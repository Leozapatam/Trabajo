import React from 'react';
import { Check } from 'lucide-react';
import {
  buildNotebook,
  getNotebookHolder,
  isNotebookEntryDone,
  setNotebookHolder,
  toggleNotebookEntry,
} from '../../engine/classGame';
import type { MissionDefinition, NotebookHolder, SessionState } from '../../engine/types';
import type { PlannedClass } from '../../engine/yearPlan';

const HOLDERS: { key: NotebookHolder; label: string }[] = [
  { key: 'estudiantes', label: 'Ellos' },
  { key: 'profe', label: 'Yo, el profe' },
];

interface NotebookPanelProps {
  session: SessionState;
  commit: (updater: (prev: SessionState) => SessionState) => void;
  plan: PlannedClass[];
  missions: MissionDefinition[];
  current: PlannedClass | null;
}

/** El cuaderno del año: lo mismo para todo el grupo, como checklist por periodo y tema */
export const NotebookPanel: React.FC<NotebookPanelProps> = ({ session, commit, plan, missions, current }) => {
  const entries = buildNotebook(plan, missions);
  const holder = getNotebookHolder(session);
  const doneCount = entries.filter((e) => isNotebookEntryDone(session, e.cls.id)).length;

  return (
    <div className="nb">
      <div className="inv__panel nb__side">
        <h3 className="inv__label">¿QUIÉN TIENE LOS CUADERNOS?</h3>
        <div className="inv__chips">
          {HOLDERS.map((h) => (
            <button
              key={h.key}
              type="button"
              className={`inv__chip${holder === h.key ? ' is-active' : ''}`}
              onClick={() => commit((prev) => setNotebookHolder(prev, h.key))}
            >
              {h.label}
            </button>
          ))}
        </div>
        <p className="nb__hint">
          {holder === 'profe'
            ? 'Tú los tienes: repártelos al llegar o haz la actividad de entrada en voz alta.'
            : 'Ellos los traen: la actividad de entrada se hace en el cuaderno apenas lleguen.'}
        </p>
        <h3 className="inv__label">COPIADO EN EL AÑO</h3>
        <p className="nb__count">
          <strong>{doneCount}</strong> de {entries.length} entradas
        </p>
        <div className="topic__bar">
          <span className="topic__bar-fill" style={{ width: `${entries.length ? (doneCount / entries.length) * 100 : 0}%` }} />
        </div>
      </div>

      <ol className="nb__list">
        {entries.length === 0 && <p className="inv__empty">Este grado todavía no tiene contenido para el cuaderno.</p>}
        {entries.map((e, i) => {
          const isDone = isNotebookEntryDone(session, e.cls.id);
          const newTopic = i === 0 || entries[i - 1].mission.id !== e.mission.id;
          return (
            <React.Fragment key={e.cls.id}>
              {newTopic && (
                <li className="nb__topic">
                  Periodo {e.cls.period} · {e.mission.title}
                </li>
              )}
              <li className={`nb__entry${isDone ? ' is-done' : ''}${e.cls.id === current?.id ? ' is-today' : ''}`}>
                <button
                  type="button"
                  className="nb__check"
                  aria-pressed={isDone}
                  onClick={() => commit((prev) => toggleNotebookEntry(prev, e.cls.id, prev.classDate))}
                  title={isDone ? 'Marcar como no copiado' : 'Marcar como copiado'}
                >
                  {isDone && <Check size={14} strokeWidth={3} />}
                </button>
                <div>
                  <span className="nb__meta">
                    Clase {e.cls.number}
                    {e.cls.id === current?.id ? ' · hoy' : ''}
                  </span>
                  {e.lines.map((l, li) => (
                    <p key={li} className="nb__line">
                      {l}
                    </p>
                  ))}
                </div>
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
};
