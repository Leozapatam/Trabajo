import { getAttendanceSummary } from './grading';
import { getAttendanceOnClassDate, getClassroomKey } from './sessionStore';
import type { RecognitionCategory, SessionState } from './types';

/** Dónde quedó la narración de un aula: cada grado sigue su propia misión */
export interface ClassProgress {
  missionId: string;
  sceneIndex: number;
}

function progressKey(state: SessionState): string {
  return getClassroomKey(state.schoolYear, state.classroomName);
}

/** Guarda en el aula actual la misión y la escena en que va */
export function rememberClassProgress(state: SessionState): SessionState {
  const key = progressKey(state);
  const saved = state.progressByClassroom?.[key];
  if (saved?.missionId === state.missionId && saved.sceneIndex === state.activeSceneIndex) return state;
  return {
    ...state,
    progressByClassroom: {
      ...state.progressByClassroom,
      [key]: { missionId: state.missionId, sceneIndex: state.activeSceneIndex },
    },
  };
}

/**
 * Al entrar a un aula: retoma su misión guardada. Si no hay, y la misión activa
 * es de otro grado, empieza por la primera misión del aula.
 */
export function resumeClassProgress(state: SessionState, aulaMissionIds: string[]): SessionState {
  if (aulaMissionIds.length === 0) return state;
  const saved = state.progressByClassroom?.[progressKey(state)];
  const target: ClassProgress | null =
    saved && aulaMissionIds.includes(saved.missionId)
      ? saved
      : aulaMissionIds.includes(state.missionId)
        ? null
        : { missionId: aulaMissionIds[0], sceneIndex: 0 };
  if (!target) return state;
  if (target.missionId === state.missionId && target.sceneIndex === state.activeSceneIndex) return state;
  return {
    ...state,
    missionId: target.missionId,
    activeSceneIndex: target.sceneIndex,
    revealed: false,
    revealedHintsCount: 0,
    activeInspectionId: null,
  };
}

export interface ClassSummary {
  date: string;
  classroom: string;
  presentes: number;
  ausentes: string[];
  excusas: string[];
  /** Puntos netos del día por estudiante, de mayor a menor (solo quienes sumaron) */
  topContributors: { name: string; points: number }[];
  pointsByCategory: Record<RecognitionCategory, number>;
  totalPoints: number;
  resourcesUsed: string[];
  /** Estudiantes con 15 % o más de fallas sin excusa en el periodo */
  absenceAlerts: { name: string; rate: number; risk: boolean }[];
}

/** Resumen de la sesión de la fecha de clase, para la pantalla de cierre */
export function getClassSummary(state: SessionState): ClassSummary {
  const date = state.classDate;
  const active = state.students.filter((s) => s.active);
  const ausentes: string[] = [];
  const excusas: string[] = [];
  let presentes = 0;
  for (const s of active) {
    const status = getAttendanceOnClassDate(state, s.id);
    if (status === 'ausente') ausentes.push(s.name);
    else if (status === 'excusa') excusas.push(s.name);
    else presentes += 1;
  }

  const pointsByCategory: Record<RecognitionCategory, number> = {
    investigacion: 0,
    participacion: 0,
    comportamiento: 0,
    actitudinal: 0,
  };
  const topContributors: { name: string; points: number }[] = [];
  for (const s of active) {
    let net = 0;
    for (const ev of s.pointLog ?? []) {
      if (ev.date !== date || ev.migrated) continue;
      net += ev.delta;
      pointsByCategory[ev.category] += ev.delta;
    }
    if (net > 0) topContributors.push({ name: s.name, points: net });
  }
  topContributors.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, 'es'));

  const classroom = state.classroomName;
  const resourcesUsed = [
    ...new Set((state.resourceLog ?? []).filter((r) => r.date === date && r.classroom === classroom).map((r) => r.title)),
  ];

  const absenceAlerts = active
    .map((s) => ({ name: s.name, summary: getAttendanceSummary(state, s.id, state.period) }))
    .filter((x) => x.summary.alert !== 'ok')
    .map((x) => ({ name: x.name, rate: x.summary.unexcusedRate, risk: x.summary.alert === 'riesgo' }))
    .sort((a, b) => b.rate - a.rate);

  return {
    date,
    classroom,
    presentes,
    ausentes,
    excusas,
    topContributors,
    pointsByCategory,
    totalPoints: Object.values(pointsByCategory).reduce((a, b) => a + b, 0),
    resourcesUsed,
    absenceAlerts,
  };
}
