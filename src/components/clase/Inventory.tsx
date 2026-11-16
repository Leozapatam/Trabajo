import React, { useEffect, useRef, useState } from 'react';
import { ClassSettings } from '../gm/ClassSettings';
import { ResourceBank } from '../gm/ResourceBank';
import { StudentArena } from '../gm/StudentArena';
import { TacticalOriginMap } from '../TacticalOriginMap';
import { confirmAttendance } from '../../engine/sessionStore';
import type {
  ActiveEventBanner,
  MissionDefinition,
  ProjectorViewMode,
  SessionState,
  WorldDefinition,
} from '../../engine/types';

export type InventoryTab = 'exploradores' | 'recursos' | 'mapa' | 'misiones' | 'bitacora' | 'ajustes';

export const INVENTORY_TABS: { key: InventoryTab; label: string }[] = [
  { key: 'exploradores', label: 'Exploradores' },
  { key: 'recursos', label: 'Recursos' },
  { key: 'mapa', label: 'Mapa' },
  { key: 'misiones', label: 'Misiones' },
  { key: 'bitacora', label: 'Bitácora' },
  { key: 'ajustes', label: 'Ajustes' },
];

const PROJECTOR_MODES: { key: ProjectorViewMode; label: string }[] = [
  { key: 'intro', label: 'Portada' },
  { key: 'map', label: 'Mapa' },
  { key: 'scene', label: 'Escena' },
];

const QUICK_EVENTS: ActiveEventBanner[] = [
  { id: 'ev-cuaderno', title: 'Cuaderno de Campo', subtitle: 'Escriban su idea en el cuaderno con sus propias palabras.', kind: 'cuaderno' },
  { id: 'ev-debate', title: 'Participación', subtitle: 'Levanten la mano para compartir qué piensan y por qué.', kind: 'debate' },
  { id: 'ev-cosmos', title: 'Mapa de Expedición', subtitle: 'Observemos en qué territorio del viaje estamos hoy.', kind: 'cosmos' },
];

interface InventoryProps {
  session: SessionState;
  commit: (updater: (prev: SessionState) => SessionState) => void;
  tab: InventoryTab;
  onTab: (tab: InventoryTab) => void;
  onClose: () => void;
  mission: MissionDefinition | null;
  missions: MissionDefinition[];
  world: WorldDefinition | undefined;
  onSelectMission: (missionId: string) => void;
  onGoToScene: (index: number) => void;
}

/**
 * Inventario de la clase: todo lo que no se necesita mientras se narra.
 * Q y E cambian de pestaña; I o Esc lo cierran.
 */
