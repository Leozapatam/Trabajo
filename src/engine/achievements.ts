import type { TeacherProfile } from './types';

/**
 * Logros de docencia.
 * Docentes oficiales vinculados desde la Ley 812 de 2003: régimen de prima media
 * (Ley 100 de 1993 y Ley 797 de 2003), 1300 semanas y 57 años para hombres y mujeres.
 * La app solo estima; el dato oficial lo da el fondo (FOMAG / Colpensiones).
 */
export const DEFAULT_GOAL_WEEKS = 1300;
export const DEFAULT_PENSION_AGE = 57;

const DAY_MS = 86_400_000;

function parseDate(iso: string | undefined): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toUtc(today: Date): Date {
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
}

/** Años completos entre dos fechas */
export function fullYearsBetween(from: Date, to: Date): number {
  let years = to.getUTCFullYear() - from.getUTCFullYear();
  const beforeAnniversary =
    to.getUTCMonth() < from.getUTCMonth() ||
    (to.getUTCMonth() === from.getUTCMonth() && to.getUTCDate() < from.getUTCDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(0, years);
}

function addYears(date: Date, years: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate()));
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface Trophy {
  id: string;
  kind: 'anios' | 'semanas';
  value: number;
  label: string;
  unlocked: boolean;
  /** Fecha en que se gana (o se ganará), AAAA-MM-DD */
  date: string | null;
}

export interface AchievementSummary {
  hasData: boolean;
  age: number | null;
  yearsTeaching: number;
  daysTeaching: number;
  weeksTeaching: number;
  totalWeeks: number;
  goalWeeks: number;
  pensionAge: number;
  weeksLeft: number;
  /** Cuándo se cumplen semanas y edad a la vez */
  pensionDate: string | null;
  trophies: Trophy[];
}

const WEEK_MILESTONES = [100, 250, 500, 750, 1000];

export function summarizeAchievements(profile: TeacherProfile | undefined, today = new Date()): AchievementSummary {
  const now = toUtc(today);
  const birth = parseDate(profile?.birthDate);
  const start = parseDate(profile?.startDate);
  const prior = Math.max(0, Math.floor(profile?.priorWeeks ?? 0));
  const goalWeeks = profile?.goalWeeks ?? DEFAULT_GOAL_WEEKS;
  const pensionAge = profile?.pensionAge ?? DEFAULT_PENSION_AGE;

  const daysTeaching = start && start <= now ? Math.floor((now.getTime() - start.getTime()) / DAY_MS) + 1 : 0;
  // Semanas legales: días cotizados / 7
  const weeksTeaching = Math.floor(daysTeaching / 7);
  const totalWeeks = prior + weeksTeaching;
  const yearsTeaching = start && start <= now ? fullYearsBetween(start, now) : 0;

  // Fecha en que la cuenta llega a n semanas, si se sigue trabajando sin pausa
  const dateForWeeks = (n: number): Date | null => {
    if (!start) return null;
    const needed = n - prior;
    if (needed <= 0) return start;
    return new Date(start.getTime() + (needed * 7 - 1) * DAY_MS);
  };

  const trophies: Trophy[] = [];
  const maxYears = Math.max(yearsTeaching + 3, 5);
  for (let y = 1; y <= maxYears; y += 1) {
    trophies.push({
      id: `anios-${y}`,
      kind: 'anios',
      value: y,
      label: `${y} ${y === 1 ? 'año' : 'años'} dando clase`,
      unlocked: y <= yearsTeaching,
      date: start ? toIso(addYears(start, y)) : null,
    });
  }
  for (const n of [...WEEK_MILESTONES.filter((n) => n < goalWeeks), goalWeeks]) {
    const d = dateForWeeks(n);
    trophies.push({
      id: `semanas-${n}`,
      kind: 'semanas',
      value: n,
      label: n === goalWeeks ? `${n} semanas: meta de pensión` : `${n} semanas cotizadas`,
      unlocked: totalWeeks >= n,
      date: d ? toIso(d) : null,
    });
  }

  const weeksDate = dateForWeeks(goalWeeks);
  const ageDate = birth ? addYears(birth, pensionAge) : null;
  const pensionDate = weeksDate && ageDate ? toIso(weeksDate > ageDate ? weeksDate : ageDate) : null;

  return {
    hasData: Boolean(start),
    age: birth && birth <= now ? fullYearsBetween(birth, now) : null,
    yearsTeaching,
    daysTeaching,
    weeksTeaching,
    totalWeeks,
    goalWeeks,
    pensionAge,
    weeksLeft: Math.max(0, goalWeeks - totalWeeks),
    pensionDate,
    trophies,
  };
}
