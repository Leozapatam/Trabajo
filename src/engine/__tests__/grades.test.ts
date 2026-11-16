import { describe, expect, it } from 'vitest';
import { getDbasForGroup, GRADE_GROUPS, normalizeClassroomName } from '../grades';
import {
  addStudentsFromText,
  createInitialSessionState,
  getActiveCountsByGrade,
  migrateSessionState,
  switchClassroomRoster,
} from '../sessionStore';
import type { SessionState } from '../types';

describe('Grados 6° a 11° y grupos fusionados', () => {
  it('normaliza nombres antiguos al id de grado', () => {
    expect(normalizeClassroomName('6°A')).toBe('6°');
    expect(normalizeClassroomName('11b')).toBe('11°');
    expect(normalizeClassroomName('8-9')).toBe('8°–9°');
    expect(normalizeClassroomName('10° y 11°')).toBe('10°–11°');
    expect(normalizeClassroomName('')).toBe('6°');
    expect(GRADE_GROUPS.map((g) => g.id)).toEqual(['6°', '7°', '8°', '9°', '10°', '11°', '6°–7°', '8°–9°', '10°–11°']);
  });

  it('un grupo fusionado empieza vacío y combina los DBA de ambos grados', () => {
    let s = addStudentsFromText(createInitialSessionState(), 'Ana, Beto');
    s = switchClassroomRoster(s, '2026', '6°–7°');
    expect(s.students).toHaveLength(0);
    expect(getActiveCountsByGrade(s)).toMatchObject({ '6°': 2, '6°–7°': 0 });

    const grades = new Set(getDbasForGroup('6°–7°').map((d) => d.grade));
    expect([...grades]).toEqual([6, 7]);
    expect(getDbasForGroup('11°').every((d) => d.evidences.length > 0)).toBe(true);
  });

  it('la migración une las listas 6°A y 6°B en 6°', () => {
    const base = createInitialSessionState();
    const st = (id: string) => ({ ...addStudentsFromText(base, id).students[0], id });
    const legacy = {
      ...base,
      classroomName: '6°A',
      students: [st('a1')],
      rostersByClassroom: { '2026-6°A': [st('a1')], '2026-6°B': [st('b1')] },
    } as SessionState;
    const migrated = migrateSessionState(legacy);
    expect(migrated.classroomName).toBe('6°');
    expect(migrated.rostersByClassroom['2026-6°'].map((s) => s.id).sort()).toEqual(['a1', 'b1']);
  });
});

describe('Asistencia por fecha desde las fichas', () => {
  it('marca, guarda el día y no arrastra el estado de otra fecha', async () => {
    const { markAttendance, getAttendanceOnClassDate } = await import('../sessionStore');
    let s = addStudentsFromText({ ...createInitialSessionState(), classDate: '2026-03-02' }, 'Ana, Beto');
    const [ana, beto] = s.students;
    s = markAttendance(s, ana.id, 'ausente');
    expect(s.attendanceByDate['2026-03-02']).toEqual({ [ana.id]: 'ausente', [beto.id]: 'presente' });
    s = markAttendance(s, beto.id, 'excusa');
    expect(getAttendanceOnClassDate(s, ana.id)).toBe('ausente');

    const nextDay = { ...s, classDate: '2026-03-03' };
    expect(getAttendanceOnClassDate(nextDay, ana.id)).toBe('presente');
    expect(nextDay.students[0].attendanceHistory.ausentes).toBe(1);
  });
});

describe('Gestión de grupos (matrícula fuera del tablero)', () => {
  it('matricula en un grupo cerrado sin cambiar el grupo abierto y evita duplicados', async () => {
    const { enrollStudents, getGroupRoster, setStudentEnrollment } = await import('../sessionStore');
    let s = createInitialSessionState(); // abierto: 6°
    const r1 = enrollStudents(s, '8°', 'Pérez Gómez Ana\n  López   Beto \n\n');
    s = r1.state;
    expect(r1.added).toBe(2);
    expect(s.classroomName).toBe('6°');
    expect(s.students).toHaveLength(0);
    expect(getGroupRoster(s, '8°').map((x) => x.name)).toEqual(['Pérez Gómez Ana', 'López Beto']);

    const r2 = enrollStudents(s, '8°', 'pérez gómez ana; Carla Ruiz');
    expect(r2.added).toBe(1);
    expect(r2.skipped).toEqual(['pérez gómez ana']);
    s = r2.state;

    const beto = getGroupRoster(s, '8°')[1];
    s = setStudentEnrollment(s, '8°', beto.id, false);
    expect(getGroupRoster(s, '8°').find((x) => x.id === beto.id)?.active).toBe(false);

    // Al abrir 8° en el tablero aparece la lista matriculada
    s = switchClassroomRoster(s, s.schoolYear, '8°');
    expect(s.students).toHaveLength(3);
  });

  it('matricular en el grupo abierto actualiza la lista del tablero', async () => {
    const { enrollStudents } = await import('../sessionStore');
    const { state } = enrollStudents(createInitialSessionState(), '6°', 'Ana');
    expect(state.students.map((x) => x.name)).toEqual(['Ana']);
  });
});

describe('Llamado a lista antes de empezar', () => {
  it('confirma presentes por defecto, permite reiniciar y recuerda la última clase de cada aula', async () => {
    const { confirmAttendance, markAllPresent, markAttendance, getLastClassDate, enrollStudents } = await import('../sessionStore');
    let s = addStudentsFromText({ ...createInitialSessionState(), classDate: '2026-03-02' }, 'Ana, Beto, Carla');
    const [ana, beto] = s.students;
    expect(getLastClassDate(s, '6°')).toBeNull();

    s = markAttendance(s, beto.id, 'ausente');
    s = confirmAttendance(s);
    expect(s.attendanceByDate['2026-03-02'][ana.id]).toBe('presente');
    expect(s.attendanceByDate['2026-03-02'][beto.id]).toBe('ausente');

    s = markAllPresent(s);
    expect(Object.values(s.attendanceByDate['2026-03-02'])).toEqual(['presente', 'presente', 'presente']);
    expect(s.students[1].attendanceHistory.ausentes).toBe(0);

    s = confirmAttendance({ ...s, classDate: '2026-03-09' });
    expect(getLastClassDate(s, '6°')).toBe('2026-03-09');
    // Un aula con estudiantes pero sin clases todavía
    s = enrollStudents(s, '9°', 'Dora').state;
    expect(getLastClassDate(s, '9°')).toBeNull();
  });
});
