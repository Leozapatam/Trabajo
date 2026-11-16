import { describe, expect, it } from 'vitest';
import { MISSIONS_LIST, worldsByGrade } from '../../data/catalog';
import { createInitialSessionState, switchClassroomRoster } from '../sessionStore';
import {
  buildYearPlan,
  CLASSES_PER_YEAR,
  completePlannedClass,
  getCurrentPlannedClass,
  selectPlannedClass,
} from '../yearPlan';

function missionsOf(grade: string) {
  const ids = new Set((worldsByGrade[grade] ?? []).map((w) => w.id));
  return MISSIONS_LIST.filter((m) => ids.has(m.worldId));
}

describe('Ruta del año', () => {
  it('cada grado tiene 78 clases: 3 periodos × 13 semanas × 2, con intro, examen y cierre en su semana', () => {
    for (const grade of Object.keys(worldsByGrade)) {
      const plan = buildYearPlan(missionsOf(grade));
      expect(plan, grade).toHaveLength(CLASSES_PER_YEAR);
      expect(plan.map((c) => c.number)).toEqual(Array.from({ length: 78 }, (_, i) => i + 1));
      for (const c of plan) {
        if (c.week === 1) expect(c.kind, `${grade} ${c.id}`).toBe('intro');
        else if (c.week === 12) expect(c.kind).toBe('examen');
        else if (c.week === 13) expect(c.kind).toBe('cierre');
        else expect(c.kind).toBe('mision');
      }
      // Todas las misiones del grado aparecen, en orden, y en un solo periodo cada una
      const teaching = missionsOf(grade).filter((m) => m.id !== 'mision-00').map((m) => m.id);
      const order = [...new Set(plan.filter((c) => c.kind === 'mision').map((c) => c.missionId))];
      expect(order, grade).toEqual(teaching);
      for (const id of teaching) {
        const periods = new Set(plan.filter((c) => c.missionId === id).map((c) => c.period));
        expect(periods.size, `${grade} ${id}`).toBe(1);
      }
    }
  });

  it('6°: la misión de reglas abre el año y las escenas de cada misión se cubren completas', () => {
    const plan = buildYearPlan(missionsOf('6°'));
    expect(plan[0]).toMatchObject({ id: 'p1-s1-c1', kind: 'intro', missionId: 'mision-00', sceneStart: 0, sceneEnd: 2 });
    expect(plan[1]).toMatchObject({ id: 'p1-s1-c2', missionId: 'mision-00', sceneStart: 3, sceneEnd: 5 });
    // Periodo 2 empieza con introducción sin misión
    expect(plan[26]).toMatchObject({ id: 'p2-s1-c1', kind: 'intro' });
    expect(plan[26].missionId).toBeUndefined();

    const m001 = plan.filter((c) => c.missionId === 'mision-001');
    expect(m001).toHaveLength(7); // 20 clases / 3 misiones → 7, 7, 6
    expect(m001.map((c) => c.sceneStart)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(m001[0]).toMatchObject({ week: 2, slot: 1, session: 1, sessions: 7 });

    // Una misión de 2 escenas repartida en 7 clases: todas las escenas aparecen
    const m602 = plan.filter((c) => c.missionId === 'mision-602');
    const covered = new Set(m602.flatMap((c) => [c.sceneStart!, c.sceneEnd!]));
    expect([...covered].sort()).toEqual([0, 1]);
  });

  it('10° reparte sus 5 misiones 2 / 2 / 1 entre los periodos', () => {
    const plan = buildYearPlan(missionsOf('10°'));
    const byPeriod = [1, 2, 3].map((p) => new Set(plan.filter((c) => c.period === p && c.missionId).map((c) => c.missionId)).size);
    expect(byPeriod).toEqual([2, 2, 1]);
  });

  it('un grado sin misiones sigue teniendo su calendario completo', () => {
    const plan = buildYearPlan([]);
    expect(plan).toHaveLength(78);
    expect(plan[2]).toMatchObject({ kind: 'mision', title: 'Clase libre' });
  });

  it('integra las 8 evaluaciones del SIE, 2 películas y cátedras transversales en cada periodo', () => {
    const plan6 = buildYearPlan(missionsOf('6°'), '6°');
    // En cada uno de los 3 periodos deben existir las evaluaciones clave del SIE
    for (let p = 1; p <= 3; p++) {
      const periodClasses = plan6.filter((c) => c.period === p);
      const evals = periodClasses.filter((c) => c.evaluation).map((c) => c.evaluation!.code);
      // P1, C2, P2, C3, P3, C4, P4, C1, A1_A2
      expect(evals).toContain('P1'); // Taller 1 (10%)
      expect(evals).toContain('C2'); // Quiz 1 (8.75%)
      expect(evals).toContain('P2'); // Plan Lector (10%)
      expect(evals).toContain('C3'); // Quiz 2 (8.75%)
      expect(evals).toContain('P3'); // Exposición (10%)
      expect(evals).toContain('C4'); // Control oral (7%)
      expect(evals).toContain('P4'); // Cuaderno (10%)
      expect(evals).toContain('C1'); // Examen Saber (10.5%)
      expect(evals).toContain('A1_A2'); // Auto y Heteroevaluación (25%)

      // 2 Películas por periodo
      const movies = periodClasses.filter((c) => c.movie).map((c) => c.movie!.title);
      expect(movies).toHaveLength(2);

      // Cátedras transversales
      const transversals = periodClasses.filter((c) => c.transversal).map((c) => c.transversal!.tag);
      expect(transversals.length).toBeGreaterThanOrEqual(2);
      if (p === 1) expect(transversals).toContain('ebejico');
      if (p === 3) expect(transversals).toContain('afrocolombianidad');
    }

    // Grupos unidos reciben sus películas y ejes integradores
    const planFused = buildYearPlan(missionsOf('6°–7°'), '6°–7°');
    expect(planFused.filter((c) => c.period === 1 && c.movie)[0].movie?.title).toContain('El Origen de la Tierra');
    expect(planFused.filter((c) => c.period === 1 && c.transversal)[0].transversal?.tag).toBe('ebejico');
  });
});

describe('Avance de cada aula en su ruta', () => {
  it('empieza en la primera clase, avanza al cerrar y cada aula lleva la suya', () => {
    const plan6 = buildYearPlan(missionsOf('6°'));
    let s = createInitialSessionState();
    expect(getCurrentPlannedClass(s, plan6)?.id).toBe('p1-s1-c1');

    s = completePlannedClass(s, plan6, '2026-02-02');
    expect(getCurrentPlannedClass(s, plan6)?.id).toBe('p1-s1-c2');

    // Saltar a otra clase y cerrarla: la siguiente es la primera sin dar después de ella
    s = selectPlannedClass(s, 'p1-s3-c1');
    s = completePlannedClass(s, plan6, '2026-02-09');
    expect(getCurrentPlannedClass(s, plan6)?.id).toBe('p1-s3-c2');
    expect(s.classPlanByClassroom?.['2026-6°'].done).toEqual({ 'p1-s1-c1': '2026-02-02', 'p1-s3-c1': '2026-02-09' });

    // 7° no hereda el avance de 6°
    const s7 = switchClassroomRoster(s, s.schoolYear, '7°');
    expect(getCurrentPlannedClass(s7, buildYearPlan(missionsOf('7°')))?.id).toBe('p1-s1-c1');
  });
});
