import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AmbientBreeze } from '../components/AmbientBreeze';
import { getAula, worldDisplayName } from '../components/aulas/aulaInfo';
import { GradeLabel } from '../components/aulas/GradeLabel';
import { ClassSummaryScreen } from '../components/clase/ClassSummaryScreen';
import { CATEGORIES, GroupColumn, type FloatFx } from '../components/clase/GroupColumn';
import { Inventory, INVENTORY_TABS, type InventoryTab } from '../components/clase/Inventory';
import { VotingBlock } from '../components/clase/VotingBlock';
import { DiskStatusBadge } from '../components/gm/DiskStatusBadge';
import { MISSIONS_LIST, worldArtById, worldsByGrade } from '../data/catalog';
import {
  getClassSummary,
  rememberClassProgress,
  resumeClassProgress,
  toggleVotingOpen,
  type ClassSummary,
} from '../engine/classFlow';
import { requestDiskBackup } from '../engine/diskSync';
import {
  awardStudentPoints,
  changeSceneState,
  loadSessionState,
  saveAndBroadcastSession,
  subscribeToNewerSession,
  undoLastPointEvent,
} from '../engine/sessionStore';
import type { ProjectorViewMode, RecognitionCategory, SessionState, StudentState } from '../engine/types';
import '../styles/aulas.css';
import '../styles/clase.css';

const LEGACY_ZONE_ART: Record<string, string> = {
  'zona-1': '/assets/art/zona1-cosmos.webp',
  'zona-2': '/assets/art/zona2-sistema-solar.webp',
  'zona-3': '/assets/art/zona3-pangea.webp',
  'zona-4': '/assets/art/zona4-vida.webp',
};

const PROJECTOR_LABEL: Record<ProjectorViewMode, string> = { intro: 'Portada', map: 'Mapa', scene: 'Escena' };

interface Toast {
  key: number;
  text: string;
  undo?: () => void;
}

function missionsForAula(aulaId: string) {
  const worlds = worldsByGrade[aulaId] ?? [];
  const ids = new Set(worlds.map((w) => w.id));
  return { worlds, missions: MISSIONS_LIST.filter((m) => ids.has(m.worldId)) };
}