export const Inventory: React.FC<InventoryProps> = ({
  session,
  commit,
  tab,
  onTab,
  onClose,
  mission,
  missions,
  world,
  onSelectMission,
  onGoToScene,
}) => {
  const [note, setNote] = useState('');
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const scene = mission ? (mission.scenes[session.activeSceneIndex] ?? mission.scenes[0]) : null;

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    const text = note.trim();
    if (!text) return;
    commit((prev) => ({
      ...prev,
      decisions: [
        { id: `dec-${Date.now().toString(36)}`, sceneId: scene?.id ?? '', summary: text, timestamp: Date.now() },
        ...prev.decisions,
      ],
    }));
    setNote('');
  };

  const toggleFog = (zoneId: string) =>
    commit((prev) => {
      const explored = prev.exploredZones.includes(zoneId);
      const next = explored ? prev.exploredZones.filter((z) => z !== zoneId) : [...prev.exploredZones, zoneId];
      return { ...prev, exploredZones: next, focusedZoneId: zoneId };
    });

  return (
    <div className="inv" role="dialog" aria-modal="true" aria-label="Inventario de la clase">
      <header className="inv__bar">
        <span className="inv__key" aria-hidden="true">Q</span>
        <nav className="inv__tabs" role="tablist">
          {INVENTORY_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`inv__tab${tab === t.key ? ' is-active' : ''}`}
              onClick={() => onTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <span className="inv__key" aria-hidden="true">E</span>
        <button ref={closeRef} type="button" className="inv__close" onClick={onClose}>
          ✕ ESC
        </button>
      </header>

      <div className="inv__body retro-scope">
        {tab === 'exploradores' && <StudentArena session={session} commit={commit} />}

        {tab === 'recursos' && <ResourceBank session={session} commit={commit} />}

        {tab === 'mapa' && (
          <div className="inv__map">
            <div className="inv__panel">
              <h3 className="inv__label">QUÉ MUESTRA EL PROYECTOR</h3>
              <div className="inv__chips">
                {PROJECTOR_MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    className={`inv__chip${session.projectorMode === m.key ? ' is-active' : ''}`}
                    onClick={() => commit((prev) => ({ ...prev, projectorMode: m.key }))}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <h3 className="inv__label">AVISO PARA EL GRUPO</h3>
              <div className="inv__chips">
                {QUICK_EVENTS.map((ev) => {
                  const on = session.activeEventBanner?.id === ev.id;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className={`inv__chip${on ? ' is-active' : ''}`}
                      onClick={() => commit((prev) => ({ ...prev, activeEventBanner: on ? null : ev }))}
                    >
                      {ev.title}
                    </button>
                  );
                })}
              </div>
              {world && (
                <>
                  <h3 className="inv__label">TERRITORIOS A LA VISTA</h3>
                  <div className="inv__chips">
                    {world.zones.map((z) => {
                      const explored = session.exploredZones.includes(z.id);
                      return (
                        <button
                          key={z.id}
                          type="button"
                          className={`inv__chip${explored ? ' is-active' : ''}`}
                          onClick={() => toggleFog(z.id)}
                          title={z.title}
                        >
                          {z.number}. {explored ? 'Visible' : 'Niebla'}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            {world ? (
              <TacticalOriginMap
                world={world}
                exploredZones={session.exploredZones}
                focusedZoneId={session.focusedZoneId}
                onSelectZone={(zoneId) =>
                  commit((prev) => ({
                    ...prev,
                    focusedZoneId: zoneId,
                    exploredZones: prev.exploredZones.includes(zoneId) ? prev.exploredZones : [...prev.exploredZones, zoneId],
                  }))
                }
              />
            ) : (
              <p className="inv__empty">Esta aula todavía no tiene un mundo cargado.</p>
            )}
          </div>
        )}

        {tab === 'misiones' && (
          <div className="inv__missions">
            {missions.length === 0 && <p className="inv__empty">Esta aula todavía no tiene misiones cargadas.</p>}
            <ul className="inv__list">
              {missions.map((m) => {
                const active = m.id === mission?.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      className={`inv__mission${active ? ' is-active' : ''}`}
                      onClick={() => onSelectMission(m.id)}
                    >
                      <span className="inv__mission-code">{m.code}</span>
                      <span className="inv__mission-title">{m.title}</span>
                      <span className="inv__mission-q">{m.centralQuestion}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {mission && (
              <div className="inv__panel">
                <h3 className="inv__label">ESCENAS DE «{mission.title}»</h3>
                <ol className="inv__scenes">
                  {mission.scenes.map((s, i) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={`inv__scene${i === session.activeSceneIndex ? ' is-active' : ''}`}
                        onClick={() => {
                          onGoToScene(i);
                          onClose();
                        }}
                      >
                        <span className="inv__scene-n">{i + 1}</span>
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {tab === 'bitacora' && (
          <div className="inv__log">
            <div className="inv__panel">
              <h3 className="inv__label">NOTAS DE LA CLASE</h3>
              <form onSubmit={addNote} className="inv__note-form">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Lo que decidió el grupo, una idea, un pendiente"
                  aria-label="Nota de la clase"
                />
                <button type="submit" className="btn btn-primary" disabled={!note.trim()}>
                  Anotar
                </button>
              </form>
              {session.decisions.length === 0 ? (
                <p className="inv__empty">Aquí queda lo que anotes durante la clase.</p>
              ) : (
                <ul className="inv__notes">
                  {session.decisions.slice(0, 30).map((d) => (
                    <li key={d.id}>
                      <time>{new Date(d.timestamp).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</time>
                      {d.summary}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="inv__panel">
              <h3 className="inv__label">GLOSARIO DE LA MISIÓN</h3>
              {mission && mission.glossary.length > 0 ? (
                <dl className="inv__glossary">
                  {mission.glossary.map((g) => (
                    <React.Fragment key={g.term}>
                      <dt>{g.term}</dt>
                      <dd>{g.definition}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              ) : (
                <p className="inv__empty">Esta misión no tiene glosario.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'ajustes' && (
          <div className="inv__settings">
            <ClassSettings
              session={session}
              commit={commit}
              onSaveAttendance={() => {
                commit(confirmAttendance);
                setAttendanceSaved(true);
                window.setTimeout(() => setAttendanceSaved(false), 2500);
              }}
              attendanceSaved={attendanceSaved}
              savedDatesCount={Object.keys(session.attendanceByDate).length}
            />
          </div>
        )}
      </div>
    </div>
  );
};
