import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AmbientBreeze } from '../components/AmbientBreeze';
import { getAula, worldDisplayName } from '../components/aulas/aulaInfo';
import { GradeLabel } from '../components/aulas/GradeLabel';
import { ClassSummaryScreen } from '../components/clase/ClassSummaryScreen';
import { GroupColumn, type FloatFx } from '../components/clase/GroupColumn';
import { Inventory, INVENTORY_TABS, type InventoryTab } from '../components/clase/Inventory';
import { SpecialClassBrief } from '../components/clase/SpecialClassBrief';
import { EntryActivityCard, ENTRY_EVENT_ID } from '../components/clase/EntryActivityCard';
import { EvidenceCheck } from '../components/clase/EvidenceCheck';
import { GameHud } from '../components/clase/GameHud';
import { NotesDrawer } from '../components/clase/NotesDrawer';
import { ProjectorMirror } from '../components/clase/ProjectorMirror';
import { TopicMap } from '../components/clase/TopicMap';
import { KIND_LABEL, YearPlanWindow } from '../components/clase/YearPlanWindow';
import { DiskStatusBadge } from '../components/gm/DiskStatusBadge';
import { MISSIONS_LIST, worldArtById, worldsByGrade } from '../data/catalog';
import {
  getClassSummary,
  rememberClassProgress,
  resumeClassProgress,
  type ClassSummary,
} from '../engine/classFlow';
import {
  buildNotebook,
  changeHearts,
  changeStars,
  claimStarReward,
  getEntryActivity,
  getHeartsLeft,
  getNotebookHolder,
} from '../engine/classGame';
import { requestDiskBackup } from '../engine/diskSync';
import {
  changeSceneState,
  loadSessionState,
  saveAndBroadcastSession,
  subscribeToNewerSession,
  undoLastPointEvent,
} from '../engine/sessionStore';
import { awardAction, formatDelta, getScoreAction, SCORE_ACTIONS } from '../engine/scoring';
import type { MissionDefinition, ProjectorViewMode, ScoreAction, SessionState, StudentState } from '../engine/types';
import {
  buildYearPlan,
  CLASSES_PER_YEAR,
  completePlannedClass,
  getClassPlanProgress,
  getCurrentPlannedClass,
  selectPlannedClass,
  type PlannedClass,
} from '../engine/yearPlan';
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
  // Si la clase en curso de la ruta es de otra misión, se abre en su primera escena
  const current = getCurrentPlannedClass(resumed, buildYearPlan(missions));
  if (current?.missionId && current.missionId !== resumed.missionId) {
    return openPlannedMission(resumed, missions, current);
  }
  if (resumed === state) return state;
  const mission = missions.find((m) => m.id === resumed.missionId);
  if (!mission) return resumed;
  const index = Math.min(resumed.activeSceneIndex, mission.scenes.length - 1);
  return changeSceneState(resumed, index, mission.scenes[index], mission.scenes.length);
}

