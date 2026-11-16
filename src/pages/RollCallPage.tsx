import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmbientBreeze } from '../components/AmbientBreeze';
import { getAula, initials, longDate } from '../components/aulas/aulaInfo';
import { GradeLabel } from '../components/aulas/GradeLabel';
import {
  confirmAttendance,
  getAttendanceOnClassDate,
  loadSessionState,
  markAllPresent,
  markAttendance,
  saveAndBroadcastSession,
  subscribeToNewerSession,
} from '../engine/sessionStore';
import type { AttendanceStatus, SessionState } from '../engine/types';
import '../styles/aulas.css';

const NEXT_STATUS: Record<AttendanceStatus, AttendanceStatus> = {
  presente: 'ausente',
  ausente: 'excusa',
  excusa: 'presente',
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  presente: 'Presente',
  ausente: 'Ausente',
  excusa: 'Excusa',
};

/**
 * Llamado a lista antes de empezar: todos llegan como presentes y se toca a quien falta.
 * Flechas mueven, Espacio cambia el estado, Enter comienza la clase, Esc vuelve a las aulas.
 */
export const RollCallPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionState>(loadSessionState);
  useEffect(() => subscribeToNewerSession(setSession), []);
  const gridRef = useRef<HTMLDivElement>(null);

  const aula = getAula(session.classroomName);
  const students = session.students.filter((s) => s.active);
  const statusOf = (id: string) => getAttendanceOnClassDate(session, id);
  const counts = { presente: 0, ausente: 0, excusa: 0 };
  for (const s of students) counts[statusOf(s.id)] += 1;

  const commit = (next: SessionState) => setSession(saveAndBroadcastSession(next));

  const start = () => {
    commit({
      ...confirmAttendance(session),
      classStarted: true,
      active: true,
      status: 'running',
      projectorMode: 'intro',
    });
    navigate('/clase');
  };

  const handlersRef = useRef({ start });
  handlersRef.current = { start };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Enter siempre comienza (aunque el foco esté en una ficha).
        // Una tecla que viene sostenida desde la pantalla anterior no cuenta.
        e.preventDefault();
        if (!e.repeat) handlersRef.current.start();
        return;
      }
      if (e.key === 'Escape') {
        navigate('/aulas');
        return;
      }
      if (!e.key.startsWith('Arrow')) return;
      const tiles = [...(gridRef.current?.querySelectorAll<HTMLButtonElement>('.roll__tile') ?? [])];
      if (tiles.length === 0) return;
      e.preventDefault();
      const current = tiles.indexOf(document.activeElement as HTMLButtonElement);
      if (current === -1) return tiles[0].focus();
      // Columnas reales de la cuadrícula: fichas que comparten la primera fila
      const cols = tiles.filter((t) => t.offsetTop === tiles[0].offsetTop).length;
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key] ?? 0;
      tiles[Math.max(0, Math.min(tiles.length - 1, current + step))].focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div className="roll">
      <div className="aulas__art" aria-hidden="true">
        <img src={aula.art} alt="" className="is-active" />
      </div>
      <div className="roll__shade" aria-hidden="true" />
      <AmbientBreeze scene="tierra" intensity="soft" />

      <header className="aulas__top">
        <button type="button" className="aulas__back" onClick={() => navigate('/aulas')}>
          ◂ AULAS
        </button>
        <span className="aulas__heading">
          AULA <GradeLabel grades={aula.grades} />
          <span className="aulas__heading-world">{aula.world}</span>
        </span>
        <span className="aulas__when">
          {longDate(session.classDate)} · Periodo {session.period}
        </span>
      </header>

      <main className="roll__main">
        <h1 className="roll__question">¿Con quién contamos para esta sesión?</h1>

        {students.length === 0 ? (
          <div className="roll__empty">
            <p>Esta aula todavía no tiene exploradores matriculados.</p>
            <div className="roll__actions">
              <button type="button" className="roll__secondary" onClick={() => navigate('/grupos')}>
                Ir a Gestión de grupos
              </button>
              <button type="button" className="roll__start" onClick={start}>
                COMENZAR <span aria-hidden="true">➤</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="roll__counts" role="status">
              <span className="roll__count is-presente">
                <strong>{counts.presente}</strong> PRESENTES
              </span>
              <span className={`roll__count is-ausente${counts.ausente ? '' : ' is-zero'}`}>
                <strong>{counts.ausente}</strong> AUSENTES
              </span>
              <span className={`roll__count is-excusa${counts.excusa ? '' : ' is-zero'}`}>
                <strong>{counts.excusa}</strong> EXCUSAS
              </span>
            </div>

            <div ref={gridRef} className="roll__grid">
              {students.map((st, i) => {
                const status = statusOf(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`roll__tile is-${status}`}
                    style={{ animationDelay: `${Math.min(i, 40) * 18}ms` }}
                    onClick={() => commit(markAttendance(session, st.id, NEXT_STATUS[status]))}
                    aria-label={`${st.name}: ${STATUS_LABEL[status]}`}
                  >
                    <span className="roll__slot">{initials(st.name)}</span>
                    <span className="roll__name">{st.name}</span>
                    {status !== 'presente' && <span className="roll__tag">{STATUS_LABEL[status]}</span>}
                  </button>
                );
              })}
            </div>

            <div className="roll__actions">
              <span className="roll__hint">Toca a quien falta: Presente → Ausente → Excusa</span>
              {counts.presente < students.length && (
                <button type="button" className="roll__secondary" onClick={() => commit(markAllPresent(session))}>
                  Todos presentes
                </button>
              )}
              <button type="button" className="roll__start" onClick={start}>
                COMENZAR <span aria-hidden="true">➤</span>
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="aulas__hint">Flechas mover · Espacio cambiar · Enter comenzar · Esc volver</footer>
    </div>
  );
};
