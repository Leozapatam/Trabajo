import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TitleBackdrop } from '../components/TitleBackdrop';
import { getGradeGroup, GRADE_GROUPS } from '../engine/grades';
import {
  getTodayIsoDate,
  loadSessionState,
  saveAndBroadcastSession,
  switchClassroomRoster,
} from '../engine/sessionStore';
import type { AcademicPeriod } from '../engine/types';
import '../styles/title-menu.css';

type MenuRow = 'nueva' | 'gestionar' | 'grupos' | 'grado' | 'periodo' | 'fecha';
const ROWS: MenuRow[] = ['nueva', 'gestionar', 'grupos', 'grado', 'periodo', 'fecha'];

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const next = new Date(y, m - 1, d + days);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${next.getFullYear()}-${p(next.getMonth() + 1)}-${p(next.getDate())}`;
}

/** Pantalla de título: ↑ ↓ para moverse, ← → para cambiar y Enter para entrar */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [initial] = useState(loadSessionState);

  const [classDate, setClassDate] = useState<string>(initial.classDate || getTodayIsoDate());
  const [classroomName, setClassroomName] = useState<string>(initial.classroomName);
  const [period, setPeriod] = useState<AcademicPeriod>(initial.period || 1);
  const [cursor, setCursor] = useState<MenuRow>('nueva');

  const enter = (startClass: boolean) => {
    const current = loadSessionState();
    const switched = switchClassroomRoster(current, current.schoolYear, classroomName);
    saveAndBroadcastSession({
      ...switched,
      classDate,
      period,
      classStarted: startClass,
      active: startClass,
      status: startClass ? 'running' : 'idle',
      ...(startClass ? { projectorMode: 'intro' as const } : {}),
    });
    navigate(startClass ? '/game-master' : '/game-master?tab=estudiantes');
  };

  const changeValue = (row: MenuRow, dir: 1 | -1) => {
    if (row === 'grado') {
      const idx = GRADE_GROUPS.findIndex((g) => g.id === classroomName);
      setClassroomName(GRADE_GROUPS[(idx + dir + GRADE_GROUPS.length) % GRADE_GROUPS.length].id);
    } else if (row === 'periodo') {
      setPeriod((p) => (((p - 1 + dir + 3) % 3) + 1) as AcademicPeriod);
    } else if (row === 'fecha') {
      setClassDate((d) => shiftDate(d, dir));
    }
  };

  const activate = (row: MenuRow) => {
    if (row === 'nueva') enter(true);
    else if (row === 'gestionar') enter(false);
    else if (row === 'grupos') navigate('/grupos');
    else changeValue(row, 1);
  };

  // Los manejadores cambian en cada render; el listener lee siempre la última versión
  const handlersRef = useRef({ cursor, activate, changeValue });
  handlersRef.current = { cursor, activate, changeValue };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { cursor: cur, activate: act, changeValue: change } = handlersRef.current;
      const idx = ROWS.indexOf(cur);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        setCursor(ROWS[(idx + dir + ROWS.length) % ROWS.length]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        change(cur, e.key === 'ArrowRight' ? 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        act(cur);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const grade = getGradeGroup(classroomName);
  const rawDate = new Date(`${classDate}T12:00:00`).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const itemProps = (row: MenuRow, delay: number, isAction = false) => ({
    className: `title-menu__item${isAction ? ' is-action' : ''}${cursor === row ? ' is-active' : ''}`,
    style: { animationDelay: `${delay}s` },
    onMouseEnter: () => setCursor(row),
  });

  const stepper = (row: MenuRow, label: string, value: string) => (
    <>
      <span className="title-menu__label">{label}</span>
      <button type="button" className="title-menu__arrow" aria-label={`${label} anterior`} onClick={() => changeValue(row, -1)}>
        ◂
      </button>
      <span className="title-menu__value">{value}</span>
      <button type="button" className="title-menu__arrow" aria-label={`${label} siguiente`} onClick={() => changeValue(row, 1)}>
        ▸
      </button>
    </>
  );

  return (
    <div className="title-screen">
      <TitleBackdrop vignette="right" />

      <header className="title-logo animate-title-enter" style={{ position: 'relative', zIndex: 2 }}>
        <span className="title-logo__brand">
          <img className="title-logo__avatar" src="/assets/brand/profe-leo-avatar.png" alt="Profe Leo" />
          PROFE LEO
        </span>
        <h1 className="title-logo__title">
          CIENCIAS
          <br />
          SOCIALES
        </h1>
        <span className="title-logo__subtitle">I.E.R. Boyacá · Sexto a Once</span>
      </header>

      <nav aria-label="Menú principal" style={{ position: 'relative', zIndex: 2, alignSelf: 'end', justifySelf: 'end', display: 'grid' }}>
        <ul className="title-menu">
          <li {...itemProps('nueva', 0.15, true)} onClick={() => enter(true)}>
            Empezar nueva clase
          </li>
          <li {...itemProps('gestionar', 0.25, true)} onClick={() => enter(false)}>
            Solo gestionar
          </li>
          <li {...itemProps('grupos', 0.3, true)} onClick={() => navigate('/grupos')}>
            Gestión de grupos
          </li>
          <li aria-hidden="true" className="title-menu__divider" />
          <li {...itemProps('grado', 0.4)}>{stepper('grado', 'Grado', `${grade.id} ${grade.label}`)}</li>
          <li {...itemProps('periodo', 0.5)}>{stepper('periodo', 'Periodo', `${period}`)}</li>
          <li {...itemProps('fecha', 0.6)}>
            {stepper('fecha', 'Fecha', dateLabel)}
            <input
              type="date"
              className="title-menu__date"
              aria-label="Elegir fecha en calendario"
              value={classDate}
              onChange={(e) => e.target.value && setClassDate(e.target.value)}
              style={{ width: 22 }}
            />
          </li>
        </ul>
        <span className="title-hint">↑ ↓ moverse · ← → cambiar · Enter entrar</span>
      </nav>

      <footer className="title-footer" style={{ position: 'relative', zIndex: 2 }}>
        Año lectivo {initial.schoolYear}
        <br />© Profe Leo · @leoelpasado
      </footer>
    </div>
  );
};
