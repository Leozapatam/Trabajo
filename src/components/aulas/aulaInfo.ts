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
  '7°': { world: 'Imperios y encuentros', tagline: 'De Roma a la Conquista de América' },
  '8°': { world: 'Revoluciones e industria', tagline: 'Capitalismo, independencias y derechos' },
  '9°': { world: 'Colombia en el siglo XX', tagline: 'Territorio, crisis y cambios del país' },
  '10°': { world: 'Orden global y conflicto', tagline: 'Territorio, violencia y orden internacional' },
  '11°': { world: 'Dilemas del mundo actual', tagline: 'Clima, paz, Guerra Fría y globalización' },
  '6°–7°': { world: 'Orígenes e imperios', tagline: 'Aula fusionada de Sexto y Séptimo' },
  '8°–9°': { world: 'Revoluciones y siglo XX', tagline: 'Aula fusionada de Octavo y Noveno' },
  '10°–11°': { world: 'Orden global y dilemas actuales', tagline: 'Aula fusionada de Décimo y Once' },
};

/** Nombre de cada mundo como se muestra en pantalla (los datos lo traen en mayúsculas) */
const WORLD_NAMES: Record<string, string> = {
  origenes: 'Orígenes',
  'mundo-7': 'Imperios y encuentros',
  'mundo-8': 'Revoluciones e industria',
  'mundo-9': 'Colombia en el siglo XX',
  'mundo-10': 'Orden global y conflicto',
  'mundo-11': 'Dilemas del mundo actual',
};

export function worldDisplayName(world: { id: string; title: string }): string {
  return WORLD_NAMES[world.id] ?? world.title;
}

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
