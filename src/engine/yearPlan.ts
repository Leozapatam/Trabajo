import { getClassroomKey } from './sessionStore';
import type { AcademicPeriod, MissionDefinition, SessionState } from './types';
import {
  EVALUATION_SLOTS,
  MOVIES_BY_GRADE,
  TRANSVERSALS_BY_PERIOD,
  type PlannedEvaluation,
  type PeriodMovie,
  type PeriodTransversal,
} from '../data/scheduleMetadata';

/**
 * Ruta del año: 3 periodos × 13 semanas × 2 clases = 78 clases por grado.
 * Semana 1 introducción, semanas 2–11 misiones (DBA en orden), semana 12 examen
 * final del periodo y semana 13 cierre.
 */
export const PERIODS_PER_YEAR = 3;
export const WEEKS_PER_PERIOD = 13;
export const CLASSES_PER_WEEK = 2;
export const INTRO_WEEK = 1;
export const EXAM_WEEK = 12;
export const CLOSING_WEEK = 13;
export const CLASSES_PER_PERIOD = WEEKS_PER_PERIOD * CLASSES_PER_WEEK;
export const CLASSES_PER_YEAR = CLASSES_PER_PERIOD * PERIODS_PER_YEAR;

/** Misión que, si existe en el grado, se usa como introducción del curso */
const INTRO_MISSION_ID = 'mision-00';

export type PlannedClassKind = 'intro' | 'mision' | 'examen' | 'cierre';

export interface PlannedClass {
  /** p1-s3-c2: periodo 1, semana 3, clase 2 */
  id: string;
  /** 1 a 78 en el año */
  number: number;
  period: AcademicPeriod;
  week: number;
  slot: 1 | 2;
  kind: PlannedClassKind;
  title: string;
  subtitle: string;
  missionId?: string;
  /** Escenas de la misión que cubre esta clase (inclusive) */
  sceneStart?: number;
  sceneEnd?: number;
  /** Sesión k de n de la misma misión */
  session?: number;
  sessions?: number;
  /** Evaluación formal del SIE asociada a esta clase (8 por periodo) */
  evaluation?: PlannedEvaluation;
  /** Película o cine-foro programado en esta clase (2 por periodo) */
  movie?: PeriodMovie;
  /** Efeméride o cátedra transversal (Ebéjico, Afrocolombianidad, Paz, etc.) */
  transversal?: PeriodTransversal;
}

const SPECIAL: Record<Exclude<PlannedClassKind, 'mision'>, [string, string][]> = {
  intro: [
    ['Introducción del periodo', 'Ruta de los DBA del periodo, acuerdos y criterios de evaluación'],
    ['Exploración inicial', 'Ideas previas del grupo y presentación del primer territorio'],
  ],
  examen: [
    ['Examen final del periodo', 'Prueba tipo Saber, opción múltiple (10 a 20 preguntas)'],
    ['Retroalimentación de la prueba', 'Revisar respuestas, competencias y temas con menos aciertos'],
  ],
  cierre: [
    ['Cierre del periodo', 'Notas, autoevaluación y planes de mejoramiento'],
    ['Superación y celebración', 'Actividades de superación y logros del periodo'],
  ],
};

/** Reparte n elementos en k grupos lo más parejo posible (los primeros reciben el sobrante) */
function splitEvenly(n: number, k: number): number[] {
  return Array.from({ length: k }, (_, i) => Math.floor(n / k) + (i < n % k ? 1 : 0));
}

function classId(period: number, week: number, slot: number): string {
  return `p${period}-s${week}-c${slot}`;
}

function detectGradeKey(missions: MissionDefinition[], classroomName?: string): string {
  if (classroomName && MOVIES_BY_GRADE[classroomName]) return classroomName;
  const worldId = missions.find((m) => m.id !== INTRO_MISSION_ID)?.worldId;
  if (worldId === 'origenes') return '6°';
  if (worldId === 'imperios') return '7°';
  if (worldId === 'revoluciones') return '8°';
  if (worldId === 'sigloxx') return '9°';
  if (worldId === 'geopolitica') return '10°';
  if (worldId === 'globalizacion') return '11°';
  return '6°';
}

/**
 * Construye las 78 clases de un grado a partir de sus misiones en orden de DBA.
 * Las misiones se reparten entre los 3 periodos y, dentro de cada periodo, entre
 * las 20 clases de las semanas 2 a 11; cada clase cubre un tramo de escenas.
 * Vincula las 8 notas del SIE de la I.E.R. Boyacá, 2 películas y las cátedras transversales.
 */
