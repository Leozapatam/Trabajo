import React from 'react';
import {
  getEvidenceStatus,
  getTopicEvidences,
  getTopicProgress,
  isNotebookEntryDone,
  setEvidenceStatus,
  toggleNotebookEntry,
} from '../../engine/classGame';
import type { EvidenceStatus, MissionDefinition, SessionState } from '../../engine/types';

const OPTIONS: { key: EvidenceStatus; label: string }[] = [
  { key: 'pendiente', label: 'No' },
  { key: 'en-curso', label: 'En curso' },
  { key: 'lograda', label: 'Lograda' },
];

interface EvidenceCheckProps {
  session: SessionState;
  commit: (updater: (prev: SessionState) => SessionState) => void;
  mission: MissionDefinition;
  /** Clase que se cierra, para marcar el cuaderno */
  classId?: string;
  hasNotebook: boolean;
}

/** Al cerrar la clase: qué evidencias del tema se trabajaron y si se copió en el cuaderno */
export const EvidenceCheck: React.FC<EvidenceCheckProps> = ({ session, commit, mission, classId, hasNotebook }) => {
  const evidences = getTopicEvidences(mission);
  const pct = Math.round(getTopicProgress(session, mission).ratio * 100);
  const copied = classId ? isNotebookEntryDone(session, classId) : false;

  return (
    <section className="evcheck">
      <h2>
        Avance del tema · {mission.title} <span className="evcheck__pct">{pct}%</span>
      </h2>
      <div className="topic__bar">
        <span className="topic__bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <ul className="evcheck__list">
        {evidences.map((ev, i) => {
          const st = getEvidenceStatus(session, mission.id, i);
          return (
            <li key={i}>
              <span className="evcheck__text">{ev}</span>
              <span className="evcheck__opts" role="radiogroup" aria-label={`Evidencia ${i + 1}`}>
                {OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={st === o.key}
                    className={`evcheck__opt is-${o.key}${st === o.key ? ' is-active' : ''}`}
                    onClick={() => commit((prev) => setEvidenceStatus(prev, mission.id, i, o.key))}
                  >
                    {o.label}
                  </button>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
      {classId && hasNotebook && (
        <label className="evcheck__nb">
          <input
            type="checkbox"
            checked={copied}
            onChange={() => commit((prev) => toggleNotebookEntry(prev, classId, prev.classDate))}
          />
          Hoy copiaron en el cuaderno lo de esta clase
        </label>
      )}
    </section>
  );
};
