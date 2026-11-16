import React, { useState } from 'react';
import { ExternalLink, Moon, Settings, Sun } from 'lucide-react';

/** El ID del calendario se guarda solo en este PC (nunca en el código ni en GitHub) */
const CALENDAR_ID_KEY = 'cs.googleCalendarId';
const CALENDAR_DARK_KEY = 'cs.googleCalendarDark';

type CalendarView = 'AGENDA' | 'WEEK' | 'MONTH';

const VIEWS: { key: CalendarView; label: string }[] = [
  { key: 'AGENDA', label: 'Agenda' },
  { key: 'WEEK', label: 'Semana' },
  { key: 'MONTH', label: 'Mes' },
];

function readStored(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento: se pedirá de nuevo la próxima vez
  }
}

function embedUrl(calendarId: string, view: CalendarView): string {
  const params = new URLSearchParams({
    src: calendarId,
    ctz: 'America/Bogota',
    mode: view,
    hl: 'es',
    showTitle: '0',
    showPrint: '0',
    showTabs: '0',
    showCalendars: '0',
    showTz: '0',
    wkst: '2',
  });
  return `https://calendar.google.com/calendar/embed?${params.toString()}`;
}

/** Agenda de Google Calendar dentro de la semiventana, para ordenarse antes de clase */
export const CalendarPanel: React.FC = () => {
  const [calendarId, setCalendarId] = useState(() => readStored(CALENDAR_ID_KEY));
  const [draft, setDraft] = useState(calendarId);
  const [editing, setEditing] = useState(!calendarId);
  const [view, setView] = useState<CalendarView>('AGENDA');
  const [dark, setDark] = useState(() => readStored(CALENDAR_DARK_KEY) !== '0');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const id = draft.trim();
    if (!id) return;
    writeStored(CALENDAR_ID_KEY, id);
    setCalendarId(id);
    setEditing(false);
  };

  const toggleDark = () => {
    setDark((d) => {
      writeStored(CALENDAR_DARK_KEY, d ? '0' : '1');
      return !d;
    });
  };

  if (editing) {
    return (
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520, margin: 'auto' }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Escribe el correo de tu cuenta de Google para ver tu calendario principal aquí, o el ID de otro calendario
          (Google Calendar → Configuración → Integrar el calendario).
        </p>
        <input
          className="game-window__input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="tucorreo@gmail.com"
          aria-label="Correo o ID del calendario"
          autoFocus
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
            Guardar
          </button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Se guarda solo en este computador.</span>
        </div>
      </form>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div className="game-window__tabs" role="tablist">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={view === v.key}
              className={`game-window__tab${view === v.key ? ' is-active' : ''}`}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" onClick={toggleDark} title="Cambiar colores del calendario">
            {dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? 'Claro' : 'Noche'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => window.open('https://calendar.google.com/calendar/r', 'google-calendar')}
            title="Abrir Google Calendar completo para crear o editar eventos"
          >
            <ExternalLink size={14} /> Editar en Google
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)} title="Cambiar de calendario">
            <Settings size={14} />
          </button>
        </div>
      </div>
      <iframe
        key={`${calendarId}-${view}`}
        title="Google Calendar"
        src={embedUrl(calendarId, view)}
        style={{
          flex: 1,
          width: '100%',
          border: '2px solid rgba(232, 184, 109, 0.35)',
          borderRadius: 2,
          background: dark ? '#0b1220' : '#fff',
          // Modo noche: invierte el calendario claro de Google para que combine con el juego
          filter: dark ? 'invert(0.9) hue-rotate(180deg) saturate(0.9)' : 'none',
        }}
      />
      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
        Si no ves tus eventos, inicia sesión en Google en este navegador una vez (botón «Editar en Google»).
      </span>
    </>
  );
};
