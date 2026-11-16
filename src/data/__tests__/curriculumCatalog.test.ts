import { describe, expect, it } from 'vitest';
import {
  EXTRA_ROTATION_BACKGROUNDS,
  MISSIONS_LIST,
  worldArtById,
  worldsByGrade,
} from '../catalog';
import dbaPlan from '../dbaPlan.json';

describe('Ruta curricular completa 6° a 11° y grupos fusionados (dbaPlan.json)', () => {
  it('asigna un mundo propio a cada grado 6°–11° con zonas = número de DBA del grado', () => {
    for (const gradeEntry of dbaPlan.grades) {
      const key = `${gradeEntry.grade}°`;
      const worlds = worldsByGrade[key];
      expect(worlds, `Falta mundo para ${key}`).toBeDefined();
      expect(worlds.length).toBeGreaterThanOrEqual(1);

      const mainWorld = worlds[0];
      expect(mainWorld.zones).toHaveLength(gradeEntry.dbas.length);

      for (const zone of mainWorld.zones) {
        expect(zone.resourceUnits?.length, `Zona ${zone.id} sin resourceUnits`).toBeGreaterThan(0);
        expect(zone.artwork, `Zona ${zone.id} sin artwork`).toMatch(/^\/assets\/art\/[\w-]+\.webp$/);
      }

      const worldCover = worldArtById[mainWorld.id];
      expect(worldCover).toMatch(/^\/assets\/art\/[\w-]+\.webp$/);
    }
  });

  it('reutiliza los dos mundos correspondientes en los grupos fusionados 6°–7°, 8°–9° y 10°–11°', () => {
    expect(worldsByGrade['6°–7°'].map((w) => w.id)).toEqual(['origenes', 'mundo-7']);
    expect(worldsByGrade['8°–9°'].map((w) => w.id)).toEqual(['mundo-8', 'mundo-9']);
    expect(worldsByGrade['10°–11°'].map((w) => w.id)).toEqual(['mundo-10', 'mundo-11']);
  });

  it('garantiza que ninguna misión cite evidencias fuera del núcleo depurado de dbaPlan.json', () => {
    const validEvidences = new Set<string>();
    for (const g of dbaPlan.grades) {
      for (const d of g.dbas) {
        for (const ev of d.evidences) {
          validEvidences.add(ev);
        }
      }
    }

    const dbaMissions = MISSIONS_LIST.filter((m) => m.id !== 'mision-00');
    expect(dbaMissions.length).toBeGreaterThanOrEqual(42);

    for (const mission of dbaMissions) {
      for (const ref of mission.curriculumRefs) {
        for (const ev of ref.evidences) {
          expect(
            validEvidences.has(ev),
            `Evidencia no perteneciente a dbaPlan.json en ${mission.id}: "${ev}"`
          ).toBe(true);
        }
      }
    }
  });

  it('incluye los 6 fondos épicos adicionales en .webp para la rotación', () => {
    expect(EXTRA_ROTATION_BACKGROUNDS).toHaveLength(6);
    for (const bg of EXTRA_ROTATION_BACKGROUNDS) {
      expect(bg).toMatch(/^\/assets\/art\/fondo-0[1-6]-[\w-]+\.webp$/);
    }
  });
});
