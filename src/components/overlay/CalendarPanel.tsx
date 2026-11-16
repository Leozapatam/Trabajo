import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import { addDays, dayKey, formatTime, schoolWeekMonday, type AgendaEvent } from './agendaTime';
import { WeekGrid } from './WeekGrid';

type AgendaResponse =
  | { configured: false }
  | { configured: true; fetchedAt: number; events: AgendaEvent[] };

/** 'semana' = cuadrícula lunes a viernes; los números son listas de N días desde hoy */
type View = 'semana' | 1 | 7 | 14;

const VIEWS: { key: View; label: string }[] = [
  { key: 'semana', label: 'Semana' },
  { key: 1, label: 'Hoy' },
  { key: 7, label: '7 días' },
  { key: 14, label: '14 días' },
];

function eventDayKey(ev: AgendaEvent): string {
  return ev.allDay ? ev.start.slice(0, 10) : dayKey(new Date(ev.start));
}

function dayTitle(key: string, today: string): string {
  const date = new Date(`${key}T12:00:00`);
  const label = date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
  const tomorrow = dayKey(new Date(new Date(`${today}T12:00:00`).getTime() + 86400000));
  if (key === today) return `HOY · ${label}`;
  if (key === tomorrow) return `MAÑANA · ${label}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`);
  return body as T;
}

/**
 * Agenda del docente dibujada por el juego a partir de la dirección secreta iCal de Google Calendar.
 * El servidor local la descarga: no hay que iniciar sesión ni abrir otra ventana.
 */
