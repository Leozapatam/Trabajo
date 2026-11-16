import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import { getAttendanceSummary, getPerformanceLevel, PERFORMANCE_LEVELS } from '../../engine/grading';
import { awardAction, formatDelta, getScoreAction, SCORE_ACTIONS } from '../../engine/scoring';
import {
  calculateCurrentPeriodGrade,
  getAttendanceOnClassDate,
  markAttendance,
  undoLastPointEvent,
} from '../../engine/sessionStore';
import type { AttendanceStatus, ScoreAction, SessionState, StudentState } from '../../engine/types';
import '../../styles/gm-arena.css';

type ArenaMode = 'puntos' | 'asistencia';

const ATTENDANCE_CYCLE: Record<AttendanceStatus, AttendanceStatus> = {
  presente: 'ausente',
  ausente: 'excusa',
  excusa: 'presente',
};

const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  presente: 'Presente',
  ausente: 'Ausente',
  excusa: 'Excusa',
};

const MODES: { key: ArenaMode; label: string; hotkey: string; icon: React.ReactNode }[] = [
  { key: 'puntos', label: 'Puntos', hotkey: 'P', icon: <Sparkles size={15} /> },
  { key: 'asistencia', label: 'Asistencia', hotkey: 'A', icon: <ClipboardCheck size={15} /> },
];

interface FloatFx {
  key: number;
  delta: number;
}

interface LevelFx {
  key: number;
  level: (typeof PERFORMANCE_LEVELS)[number];
}

