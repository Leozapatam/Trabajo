import { describe, expect, it } from 'vitest';
import { MISSIONS_LIST, worldsByGrade } from '../../data/catalog';
import {
  buildNotebook,
  changeHearts,
  changeStars,
  claimStarReward,
  cycleEvidenceStatus,
  getEntryActivity,
  getHeartsLeft,
  getNotebookHolder,
  getPeriodTopics,
  getStarProgress,
  getTopicEvidences,
  getTopicProgress,
  HEARTS_PER_CLASS,
  isNotebookEntryDone,
  setNotebookHolder,
  toggleNotebookEntry,
} from '../classGame';
import { awardAction } from '../scoring';
import { addStudentsFromText, createInitialSessionState, undoLastPointEvent } from '../sessionStore';
import { buildYearPlan, selectPlannedClass } from '../yearPlan';

const missions6 = (() => {
  const ids = new Set((worldsByGrade['6°'] ?? []).map((w) => w.id));
  return MISSIONS_LIST.filter((m) => ids.has(m.worldId));
})();

describe('Capa de juego del aula', () => {
  it('los corazones se apagan en la clase y se encienden al cambiar de clase', () => {
    let s = selectPlannedClass(createInitialSessionState(), 'p1-s2-c1');
    expect(getHeartsLeft(s)).toBe(HEARTS_PER_CLASS);
    s = changeHearts(s, 1);
    s = changeHearts(s, 1);
    expect(getHeartsLeft(s)).toBe(1);
    s = changeHearts(s, -1);
    expect(getHeartsLeft(s)).toBe(2);
    s = changeHearts(changeHearts(changeHearts(s, 1), 1), 1);
    expect(getHeartsLeft(s)).toBe(0);
    s = selectPlannedClass(s, 'p1-s2-c2');
    expect(getHeartsLeft(s)).toBe(HEARTS_PER_CLASS);
  });

  it('las estrellas se llenan con los aportes del grupo, siguen al deshacer y vuelven a cero con la recompensa', () => {
    let s = addStudentsFromText({ ...createInitialSessionState(), classDate: '2026-03-02' }, 'Ana, Beto');
    const [ana, beto] = s.students;
    s = awardAction(s, ana.id, 'aporte-extra');
    s = awardAction(s, beto.id, 'aporte-extra');
    s = awardAction(s, beto.id, 'aporte');
    s = awardAction(s, beto.id, 'interrupcion'); // lo negativo no apaga estrellas
    expect(getStarProgress(s)).toMatchObject({ points: 5, stars: 1, partial: 0 });
    s = undoLastPointEvent(s, beto.id); // quita la interrupción
    s = undoLastPointEvent(s, beto.id); // quita el aporte
    expect(getStarProgress(s)).toMatchObject({ points: 4, stars: 0, partial: 4 });

    s = changeStars(changeStars(changeStars(changeStars(changeStars(s, 1), 1), 1), 1), 1);
    expect(getStarProgress(s).goalReached).toBe(true);
    s = claimStarReward(s, Date.now() + 1);
    expect(getStarProgress(s)).toMatchObject({ points: 0, stars: 0, rewardsWon: 1 });
  });

  it('el avance del tema sale de sus evidencias: lograda vale 1 y en curso ½', () => {
    const m = missions6.find((x) => x.id === 'mision-001')!;
    const total = getTopicEvidences(m).length;
    expect(total).toBeGreaterThan(1);
    let s = createInitialSessionState();
    s = cycleEvidenceStatus(s, m.id, 0); // en curso
    s = cycleEvidenceStatus(cycleEvidenceStatus(s, m.id, 1), m.id, 1); // lograda
    const p = getTopicProgress(s, m);
    expect(p).toMatchObject({ total, achieved: 1, inProgress: 1 });
    expect(p.ratio).toBeCloseTo(1.5 / total);
  });

  it('los temas del periodo salen de la ruta, en orden y con sus clases', () => {
    const plan = buildYearPlan(missions6);
    const topics = getPeriodTopics(plan, missions6, 1);
    expect(topics.map((t) => t.mission.id)).toEqual(['mision-001', 'mision-602', 'mision-603']);
    expect(topics[0].classes.map((c) => c.number)[0]).toBe(3);
  });

  it('el cuaderno lista lo que se copia sin repetir escenas, y se marca por clase', () => {
    const plan = buildYearPlan(missions6);
    const notebook = buildNotebook(plan, missions6);
    expect(notebook.length).toBeGreaterThan(0);
    // Las misiones esqueleto comparten texto entre temas; dentro de un tema no se repite
    const scenesSeen = notebook.flatMap((e) => e.lines.map((l) => `${e.mission.id}|${l}`));
    expect(new Set(scenesSeen).size).toBe(scenesSeen.length);

    let s = createInitialSessionState();
    expect(getNotebookHolder(s)).toBe('estudiantes');
    s = setNotebookHolder(s, 'profe');
    expect(getNotebookHolder(s)).toBe('profe');
    s = toggleNotebookEntry(s, notebook[0].cls.id, '2026-03-02');
    expect(isNotebookEntryDone(s, notebook[0].cls.id)).toBe(true);
  });

  it('la actividad de entrada no va en la primera clase del año', () => {
    const plan = buildYearPlan(missions6);
    expect(getEntryActivity(plan, missions6, plan[0])).toBeNull();
    const act = getEntryActivity(plan, missions6, plan[3]);
    expect(act?.from.number).toBe(3);
    expect(act?.prompt).toMatch(/cuaderno|líneas/);
  });
});
