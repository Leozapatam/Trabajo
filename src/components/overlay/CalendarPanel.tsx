import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, Settings } from 'lucide-react';

/** Evento tal como lo entrega /api/agenda */
interface AgendaEvent {
  id: string;
  title: string;
  location: string;
  allDay: boolean;
  /** Todo el día: "YYYY-MM-DD"; con hora: instante ISO */
  start: string;
  end: string;
}

type AgendaResponse =
  | { configured: false }
  | { configured: true; fetchedAt: number; events: AgendaEvent[] };

const RANGES = [
  { days: 1, label: 'Hoy' },
  { days: 7, label: '7 días' },
  { days: 14, label: '14 días' },
];

function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function eventDayKey(ev: AgendaEvent): string {
  return ev.allDay ? ev.start.slice(0, 10) : dayKey(new Date(ev.start));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
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
  const [days, setDays] = useState(7);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      setData(await api<AgendaResponse>(`/api/agenda?dias=${days}${force ? '&refrescar=1' : ''}`));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [days]);

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
  const groups = new Map<string, AgendaEvent[]>();
  for (let i = 0; i < days; i++) {
    groups.set(dayKey(new Date(new Date(`${today}T12:00:00`).getTime() + i * 86400000)), []);
  }
  for (const ev of data.events) groups.get(eventDayKey(ev))?.push(ev);

  const timedToday = (groups.get(today) ?? []).filter((e) => !e.allDay);
  const current = timedToday.find((e) => new Date(e.start) <= now && now < new Date(e.end));
  const upcoming = timedToday.find((e) => new Date(e.start) > now);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div className="game-window__tabs" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              role="tab"
              aria-selected={days === r.days}
              className={`game-window__tab${days === r.days ? ' is-active' : ''}`}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </button>
          ))}
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
    </>
  );
};
