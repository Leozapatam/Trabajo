import { describe, expect, it } from 'vitest';
import {
  calculateAnnualGrade,
  calculatePeriodGrade,
  getAttendanceSummary,
  getPerformanceLevel,
} from '../grading';
import {
  addStudentsFromText,
  awardStudentPoints,
  createInitialSessionState,
  migrateSessionState,
  recordAttendanceSnapshot,
  saveAndBroadcastSession,
  setStudentAttendance,
  syncCurrentPeriodPoints,
  undoLastPointEvent,
} from '../sessionStore';
import type { SessionState } from '../types';

function withStudents(names: string): SessionState {
  return addStudentsFromText(createInitialSessionState(), names);
}

describe('Notas por periodo y anual según el SIE', () => {
  it('separa los puntos de cada periodo y calcula la anual 30/35/35', () => {
    let s = withStudents('Ana');
    const id = s.students[0].id;
    s = awardStudentPoints(s, id, 'participacion', 5); // P1 → 4.0
    s = syncCurrentPeriodPoints({ ...s, period: 2 });
    expect(s.students[0].points.participacion).toBe(0);
    s = awardStudentPoints(s, id, 'investigacion', 10); // P2 → 4.5
    s = syncCurrentPeriodPoints({ ...s, period: 3 });
    s = awardStudentPoints(s, id, 'comportamiento', -5); // P3 → 3.0

    const st = s.students[0];
    expect(calculatePeriodGrade(st, 1)).toBe(4.0);
    expect(calculatePeriodGrade(st, 2)).toBe(4.5);
    expect(calculatePeriodGrade(st, 3)).toBe(3.0);
    // 4.0*0.30 + 4.5*0.35 + 3.0*0.35 = 3.825
    expect(calculateAnnualGrade(st)).toBe(3.8);
    // Proyección con solo P1 y P2 normaliza los pesos
    expect(calculateAnnualGrade(st, undefined, [1, 2])).toBe(4.3);
  });

  it('limita la nota a la escala 1.0 – 5.0 y asigna el desempeño institucional', () => {
    let s = withStudents('Leo');
    const id = s.students[0].id;
    s = awardStudentPoints(s, id, 'participacion', 40);
    expect(calculatePeriodGrade(s.students[0], 1)).toBe(5.0);
    expect(getPerformanceLevel(4.6).key).toBe('superior');
    expect(getPerformanceLevel(4.5).key).toBe('alto');
    expect(getPerformanceLevel(3.0).key).toBe('basico');
    expect(getPerformanceLevel(2.9).approved).toBe(false);
  });

  it('deshace el último punto otorgado', () => {
    let s = withStudents('Ana, Beto');
    s = awardStudentPoints(s, s.students[0].id, 'participacion', 1);
    s = awardStudentPoints(s, s.students[1].id, 'actitudinal', -1);
    s = undoLastPointEvent(s);
    expect(s.students[1].points.actitudinal).toBe(0);
    expect(s.students[0].points.participacion).toBe(1);
  });
});

describe('Asistencia por fecha', () => {
  it('no duplica conteos al guardar dos veces la misma fecha', () => {
    let s = withStudents('Ana');
    const id = s.students[0].id;
    s = setStudentAttendance(s, id, 'ausente');
    s = recordAttendanceSnapshot(s);
    s = recordAttendanceSnapshot(s);
    expect(s.students[0].attendanceHistory.ausentes).toBe(1);
    expect(s.periodByDate?.[s.classDate]).toBe(1);
  });

  it('alerta por inasistencia sin excusa (≥25 % = riesgo) y no cuenta excusas', () => {
    let s = withStudents('Ana');
    const id = s.students[0].id;
    const days: [string, 'presente' | 'ausente' | 'excusa'][] = [
      ['2026-02-02', 'presente'],
      ['2026-02-03', 'ausente'],
      ['2026-02-04', 'excusa'],
      ['2026-02-05', 'presente'],
    ];
    for (const [date, status] of days) {
      s = recordAttendanceSnapshot(setStudentAttendance({ ...s, classDate: date }, id, status));
    }
    const summary = getAttendanceSummary(s, id, 1);
    expect(summary).toMatchObject({ presentes: 2, ausentes: 1, excusas: 1, total: 4, alert: 'riesgo' });
    expect(getAttendanceSummary(s, id, 2).total).toBe(0);
  });
});

describe('Migración v1 → v2', () => {
  it('convierte los totales antiguos en saldo inicial del periodo activo', () => {
    const v1 = createInitialSessionState();
    const legacy = {
      ...v1,
      schemaVersion: undefined,
      period: 2,
      students: [
        {
          id: 'est-1',
          name: 'Ana',
          active: true,
          attendanceToday: 'presente',
          attendanceHistory: { presentes: 3, ausentes: 0, excusas: 0 },
          points: { investigacion: 2, participacion: 0, comportamiento: -1, actitudinal: 0 },
          badges: [],
        },
      ],
    } as unknown as SessionState;

    const migrated = migrateSessionState(legacy);
    const ana = migrated.students[0];
    expect(migrated.schemaVersion).toBe(2);
    expect(ana.pointLog).toHaveLength(2);
    expect(ana.pointLog?.every((e) => e.period === 2 && e.migrated)).toBe(true);
    expect(calculatePeriodGrade(ana, 2)).toBe(3.6);
    // El saldo migrado no se puede "deshacer" por accidente
    expect(undoLastPointEvent(migrated)).toBe(migrated);
  });

  it('al guardar recalcula los puntos visibles para el periodo activo', () => {
    let s = withStudents('Ana');
    s = awardStudentPoints(s, s.students[0].id, 'participacion', 3);
    const saved = saveAndBroadcastSession({ ...s, period: 3 });
    expect(saved.students[0].points.participacion).toBe(0);
  });
});