/** Pone la misión de una clase de la ruta en su primera escena */
function openPlannedMission(state: SessionState, missions: MissionDefinition[], cls: PlannedClass): SessionState {
  const mission = missions.find((m) => m.id === cls.missionId);
  if (!mission) return state;
  const index = Math.min(cls.sceneStart ?? 0, mission.scenes.length - 1);
  return changeSceneState({ ...state, missionId: mission.id }, index, mission.scenes[index], mission.scenes.length);
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

  const [scoreAction, setScoreAction] = useState<ScoreAction>('aporte');
  const [floats, setFloats] = useState<Record<string, FloatFx>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [inventory, setInventory] = useState<InventoryTab | null>(manageOnly ? 'mapa' : null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [closing, setClosing] = useState<{
    summary: ClassSummary;
    backup: string | null | undefined;
    finished: PlannedClass | null;
  } | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const fxCounter = useRef(0);

  const aula = getAula(session.classroomName);
  const { worlds, missions } = useMemo(() => missionsForAula(aula.id), [aula.id]);
  const plan = useMemo(() => buildYearPlan(missions), [missions]);
  const currentClass = getCurrentPlannedClass(session, plan);
  const doneClasses = getClassPlanProgress(session)?.done ?? {};
  /** Introducción, examen o cierre sin misión: se muestra la guía de esa clase */
  const specialClass = currentClass && !currentClass.missionId ? currentClass : null;
  const entryActivity = useMemo(() => getEntryActivity(plan, missions, currentClass), [plan, missions, currentClass]);
  const notebookClassIds = useMemo(() => new Set(buildNotebook(plan, missions).map((e) => e.cls.id)), [plan, missions]);

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
  const scene = specialClass ? null : (mission?.scenes[sceneIndex] ?? null);
  const world = worlds.find((w) => w.id === mission?.worldId) ?? worlds[0];
  const zone = world?.zones.find((z) => z.id === mission?.zoneId);
  const art =
    zone?.artwork ?? (zone ? LEGACY_ZONE_ART[zone.id] : undefined) ?? world?.artwork ?? (world ? worldArtById[world.id] : undefined) ?? aula.art;

  const showToast = (text: string, undo?: () => void) => {
    fxCounter.current += 1;
    setToast({ key: fxCounter.current, text, undo });
  };

  const goToScene = (index: number) => {
    if (!mission || specialClass) return;
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

  const selectClass = (cls: PlannedClass) => {
    setPlanOpen(false);
    commit((prev) => {
      let next = selectPlannedClass(prev, cls.id);
      // La clase define el periodo en que se registran puntos y asistencia
      if (next.period !== cls.period) next = { ...next, period: cls.period };
      if (cls.missionId) return { ...openPlannedMission(next, missions, cls), projectorMode: 'scene' as const };
      return { ...next, projectorMode: 'intro' as const };
    });
    if (cls.period !== session.period) showToast(`Periodo cambiado a ${cls.period}`);
  };

  const revealHint = () => {
    if (!scene) return;
    if (session.revealedHintsCount >= scene.hints.length) {
      showToast(scene.hints.length ? 'Ya se mostraron todas las pistas' : 'Esta escena no tiene pistas');
      return;
    }
    commit((prev) => ({ ...prev, revealedHintsCount: prev.revealedHintsCount + 1, projectorMode: 'scene' }));
  };

  const award = (student: StudentState, action: ScoreAction) => {
    const def = getScoreAction(action);
    const delta = def.delta;
    commit((prev) => awardAction(prev, student.id, action));
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
    showToast(`${formatDelta(delta)} ${def.label} · ${student.name}`, () =>
      commit((prev) => undoLastPointEvent(prev, student.id))
    );
  };

  // Tres llamados de atención apagan los corazones: el proyector anuncia la tarea extensa
  const heartAction = (lost: 1 | -1) => {
    const left = getHeartsLeft(session);
    commit((prev) => {
      const next = changeHearts(prev, lost);
      if (getHeartsLeft(next) === 0 && getHeartsLeft(prev) > 0) {
        return {
          ...next,
          activeEventBanner: { id: 'ev-tarea', title: 'Tarea extensa', subtitle: 'Se apagaron los 3 corazones del grupo.', kind: 'cuaderno' },
        };
      }
      if (lost === -1 && prev.activeEventBanner?.id === 'ev-tarea') return { ...next, activeEventBanner: null };
      return next;
    });
    if (lost === 1 && left === 1) showToast('Sin corazones: tarea extensa para el grupo');
    else if (lost === 1 && left > 1) showToast(`Llamado de atención · quedan ${left - 1} corazones`);
  };

  const starAction = (delta: 1 | -1) => commit((prev) => changeStars(prev, delta));
  const claimReward = () => {
    commit((prev) => ({
      ...claimStarReward(prev),
      activeEventBanner: { id: 'ev-recompensa', title: 'Recompensa', subtitle: '¡El grupo llenó sus 5 estrellas!', kind: 'debate' },
    }));
    showToast('Recompensa cobrada: las estrellas vuelven a cero');
  };

  const openProjector = () => window.open('/projector', 'expedicion6-projector', 'noopener,noreferrer');

  const closeClass = () => {
    const summary = getClassSummary(session);
    const finished = currentClass;
    commit((prev) => ({
      ...completePlannedClass(prev, plan, prev.classDate),
      active: false,
      classStarted: false,
      status: 'completed',
      projectorMode: 'intro',
      activeEventBanner: null,
    }));
    setInventory(null);
    setClosing({
      summary: { ...summary, plannedClass: finished ? `Clase ${finished.number} de ${CLASSES_PER_YEAR} · ${finished.title}` : undefined },
      backup: undefined,
      finished,
    });
    // Respaldo con nombre, después de que el cierre quede guardado
    window.setTimeout(() => {
      void requestDiskBackup(`cierre-${session.classroomName}`).then((backup) =>
        setClosing((c) => (c ? { ...c, backup } : c))
      );
    }, 0);
  };

  // Los atajos leen siempre la última versión de las acciones
  const actions = { goToScene, revealHint, openProjector, sceneIndex, inventory, closing, toast, commit, planOpen, notesOpen, scene };
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const a = actionsRef.current;
      // La ruta del año maneja sus propias teclas (Esc la cierra)
      if (a.closing || a.planOpen) return;
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
      else if (key === 'p') a.openProjector();
      else if (key === 'i' || e.key === 'Tab') setInventory('mapa');
      else if (key === 'n') {
        if (a.scene) setNotesOpen((o) => !o);
      } else if (e.key === 'Escape' && a.notesOpen) setNotesOpen(false);
      else if (key === 'c') setPlanOpen(true);
      else if (e.key >= '1' && e.key <= '4') setScoreAction(SCORE_ACTIONS[Number(e.key) - 1].key);
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
          {zone && !specialClass && (
            <span className="clase__hud-zone">
              Territorio {zone.number} de {world?.zones.length} · {zone.title}
            </span>
          )}
        </div>
        <div className="clase__hud-center">
          <ProjectorMirror onOpen={openProjector} />
        </div>
        <div className="clase__hud-right">
          {session.classStarted && <GameHud session={session} onHeart={heartAction} onStar={starAction} onClaim={claimReward} />}
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
        {specialClass ? (
          <div className="clase__col">
            {currentClass && (
              <ClassPlanButton cls={currentClass} onOpen={() => setPlanOpen(true)} />
            )}
            <SpecialClassBrief cls={specialClass} plan={plan} missions={missions} session={session} />
          </div>
        ) : scene && mission ? (
          <div className="clase__col">
          {currentClass && (
            <ClassPlanButton
              cls={currentClass}
              onOpen={() => setPlanOpen(true)}
              detail={`${mission.code} · escena ${sceneIndex + 1} de ${mission.scenes.length}${
                currentClass.missionId === mission.id && currentClass.sceneStart !== undefined
                  ? ` · esta clase: ${sceneRange(currentClass)}`
                  : ''
              }`}
            />
          )}
          <section className="clase__now">
            <span className="clase__now-kicker">
              {mission.title} · escena {sceneIndex + 1} de {mission.scenes.length}
            </span>
            <h1 className="clase__title">{scene.title}</h1>
            <p className="notes__question">{scene.promptQuestion}</p>
            <button type="button" className="clase__notes-btn" onClick={() => setNotesOpen(true)}>
              <kbd>N</kbd> Notas de orador
            </button>
          </section>
          {entryActivity && sceneIndex === (currentClass?.sceneStart ?? 0) && (
            <EntryActivityCard
              activity={entryActivity}
              holder={getNotebookHolder(session)}
              projected={session.activeEventBanner?.id === ENTRY_EVENT_ID}
              onProject={() =>
                commit((prev) => ({
                  ...prev,
                  activeEventBanner:
                    prev.activeEventBanner?.id === ENTRY_EVENT_ID
                      ? null
                      : { id: ENTRY_EVENT_ID, title: 'Al llegar', subtitle: entryActivity.prompt, kind: 'cuaderno' },
                }))
              }
            />
          )}
          {currentClass && (
            <section className="clase__map">
              <span className="clase__now-kicker">MAPA DEL PERIODO {currentClass.period}</span>
              <TopicMap
                session={session}
                commit={commit}
                plan={plan}
                missions={missions}
                period={currentClass.period}
                current={currentClass}
                done={doneClasses}
                onSelectClass={selectClass}
              />
            </section>
          )}
          </div>
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

        <GroupColumn session={session} action={scoreAction} onAction={setScoreAction} onAward={award} floats={floats} />
      </main>

      <footer className="clase__bar">
        <button type="button" className="clase__act" onClick={() => goToScene(sceneIndex - 1)} disabled={!scene || sceneIndex === 0}>
          <kbd className="is-arrow">←</kbd> Anterior
        </button>
        <button type="button" className="clase__act" onClick={revealHint} disabled={!scene}>
          <kbd>H</kbd> Pista {scene ? `${hintsShown}/${scene.hints.length}` : ''}
        </button>
        <button
          type="button"
          className="clase__act is-primary"
          onClick={() => goToScene(sceneIndex + 1)}
          disabled={!scene || !mission || sceneIndex >= mission.scenes.length - 1}
        >
          Siguiente <kbd className="is-arrow">→</kbd>
        </button>

        {mission && !specialClass && (
          <div className="clase__dots" aria-label="Escenas">
            {mission.scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`clase__dot${i === sceneIndex ? ' is-active' : ''}${i < sceneIndex ? ' is-done' : ''}${
                  currentClass?.missionId === mission.id &&
                  i >= (currentClass.sceneStart ?? 0) &&
                  i <= (currentClass.sceneEnd ?? -1)
                    ? ' in-class'
                    : ''
                }`}
                onClick={() => goToScene(i)}
                title={`${i + 1}. ${s.title}`}
                aria-label={`Escena ${i + 1}: ${s.title}`}
              />
            ))}
          </div>
        )}

        <button type="button" className="clase__act is-plan" onClick={() => setPlanOpen(true)}>
          <kbd>C</kbd> Clases
        </button>
        <button type="button" className="clase__act" onClick={() => setInventory('cuaderno')}>
          Cuaderno
        </button>
        <button type="button" className="clase__act is-inventory" onClick={() => setInventory('mapa')}>
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
          plan={plan}
          current={currentClass}
          done={doneClasses}
          onSelectClass={(cls) => {
            selectClass(cls);
            setInventory(null);
          }}
          onSelectMission={selectMission}
          onGoToScene={goToScene}
        />
      )}

      {planOpen && (
        <YearPlanWindow
          plan={plan}
          current={currentClass}
          done={doneClasses}
          aulaLabel={aula.id}
          onSelect={selectClass}
          onClose={() => setPlanOpen(false)}
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
        >
          {(() => {
            const m = missions.find((x) => x.id === closing.finished?.missionId);
            return m && closing.finished?.kind === 'mision' ? (
              <EvidenceCheck
                session={session}
                commit={commit}
                mission={m}
                classId={closing.finished.id}
                hasNotebook={notebookClassIds.has(closing.finished.id)}
              />
            ) : null;
          })()}
        </ClassSummaryScreen>
      )}

      {notesOpen && scene && mission && (
        <NotesDrawer
          scene={scene}
          sceneIndex={sceneIndex}
          sceneCount={mission.scenes.length}
          hintsShown={hintsShown}
          onClose={() => setNotesOpen(false)}
        />
      )}
    </div>
  );
};

function sceneRange(cls: PlannedClass): string {
  const a = (cls.sceneStart ?? 0) + 1;
  const b = (cls.sceneEnd ?? cls.sceneStart ?? 0) + 1;
  return a === b ? `escena ${a}` : `escenas ${a}–${b}`;
}

/** Botón de la ruta del año: dice qué clase es y abre la lista de las 78 */
const ClassPlanButton: React.FC<{ cls: PlannedClass; onOpen: () => void; detail?: string }> = ({ cls, onOpen, detail }) => (
  <button type="button" className={`clase__planbtn is-${cls.kind}`} onClick={onOpen} title="Ver y elegir las clases del año (C)">
    <span className="clase__planbtn-main">
      CLASE {cls.number} DE {CLASSES_PER_YEAR} · SEMANA {cls.week} · PERIODO {cls.period}
      <span className="clase__planbtn-kind">{KIND_LABEL[cls.kind]}</span>
      <span aria-hidden="true">▾</span>
    </span>
    <span className="clase__planbtn-detail">{detail ?? cls.subtitle}</span>
  </button>
);
