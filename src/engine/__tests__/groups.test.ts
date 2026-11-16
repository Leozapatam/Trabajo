import { describe, expect, it } from 'vitest';
import { acceptFusionCandidates, getFusionCandidates, getSquadForGrade, groupBySquad } from '../groups';
import { awardAction } from '../scoring';
import { createInitialSessionState, enrollStudents, getGroupRoster, setStudentEnrollment } from '../sessionStore';

describe('Grupos unidos', () => {
  it('proponen a los activos de cada grado y solo se llenan con los aceptados', () => {
    let s = createInitialSessionState();
    s = enrollStudents(s, '6°', 'Ana\nBeto').state;
    s = enrollStudents(s, '7°', 'Carla\nDaniel').state;
    const beto = getGroupRoster(s, '6°').find((x) => x.name === 'Beto')!;
    s = setStudentEnrollment(s, '6°', beto.id, false); // retirado: no se propone

    const candidates = getFusionCandidates(s, '6°–7°');
    expect(candidates.map((c) => [c.student.name, c.fromGroup])).toEqual([
      ['Ana', '6°'],
      ['Carla', '7°'],
      ['Daniel', '7°'],
    ]);
    // Nada entra hasta aceptar
    expect(getGroupRoster(s, '6°–7°')).toHaveLength(0);

    const result = acceptFusionCandidates(s, '6°–7°', candidates.filter((c) => c.student.name !== 'Daniel'));
    expect(result.added).toBe(2);
    expect(getGroupRoster(result.state, '6°–7°').map((x) => x.name)).toEqual(['Ana', 'Carla']);
    // Los ya aceptados dejan de proponerse; los grados de origen no cambian
    expect(getFusionCandidates(result.state, '6°–7°').map((c) => c.student.name)).toEqual(['Daniel']);
    expect(getGroupRoster(result.state, '7°')).toHaveLength(2);
  });

  it('un grado simple no tiene candidatos', () => {
    expect(getFusionCandidates(createInitialSessionState(), '6°')).toEqual([]);
  });
});

describe('Escuadrones por rendimiento', () => {
  it('Superior y Alto en Vanguardia, Básico en Centro, Bajo en Retaguardia', () => {
    expect(getSquadForGrade(4.8).key).toBe('vanguardia');
    expect(getSquadForGrade(4.0).key).toBe('vanguardia');
    expect(getSquadForGrade(3.9).key).toBe('centro');
    expect(getSquadForGrade(3.0).key).toBe('centro');
    expect(getSquadForGrade(2.9).key).toBe('retaguardia');
  });

  it('reparte a los activos según su nota del periodo, de mayor a menor', () => {
    let s = { ...createInitialSessionState(), classDate: '2026-03-02' };
    s = enrollStudents(s, s.classroomName, 'Ana\nBeto\nCarla').state;
    const [ana, beto, carla] = getGroupRoster(s, s.classroomName);
    for (let i = 0; i < 3; i++) s = awardAction(s, ana.id, 'aporte-extra'); // 3.5 + 0.6 = 4.1
    for (let i = 0; i < 4; i++) s = awardAction(s, carla.id, 'impide-clase'); // 3.5 − 0.8 = 2.7
    const squads = groupBySquad(s, getGroupRoster(s, s.classroomName));
    expect(squads.vanguardia.map((m) => m.student.id)).toEqual([ana.id]);
    expect(squads.centro.map((m) => m.student.id)).toEqual([beto.id]);
    expect(squads.retaguardia.map((m) => m.student.id)).toEqual([carla.id]);
  });
});
