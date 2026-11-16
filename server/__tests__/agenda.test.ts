import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error módulo JS del servidor sin tipos
import { createAgenda, normalizeIcsUrl, parseIcsEvents } from '../agenda.mjs';

const ICS = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Google Inc//Google Calendar 70.9054//EN',
  'BEGIN:VTIMEZONE',
  'TZID:America/Bogota',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0500',
  'TZNAME:-05',
  'DTSTART:19700101T000000',
  'END:STANDARD',
  'END:VTIMEZONE',
  // Clase de 6° lunes y miércoles 7:00–7:55, sin el miércoles 18
  'BEGIN:VEVENT',
  'UID:clase-6',
  'DTSTART;TZID=America/Bogota:20261102T070000',
  'DTEND;TZID=America/Bogota:20261102T075500',
  'RRULE:FREQ=WEEKLY;BYDAY=MO,WE',
  'EXDATE;TZID=America/Bogota:20261118T070000',
  'SUMMARY:Sociales 6°',
  'LOCATION:Aula 3',
  'END:VEVENT',
  // El lunes 23 la clase se movió a las 9:00
  'BEGIN:VEVENT',
  'UID:clase-6',
  'RECURRENCE-ID;TZID=America/Bogota:20261123T070000',
  'DTSTART;TZID=America/Bogota:20261123T090000',
  'DTEND;TZID=America/Bogota:20261123T095500',
  'SUMMARY:Sociales 6° (cambio de hora)',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:festivo',
  'DTSTART;VALUE=DATE:20261116',
  'DTEND;VALUE=DATE:20261117',
  'SUMMARY:Festivo',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:cancelada',
  'DTSTART:20261117T150000Z',
  'DTEND:20261117T160000Z',
  'STATUS:CANCELLED',
  'SUMMARY:Reunión cancelada',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

// Bogotá = UTC-5: 16 nov 2026 00:00 local = 05:00Z
const FROM = new Date('2026-11-16T05:00:00Z');
const TO = new Date('2026-11-24T05:00:00Z');

describe('Lectura del calendario iCal', () => {
  it('expande recurrentes, respeta excepciones y omite cancelados', () => {
    const evs = parseIcsEvents(ICS, FROM, TO);
    const summary = evs.map((e: any) => `${e.start} ${e.title}`);
    expect(summary).toEqual([
      '2026-11-16 Festivo',
      '2026-11-16T12:00:00.000Z Sociales 6°',
      '2026-11-23T14:00:00.000Z Sociales 6° (cambio de hora)',
    ]);
    expect(evs[0].allDay).toBe(true);
    expect(evs[1].location).toBe('Aula 3');
  });

  it('acepta enlaces https y webcal de .ics y rechaza lo demás', () => {
    expect(normalizeIcsUrl('webcal://calendar.google.com/calendar/ical/x/private-y/basic.ics')).toMatch(/^https:\/\//);
    expect(() => normalizeIcsUrl('http://ejemplo.com/a.ics')).toThrow();
    expect(() => normalizeIcsUrl('https://calendar.google.com/calendar/u/0/r')).not.toThrow();
    expect(() => normalizeIcsUrl('https://ejemplo.com/pagina')).toThrow();
    expect(() => normalizeIcsUrl('no es un enlace')).toThrow();
  });
});

describe('Agenda en el servidor', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'exp6-agenda-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const fakeFetch = (body: string, status = 200) => async () => new Response(body, { status });
  const now = () => new Date('2026-11-16T15:00:00Z');

  it('sin configurar avisa; al configurar guarda el enlace solo en el PC y devuelve eventos', async () => {
    const agenda = createAgenda({ dataDir: dir, fetchImpl: fakeFetch(ICS), now });
    expect(await agenda.events()).toEqual({ configured: false });

    await agenda.configure('https://calendar.google.com/calendar/ical/abc/private-123/basic.ics');
    const config = JSON.parse(readFileSync(join(dir, 'config.json'), 'utf8'));
    expect(config.agendaIcsUrl).toContain('private-123');

    const result = await agenda.events({ days: 8 });
    expect(result.configured).toBe(true);
    expect(result.events.map((e: any) => e.title)).toContain('Sociales 6° (cambio de hora)');

    // Semana del lunes 23 (desde=…): la clase movida de ese lunes y nada del 16
    const week = await agenda.events({ from: '2026-11-23', days: 5 });
    expect(week.events.map((e: any) => e.title)).toEqual(['Sociales 6° (cambio de hora)', 'Sociales 6°']);

    await agenda.disconnect();
    expect(await agenda.events()).toEqual({ configured: false });
  });

  it('no guarda un enlace que no devuelve un calendario', async () => {
    const agenda = createAgenda({ dataDir: dir, fetchImpl: fakeFetch('<html>login</html>'), now });
    await expect(agenda.configure('https://calendar.google.com/x/basic.ics')).rejects.toMatchObject({ status: 502 });
    expect(existsSync(join(dir, 'config.json'))).toBe(false);
  });
});
