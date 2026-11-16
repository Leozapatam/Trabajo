import React from 'react';
import { Link } from 'react-router-dom';
import { initials } from '../aulas/aulaInfo';
import { getPerformanceLevel } from '../../engine/grading';
import { calculateCurrentPeriodGrade, getAttendanceOnClassDate } from '../../engine/sessionStore';
import type { RecognitionCategory, SessionState, StudentState } from '../../engine/types';

export const CATEGORIES: { key: RecognitionCategory; label: string }[] = [
  { key: 'investigacion', label: 'Investigación' },
  { key: 'participacion', label: 'Participación' },
  { key: 'comportamiento', label: 'Comportamiento' },
  { key: 'actitudinal', label: 'Actitudinal' },
];

export interface FloatFx {
  key: number;
  delta: number;
}

interface GroupColumnProps {
  session: SessionState;
  category: RecognitionCategory;
  onCategory: (c: RecognitionCategory) => void;
  onAward: (student: StudentState, delta: number) => void;
  floats: Record<string, FloatFx>;
}

/** El grupo siempre a la vista: clic +1 en la categoría activa, clic derecho −1 */
export const GroupColumn: React.FC<GroupColumnProps> = ({ session, category, onCategory, onAward, floats }) => {
  const students = session.students.filter((s) => s.active);

  return (
    <aside className="clase__group" aria-label="El grupo">
      <div className="clase__cats" role="radiogroup" aria-label="Categoría de puntos">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={category === c.key}
            className={`clase__cat clase__cat--${c.key}${category === c.key ? ' is-active' : ''}`}
            onClick={() => onCategory(c.key)}
            title={`${c.label} (tecla ${i + 1})`}
          >
            <span className="clase__cat-key">{i + 1}</span>
            {c.label}
          </button>
        ))}
      </div>

      {students.length === 0 ? (
        <p className="clase__group-empty">
          Esta aula no tiene exploradores. Matricúlalos en <Link to="/grupos">Gestión de grupos</Link>.
        </p>
      ) : (
        <div className="clase__slots">
          {students.map((st) => {
            const status = getAttendanceOnClassDate(session, st.id);
            const here = status === 'presente';
            const grade = calculateCurrentPeriodGrade(session, st);
            const level = getPerformanceLevel(grade);
            const fx = floats[st.id];
            return (
              <button
                key={st.id}
                type="button"
                className={`clase__slot is-${status}`}
                disabled={!here}
                onClick={(e) => onAward(st, e.shiftKey ? -1 : 1)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (here) onAward(st, -1);
                }}
                title={here ? `${st.name} · ${grade.toFixed(1)} (${level.label})` : `${st.name} · ${status}`}
                aria-label={`${st.name}, nota ${grade.toFixed(1)}${here ? '' : `, ${status}`}`}
              >
                {fx && (
                  <span key={fx.key} className={`clase__float${fx.delta < 0 ? ' is-minus' : ''}`}>
                    {fx.delta > 0 ? '+1' : '−1'}
                  </span>
                )}
                <span className="clase__slot-face">{initials(st.name)}</span>
                {/* Nota del periodo como barra: no tapa las iniciales (el número va en el título) */}
                <span className={`clase__slot-bar${level.approved ? '' : ' is-low'}`}>
                  <span style={{ width: `${((grade - 1) / 4) * 100}%` }} />
                </span>
                <span className="clase__slot-name">{st.name}</span>
              </button>
            );
          })}
        </div>
      )}
      <span className="clase__group-hint">Clic +1 · clic derecho −1 · Ctrl+Z deshacer</span>
    </aside>
  );
};
