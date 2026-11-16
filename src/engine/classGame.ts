import { getClassroomKey } from './sessionStore';
import type { ClassroomGame, EvidenceStatus, MissionDefinition, NotebookHolder, SessionState } from './types';
import { getClassPlanProgress, type PlannedClass } from './yearPlan';

/**
 * Capa de juego de cada aula:
 * - 3 corazones por clase = llamados de atención al grupo; sin corazones hay tarea extensa.
 * - Estrellas del grupo: cada POINTS_PER_STAR puntos de aporte encienden una; con STARS_GOAL hay recompensa.
 * - Evidencias de cada tema (DBA clave), marcadas al cerrar la clase.
 * - Cuaderno: quién lo tiene y qué se ha copiado.
 */
export const HEARTS_PER_CLASS = 3;
export const STARS_GOAL = 5;
export const POINTS_PER_STAR = 5;

const EMPTY_GAME: ClassroomGame = { heartsLost: 0, starsSince: 0, bonusPoints: 0, rewardsWon: 0 };

function gameKey(state: SessionState): string {
  return getClassroomKey(state.schoolYear, state.classroomName);
}

export function getClassroomGame(state: SessionState): ClassroomGame {
  return { ...EMPTY_GAME, ...state.gameByClassroom?.[gameKey(state)] };
}

function updateGame(state: SessionState, patch: (g: ClassroomGame) => ClassroomGame): SessionState {
  const key = gameKey(state);
  return { ...state, gameByClassroom: { ...state.gameByClassroom, [key]: patch(getClassroomGame(state)) } };
}

// ---------- Corazones ----------

/** Clase actual del aula; los corazones se encienden de nuevo al cambiar de clase */
function currentClassId(state: SessionState): string {
  return getClassPlanProgress(state)?.currentClassId ?? '';
}

export function getHeartsLeft(state: SessionState): number {
  const g = getClassroomGame(state);
  if (g.heartsClassId !== currentClassId(state)) return HEARTS_PER_CLASS;
  return Math.max(0, HEARTS_PER_CLASS - g.heartsLost);
}

/** Suma (+1 apaga uno) o resta (−1 lo vuelve a encender) llamados de atención */
export function changeHearts(state: SessionState, lost: 1 | -1): SessionState {
  const classId = currentClassId(state);
  const left = getHeartsLeft(state);
  const nextLeft = Math.max(0, Math.min(HEARTS_PER_CLASS, left - lost));
  if (nextLeft === left) return state;
  return updateGame(state, (g) => ({ ...g, heartsClassId: classId, heartsLost: HEARTS_PER_CLASS - nextLeft }));
}

// ---------- Estrellas ----------

export interface StarProgress {
  /** Puntos de aporte acumulados desde la última recompensa */
  points: number;
  stars: number;
  /** Puntos que lleva la estrella que se está llenando */
  partial: number;
  goalReached: boolean;
  rewardsWon: number;
}

/** Sale del historial de puntos del grupo, así deshacer un punto también apaga la estrella */
export function getStarProgress(state: SessionState): StarProgress {
  const g = getClassroomGame(state);
  const earned = state.students.reduce(
    (sum, s) => sum + (s.pointLog ?? []).filter((e) => e.delta > 0 && e.ts >= g.starsSince).reduce((a, e) => a + e.delta, 0),
    0
  );
  const points = Math.max(0, earned + g.bonusPoints);
  const stars = Math.min(STARS_GOAL, Math.floor(points / POINTS_PER_STAR));
  return {
    points,
    stars,
    partial: stars >= STARS_GOAL ? POINTS_PER_STAR : points % POINTS_PER_STAR,
    goalReached: stars >= STARS_GOAL,
    rewardsWon: g.rewardsWon,
  };
}

/** Estrella dada o quitada a mano por el profe */
export function changeStars(state: SessionState, stars: 1 | -1): SessionState {
  return updateGame(state, (g) => ({ ...g, bonusPoints: g.bonusPoints + stars * POINTS_PER_STAR }));
}

/** El grupo cobra la recompensa: las estrellas vuelven a cero */
export function claimStarReward(state: SessionState, now = Date.now()): SessionState {
  return updateGame(state, (g) => ({ ...g, starsSince: now, bonusPoints: 0, rewardsWon: g.rewardsWon + 1 }));
}

// ---------- Evidencias de cada tema ----------

export function evidenceId(missionId: string, index: number): string {
  return `${missionId}#${index}`;
}

/** Evidencias clave del tema: las de sus referencias directas al DBA */
export function getTopicEvidences(mission: MissionDefinition): string[] {
  const direct = mission.curriculumRefs.filter((r) => r.nature === 'directa');
  return (direct.length ? direct : mission.curriculumRefs).flatMap((r) => r.evidences);
}

export function getEvidenceStatus(state: SessionState, missionId: string, index: number): EvidenceStatus {
  return getClassroomGame(state).evidence?.[evidenceId(missionId, index)] ?? 'pendiente';
}

