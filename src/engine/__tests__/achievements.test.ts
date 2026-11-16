import { describe, expect, it } from 'vitest';
import { fullYearsBetween, summarizeAchievements } from '../achievements';

const day = (iso: string) => new Date(`${iso}T12:00:00`);

describe('logros de docencia', () => {
  it('sin fecha de inicio no hay datos ni trofeos ganados', () => {
    const s = summarizeAchievements(undefined, day('2026-11-16'));
    expect(s.hasData).toBe(false);
    expect(s.trophies.every((t) => !t.unlocked)).toBe(true);
  });

  it('cuenta años completos, edad y semanas (días / 7)', () => {
    const s = summarizeAchievements({ birthDate: '1990-05-20', startDate: '2023-11-16' }, day('2026-11-16'));
    expect(s.age).toBe(36);
    expect(s.yearsTeaching).toBe(3);
    expect(s.daysTeaching).toBe(1097);
    expect(s.weeksTeaching).toBe(156);
    expect(s.trophies.find((t) => t.id === 'anios-3')?.unlocked).toBe(true);
    expect(s.trophies.find((t) => t.id === 'anios-4')?.unlocked).toBe(false);
    expect(s.trophies.find((t) => t.id === 'semanas-100')?.unlocked).toBe(true);
  });

  it('suma semanas previas y calcula la fecha de pensión por lo último que se cumpla', () => {
    const s = summarizeAchievements(
      { birthDate: '1990-05-20', startDate: '2023-11-16', priorWeeks: 200 },
      day('2026-11-16')
    );
    expect(s.totalWeeks).toBe(356);
    expect(s.weeksLeft).toBe(944);
    // 1100 semanas desde 2023-11-16 llegan en 2044; los 57 años, en 2047
    expect(s.pensionDate).toBe('2047-05-20');
  });

  it('el aniversario no cuenta antes del día', () => {
    expect(fullYearsBetween(new Date(Date.UTC(2020, 5, 10)), new Date(Date.UTC(2021, 5, 9)))).toBe(0);
    expect(fullYearsBetween(new Date(Date.UTC(2020, 5, 10)), new Date(Date.UTC(2021, 5, 10)))).toBe(1);
  });
});
