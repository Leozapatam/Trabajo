import React from 'react';
import { addDays, dayKey, formatTime, type AgendaEvent } from './agendaTime';

const PX_PER_HOUR = 46;
const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 18;

interface PlacedEvent {
  ev: AgendaEvent;
  startMin: number;
  endMin: number;
  lane: number;
  lanes: number;
}

function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** Reparte eventos que se cruzan en carriles lado a lado */
function placeEvents(evs: AgendaEvent[], dayStartMin: number, dayEndMin: number): PlacedEvent[] {
  const items = evs
    .map((ev) => ({
      ev,
      startMin: Math.max(dayStartMin, minutesOfDay(ev.start)),
      // Un evento que termina otro día se corta al final de la columna
      endMin: dayKey(new Date(ev.end)) !== dayKey(new Date(ev.start)) ? dayEndMin : Math.min(dayEndMin, minutesOfDay(ev.end)),
      lane: 0,
      lanes: 1,
    }))
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  let cluster: PlacedEvent[] = [];
  let clusterEnd = -1;
  const laneEnds: number[] = [];
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => (c.lanes = lanes));
    cluster = [];
    laneEnds.length = 0;
  };
  for (const item of items) {
    if (item.startMin >= clusterEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= item.startMin);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = item.endMin;
    item.lane = lane;
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.endMin);
  }
  flush();
  return items;
}

interface WeekGridProps {
  monday: string;
  events: AgendaEvent[];
  now: Date;
}

/** Semana escolar lunes a viernes: una columna por día y bloques verticales según la hora */
export const WeekGrid: React.FC<WeekGridProps> = ({ monday, events, now }) => {
  const days = [0, 1, 2, 3, 4].map((i) => addDays(monday, i));
  const today = dayKey(now);

  const timed = events.filter((e) => !e.allDay);
  const allDay = events.filter((e) => e.allDay);

  // Horario visible: 6:00–18:00, ampliado si hay eventos por fuera
  let startHour = DEFAULT_START_HOUR;
  let endHour = DEFAULT_END_HOUR;
  for (const ev of timed) {
    startHour = Math.min(startHour, Math.floor(minutesOfDay(ev.start) / 60));
    const endMin = dayKey(new Date(ev.end)) !== dayKey(new Date(ev.start)) ? 24 * 60 : minutesOfDay(ev.end);
    endHour = Math.max(endHour, Math.ceil(endMin / 60));
  }
  const dayStartMin = startHour * 60;
  const dayEndMin = endHour * 60;
  const height = (endHour - startHour) * PX_PER_HOUR;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const toPx = (min: number) => ((min - dayStartMin) / 60) * PX_PER_HOUR;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const hasAllDay = days.some((d) => allDay.some((e) => e.start <= d && d < e.end));

  return (
    <div className="week-grid">
      {/* Encabezados */}
      <div className="week-grid__corner" />
      {days.map((d) => {
        const date = new Date(`${d}T12:00:00`);
        const weekday = date.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '');
        return (
          <div key={d} className={`week-grid__head${d === today ? ' is-today' : ''}`}>
            <span className="week-grid__weekday">{weekday}</span>
            <span className="week-grid__date">{date.getDate()}</span>
          </div>
        );
      })}

      {/* Eventos de todo el día */}
      {hasAllDay && (
        <>
          <div className="week-grid__gutter-label">Todo el día</div>
          {days.map((d) => (
            <div key={d} className="week-grid__allday">
              {allDay
                .filter((e) => e.start <= d && d < e.end)
                .map((e) => (
                  <span key={e.id} className="week-grid__chip" title={e.title}>
                    {e.title}
                  </span>
                ))}
            </div>
          ))}
        </>
      )}

      {/* Cuerpo con horas */}
      <div className="week-grid__scroll">
        <div className="week-grid__hours" style={{ height }}>
          {hours.map((h) => (
            <span key={h} className="week-grid__hour" style={{ top: toPx(h * 60) }}>
              {h <= 12 ? `${h === 0 ? 12 : h} ${h < 12 ? 'a. m.' : 'p. m.'}` : `${h - 12} p. m.`}
            </span>
          ))}
        </div>
        {days.map((d) => {
          const placed = placeEvents(
            timed.filter((e) => dayKey(new Date(e.start)) === d),
            dayStartMin,
            dayEndMin
          );
          return (
            <div key={d} className={`week-grid__col${d === today ? ' is-today' : ''}`} style={{ height }}>
              {hours.map((h) => (
                <span key={h} className="week-grid__line" style={{ top: toPx(h * 60) }} />
              ))}
              {placed.map(({ ev, startMin, endMin, lane, lanes }) => {
                const isNow = new Date(ev.start) <= now && now < new Date(ev.end);
                const isPast = new Date(ev.end) <= now;
                const blockHeight = Math.max(20, toPx(endMin) - toPx(startMin) - 2);
                return (
                  <div
                    key={ev.id}
                    className={`week-grid__event${isNow ? ' is-now' : ''}${isPast ? ' is-past' : ''}`}
                    style={{
                      top: toPx(startMin) + 1,
                      height: blockHeight,
                      left: `calc(${(lane / lanes) * 100}% + 2px)`,
                      width: `calc(${100 / lanes}% - 4px)`,
                    }}
                    title={`${formatTime(ev.start)} – ${formatTime(ev.end)} · ${ev.title}${ev.location ? ` · ${ev.location}` : ''}`}
                  >
                    <span className="week-grid__event-title">{ev.title}</span>
                    {blockHeight > 34 && (
                      <span className="week-grid__event-time">
                        {formatTime(ev.start)} – {formatTime(ev.end)}
                      </span>
                    )}
                    {blockHeight > 52 && ev.location && <span className="week-grid__event-place">{ev.location}</span>}
                  </div>
                );
              })}
              {d === today && nowMin >= dayStartMin && nowMin <= dayEndMin && (
                <span className="week-grid__now" style={{ top: toPx(nowMin) }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
