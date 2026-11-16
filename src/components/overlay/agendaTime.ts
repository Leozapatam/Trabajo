/** Evento tal como lo entrega /api/agenda */
export interface AgendaEvent {
  id: string;
  title: string;
  location: string;
  allDay: boolean;
  /** Todo el día: "YYYY-MM-DD"; con hora: instante ISO */
  start: string;
  end: string;
}

export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Suma días a una fecha "YYYY-MM-DD" (al mediodía, para no tropezar con cambios de hora) */
export function addDays(key: string, n: number): string {
  return dayKey(new Date(new Date(`${key}T12:00:00`).getTime() + n * 86400000));
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
}

/** Lunes de la semana escolar a mostrar: sábado y domingo ya miran la semana siguiente */
export function schoolWeekMonday(today: Date, weekOffset = 0): string {
  const dow = today.getDay(); // 0 domingo … 6 sábado
  const shift = dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow;
  return addDays(dayKey(today), shift + weekOffset * 7);
}
