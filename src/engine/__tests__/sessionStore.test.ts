import { describe, expect, it } from 'vitest';
import {
  addResourceItem,
  addStudentsFromText,
  awardStudentPoints,
  buildPublicProjectorView,
  calculateStudentGrade,
  changeSceneState,
  createInitialSessionState,
  getActiveStudentsCount,
  getStudentTotalPoints,
  recordAttendanceSnapshot,
  removeResourceItem,
  setStudentAttendance,
  switchClassroomRoster,
  toggleResourceUsed,
  toggleStudentActive,
} from '../sessionStore';
import { MISION_00 } from '../../data/mision00';
import { MISION_001 } from '../../data/mision001';
import { ORIGENES_WORLD } from '../../data/origenesWorld';
import dbaPlan from '../../data/dbaPlan.json';

describe('Motor de Sesión, Asistencia, Heteroevaluación e Inventario', () => {
  it('oculta notas docentes y respuestas no reveladas en la vista pública del proyector', () => {
    const session = createInitialSessionState('mision-001');
    const scene = MISION_001.scenes[1];

    const hiddenView = buildPublicProjectorView(session, scene);
    expect(hiddenView.revealed).toBe(false);
    expect(hiddenView.publicAnswerSummary).toBeNull();
    expect(hiddenView.scientificFeedback).toBeNull();
    expect(hiddenView.visibleHints).toHaveLength(0);
    expect('teacherNotes' in hiddenView).toBe(false);

    const revealedSession = { ...session, revealed: true, revealedHintsCount: 1 };
    const revealedView = buildPublicProjectorView(revealedSession, scene);
    expect(revealedView.revealed).toBe(true);
    expect(revealedView.publicAnswerSummary).toBe(scene.publicAnswerSummary);
    expect(revealedView.visibleHints).toHaveLength(1);
  });

  it('reinicia pistas y revelación al cambiar de pantalla', () => {
    const session = {
      ...createInitialSessionState('mision-001'),
      revealed: true,
      revealedHintsCount: 2,
    };
    const nextScene = MISION_001.scenes[2];
    const updated = changeSceneState(session, 2, nextScene, MISION_001.scenes.length);

    expect(updated.activeSceneIndex).toBe(2);
    expect(updated.revealed).toBe(false);
    expect(updated.revealedHintsCount).toBe(0);
  });

  it('gestiona asistencia, retiros y puntos positivos y negativos', () => {
    let session = createInitialSessionState();
    session = addStudentsFromText(session, 'Ana\nCarlos, Sofía');
    expect(session.students).toHaveLength(3);
    expect(getActiveStudentsCount(session.students)).toBe(3);

    // Marcar retiro de Carlos
    session = toggleStudentActive(session, session.students[1].id);
    expect(getActiveStudentsCount(session.students)).toBe(2);

    // Asistencia hoy y guardado acumulado
    session = setStudentAttendance(session, session.students[0].id, 'presente');
    session = setStudentAttendance(session, session.students[2].id, 'ausente');
    session = recordAttendanceSnapshot(session);
    expect(session.students[0].attendanceHistory.presentes).toBe(1);
    expect(session.students[2].attendanceHistory.ausentes).toBe(1);

    // Puntos positivos y negativos en heteroevaluación y nota 1.0 - 5.0
    session = awardStudentPoints(session, session.students[0].id, 'investigacion', 2);
    session = awardStudentPoints(session, session.students[0].id, 'comportamiento', -1);
    expect(getStudentTotalPoints(session.students[0])).toBe(1);
    expect(calculateStudentGrade(session.students[0], { baseGrade: 3.5, stepPerPoint: 0.1 })).toBe(3.6);

    // Persistencia de listas por salón al cambiar de grupo
    session = switchClassroomRoster(session, '2026', '7°');
    expect(session.students).toHaveLength(0);
    session = switchClassroomRoster(session, '2026', '6°');
    expect(session.students).toHaveLength(3);
  });

  it('administra inventario de materiales de Drive por zona', () => {
    let session = createInitialSessionState();
    const initialCount = session.resources.length;
    expect(initialCount).toBeGreaterThan(0);

    session = addResourceItem(session, {
      title: 'Diapositivas Big Bang',
      url: 'https://drive.google.com/example',
      type: 'diapositivas',
      zoneId: 'zona-1',
    });
    expect(session.resources).toHaveLength(initialCount + 1);
    const id = session.resources[0].id;

    session = toggleResourceUsed(session, id);
    expect(session.resources[0].used).toBe(true);

    session = removeResourceItem(session, id);
    expect(session.resources).toHaveLength(initialCount);
  });

  it('valida la estructura de Orígenes, Misión 00 y Misión 001', () => {
    // Mundo 1 de 6°: una zona por cada DBA del núcleo depurado
    const dbas6 = dbaPlan.grades.find((g) => g.grade === 6)!.dbas;
    expect(ORIGENES_WORLD.zones).toHaveLength(dbas6.length);
    expect(MISION_00.scenes).toHaveLength(6);
    expect(MISION_001.scenes).toHaveLength(7);
  });
});