export function buildYearPlan(missions: MissionDefinition[], classroomName?: string): PlannedClass[] {
  const intro = missions.find((m) => m.id === INTRO_MISSION_ID);
  const teaching = missions.filter((m) => m.id !== INTRO_MISSION_ID);
  const missionsPerPeriod = splitEvenly(teaching.length, PERIODS_PER_YEAR);
  const teachingSlots = (EXAM_WEEK - INTRO_WEEK - 1) * CLASSES_PER_WEEK;
  const gradeKey = detectGradeKey(missions, classroomName);

  const plan: PlannedClass[] = [];
  let missionCursor = 0;

  for (let p = 1; p <= PERIODS_PER_YEAR; p++) {
    const period = p as AcademicPeriod;
    const periodMissions = teaching.slice(missionCursor, missionCursor + missionsPerPeriod[p - 1]);
    missionCursor += periodMissions.length;

    // Clases de misión del periodo: cada misión recibe su parte de las 20 clases
    const missionSlots: Omit<PlannedClass, 'id' | 'number' | 'period' | 'week' | 'slot'>[] = [];
    if (periodMissions.length === 0) {
      for (let i = 0; i < teachingSlots; i++) {
        missionSlots.push({ kind: 'mision', title: 'Clase libre', subtitle: 'Este grado aún no tiene misiones cargadas' });
      }
    } else {
      splitEvenly(teachingSlots, periodMissions.length).forEach((sessions, mi) => {
        const mission = periodMissions[mi];
        const scenes = Math.max(1, mission.scenes.length);
        for (let s = 0; s < sessions; s++) {
          const sceneStart = Math.min(scenes - 1, Math.floor((s * scenes) / sessions));
          const sceneEnd = Math.max(sceneStart, Math.min(scenes - 1, Math.floor(((s + 1) * scenes) / sessions) - 1));
          missionSlots.push({
            kind: 'mision',
            title: mission.title,
            subtitle: `${mission.code} · sesión ${s + 1} de ${sessions}`,
            missionId: mission.id,
            sceneStart,
            sceneEnd,
            session: s + 1,
            sessions,
          });
        }
      });
    }

    let missionIndex = 0;
    for (let week = 1; week <= WEEKS_PER_PERIOD; week++) {
      for (let slot = 1; slot <= CLASSES_PER_WEEK; slot++) {
        const slotKey = `s${week}-c${slot}`;
        const evaluation = EVALUATION_SLOTS[slotKey];

        // 2 Películas por periodo: Semana 2 Slot 1 y Semana 6 Slot 1
        let movie: PeriodMovie | undefined;
        const gradeMovies = MOVIES_BY_GRADE[gradeKey]?.[period];
        if (gradeMovies) {
          if (week === 2 && slot === 1) movie = gradeMovies[0];
          else if (week === 6 && slot === 1) movie = gradeMovies[1];
        }

        // Cátedras transversales: Semana 4 Slot 1 y Semana 7 Slot 1
        let transversal: PeriodTransversal | undefined;
        const periodTrans = TRANSVERSALS_BY_PERIOD[period];
        if (periodTrans) {
          if (week === 4 && slot === 1) transversal = periodTrans.week4;
          else if (week === 7 && slot === 1) transversal = periodTrans.week7;
        }

        const base = {
          id: classId(p, week, slot),
          number: plan.length + 1,
          period,
          week,
          slot: slot as 1 | 2,
          evaluation,
          movie,
          transversal,
        };

        if (week === INTRO_WEEK) {
          // La primera introducción del año usa la misión de reglas si el grado la tiene
          if (p === 1 && intro) {
            const half = Math.ceil(intro.scenes.length / 2);
            plan.push({
              ...base,
              kind: 'intro',
              title: slot === 1 ? 'Introducción del curso' : intro.title,
              subtitle: slot === 1 ? `${intro.code} · ${intro.title}` : `${intro.code} · segunda parte`,
              missionId: intro.id,
              sceneStart: slot === 1 ? 0 : half,
              sceneEnd: slot === 1 ? half - 1 : intro.scenes.length - 1,
              session: slot,
              sessions: 2,
            });
          } else {
            const [title, subtitle] = SPECIAL.intro[slot - 1];
            plan.push({ ...base, kind: 'intro', title: p === 1 && slot === 1 ? 'Introducción del curso' : title, subtitle });
          }
        } else if (week === EXAM_WEEK || week === CLOSING_WEEK) {
          const kind = week === EXAM_WEEK ? 'examen' : 'cierre';
          const [title, subtitle] = SPECIAL[kind][slot - 1];
          plan.push({ ...base, kind, title, subtitle });
        } else {
          plan.push({ ...base, ...missionSlots[missionIndex++] });
        }
      }
    }
  }
  return plan;
}

// ---------- Avance de cada aula en su ruta ----------

export interface ClassPlanProgress {
  currentClassId: string;
  /** Clases dadas: id → fecha */
  done: Record<string, string>;
}

function planKey(state: SessionState): string {
  return getClassroomKey(state.schoolYear, state.classroomName);
}

export function getClassPlanProgress(state: SessionState): ClassPlanProgress | null {
  return state.classPlanByClassroom?.[planKey(state)] ?? null;
}

/** La clase en curso del aula; si nunca se eligió, la primera sin dar */
export function getCurrentPlannedClass(state: SessionState, plan: PlannedClass[]): PlannedClass | null {
  if (plan.length === 0) return null;
  const progress = getClassPlanProgress(state);
  const current = plan.find((c) => c.id === progress?.currentClassId);
  if (current) return current;
  return plan.find((c) => !progress?.done[c.id]) ?? plan[plan.length - 1];
}

/** Elige una clase de la ruta (no la marca como dada) */
export function selectPlannedClass(state: SessionState, classIdToSelect: string): SessionState {
  const key = planKey(state);
  const prev = state.classPlanByClassroom?.[key];
  return {
    ...state,
    classPlanByClassroom: {
      ...state.classPlanByClassroom,
      [key]: { currentClassId: classIdToSelect, done: prev?.done ?? {} },
    },
  };
}

/** Al cerrar la clase: queda dada con la fecha y la siguiente pasa a ser la actual */
export function completePlannedClass(state: SessionState, plan: PlannedClass[], date: string): SessionState {
  const current = getCurrentPlannedClass(state, plan);
  if (!current) return state;
  const key = planKey(state);
  const done = { ...(state.classPlanByClassroom?.[key]?.done ?? {}), [current.id]: date };
  const next = plan.find((c) => c.number > current.number && !done[c.id]) ?? current;
  return {
    ...state,
    classPlanByClassroom: { ...state.classPlanByClassroom, [key]: { currentClassId: next.id, done } },
  };
}