export const CalendarPanel: React.FC = () => {
  const [data, setData] = useState<AgendaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('semana');
  const [weekOffset, setWeekOffset] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const monday = schoolWeekMonday(new Date(), weekOffset);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    const range = view === 'semana' ? `dias=5&desde=${monday}` : `dias=${view}`;
    try {
      setData(await api<AgendaResponse>(`/api/agenda?${range}${force ? '&refrescar=1' : ''}`));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [view, monday]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reloj para marcar AHORA / SIGUIENTE
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const saveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api('/api/agenda/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: draft }),
      });
      setDraft('');
      setEditing(false);
      await load(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    await api('/api/agenda/config', { method: 'DELETE' }).catch(() => {});
    setEditing(false);
    await load();
  };

  if (loading && !data) {
    return <p style={{ margin: 'auto', color: 'var(--text-muted)' }}>Cargando agenda…</p>;
  }

  if (!data && error) {
    return (
      <div style={{ margin: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 460 }}>
        <p style={{ margin: 0, color: '#FCA5A5' }}>{error}</p>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.84rem' }}>
          La agenda necesita el servidor local: abre la app con el acceso directo «Ciencias Sociales».
        </p>
        <button type="button" className="btn" onClick={() => load(true)} style={{ alignSelf: 'center' }}>
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    );
  }

  if (data && (!data.configured || editing)) {
    return (
      <form onSubmit={saveUrl} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620, margin: 'auto' }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Conecta tu Google Calendar una sola vez, sin iniciar sesión aquí:
        </p>
        <ol style={{ margin: 0, paddingLeft: 22, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
          <li>
            En Google Calendar abre <strong>⚙ Configuración</strong>.
          </li>
          <li>
            A la izquierda, en <strong>Configuración de mis calendarios</strong>, elige tu calendario.
          </li>
          <li>
            Baja hasta <strong>Integrar el calendario</strong> y copia la <strong>Dirección secreta en formato iCal</strong>.
          </li>
          <li>Pégala aquí abajo.</li>
        </ol>
        <input
          className="game-window__input"
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://calendar.google.com/calendar/ical/…/private-…/basic.ics"
          aria-label="Dirección secreta en formato iCal"
          autoFocus
        />
        {error && <span style={{ color: '#FCA5A5', fontSize: '0.86rem' }}>{error}</span>}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={!draft.trim() || saving}>
            {saving ? 'Comprobando…' : 'Conectar agenda'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => window.open('https://calendar.google.com/calendar/r/settings', 'google-calendar')}
          >
            <ExternalLink size={14} /> Abrir configuración de Google
          </button>
          {data.configured && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-ghost" onClick={disconnect} style={{ color: '#FCA5A5' }}>
                Desconectar agenda
              </button>
            </>
          )}
        </div>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          La dirección es privada: se guarda solo en este computador (Documentos\Expedicion6-Datos) y nunca se publica.
        </span>
      </form>
    );
  }

  if (!data || !data.configured) return null;

  const today = dayKey(now);
  const listDays = view === 'semana' ? 0 : view;
  const groups = new Map<string, AgendaEvent[]>();
  for (let i = 0; i < listDays; i++) groups.set(addDays(today, i), []);
  for (const ev of data.events) groups.get(eventDayKey(ev))?.push(ev);

  const timedToday = (groups.get(today) ?? []).filter((e) => !e.allDay);
  const current = timedToday.find((e) => new Date(e.start) <= now && now < new Date(e.end));
  const upcoming = timedToday.find((e) => new Date(e.start) > now);

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
          {view === 'semana' && (
            <span className="week-nav">
              <button type="button" className="btn btn-ghost" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Semana anterior">
                <ChevronLeft size={14} />
              </button>
              <span className="week-nav__label">{weekLabel(monday)}</span>
              <button type="button" className="btn btn-ghost" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Semana siguiente">
                <ChevronRight size={14} />
              </button>
              {weekOffset !== 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => setWeekOffset(0)}>
                  Esta semana
                </button>
              )}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Actualizada {formatTime(new Date(data.fetchedAt).toISOString())}
          </span>
          <button type="button" className="btn btn-ghost" onClick={() => load(true)} title="Actualizar" disabled={loading}>
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => window.open('https://calendar.google.com/calendar/r', 'google-calendar')}
            title="Crear o mover eventos en Google Calendar"
          >
            <ExternalLink size={14} /> Editar en Google
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)} title="Cambiar o desconectar">
            <Settings size={14} />
          </button>
        </div>
      </div>

      {error && <span style={{ color: '#FCA5A5', fontSize: '0.84rem' }}>{error}</span>}

      {view === 'semana' ? (
        <WeekGrid monday={monday} events={data.events} now={now} />
      ) : (
      <div className="agenda-list">
        {[...groups.entries()].map(([key, evs]) => (
          <section key={key} className="agenda-day">
            <h3 className={`agenda-day__title${key === today ? ' is-today' : ''}`}>{dayTitle(key, today)}</h3>
            {evs.length === 0 ? (
              <p className="agenda-empty">Sin eventos · día libre para la expedición</p>
            ) : (
              evs.map((ev) => {
                const past = !ev.allDay && new Date(ev.end) <= now;
                const tag = ev === current ? 'AHORA' : ev === upcoming ? 'SIGUIENTE' : null;
                return (
                  <div
                    key={ev.id}
                    className={`agenda-event${past ? ' is-past' : ''}${tag === 'AHORA' ? ' is-now' : ''}${tag === 'SIGUIENTE' ? ' is-next' : ''}`}
                  >
                    <span className="agenda-event__time">
                      {ev.allDay ? 'Todo el día' : `${formatTime(ev.start)} – ${formatTime(ev.end)}`}
                    </span>
                    <span className="agenda-event__title">
                      {ev.title}
                      {ev.location && <span className="agenda-event__place"> · {ev.location}</span>}
                    </span>
                    {tag && <span className="agenda-event__tag">{tag}</span>}
                  </div>
                );
              })
            )}
          </section>
        ))}
      </div>
      )}
    </>
  );
};

function weekLabel(monday: string): string {
  const fmt = (key: string) =>
    new Date(`${key}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).replace('.', '');
  return `${fmt(monday)} – ${fmt(addDays(monday, 4))}`;
}
