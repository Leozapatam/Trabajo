import fondos from 'virtual:fondos';
import { GRADE_GROUPS, type GradeGroup } from '../../engine/grades';

/** Un aula = un grado (o grupo fusionado) presentado como un espacio para explorar */
export interface Aula extends GradeGroup {
  /** Nombre del mundo que se recorre en esa aula */
  world: string;
  tagline: string;
  art: string;
}

const WORLDS: Record<string, { world: string; tagline: string }> = {
  '6°': { world: 'Orígenes', tagline: 'Del universo a las primeras ciudades' },
  '7°': { world: 'Imperios', tagline: 'De Roma a la Conquista de América' },
  '8°': { world: 'Revoluciones', tagline: 'Capitalismo, independencias y derechos' },
  '9°': { world: 'Colombia, siglo XX', tagline: 'Territorio, crisis y cambios del país' },
  '10°': { world: 'Geopolítica', tagline: 'Conflictos, culturas y orden internacional' },
  '11°': { world: 'Globalización', tagline: 'Guerra Fría, paz y un planeta en juego' },
  '6°–7°': { world: 'Orígenes e Imperios', tagline: 'Aula fusionada de Sexto y Séptimo' },
  '8°–9°': { world: 'Revoluciones y siglo XX', tagline: 'Aula fusionada de Octavo y Noveno' },
  '10°–11°': { world: 'Geopolítica y Globalización', tagline: 'Aula fusionada de Décimo y Once' },
};

// Arte de los grupos fusionados: fondos temáticos (por fragmento del nombre de archivo)
const FUSED_ART: Record<string, string> = {
  '6°–7°': 'mundo-antiguo',
  '8°–9°': 'independencias',
  '10°–11°': 'siglo-xx',
};

const FALLBACK_ART = fondos.find((f) => f.includes('title-screen')) ?? fondos[0] ?? '';

/**
 * La ilustración se busca por convención de nombre en public/assets/art:
 * `mundo-<grado>-…` para un grado; si aún no existe, se usa la portada.
 */
function findArt(group: GradeGroup): string {
  const match = group.fused
    ? fondos.find((f) => f.includes(FUSED_ART[group.id] ?? '\0'))
    : fondos.find((f) => f.includes(`/mundo-${group.grades[0]}-`));
  return match ?? FALLBACK_ART;
}

export const AULAS: Aula[] = GRADE_GROUPS.map((g) => ({
  ...g,
  ...(WORLDS[g.id] ?? { world: g.label, tagline: '' }),
  art: findArt(g),
}));

export function getAula(id: string): Aula {
  return AULAS.find((a) => a.id === id) ?? AULAS[0];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

/** "lunes 16 de noviembre" a partir de "YYYY-MM-DD" */
export function longDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}
