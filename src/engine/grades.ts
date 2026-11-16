import dbaPlan from '../data/dbaPlan.json';

/** Un grado por curso (sin letras) o un grupo fusionado; los fusionados empiezan vacíos */
export interface GradeGroup {
  id: string;
  label: string;
  grades: number[];
  fused: boolean;
}

export const GRADE_GROUPS: GradeGroup[] = [
  { id: '6°', label: 'Sexto', grades: [6], fused: false },
  { id: '7°', label: 'Séptimo', grades: [7], fused: false },
  { id: '8°', label: 'Octavo', grades: [8], fused: false },
  { id: '9°', label: 'Noveno', grades: [9], fused: false },
  { id: '10°', label: 'Décimo', grades: [10], fused: false },
  { id: '11°', label: 'Once', grades: [11], fused: false },
  { id: '6°–7°', label: 'Sexto y Séptimo', grades: [6, 7], fused: true },
  { id: '8°–9°', label: 'Octavo y Noveno', grades: [8, 9], fused: true },
  { id: '10°–11°', label: 'Décimo y Once', grades: [10, 11], fused: true },
];

export const DEFAULT_GRADE_ID = '6°';

/**
 * Convierte nombres antiguos ("6°A", "6a", "6-7", "10 y 11") al id de grado.
 * Si no se reconoce, devuelve el grado por defecto.
 */
export function normalizeClassroomName(name: string | undefined | null): string {
  const nums = (name ?? '').match(/\d+/g)?.map(Number) ?? [];
  if (nums.length >= 2) {
    const fused = GRADE_GROUPS.find((g) => g.fused && g.grades[0] === nums[0] && g.grades[1] === nums[1]);
    if (fused) return fused.id;
  }
  const single = GRADE_GROUPS.find((g) => !g.fused && g.grades[0] === nums[0]);
  return single?.id ?? DEFAULT_GRADE_ID;
}

export function getGradeGroup(id: string): GradeGroup {
  return GRADE_GROUPS.find((g) => g.id === id) ?? GRADE_GROUPS[0];
}

export interface DbaEntry {
  grade: number;
  num: number;
  statement: string;
  focus: string;
  evidences: string[];
}

/** DBA del núcleo depurado para el grado o grupo fusionado elegido */
export function getDbasForGroup(id: string): DbaEntry[] {
  const group = getGradeGroup(id);
  return dbaPlan.grades
    .filter((g) => group.grades.includes(g.grade))
    .flatMap((g) => g.dbas.map((d) => ({ grade: g.grade, ...d })));
}