/** Retoma la misión del aula y, si cambió, prepara su escena (incluidas las opciones de votación) */
function resumeForAula(state: SessionState): SessionState {
  const { missions } = missionsForAula(getAula(state.classroomName).id);
  const resumed = resumeClassProgress(
    state,
    missions.map((m) => m.id)
  );
  if (resumed === state) return state;
  const mission = missions.find((m) => m.id === resumed.missionId);
  if (!mission) return resumed;
  const index = Math.min(resumed.activeSceneIndex, mission.scenes.length - 1);
  return changeSceneState(resumed, index, mission.scenes[index], mission.scenes.length);
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

/**
 * Pantalla "En clase": solo lo que se necesita mientras se narra.
 * ← → escenas · H pista · R revelar · V votación · 1–4 categoría · I inventario · P proyector · Ctrl+Z deshacer.
 * Con ?modo=gestion abre directo el inventario, sin clase iniciada.
 */
export const ClassPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const manageOnly = params.get('modo') === 'gestion';
  // Desde el primer cuadro el aula ya está en su propia misión (cada grado lleva la suya)
  const resumedOnLoad = useRef(false);
  const [session, setSession] = useState<SessionState>(() => {
    const loaded = loadSessionState();
    const resumed = resumeForAula(loaded);
    // Lo retomado aún no está guardado: el proyector lo necesita de inmediato
    resumedOnLoad.current = resumed !== loaded;
    return resumed;
  });
  useEffect(() => subscribeToNewerSession(setSession), []);

  const [category, setCategory] = useState<RecognitionCategory>('participacion');
  const [floats, setFloats] = useState<Record<string, FloatFx>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [inventory, setInventory] = useState<InventoryTab | null>(manageOnly ? 'exploradores' : null);
  const [closing, setClosing] = useState<{ summary: ClassSummary; backup: string | null | undefined } | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const fxCounter = useRef(0);

  const aula = getAula(session.classroomName);
  const { worlds, missions } = useMemo(() => missionsForAula(aula.id), [aula.id]);

  const commit = useCallback((updater: (prev: SessionState) => SessionState, force = false) => {
    setSession((prev) => {
      // Cada cambio deja anotado por dónde va esta aula
      const next = rememberClassProgress(updater(prev));
      return next === prev && !force ? prev : saveAndBroadcastSession(next);
    });
  }, []);

  // Deja guardado el punto de partida, y vuelve a retomar si el aula cambia desde Ajustes
  useEffect(() => {
    commit(resumeForAula, resumedOnLoad.current);
    resumedOnLoad.current = false;
  }, [aula.id, commit]);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 20000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const mission = missions.find((m) => m.id === session.missionId) ?? null;
  const sceneIndex = mission ? Math.min(session.activeSceneIndex, mission.scenes.length - 1) : 0;
  const scene = mission?.scenes[sceneIndex] ?? null;
  const world = worlds.find((w) => w.id === mission?.worldId) ?? worlds[0];
  const zone = world?.zones.find((z) => z.id === mission?.zoneId);
  const art =
    zone?.artwork ?? (zone ? LEGACY_ZONE_ART[zone.id] : undefined) ?? world?.artwork ?? (world ? worldArtById[world.id] : undefined) ?? aula.art;

  const showToast = (text: string, undo?: () => void) => {
    fxCounter.current += 1;
    setToast({ key: fxCounter.current, text, undo });
  };

  const goToScene = (index: number) => {
    if (!mission) return;
    const clamped = Math.max(0, Math.min(mission.scenes.length - 1, index));
    if (clamped === sceneIndex) return;
    commit((prev) => ({
      ...changeSceneState(prev, clamped, mission.scenes[clamped], mission.scenes.length),
      projectorMode: 'scene',
    }));
  };

  const selectMission = (missionId: string) => {
    const next = missions.find((m) => m.id === missionId);
    if (!next) return;
    commit((prev) => ({
      ...changeSceneState({ ...prev, missionId: next.id }, 0, next.scenes[0], next.scenes.length),
      focusedZoneId: next.zoneId,
      exploredZones: prev.exploredZones.includes(next.zoneId) ? prev.exploredZones : [...prev.exploredZones, next.zoneId],
    }));
  };

  const revealHint = () => {
    if (!scene) return;
    if (session.revealedHintsCount >= scene.hints.length) {
      showToast(scene.hints.length ? 'Ya se mostraron todas las pistas' : 'Esta escena no tiene pistas');
      return;
    }
    commit((prev) => ({ ...prev, revealedHintsCount: prev.revealedHintsCount + 1, projectorMode: 'scene' }));
  };

  const toggleReveal = () => {
    if (!scene) return;
    commit((prev) => ({ ...prev, revealed: !prev.revealed, projectorMode: 'scene' }));
  };

  const award = (student: StudentState, delta: number) => {
    commit((prev) => awardStudentPoints(prev, student.id, category, delta));
    fxCounter.current += 1;
    const key = fxCounter.current;
    setFloats((prev) => ({ ...prev, [student.id]: { key, delta } }));
    window.setTimeout(() => {
      setFloats((prev) => {
        if (prev[student.id]?.key !== key) return prev;
        const next = { ...prev };
        delete next[student.id];
        return next;
      });
    }, 900);
    const label = CATEGORIES.find((c) => c.key === category)!.label;
    showToast(`${delta > 0 ? '+1' : '−1'} ${label} · ${student.name}`, () =>
      commit((prev) => undoLastPointEvent(prev, student.id))
    );
  };

  const openProjector = () => window.open('/projector', 'expedicion6-projector', 'noopener,noreferrer');

  const closeClass = () => {
    const summary = getClassSummary(session);
    commit((prev) => ({
      ...prev,
      active: false,
      classStarted: false,
      status: 'completed',
      projectorMode: 'intro',
      activeEventBanner: null,
    }));
    setInventory(null);
    setClosing({ summary, backup: undefined });
    // Respaldo con nombre, después de que el cierre quede guardado
    window.setTimeout(() => {
      void requestDiskBackup(`cierre-${session.classroomName}`).then((backup) =>
        setClosing((c) => (c ? { ...c, backup } : c))
      );
    }, 0);
  };

  // Los atajos leen siempre la última versión de las acciones
  const actions = { goToScene, revealHint, toggleReveal, openProjector, sceneIndex, inventory, closing, toast, commit };
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const a = actionsRef.current;
      if (a.closing) return;
      const key = e.key.toLowerCase();

      if (a.inventory) {
        if (e.key === 'Escape' || (key === 'i' && !isTyping(e.target))) {
          e.preventDefault();
          setInventory(null);
        } else if ((key === 'q' || key === 'e') && !isTyping(e.target) && !e.ctrlKey && !e.metaKey) {
          const i = INVENTORY_TABS.findIndex((t) => t.key === a.inventory);
          const n = INVENTORY_TABS.length;
          setInventory(INVENTORY_TABS[(i + (key === 'e' ? 1 : -1) + n) % n].key);
        }
        return;
      }

      if (isTyping(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (a.toast?.undo) {
          a.toast.undo();
          setToast(null);
        } else {
          a.commit((prev) => undoLastPointEvent(prev));
        }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'ArrowRight') a.goToScene(a.sceneIndex + 1);
      else if (e.key === 'ArrowLeft') a.goToScene(a.sceneIndex - 1);
      else if (key === 'h') a.revealHint();
      else if (key === 'r') a.toggleReveal();
      else if (key === 'p') a.openProjector();
      else if (key === 'v') a.commit((prev) => (prev.voting.options.length ? toggleVotingOpen(prev) : prev));
      else if (key === 'i' || e.key === 'Tab') setInventory('exploradores');
      else if (e.key >= '1' && e.key <= '4') setCategory(CATEGORIES[Number(e.key) - 1].key);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const hintsShown = scene ? Math.min(session.revealedHintsCount, scene.hints.length) : 0;

  return (
    <div className="clase">
      <div className="aulas__art" aria-hidden="true">
        <img key={art} src={art} alt="" className="is-active" />
      </div>
      <div className="clase__shade" aria-hidden="true" />
      <AmbientBreeze scene="tierra" intensity="soft" />

      <header className="clase__hud">
        <div className="clase__hud-left">
          <span className="clase__hud-aula">
            AULA <GradeLabel grades={aula.grades} />
          </span>
          <span className="clase__hud-world">{world ? worldDisplayName(world) : aula.world}</span>
          {zone && (
            <span className="clase__hud-zone">
              Territorio {zone.number} de {world?.zones.length} · {zone.title}
            </span>
          )}
        </div>
        <div className="clase__hud-right">
          <span className="clase__hud-clock">
            {clock.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })} · P{session.period}
          </span>
          <DiskStatusBadge />
          <button type="button" className="clase__hud-btn" onClick={openProjector} title="Abrir la pantalla del proyector (P)">
            Proyector: {PROJECTOR_LABEL[session.projectorMode]}
          </button>
          {session.classStarted ? (
            <>
              <button
                type="button"
                className={`clase__hud-btn is-quiet${session.status === 'paused' ? ' is-paused' : ''}`}
                onClick={() => commit((prev) => ({ ...prev, status: prev.status === 'paused' ? 'running' : 'paused' }))}
                title="El proyector avisa al grupo que la clase está en pausa"
              >
                {session.status === 'paused' ? 'Reanudar' : 'Pausar'}
              </button>
              <button type="button" className="clase__hud-btn is-quiet" onClick={closeClass}>
                Cerrar clase
              </button>
            </>
          ) : (
            <>
              <span className="clase__hud-mode">SIN CLASE INICIADA</span>
              <button type="button" className="clase__hud-btn" onClick={() => navigate('/lista')}>
                Empezar clase
              </button>
              <button type="button" className="clase__hud-btn is-quiet" onClick={() => navigate('/')}>
                Portada
              </button>
            </>
          )}
        </div>
      </header>

      <main className="clase__main">
        {scene && mission ? (
          <article key={scene.id} className="clase__script">
            <span className="clase__kicker">
              {mission.code} · ESCENA {sceneIndex + 1} DE {mission.scenes.length}
            </span>
            <h1 className="clase__title">{scene.title}</h1>
            <p className="clase__question">{scene.promptQuestion}</p>

            <section className="clase__block">
              <h2>GUION</h2>
              <p className="clase__guion">{scene.teacherNotes.facilitationScript}</p>
            </section>

            <section className="clase__block">
              <h2>EN EL PROYECTOR</h2>
              <p>{scene.narrative}</p>
              {scene.notebookPrompt && <p className="clase__notebook">Cuaderno: {scene.notebookPrompt}</p>}
            </section>

            {scene.hints.length > 0 && (
              <section className="clase__block">
                <h2>
                  PISTAS · {hintsShown} DE {scene.hints.length} A LA VISTA
                </h2>
                <ol className="clase__hints">
                  {scene.hints.map((hint, i) => (
                    <li key={i} className={i < hintsShown ? 'is-shown' : ''}>
                      {hint}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className={`clase__block clase__finding${session.revealed ? ' is-revealed' : ''}`}>
              <h2>HALLAZGO · {session.revealed ? 'A LA VISTA DEL GRUPO' : 'OCULTO PARA EL GRUPO'}</h2>
              <p>{scene.publicAnswerSummary}</p>
            </section>

            <VotingBlock session={session} commit={commit} question={scene.promptQuestion} />

            <section className="clase__block is-quiet">
              <h2>OJO CON</h2>
              <p>{scene.teacherNotes.whatToWatchFor}</p>
            </section>

            <section className="clase__block is-quiet">
              <h2>PROPÓSITO</h2>
              <p>{scene.teacherNotes.pedagogicalGoal}</p>
            </section>
          </article>
        ) : (
          <article className="clase__script">
            <span className="clase__kicker">SIN MISIONES</span>
            <h1 className="clase__title">{aula.world}</h1>
            <p className="clase__question">Esta aula todavía no tiene misiones cargadas.</p>
            <section className="clase__block">
              <p>Puedes dar puntos, abrir recursos del banco y llevar la asistencia. Las misiones de este grado están en construcción.</p>
            </section>
          </article>
        )}

        <GroupColumn session={session} category={category} onCategory={setCategory} onAward={award} floats={floats} />
      </main>

      <footer className="clase__bar">
        <button type="button" className="clase__act" onClick={() => goToScene(sceneIndex - 1)} disabled={!scene || sceneIndex === 0}>
          <kbd className="is-arrow">←</kbd> Anterior
        </button>
        <button type="button" className="clase__act" onClick={revealHint} disabled={!scene}>
          <kbd>H</kbd> Pista {scene ? `${hintsShown}/${scene.hints.length}` : ''}
        </button>
        <button type="button" className={`clase__act${session.revealed ? ' is-on' : ''}`} onClick={toggleReveal} disabled={!scene}>
          <kbd>R</kbd> {session.revealed ? 'Ocultar hallazgo' : 'Revelar hallazgo'}
        </button>
        <button
          type="button"
          className="clase__act is-primary"
          onClick={() => goToScene(sceneIndex + 1)}
          disabled={!mission || sceneIndex >= mission.scenes.length - 1}
        >
          Siguiente <kbd className="is-arrow">→</kbd>
        </button>

        {mission && (
          <div className="clase__dots" aria-label="Escenas">
            {mission.scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`clase__dot${i === sceneIndex ? ' is-active' : ''}${i < sceneIndex ? ' is-done' : ''}`}
                onClick={() => goToScene(i)}
                title={`${i + 1}. ${s.title}`}
                aria-label={`Escena ${i + 1}: ${s.title}`}
              />
            ))}
          </div>
        )}

        <button type="button" className="clase__act is-inventory" onClick={() => setInventory('exploradores')}>
          <kbd>I</kbd> Inventario
        </button>
      </footer>

      {toast && (
        <div key={toast.key} className="clase__toast" role="status">
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              type="button"
              onClick={() => {
                toast.undo?.();
                setToast(null);
              }}
            >
              Deshacer
            </button>
          )}
        </div>
      )}

      {inventory && (
        <Inventory
          session={session}
          commit={commit}
          tab={inventory}
          onTab={setInventory}
          onClose={() => setInventory(null)}
          mission={mission}
          missions={missions}
          world={world}
          onSelectMission={selectMission}
          onGoToScene={goToScene}
        />
      )}

      {closing && (
        <ClassSummaryScreen
          summary={closing.summary}
          grades={aula.grades}
          world={world ? worldDisplayName(world) : aula.world}
          backupName={closing.backup}
          onHome={() => navigate('/')}
          onAulas={() => navigate('/aulas')}
        />
      )}
    </div>
  );
};
