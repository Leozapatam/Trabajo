import { describe, expect, it } from 'vitest';
import {
  adjustVote,
  getClassSummary,
  rememberClassProgress,
  resetVotes,
  resumeClassProgress,
  startQuickVote,
  toggleVotingOpen,
} from '../classFlow';
import {
  addStudentsFromText,
  awardStudentPoints,
  createInitialSessionState,
  markAttendance,
  switchClassroomRoster,
} from '../sessionStore';

describe('Cada aula recuerda su misión', () => {
  const sixth = ['mision-00', 'mision-001'];
  const seventh = ['mision-701', 'mision-702'];

  it('retoma la misión y escena guardadas al volver al aula', () => {
    let s = createInitialSessionState('mision-001');
    s = rememberClassProgress({ ...s, activeSceneIndex: 3 });

    // Pasa a 7°: la misión activa es de 6°, así que empieza la primera de 7°
    s = resumeClassProgress(switchClassroomRoster(s, s.schoolYear, '7°'), seventh);
    expect(s.missionId).toBe('mision-701');
    expect(s.activeSceneIndex).toBe(0);
    s = rememberClassProgress({ ...s, missionId: 'mision-702', activeSceneIndex: 2 });

    // Vuelve a 6°: sigue donde iba, sin pistas ni hallazgo revelados
    s = resumeClassProgress(switchClassroomRoster({ ...s, revealed: true }, s.schoolYear, '6°'), sixth);
    expect(s).toMatchObject({ missionId: 'mision-001', activeSceneIndex: 3, revealed: false });

    s = resumeClassProgress(switchClassroomRoster(s, s.schoolYear, '7°'), seventh);
    expect(s).toMatchObject({ missionId: 'mision-702', activeSceneIndex: 2 });
  });

  it('no cambia nada si el aula no tiene misiones o ya está en la correcta', () => {
    const s = createInitialSessionState('mision-001');
    expect(resumeClassProgress(s, [])).toBe(s);
    expect(resumeClassProgress(s, sixth)).toBe(s);
    expect(rememberClassProgress(rememberClassProgress(s))).toEqual(rememberClassProgress(s));
  });
});

describe('Resumen de cierre de clase', () => {
  it('cuenta asistencia, aportes del día y recursos usados en esa aula', () => {
    let s = addStudentsFromText({ ...createInitialSessionState(), classDate: '2026-03-02' }, 'Ana, Beto, Carla, Dora');
    const [ana, beto, carla, dora] = s.students;
    s = markAttendance(s, beto.id, 'ausente');
    s = markAttendance(s, carla.id, 'excusa');
    s = awardStudentPoints(s, ana.id, 'participacion', 1);
    s = awardStudentPoints(s, ana.id, 'investigacion', 1);
    s = awardStudentPoints(s, dora.id, 'participacion', 1);
    s = awardStudentPoints(s, dora.id, 'comportamiento', -1);
    s = {
      ...s,
      resourceLog: [
        { resourceId: 'r1', title: 'Origen del universo', date: '2026-03-02', classroom: '6°', period: 1 },
        { resourceId: 'r1', title: 'Origen del universo', date: '2026-03-02', classroom: '6°', period: 1 },
        { resourceId: 'r2', title: 'Otra aula', date: '2026-03-02', classroom: '7°', period: 1 },
        { resourceId: 'r3', title: 'Otro día', date: '2026-03-01', classroom: '6°', period: 1 },
      ],
    };

    const summary = getClassSummary(s);
    expect(summary).toMatchObject({ presentes: 2, ausentes: ['Beto'], excusas: ['Carla'], totalPoints: 2 });
    expect(summary.topContributors).toEqual([{ name: 'Ana', points: 2 }]);
    // Puntos de antes del cambio (sin acción): se deducen por su valor
    expect(summary.actionCounts).toEqual({ aporte: 3, 'aporte-extra': 0, interrupcion: 1, 'impide-clase': 0 });
    expect(summary.resourcesUsed).toEqual(['Origen del universo']);
    // Una sola clase y faltó sin excusa: 100 % → riesgo
    expect(summary.absenceAlerts).toEqual([{ name: 'Beto', rate: 1, risk: true }]);
  });
});

describe('Varios grados el mismo día', () => {
  it('llamar a lista en un aula no borra la asistencia de otra en esa fecha', async () => {
    const { confirmAttendance, enrollStudents, getAttendanceOnClassDate } = await import('../sessionStore');
    let s = addStudentsFromText({ ...createInitialSessionState(), classDate: '2026-03-02' }, 'Ana, Beto');
    const [ana, beto] = s.students;
    s = markAttendance(s, beto.id, 'ausente');

    // Segunda hora: 7°, con su propia lista
    s = enrollStudents(s, '7°', 'Carla\nDora').state;
    s = switchClassroomRoster(s, s.schoolYear, '7°');
    const [carla] = s.students;
    s = confirmAttendance(markAttendance(s, carla.id, 'excusa'));

    expect(s.attendanceByDate['2026-03-02']).toMatchObject({ [ana.id]: 'presente', [beto.id]: 'ausente', [carla.id]: 'excusa' });
    expect(Object.keys(s.attendanceByDate['2026-03-02'])).toHaveLength(4);

    // De vuelta en 6°, Beto sigue ausente y el resumen lo cuenta
    s = switchClassroomRoster(s, s.schoolYear, '6°');
    expect(getAttendanceOnClassDate(s, beto.id)).toBe('ausente');
    expect(getClassSummary(s)).toMatchObject({ presentes: 1, ausentes: ['Beto'] });

    // Un aula sin estudiantes tampoco borra nada
    s = confirmAttendance(switchClassroomRoster(s, s.schoolYear, '9°'));
    expect(Object.keys(s.attendanceByDate['2026-03-02'])).toHaveLength(4);
  });
});

describe('Votación a mano alzada', () => {
  it('cuenta votos sin bajar de cero, se muestra en el proyector y se reinicia', () => {
    let s = startQuickVote(createInitialSessionState(), '¿La Tierra es más joven que el Sol?');
    expect(s.voting.options.map((o) => o.label)).toEqual(['Sí', 'No']);
    expect(s.voting.open).toBe(false);

    s = adjustVote(adjustVote(adjustVote(s, 'voto-si', 1), 'voto-si', 1), 'voto-no', -1);
    expect(s.voting.options.map((o) => o.votes)).toEqual([2, 0]);

    // Al mostrarla, el proyector deja la portada y pasa a la escena
    s = toggleVotingOpen({ ...s, projectorMode: 'intro' });
    expect(s.voting.open).toBe(true);
    expect(s.projectorMode).toBe('scene');
    expect(toggleVotingOpen({ ...s, projectorMode: 'map' }).projectorMode).toBe('map');
    expect(resetVotes(s).voting).toMatchObject({ open: true, options: [{ votes: 0 }, { votes: 0 }] });
  });
});
