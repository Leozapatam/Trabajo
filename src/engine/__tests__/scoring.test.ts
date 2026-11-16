import { describe, expect, it } from 'vitest';
import { getClassSummary } from '../classFlow';
import { calculatePeriodGrade } from '../grading';
import { actionOf, awardAction, formatDelta, SCORE_ACTIONS } from '../scoring';
import { addStudentsFromText, createInitialSessionState, undoLastPointEvent } from '../sessionStore';

describe('Acciones de puntaje', () => {
  it('son +1 aporte, +2 aporte extra, −1 interrupción y −2 impide la clase, en ese orden', () => {
    expect(SCORE_ACTIONS.map((a) => [a.key, a.delta])).toEqual([
      ['aporte', 1],
      ['aporte-extra', 2],
      ['interrupcion', -1],
      ['impide-clase', -2],
    ]);
  });

  it('mueven la nota del periodo según su valor y quedan en el historial con la acción', () => {
    let s = addStudentsFromText({ ...createInitialSessionState(), classDate: '2026-03-02' }, 'Ana, Beto');
    const [ana, beto] = s.students;
    s = awardAction(s, ana.id, 'aporte-extra');
    s = awardAction(s, ana.id, 'aporte');
    s = awardAction(s, beto.id, 'impide-clase');
    s = awardAction(s, beto.id, 'interrupcion');

    // Base 3.5, 0.1 por punto
    expect(calculatePeriodGrade(s.students[0], 1)).toBe(3.8);
    expect(calculatePeriodGrade(s.students[1], 1)).toBe(3.2);
    expect(s.students[0].pointLog?.map((e) => e.action)).toEqual(['aporte-extra', 'aporte']);

    const summary = getClassSummary(s);
    expect(summary.actionCounts).toEqual({ aporte: 1, 'aporte-extra': 1, interrupcion: 1, 'impide-clase': 1 });
    expect(summary.totalPoints).toBe(0);
    expect(summary.topContributors).toEqual([{ name: 'Ana', points: 3 }]);

    // Deshacer quita el −1 completo y luego el −2
    s = undoLastPointEvent(s, beto.id);
    expect(calculatePeriodGrade(s.students[1], 1)).toBe(3.3);
  });

  it('deduce la acción de los puntos de antes del cambio y escribe el signo menos', () => {
    const ev = (delta: number) => ({ id: 'x', category: 'participacion' as const, delta, period: 1 as const, date: 'd', ts: 1 });
    expect([2, 1, -1, -2, 3, -4].map((d) => actionOf(ev(d)))).toEqual([
      'aporte-extra',
      'aporte',
      'interrupcion',
      'impide-clase',
      'aporte-extra',
      'impide-clase',
    ]);
    expect([formatDelta(2), formatDelta(-1)]).toEqual(['+2', '−1']);
  });
});