interface Toast {
  key: number;
  text: string;
  undo: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

interface StudentArenaProps {
  session: SessionState;
  commit: (updater: (prev: SessionState) => SessionState) => void;
}

/**
 * Tablero de fichas: un toque = una acción.
 * Puntos: clic +1 en la categoría activa, clic derecho o Shift+clic −1.
 * Asistencia: clic cambia Presente → Ausente → Excusa y se guarda solo.
 */
export const StudentArena: React.FC<StudentArenaProps> = ({ session, commit }) => {
  const [mode, setMode] = useState<ArenaMode>('puntos');
  const [scoreAction, setScoreAction] = useState<ScoreAction>('aporte');
  const [floats, setFloats] = useState<Record<string, FloatFx>>({});
  const [levelUps, setLevelUps] = useState<Record<string, LevelFx>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const fxCounter = useRef(0);

  const showToast = useCallback((text: string, undo: () => void) => {
    fxCounter.current += 1;
    setToast({ key: fxCounter.current, text, undo });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const flash = (studentId: string, delta: number, before: number, after: number) => {
    fxCounter.current += 1;
    const key = fxCounter.current;
    setFloats((prev) => ({ ...prev, [studentId]: { key, delta } }));
    window.setTimeout(() => setFloats((prev) => (prev[studentId]?.key === key ? omit(prev, studentId) : prev)), 900);

    const crossed = PERFORMANCE_LEVELS.find((lvl) => lvl.approved && before < lvl.min && after >= lvl.min);
    if (crossed) {
      setLevelUps((prev) => ({ ...prev, [studentId]: { key, level: crossed } }));
      window.setTimeout(() => setLevelUps((prev) => (prev[studentId]?.key === key ? omit(prev, studentId) : prev)), 1800);
    }
  };

  const award = (student: StudentState, action: ScoreAction) => {
    const def = getScoreAction(action);
    const before = calculateCurrentPeriodGrade(session, student);
    const after = calculateCurrentPeriodGrade(session, awardAction(session, student.id, action).students.find((s) => s.id === student.id)!);
    commit((prev) => awardAction(prev, student.id, action));
    flash(student.id, def.delta, before, after);
    showToast(`${formatDelta(def.delta)} ${def.label} · ${student.name}`, () =>
      commit((prev) => undoLastPointEvent(prev, student.id))
    );
  };

  const cycleAttendance = (student: StudentState) => {
    const current = getAttendanceOnClassDate(session, student.id);
    const next = ATTENDANCE_CYCLE[current];
    commit((prev) => markAttendance(prev, student.id, next));
    showToast(`${student.name}: ${ATTENDANCE_LABEL[next]}`, () =>
      commit((prev) => markAttendance(prev, student.id, current))
    );
  };

  const handleTokenClick = (student: StudentState, e: React.MouseEvent) => {
    if (mode === 'asistencia') return cycleAttendance(student);
    award(student, e.shiftKey ? 'interrupcion' : scoreAction);
  };

  const handleTokenContextMenu = (student: StudentState, e: React.MouseEvent) => {
    if (mode !== 'puntos') return;
    e.preventDefault();
    award(student, 'interrupcion');
  };

  // Atajos: 1–4 acción, P/A modo, Ctrl+Z deshacer
  const toastRef = useRef(toast);
  toastRef.current = toast;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        const t = toastRef.current;
        if (t) {
          e.preventDefault();
          t.undo();
          setToast(null);
        }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < SCORE_ACTIONS.length) {
        setScoreAction(SCORE_ACTIONS[idx].key);
        setMode('puntos');
        return;
      }
      const m = MODES.find((x) => x.hotkey.toLowerCase() === e.key.toLowerCase());
      if (m) setMode(m.key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Matrícula y retiros se gestionan en /grupos: aquí solo juegan los activos
  const ordered = session.students.filter((s) => s.active);
  const retiredCount = session.students.length - ordered.length;
  const dayMap = session.attendanceByDate[session.classDate];
  const absentToday = session.students.filter((s) => s.active && dayMap?.[s.id] === 'ausente').length;

  return (
    <section className="rpg-window gm-arena" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div className="retro-tabs">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`retro-tab${mode === m.key ? ' is-active' : ''}`}
              onClick={() => setMode(m.key)}
              title={`Atajo: ${m.hotkey}`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {session.classDate} · P{session.period} ·{' '}
          {dayMap ? `asistencia guardada · ${absentToday} ausentes` : 'asistencia sin marcar (todos presentes)'}
          {retiredCount > 0 && ` · ${retiredCount} retirados fuera del tablero`}
        </span>
      </div>

      {mode === 'puntos' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
          {SCORE_ACTIONS.map((a, i) => (
            <button
              key={a.key}
              type="button"
              className={`gm-category-chip gm-score-chip--${a.key}${scoreAction === a.key ? ' is-selected' : ''}`}
              onClick={() => setScoreAction(a.key)}
              title={a.hint}
            >
              {i + 1} · {formatDelta(a.delta)} {a.label}
            </button>
          ))}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Clic: acción elegida · clic derecho: −1 interrupción · Ctrl+Z deshacer
          </span>
        </div>
      )}
      {mode === 'asistencia' && (
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
          Toca una ficha para cambiar Presente → Ausente → Excusa. Se guarda sola en la fecha {session.classDate}.
        </p>
      )}
      {ordered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Este grupo no tiene estudiantes matriculados. Inscríbelos en{' '}
          <Link to="/grupos" style={{ color: 'var(--accent-gold)' }}>
            Gestión de grupos
          </Link>
          .
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
          {ordered.map((st) => {
            const status = getAttendanceOnClassDate(session, st.id);
            const grade = calculateCurrentPeriodGrade(session, st);
            const level = getPerformanceLevel(grade);
            const absence = getAttendanceSummary(session, st.id, session.period);
            const fx = floats[st.id];
            const lvl = levelUps[st.id];
            const stateClass = `is-${status}`;
            return (
              <div
                key={st.id}
                role="button"
                tabIndex={0}
                className={`gm-token ${stateClass}`}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={(e) => handleTokenClick(st, e)}
                onContextMenu={(e) => handleTokenContextMenu(st, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTokenClick(st, e as unknown as React.MouseEvent);
                  }
                }}
                aria-label={`${st.name}, nota ${grade.toFixed(1)}`}
              >
                {fx && (
                  <span key={fx.key} className={fx.delta > 0 ? 'gm-float-plus' : 'gm-float-minus'}>
                    {formatDelta(fx.delta)}
                  </span>
                )}
                <div className="gm-token__header">
                  <span className="gm-token__avatar">{initials(st.name)}</span>
                  <span className="gm-token__name">{st.name}</span>
                </div>
                {/* En Puntos solo se avisa quién no está; en Asistencia se ve el estado de todos */}
                {(mode === 'asistencia' || status !== 'presente') && (
                  <span className="gm-token__status">{ATTENDANCE_LABEL[status]}</span>
                )}
                <div className="gm-token__grade-row" title={`Desempeño ${level.label}`}>
                  <div className="gm-token__grade-bar">
                    <div className="gm-token__grade-fill" style={{ width: `${((grade - 1) / 4) * 100}%` }} />
                  </div>
                  <span className="gm-token__grade-value">{grade.toFixed(1)}</span>
                </div>
                {absence.alert !== 'ok' && (
                  <span
                    className={absence.alert === 'riesgo' ? 'gm-alert-riesgo' : 'gm-alert-atencion'}
                    style={{ fontSize: '0.7rem', padding: '3px 7px' }}
                    title="Inasistencia sin excusa en este periodo (el SIE permite reprobar desde el 25 %)"
                  >
                    {Math.round(absence.unexcusedRate * 100)} % fallas
                  </span>
                )}
                {lvl && (
                  <span
                    key={lvl.key}
                    className={`gm-level-up gm-level-up--${lvl.level.key}`}
                    style={{ position: 'absolute', left: 0, right: 0, bottom: -14, margin: '0 auto', width: 'fit-content', whiteSpace: 'nowrap', zIndex: 11 }}
                  >
                    NIVEL {lvl.level.label.toUpperCase()} · {lvl.level.min.toFixed(1)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div key={toast.key} className="gm-toast" role="status">
          <span>{toast.text}</span>
          <button
            type="button"
            className="gm-toast__undo"
            onClick={() => {
              toast.undo();
              setToast(null);
            }}
          >
            Deshacer
          </button>
        </div>
      )}
    </section>
  );
};

function omit<T>(obj: Record<string, T>, key: string): Record<string, T> {
  const next = { ...obj };
  delete next[key];
  return next;
}
