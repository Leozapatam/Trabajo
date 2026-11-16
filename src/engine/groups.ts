import { getPerformanceLevel, type PerformanceLevel } from './grading';
import { getGradeGroup } from './grades';
import { calculateCurrentPeriodGrade, enrollStudents, getGroupRoster } from './sessionStore';
import type { SessionState, StudentState } from './types';

// ---------- Grupos unidos (6°–7°, 8°–9°, 10°–11°) ----------

export interface FusionCandidate {
  student: StudentState;
  /** Grado del que viene: 6°, 7°… */
  fromGroup: string;
}

/**
 * Estudiantes activos de los grados que forman el grupo unido y que aún no están en él.
 * El grupo unido no se llena solo: el profe acepta a quiénes trae.
 */
export function getFusionCandidates(state: SessionState, fusedId: string): FusionCandidate[] {
  const group = getGradeGroup(fusedId);
  if (!group.fused) return [];
  const already = new Set(getGroupRoster(state, fusedId).map((s) => s.name.trim().toLocaleLowerCase('es')));
  return group.grades.flatMap((n) => {
    const fromGroup = `${n}°`;
    return getGroupRoster(state, fromGroup)
      .filter((s) => s.active && !already.has(s.name.trim().toLocaleLowerCase('es')))
      .map((student) => ({ student, fromGroup }));
  });
}

/** Matricula en el grupo unido a los candidatos aceptados (sus notas de cada grado no se mezclan) */
export function acceptFusionCandidates(
  state: SessionState,
  fusedId: string,
  accepted: FusionCandidate[]
): { state: SessionState; added: number } {
  if (accepted.length === 0) return { state, added: 0 };
  const result = enrollStudents(state, fusedId, accepted.map((c) => c.student.name).join('\n'));
  return { state: result.state, added: result.added };
}

// ---------- Escuadrones por rendimiento ----------

export type SquadKey = 'vanguardia' | 'centro' | 'retaguardia';

export interface SquadDef {
  key: SquadKey;
  label: string;
  hint: string;
  levels: PerformanceLevel[];
}

/** Superior y Alto van adelante, Básico en el centro, Bajo atrás (escala SIE) */
export const SQUADS: SquadDef[] = [
  { key: 'vanguardia', label: 'Vanguardia', hint: 'Superior y Alto · 4.0 a 5.0', levels: ['superior', 'alto'] },
  { key: 'centro', label: 'Centro', hint: 'Básico · 3.0 a 3.9', levels: ['basico'] },
  { key: 'retaguardia', label: 'Retaguardia', hint: 'Bajo · 1.0 a 2.9', levels: ['bajo'] },
];

export function getSquadForGrade(grade: number): SquadDef {
  const level = getPerformanceLevel(grade).key;
  return SQUADS.find((s) => s.levels.includes(level)) ?? SQUADS[SQUADS.length - 1];
}

export interface SquadMember {
  student: StudentState;
  grade: number;
}

/** Estudiantes activos repartidos por su nota del periodo actual, de mayor a menor */
export function groupBySquad(state: SessionState, roster: StudentState[]): Record<SquadKey, SquadMember[]> {
  const squads: Record<SquadKey, SquadMember[]> = { vanguardia: [], centro: [], retaguardia: [] };
  for (const student of roster) {
    if (!student.active) continue;
    const grade = calculateCurrentPeriodGrade(state, student);
    squads[getSquadForGrade(grade).key].push({ student, grade });
  }
  for (const list of Object.values(squads)) list.sort((a, b) => b.grade - a.grade || a.student.name.localeCompare(b.student.name, 'es'));
  return squads;
}
