import React, { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { GameWindow } from '../overlay/GameWindow';
import { CLASSES_PER_PERIOD, WEEKS_PER_PERIOD, type PlannedClass, type PlannedClassKind } from '../../engine/yearPlan';
import type { AcademicPeriod } from '../../engine/types';

export const KIND_LABEL: Record<PlannedClassKind, string> = {
  intro: 'INTRODUCCIÓN',
  mision: 'MISIÓN',
  examen: 'EXAMEN',
  cierre: 'CIERRE',
};

interface YearPlanWindowProps {
  plan: PlannedClass[];
  current: PlannedClass | null;
  done: Record<string, string>;
  aulaLabel: string;
  onSelect: (c: PlannedClass) => void;
  onClose: () => void;
}

function shortDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).replace('.', '');
}

/** Las 78 clases del año: 3 periodos × 13 semanas × 2 clases. Clic en una clase la abre. */
export const YearPlanWindow: React.FC<YearPlanWindowProps> = ({ plan, current, done, aulaLabel, onSelect, onClose }) => {
  const [period, setPeriod] = useState<AcademicPeriod>(current?.period ?? 1);
  const classes = plan.filter((c) => c.period === period);
  const weeks = Array.from({ length: WEEKS_PER_PERIOD }, (_, i) => i + 1);

  return (
    <GameWindow title={`RUTA DEL AÑO · AULA ${aulaLabel}`} icon={<MapIcon size={16} />} onClose={onClose}>
      <div className="plan__periods" role="tablist">
        {([1, 2, 3] as AcademicPeriod[]).map((p) => {
          const given = plan.filter((c) => c.period === p && done[c.id]).length;
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              className={`plan__period${period === p ? ' is-active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              Periodo {p}
              <span className="plan__period-count">
                {given}/{CLASSES_PER_PERIOD}
              </span>
            </button>
          );
        })}
      </div>

      <ol className="plan__weeks">
        {weeks.map((week) => (
          <li key={week} className="plan__week">
            <span className="plan__week-label">
              SEMANA <strong>{week}</strong>
            </span>
            {classes
              .filter((c) => c.week === week)
              .map((c) => {
                const isCurrent = c.id === current?.id;
                const doneOn = done[c.id];
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`plan__class is-${c.kind}${isCurrent ? ' is-current' : ''}${doneOn ? ' is-done' : ''}`}
                    onClick={() => onSelect(c)}
                    title={`${c.title} · ${c.subtitle}`}
                  >
                    <span className="plan__class-n">{c.number}</span>
                    <span className="plan__class-text">
                      <span className="plan__class-kind">{KIND_LABEL[c.kind]}</span>
                      <span className="plan__class-title">{c.title}</span>
                      <span className="plan__class-sub">{c.subtitle}</span>
                      {(c.evaluation || c.movie || c.transversal) && (
                        <span className="plan__class-badges">
                          {c.evaluation && (
                            <span className="plan__badge is-eval" title={c.evaluation.description}>
                              📝 {c.evaluation.label} ({c.evaluation.totalWeight})
                            </span>
                          )}
                          {c.movie && (
                            <span className="plan__badge is-movie" title={c.movie.focus}>
                              🎬 {c.movie.title}
                            </span>
                          )}
                          {c.transversal && (
                            <span className="plan__badge is-trans" title={c.transversal.description}>
                              🏛️ {c.transversal.title}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                    {isCurrent ? (
                      <span className="plan__class-tag">AHORA</span>
                    ) : doneOn ? (
                      <span className="plan__class-done">✓ {shortDate(doneOn)}</span>
                    ) : null}
                  </button>
                );
              })}
          </li>
        ))}
      </ol>
    </GameWindow>
  );
};
