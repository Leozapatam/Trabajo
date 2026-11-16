import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { CalendarPanel } from '../components/overlay/CalendarPanel';
import { GameWindow } from '../components/overlay/GameWindow';
import { TitleBackdrop } from '../components/TitleBackdrop';
import {
  getTodayIsoDate,
  loadSessionState,
  saveAndBroadcastSession,
} from '../engine/sessionStore';
import type { AcademicPeriod } from '../engine/types';
import '../styles/title-menu.css';

/** Semiventanas que se abren desde los botones redondos de la portada */
type Panel = 'calendario';

type MenuRow = 'empezar' | 'gestionar' | 'grupos' | 'logros' | 'periodo' | 'fecha';
const ROWS: MenuRow[] = ['empezar', 'gestionar', 'grupos', 'logros', 'periodo', 'fecha'];

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
  const [period, setPeriod] = useState<AcademicPeriod>(initial.period || 1);
  const [cursor, setCursor] = useState<MenuRow>('empezar');
  const [panel, setPanel] = useState<Panel | null>(null);
  const closePanel = useCallback(() => setPanel(null), []);

  // El aula se elige en la pantalla siguiente; aquí solo se fija la fecha y el periodo
  const enter = (startClass: boolean) => {
    saveAndBroadcastSession({ ...loadSessionState(), classDate, period });
    navigate(startClass ? '/aulas' : '/aulas?modo=gestion');
  };

  const changeValue = (row: MenuRow, dir: 1 | -1) => {
    if (row === 'periodo') {
      setPeriod((p) => (((p - 1 + dir + 3) % 3) + 1) as AcademicPeriod);
    } else if (row === 'fecha') {
      setClassDate((d) => shiftDate(d, dir));
    }
  };

  const activate = (row: MenuRow) => {
    if (row === 'empezar') enter(true);
    else if (row === 'gestionar') enter(false);
    else if (row === 'grupos') navigate('/grupos');
    else if (row === 'logros') navigate('/logros');
    else changeValue(row, 1);
  };

  // Los manejadores cambian en cada render; el listener lee siempre la última versión
  const handlersRef = useRef({ cursor, activate, changeValue, panel });
  handlersRef.current = { cursor, activate, changeValue, panel };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { cursor: cur, activate: act, changeValue: change, panel: openPanel } = handlersRef.current;
      if (openPanel) return; // con una semiventana abierta, el menú no se mueve
      const idx = ROWS.indexOf(cur);
      if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setPanel('calendario');
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
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

      <div className="title-dock" aria-label="Accesos rápidos">
        <button type="button" className="title-dock__button" onClick={() => setPanel('calendario')} aria-label="Agenda (C)">
          <CalendarDays size={20} />
          <span className="title-dock__label">Agenda · C</span>
        </button>
      </div>

      {panel === 'calendario' && (
        <GameWindow title="AGENDA" icon={<CalendarDays size={16} />} onClose={closePanel}>
          <CalendarPanel />
        </GameWindow>
      )}

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
          <li {...itemProps('empezar', 0.15, true)} onClick={() => enter(true)}>
            Empezar
          </li>
          <li {...itemProps('gestionar', 0.25, true)} onClick={() => enter(false)}>
            Solo gestionar
          </li>
          <li {...itemProps('grupos', 0.3, true)} onClick={() => navigate('/grupos')}>
            Gestión de grupos
          </li>
          <li {...itemProps('logros', 0.35, true)} onClick={() => navigate('/logros')}>
            Logros
          </li>
          <li aria-hidden="true" className="title-menu__divider" />
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
        <span className="title-hint">↑ ↓ moverse · ← → cambiar · Enter entrar · C agenda</span>
      </nav>

      <footer className="title-footer" style={{ position: 'relative', zIndex: 2 }}>
        Año lectivo {initial.schoolYear}
        <br />© Profe Leo · @leoelpasado
      </footer>
    </div>
  );
};
