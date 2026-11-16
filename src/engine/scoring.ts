import { awardStudentPoints } from './sessionStore';
import type { PointEvent, RecognitionCategory, ScoreAction, SessionState } from './types';

export interface ScoreActionDef {
  key: ScoreAction;
  delta: number;
  label: string;
  hint: string;
  /** Categoría en la que se acumula para las notas por componente */
  category: RecognitionCategory;
}

/** Las cuatro acciones de puntaje, en el orden de las teclas 1 a 4 */
export const SCORE_ACTIONS: ScoreActionDef[] = [
  { key: 'aporte', delta: 1, label: 'Aporte', hint: 'Participa y aporta a la clase', category: 'participacion' },
  { key: 'aporte-extra', delta: 2, label: 'Aporte extra', hint: 'Aporta más de lo que se pide', category: 'participacion' },
  { key: 'interrupcion', delta: -1, label: 'Interrupción', hint: 'Una falta que interrumpe la clase', category: 'comportamiento' },
  {
    key: 'impide-clase',
    delta: -2,
    label: 'Impide la clase',
    hint: 'Comportamiento reiterado que no deja dar la clase',
    category: 'comportamiento',
  },
];

export function getScoreAction(key: ScoreAction): ScoreActionDef {
  return SCORE_ACTIONS.find((a) => a.key === key) ?? SCORE_ACTIONS[0];
}

/** Aplica una acción de puntaje a un estudiante (queda en su historial con la acción) */
export function awardAction(state: SessionState, studentId: string, action: ScoreAction): SessionState {
  const def = getScoreAction(action);
  return awardStudentPoints(state, studentId, def.category, def.delta, def.key);
}

/** Acción de un punto del historial; los puntos anteriores al cambio se deducen por su valor */
export function actionOf(ev: PointEvent): ScoreAction {
  if (ev.action) return ev.action;
  if (ev.delta >= 2) return 'aporte-extra';
  if (ev.delta > 0) return 'aporte';
  if (ev.delta <= -2) return 'impide-clase';
  return 'interrupcion';
}

/** "+2" o "−1" con el signo menos tipográfico */
export function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
}
