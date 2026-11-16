import React from 'react';
import { Check, Lock } from 'lucide-react';
import {
  cycleEvidenceStatus,
  getEvidenceStatus,
  getPeriodTopics,
  getTopicEvidences,
  getTopicProgress,
} from '../../engine/classGame';
import type { EvidenceStatus, MissionDefinition, SessionState } from '../../engine/types';
import type { PlannedClass } from '../../engine/yearPlan';

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  pendiente: 'Pendiente',
  'en-curso': 'En curso',
  lograda: 'Lograda',
};

interface TopicMapProps {
  session: SessionState;
  commit?: (updater: (prev: SessionState) => SessionState) => void;
  plan: PlannedClass[];
  missions: MissionDefinition[];
  period: number;
  current: PlannedClass | null;
  done: Record<string, string>;
  onSelectClass?: (cls: PlannedClass) => void;
  /** Muestra el texto completo de cada evidencia */
  detailed?: boolean;
}

/**
 * Mapa del periodo: cada tema con su barra de avance, sus evidencias (clic cambia
 * pendiente → en curso → lograda) y sus clases (dada, hoy o por dar).
 */
export const TopicMap: React.FC<TopicMapProps> = ({
  session,
  commit,
  plan,
  missions,
  period,
  current,
  done,
  onSelectClass,
  detailed = false,
}) => {
  const topics = getPeriodTopics(plan, missions, period);
  if (topics.length === 0) {
    return <p className="topics__empty">Este periodo todavía no tiene temas cargados.</p>;
  }

  return (
    <ol className="topics">
      {topics.map(({ mission, classes }, ti) => {
        const evidences = getTopicEvidences(mission);
        const progress = getTopicProgress(session, mission);
        const isCurrent = classes.some((c) => c.id === current?.id);
        const started = isCurrent || classes.some((c) => done[c.id]);
        const pct = Math.round(progress.ratio * 100);
        return (
          <li key={mission.id} className={`topic${isCurrent ? ' is-current' : ''}${started ? '' : ' is-locked'}`}>
            <div className="topic__head">
              <span className="topic__n">{started ? ti + 1 : <Lock size={13} />}</span>
              <span className="topic__title">{mission.title}</span>
              <span className="topic__pct">{pct}%</span>
            </div>
            <div className="topic__bar" aria-label={`Avance del tema: ${pct} %`}>
              <span className="topic__bar-fill" style={{ width: `${pct}%` }} />
            </div>

            <ul className="topic__evidences">
              {evidences.map((ev, i) => {
                const st = getEvidenceStatus(session, mission.id, i);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className={`topic__ev is-${st}`}
                      disabled={!commit}
                      onClick={() => commit?.((prev) => cycleEvidenceStatus(prev, mission.id, i))}
                      title={`${ev}\n${STATUS_LABEL[st]} · clic para cambiar`}
                    >
                      {st === 'lograda' ? <Check size={12} strokeWidth={3} /> : <span className="topic__ev-dot" />}
                      <span className={detailed ? 'topic__ev-text' : 'topic__ev-short'}>
                        {detailed ? ev : `Evidencia ${i + 1}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="topic__classes" aria-label="Clases del tema">
              {classes.map((c) => {
                const state = c.id === current?.id ? 'is-today' : done[c.id] ? 'is-done' : '';
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`topic__class ${state}`}
                    disabled={!onSelectClass}
                    onClick={() => onSelectClass?.(c)}
                    title={`Clase ${c.number} · semana ${c.week}${done[c.id] ? ` · dada el ${done[c.id]}` : ''}`}
                  >
                    {c.number}
                  </button>
                );
              })}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
