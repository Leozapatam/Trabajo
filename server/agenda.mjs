// Agenda del docente desde la "dirección secreta en formato iCal" de Google Calendar.
// El servidor local la descarga: no hay que iniciar sesión ni abrir otra ventana.
// La dirección se guarda solo en el PC (config.json en la carpeta de datos), nunca en el código.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import ICAL from 'ical.js';

const CACHE_MS = 5 * 60 * 1000;
const MAX_OCCURRENCES = 5000;

/** Acepta https:// o webcal:// de un .ics (Google, Outlook…). Devuelve la URL https o lanza error. */
export function normalizeIcsUrl(raw) {
  let url;
  try {
    url = new URL(String(raw ?? '').trim().replace(/^webcals?:\/\//i, 'https://'));
  } catch {
    throw Object.assign(new Error('Ese enlace no es válido'), { status: 400 });
  }
  if (url.protocol !== 'https:') throw Object.assign(new Error('El enlace debe empezar por https://'), { status: 400 });
  const looksLikeIcs = url.pathname.endsWith('.ics') || url.hostname === 'calendar.google.com';
  if (!looksLikeIcs) {
    throw Object.assign(new Error('Pega la "Dirección secreta en formato iCal" (termina en .ics)'), { status: 400 });
  }
  return url.toString();
}

function toEvent(item, start, end) {
  const allDay = start.isDate;
  return {
    id: `${item.uid}@${start.toString()}`,
    title: item.summary || '(Sin título)',
    location: item.location || '',
    allDay,
    // Todo el día: fecha local sin hora; con hora: instante ISO
    start: allDay ? start.toString() : start.toJSDate().toISOString(),
    end: allDay ? end.toString() : end.toJSDate().toISOString(),
  };
}

function overlaps(start, end, from, to) {
  return end.toJSDate() > from && start.toJSDate() < to;
}

/** Expande eventos (incluidos los recurrentes y sus excepciones) entre `from` y `to` */
export function parseIcsEvents(icsText, from, to) {
  const root = new ICAL.Component(ICAL.parse(icsText));
  for (const tz of root.getAllSubcomponents('vtimezone')) ICAL.TimezoneService.register(tz);

  const masters = new Map();
  const exceptions = [];
  for (const comp of root.getAllSubcomponents('vevent')) {
    if (String(comp.getFirstPropertyValue('status') ?? '').toUpperCase() === 'CANCELLED') continue;
    const ev = new ICAL.Event(comp);
    if (ev.isRecurrenceException()) exceptions.push(ev);
    else masters.set(ev.uid, ev);
  }
  for (const ex of exceptions) masters.get(ex.uid)?.relateException(ex);

  const out = [];
  for (const ev of masters.values()) {
    if (!ev.isRecurring()) {
      if (overlaps(ev.startDate, ev.endDate, from, to)) out.push(toEvent(ev, ev.startDate, ev.endDate));
      continue;
    }
    const it = ev.iterator();
    for (let n = 0, next = it.next(); next && n < MAX_OCCURRENCES; n++, next = it.next()) {
      if (next.toJSDate() >= to) break;
      const occ = ev.getOccurrenceDetails(next);
      if (String(occ.item.component.getFirstPropertyValue('status') ?? '').toUpperCase() === 'CANCELLED') continue;
      if (overlaps(occ.startDate, occ.endDate, from, to)) out.push(toEvent(occ.item, occ.startDate, occ.endDate));
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export function createAgenda({ dataDir, fetchImpl = globalThis.fetch, now = () => new Date() }) {
  const configFile = join(dataDir, 'config.json');
  let cache = null; // { url, text, fetchedAt }

  async function readConfig() {
    try {
      return JSON.parse(await readFile(configFile, 'utf8'));
    } catch {
      return {};
    }
  }

  async function writeConfig(patch) {
    await mkdir(dataDir, { recursive: true });
    const next = { ...(await readConfig()), ...patch };
    await writeFile(configFile, JSON.stringify(next, null, 2), 'utf8');
  }

  async function download(url, force = false) {
    if (!force && cache && cache.url === url && now().getTime() - cache.fetchedAt < CACHE_MS) return cache;
    let res;
    try {
      res = await fetchImpl(url, { signal: AbortSignal.timeout(10000) });
    } catch {
      throw Object.assign(new Error('Sin conexión a internet o Google no respondió'), { status: 502 });
    }
    if (!res.ok) {
      throw Object.assign(new Error(`Google respondió ${res.status}: revisa que el enlace sea la dirección secreta`), { status: 502 });
    }
    const text = await res.text();
    if (!text.includes('BEGIN:VCALENDAR')) {
      throw Object.assign(new Error('El enlace no devuelve un calendario iCal'), { status: 502 });
    }
    cache = { url, text, fetchedAt: now().getTime() };
    return cache;
  }

  /** Eventos durante `days` días desde `from` ("YYYY-MM-DD", hora local) o desde hoy */
  async function events({ days = 7, force = false, from: fromDay = null } = {}) {
    const { agendaIcsUrl } = await readConfig();
    if (!agendaIcsUrl) return { configured: false };
    const { text, fetchedAt } = await download(agendaIcsUrl, force);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fromDay ?? '');
    const from = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : now();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + Math.min(Math.max(days, 1), 31) * 86400000);
    return { configured: true, fetchedAt, events: parseIcsEvents(text, from, to) };
  }

  /** Guarda el enlace solo si de verdad descarga un calendario */
  async function configure(rawUrl) {
    const url = normalizeIcsUrl(rawUrl);
    const { text } = await download(url, true);
    parseIcsEvents(text, now(), now()); // valida que se pueda leer
    await writeConfig({ agendaIcsUrl: url });
  }

  async function disconnect() {
    cache = null;
    await writeConfig({ agendaIcsUrl: null });
  }

  return { events, configure, disconnect };
}