export function setEvidenceStatus(state: SessionState, missionId: string, index: number, status: EvidenceStatus): SessionState {
  return updateGame(state, (g) => {
    const evidence = { ...g.evidence };
    if (status === 'pendiente') delete evidence[evidenceId(missionId, index)];
    else evidence[evidenceId(missionId, index)] = status;
    return { ...g, evidence };
  });
}

const NEXT_STATUS: Record<EvidenceStatus, EvidenceStatus> = { pendiente: 'en-curso', 'en-curso': 'lograda', lograda: 'pendiente' };

export function cycleEvidenceStatus(state: SessionState, missionId: string, index: number): SessionState {
  return setEvidenceStatus(state, missionId, index, NEXT_STATUS[getEvidenceStatus(state, missionId, index)]);
}

export interface TopicProgress {
  total: number;
  achieved: number;
  inProgress: number;
  /** 0 a 1: lograda vale 1, en curso vale ½ */
  ratio: number;
}

export function getTopicProgress(state: SessionState, mission: MissionDefinition): TopicProgress {
  const total = getTopicEvidences(mission).length;
  let achieved = 0;
  let inProgress = 0;
  for (let i = 0; i < total; i++) {
    const st = getEvidenceStatus(state, mission.id, i);
    if (st === 'lograda') achieved++;
    else if (st === 'en-curso') inProgress++;
  }
  return { total, achieved, inProgress, ratio: total ? (achieved + inProgress / 2) / total : 0 };
}

export interface PeriodTopic {
  mission: MissionDefinition;
  classes: PlannedClass[];
}

/** Temas (misiones) de un periodo en el orden de la ruta, con sus clases */
export function getPeriodTopics(plan: PlannedClass[], missions: MissionDefinition[], period: number): PeriodTopic[] {
  const topics: PeriodTopic[] = [];
  for (const cls of plan) {
    if (cls.period !== period || cls.kind !== 'mision' || !cls.missionId) continue;
    let topic = topics.find((t) => t.mission.id === cls.missionId);
    if (!topic) {
      const mission = missions.find((m) => m.id === cls.missionId);
      if (!mission) continue;
      topic = { mission, classes: [] };
      topics.push(topic);
    }
    topic.classes.push(cls);
  }
  return topics;
}

// ---------- Cuaderno ----------

export function getNotebookHolder(state: SessionState): NotebookHolder {
  return getClassroomGame(state).notebooksHeldBy ?? 'estudiantes';
}

export function setNotebookHolder(state: SessionState, holder: NotebookHolder): SessionState {
  return updateGame(state, (g) => ({ ...g, notebooksHeldBy: holder }));
}

export function isNotebookEntryDone(state: SessionState, classId: string): boolean {
  return Boolean(getClassroomGame(state).notebookDone?.[classId]);
}

export function toggleNotebookEntry(state: SessionState, classId: string, date: string): SessionState {
  return updateGame(state, (g) => {
    const notebookDone = { ...g.notebookDone };
    if (notebookDone[classId]) delete notebookDone[classId];
    else notebookDone[classId] = date;
    return { ...g, notebookDone };
  });
}

export interface NotebookEntry {
  cls: PlannedClass;
  mission: MissionDefinition;
  /** Lo que se copia: una línea por escena de la clase */
  lines: string[];
}

/** El cuaderno del año: igual para todos los estudiantes del aula */
export function buildNotebook(plan: PlannedClass[], missions: MissionDefinition[]): NotebookEntry[] {
  const entries: NotebookEntry[] = [];
  // Si una escena se reparte en varias clases, se copia solo la primera vez
  const copied = new Set<string>();
  for (const cls of plan) {
    const mission = missions.find((m) => m.id === cls.missionId);
    if (!mission) continue;
    const start = cls.sceneStart ?? 0;
    const end = cls.sceneEnd ?? mission.scenes.length - 1;
    const lines: string[] = [];
    for (const s of mission.scenes.slice(start, end + 1)) {
      const text = s.notebookPrompt?.trim();
      if (!text || copied.has(s.id)) continue;
      copied.add(s.id);
      lines.push(text);
    }
    if (lines.length) entries.push({ cls, mission, lines });
  }
  return entries;
}

export interface EntryActivity {
  prompt: string;
  /** Clase anterior en la que se apoya */
  from: PlannedClass;
}

/**
 * Actividad de entrada en el cuaderno para activar al grupo apenas llega.
 * No hay en la primera clase del año; se apoya en la clase anterior con tema.
 */
export function getEntryActivity(
  plan: PlannedClass[],
  missions: MissionDefinition[],
  current: PlannedClass | null
): EntryActivity | null {
  if (!current || current.number <= 1) return null;
  const previous = [...plan].reverse().find((c) => c.number < current.number && c.missionId);
  if (!previous) return null;
  const mission = missions.find((m) => m.id === previous.missionId);
  if (!mission) return null;
  const scene = mission.scenes[previous.sceneEnd ?? 0] ?? mission.scenes[0];
  const question = scene?.promptQuestion ?? mission.centralQuestion;
  return {
    from: previous,
    prompt: `En tres líneas, sin mirar atrás: ${question}`,
  };
}
