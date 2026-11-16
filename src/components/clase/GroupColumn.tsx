import React from 'react';
import { Link } from 'react-router-dom';
import { initials } from '../aulas/aulaInfo';
import { getPerformanceLevel } from '../../engine/grading';
import { calculateCurrentPeriodGrade, getAttendanceOnClassDate } from '../../engine/sessionStore';
import { formatDelta, SCORE_ACTIONS } from '../../engine/scoring';
import type { ScoreAction, SessionState, StudentState } from '../../engine/types';

export interface FloatFx {
  key: number;
  delta: number;
}

interface GroupColumnProps {
  session: SessionState;
  action: ScoreAction;
  onAction: (a: ScoreAction) => void;
  onAward: (student: StudentState, action: ScoreAction) => void;
  floats: Record<string, FloatFx>;
}

/** El grupo siempre a la vista: clic aplica la acción elegida, clic derecho una interrupción */
export const GroupColumn: React.FC<GroupColumnProps> = ({ session, action, onAction, onAward, floats }) => {
  const students = session.students.filter((s) => s.active);

  return (
    <aside className="clase__group" aria-label="El grupo">
      <div className="clase__cats" role="radiogroup" aria-label="Acción de puntaje">
        {SCORE_ACTIONS.map((a, i) => (
          <button
            key={a.key}
            type="button"
            role="radio"
            aria-checked={action === a.key}
            className={`clase__cat clase__cat--${a.key}${action === a.key ? ' is-active' : ''}`}
            onClick={() => onAction(a.key)}
            title={`${a.hint} (tecla ${i + 1})`}
          >
            <span className="clase__cat-key">{i + 1}</span>
            <span className="clase__cat-delta">{formatDelta(a.delta)}</span>
            {a.label}
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
                onClick={(e) => onAward(st, e.shiftKey ? 'interrupcion' : action)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (here) onAward(st, 'interrupcion');
                }}
                title={here ? `${st.name} · ${grade.toFixed(1)} (${level.label})` : `${st.name} · ${status}`}
                aria-label={`${st.name}, nota ${grade.toFixed(1)}${here ? '' : `, ${status}`}`}
              >
                {fx && (
                  <span key={fx.key} className={`clase__float${fx.delta < 0 ? ' is-minus' : ''}`}>
                    {formatDelta(fx.delta)}
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
      <span className="clase__group-hint">Clic: acción elegida · clic derecho: −1 interrupción · Ctrl+Z deshacer</span>
    </aside>
  );
};
