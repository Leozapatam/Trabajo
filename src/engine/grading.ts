import type {
  AcademicPeriod,
  AttendanceStatus,
  PointEvent,
  RecognitionCategory,
  SessionState,
  StudentState,
} from './types';

export const PERIODS: AcademicPeriod[] = [1, 2, 3];

/** SIE I.E.R. Boyacá, artículo cuarto: peso de cada periodo en la nota anual */
export const SIE_PERIOD_WEIGHTS: Record<AcademicPeriod, number> = {
  1: 0.3,
  2: 0.35,
  3: 0.35,
};

export interface GradeConfig {
  baseGrade: number;
  stepPerPoint: number;
}

export const DEFAULT_GRADE_CONFIG: GradeConfig = { baseGrade: 3.5, stepPerPoint: 0.1 };

export type PerformanceLevel = 'superior' | 'alto' | 'basico' | 'bajo';

/** SIE artículo quinto: escala de valoración institucional */
export const PERFORMANCE_LEVELS: { key: PerformanceLevel; label: string; min: number; approved: boolean }[] = [
  { key: 'superior', label: 'Superior', min: 4.6, approved: true },
  { key: 'alto', label: 'Alto', min: 4.0, approved: true },
  { key: 'basico', label: 'Básico', min: 3.0, approved: true },
  { key: 'bajo', label: 'Bajo', min: 1.0, approved: false },
];

/** Inasistencia sin excusa: el SIE permite reprobar desde el 25 %; avisamos antes */
export const ABSENCE_WARNING_RATE = 0.15;
export const ABSENCE_RISK_RATE = 0.25;

export function emptyPoints(): Record<RecognitionCategory, number> {
  return { investigacion: 0, participacion: 0, comportamiento: 0, actitudinal: 0 };
}

export function roundGrade(value: number): number {
  return Math.round(Math.max(1.0, Math.min(5.0, value)) * 10) / 10;
}

export function sumPointLog(
  log: PointEvent[] | undefined,
  period: AcademicPeriod
): Record<RecognitionCategory, number> {
  const totals = emptyPoints();
  for (const ev of log ?? []) {
    if (ev.period === period) totals[ev.category] += ev.delta;
  }
  return totals;
}

export function getPeriodPointTotal(student: StudentState, period: AcademicPeriod): number {
  const t = sumPointLog(student.pointLog, period);
  return t.investigacion + t.participacion + t.comportamiento + t.actitudinal;
}

export function calculatePeriodGrade(
  student: StudentState,
  period: AcademicPeriod,
  config: GradeConfig = DEFAULT_GRADE_CONFIG
): number {
  return roundGrade(config.baseGrade + getPeriodPointTotal(student, period) * config.stepPerPoint);
}

/**
 * Nota anual ponderada 30/35/35. Con `periods` se calcula una proyección
 * solo con los periodos ya cursados (los pesos se normalizan).
 */
export function calculateAnnualGrade(
  student: StudentState,
  config: GradeConfig = DEFAULT_GRADE_CONFIG,
  periods: AcademicPeriod[] = PERIODS
): number {
  const weightSum = periods.reduce((acc, p) => acc + SIE_PERIOD_WEIGHTS[p], 0);
  if (weightSum === 0) return roundGrade(config.baseGrade);
  const weighted = periods.reduce(
    (acc, p) => acc + calculatePeriodGrade(student, p, config) * SIE_PERIOD_WEIGHTS[p],
    0
  );
  return roundGrade(weighted / weightSum);
}

export function getPerformanceLevel(grade: number) {
  return PERFORMANCE_LEVELS.find((lvl) => grade >= lvl.min) ?? PERFORMANCE_LEVELS[PERFORMANCE_LEVELS.length - 1];
}

export interface AttendanceSummary {
  presentes: number;
  ausentes: number;
  excusas: number;
  total: number;
  /** Ausencias sin excusa / clases registradas */
  unexcusedRate: number;
  alert: 'ok' | 'atencion' | 'riesgo';
}

export function getAttendanceSummary(
  state: Pick<SessionState, 'attendanceByDate' | 'periodByDate'>,
  studentId: string,
  period?: AcademicPeriod
): AttendanceSummary {
  const counts: Record<AttendanceStatus, number> = { presente: 0, ausente: 0, excusa: 0 };
  for (const [date, dayMap] of Object.entries(state.attendanceByDate)) {
    if (period && state.periodByDate?.[date] !== period) continue;
    const status = dayMap[studentId];
    if (status) counts[status] += 1;
  }
  const total = counts.presente + counts.ausente + counts.excusa;
  const unexcusedRate = total === 0 ? 0 : counts.ausente / total;
  return {
    presentes: counts.presente,
    ausentes: counts.ausente,
    excusas: counts.excusa,
    total,
    unexcusedRate,
    alert: unexcusedRate >= ABSENCE_RISK_RATE ? 'riesgo' : unexcusedRate >= ABSENCE_WARNING_RATE ? 'atencion' : 'ok',
  };
}
