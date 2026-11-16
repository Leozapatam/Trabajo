import type {
  AttendanceStatus,
  RecognitionCategory,
  ResourceItem,
  SceneDefinition,
  SessionState,
  StudentState,
  TeamState,
  VoteOption,
} from './types';

export const SESSION_STORAGE_KEY = 'expedicion6.session.v1';
export const SESSION_CHANNEL_NAME = 'expedicion6-session';

const EMPTY_POINTS: Record<RecognitionCategory, number> = {
  investigacion: 0,
  participacion: 0,
  comportamiento: 0,
  actitudinal: 0,
};

export const DEFAULT_TEAMS: TeamState[] = [
  {
    id: 'equipo-alfa',
    name: 'Equipo Orión',
    color: '#38BDF8',
    points: { ...EMPTY_POINTS },
    badges: [],
  },
];

const BASE_DRIVE_COSMOS =
  'G:\\Mi unidad\\1. 💼 Trabajo\\1. Clases\\Banco de Recursos\\Ciencias Sociales\\01. Cosmos y Tierra\\';
const BASE_DRIVE_GENERALES =
  'G:\\Mi unidad\\1. 💼 Trabajo\\1. Clases\\Banco de Recursos\\Generales\\';

export const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: 'res-c1',
    title: 'Origen del universo: teorías científicas (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, origen del universo, teorías científicas.pptx`,
    zoneId: 'zona-1',
    used: false,
  },
  {
    id: 'res-c2',
    title: 'Origen del universo: teorías religiosas (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, origen del universo, teorías religiosas.pptx`,
    zoneId: 'zona-1',
    used: false,
  },
  {
    id: 'res-c3',
    title: 'Orígenes del cosmos (.pdf)',
    type: 'documento',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, orígenes del cosmos.pdf`,
    zoneId: 'zona-1',
    used: false,
  },
  {
    id: 'res-c4',
    title: 'Sistema solar: historia (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, sistema solar, historia (opcional).pptx`,
    zoneId: 'zona-2',
    used: false,
  },
  {
    id: 'res-c5',
    title: 'Sistema solar: elementos (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, sistema solar, elementos (opcional).pptx`,
    zoneId: 'zona-2',
    used: false,
  },
  {
    id: 'res-c6',
    title: 'Pangea (.mp4)',
    type: 'video',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, Pangea (opcional).mp4`,
    zoneId: 'zona-3',
    used: false,
  },
  {
    id: 'res-c7',
    title: 'Relieve, clima y deriva continental (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, relieve, clima y deriva continental.pptx`,
    zoneId: 'zona-3',
    used: false,
  },
  {
    id: 'res-c8',
    title: 'Composición de la Tierra (.mp4)',
    type: 'video',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, composición de la Tierra (opcional).mp4`,
    zoneId: 'zona-3',
    used: false,
  },
  {
    id: 'res-c9',
    title: 'Terremoto y falla de San Andrés (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, terremoto y la falla de San Andrés.pptx`,
    zoneId: 'zona-3',
    used: false,
  },
  {
    id: 'res-c10',
    title: 'Fenómenos climáticos: El Niño y La Niña (.mp4)',
    type: 'video',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, fenómenos climáticos, El Niño y La Niña (opcional).mp4`,
    zoneId: 'zona-3',
    used: false,
  },
  {
    id: 'res-c11',
    title: 'Repaso Saber: Tierra y clima (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, repaso Saber, Tierra y clima.pptx`,
    zoneId: 'zona-3',
    used: false,
  },
  {
    id: 'res-c12',
    title: 'Interacción planeta y humanos (.html)',
    type: 'actividad',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, interacción planeta y humanos.html`,
    zoneId: 'zona-4',
    used: false,
  },
  {
    id: 'res-c13',
    title: 'Evolución y hominización — Puente Mundo 2 (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_COSMOS}Cosmos y Tierra, evolución y hominización.pptx`,
    zoneId: 'zona-4',
    used: false,
  },
  {
    id: 'res-g1',
    title: 'Cronología del mundo (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_GENERALES}Cronología del mundo.pptx`,
    zoneId: 'zona-1',
    used: false,
  },
  {
    id: 'res-g2',
    title: 'Qué es un mapa mental (.pptx)',
    type: 'diapositivas',
    url: `${BASE_DRIVE_GENERALES}Qué es un mapa mental.pptx`,
    zoneId: 'zona-1',
    used: false,
  },
];

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createInitialSessionState(
  missionId = 'mision-00',
  defaultTimerSeconds = 180
): SessionState {
  return {
    sessionId: `ses-${Date.now().toString(36)}`,
    active: false,
    classStarted: false,
    classDate: getTodayIsoDate(),
    status: 'idle',
    schoolYear: '2026',
    classroomName: '6°A',
    period: 1,
    missionId,
    resources: DEFAULT_RESOURCES.map((r) => ({ ...r })),
    attendanceByDate: {},
    gradeConfig: {
      baseGrade: 3.5,
      stepPerPoint: 0.1,
    },
    rostersByClassroom: {},
    projectorMode: 'intro',
    exploredZones: ['zona-1'],
    focusedZoneId: 'zona-1',
    activeEventBanner: null,
    activeSceneIndex: 0,
    revealed: false,
    revealedHintsCount: 0,
    activeInspectionId: null,
    timer: {
      durationSeconds: defaultTimerSeconds,
      remainingSeconds: defaultTimerSeconds,
      running: false,
      lastUpdatedAt: null,
    },
    voting: {
      open: false,
      question: '',
      options: [],
    },
    students: [],
    teams: DEFAULT_TEAMS.map((t) => ({
      ...t,
      points: { ...t.points },
      badges: [...t.badges],
    })),
    decisions: [],
    discoveries: [],
    reducedMotion: false,
    updatedAt: Date.now(),
  };
}

export function loadSessionState(): SessionState {
  if (typeof window === 'undefined') {
    return createInitialSessionState();
  }
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return createInitialSessionState();
    const parsed = JSON.parse(raw) as SessionState;
    if (!parsed || typeof parsed.activeSceneIndex !== 'number') {
      return createInitialSessionState();
    }
    const normalizedStudents: StudentState[] = Array.isArray(parsed.students)
      ? parsed.students.map((s) => ({
          ...s,
          attendanceToday: s.attendanceToday ?? 'presente',
          attendanceHistory: s.attendanceHistory ?? { presentes: 0, ausentes: 0, excusas: 0 },
          points: {
            investigacion: s.points?.investigacion ?? 0,
            participacion: s.points?.participacion ?? 0,
            comportamiento: s.points?.comportamiento ?? 0,
            actitudinal: s.points?.actitudinal ?? 0,
          },
        }))
      : [];

    return {
      ...createInitialSessionState(),
      ...parsed,
      classStarted: parsed.classStarted ?? false,
      classDate: parsed.classDate ?? getTodayIsoDate(),
      schoolYear: parsed.schoolYear ?? '2026',
      classroomName: parsed.classroomName ?? '6°A',
      period: parsed.period === 2 || parsed.period === 3 ? parsed.period : 1,
      resources:
        Array.isArray(parsed.resources) && parsed.resources.length > 0
          ? parsed.resources
          : DEFAULT_RESOURCES.map((r) => ({ ...r })),
      attendanceByDate: parsed.attendanceByDate ?? {},
      gradeConfig: parsed.gradeConfig ?? { baseGrade: 3.5, stepPerPoint: 0.1 },
      rostersByClassroom: parsed.rostersByClassroom ?? {},
      students: normalizedStudents,
      projectorMode: parsed.projectorMode ?? 'intro',
      exploredZones: Array.isArray(parsed.exploredZones) ? parsed.exploredZones : ['zona-1'],
      focusedZoneId: parsed.focusedZoneId ?? 'zona-1',
      activeEventBanner: parsed.activeEventBanner ?? null,
    };
  } catch {
    return createInitialSessionState();
  }
}

export function saveAndBroadcastSession(state: SessionState): SessionState {
  const next: SessionState = { ...state, updatedAt: Date.now() };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignorar errores de cuota
    }
    if ('BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(SESSION_CHANNEL_NAME);
        channel.postMessage({ type: 'SESSION_SYNC', payload: next });
        channel.close();
      } catch {
        // Respaldo vía storage
      }
    }
  }
  return next;
}

export function subscribeToSession(onUpdate: (state: SessionState) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(SESSION_CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === 'SESSION_SYNC' && event.data.payload) {
        onUpdate(event.data.payload as SessionState);
      }
    };
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_STORAGE_KEY && event.newValue) {
      try {
        onUpdate(JSON.parse(event.newValue) as SessionState);
      } catch {
        // Ignorar JSON inválido
      }
    }
  };

  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener('storage', onStorage);
    if (channel) {
      channel.close();
    }
  };
}

export function getTeamTotalPoints(team: TeamState): number {
  return (
    team.points.investigacion +
    team.points.participacion +
    team.points.comportamiento +
    team.points.actitudinal
  );
}

export function awardTeamPoints(
  state: SessionState,
  teamId: string,
  category: RecognitionCategory,
  delta: number
): SessionState {
  return {
    ...state,
    teams: state.teams.map((team) => {
      if (team.id !== teamId) return team;
      return {
        ...team,
        points: {
          ...team.points,
          [category]: team.points[category] + delta,
        },
      };
    }),
  };
}

export function toggleTeamBadge(state: SessionState, teamId: string, badge: string): SessionState {
  return {
    ...state,
    teams: state.teams.map((team) => {
      if (team.id !== teamId) return team;
      const hasBadge = team.badges.includes(badge);
      return {
        ...team,
        badges: hasBadge ? team.badges.filter((b) => b !== badge) : [...team.badges, badge],
      };
    }),
  };
}

export function changeSceneState(
  state: SessionState,
  nextIndex: number,
  nextScene: SceneDefinition,
  totalScenes: number
): SessionState {
  const clamped = Math.max(0, Math.min(totalScenes - 1, nextIndex));
  const voteOptions: VoteOption[] = (nextScene.challengeData?.defaultVoteOptions ?? []).map((opt) => ({
    id: opt.id,
    label: opt.label,
    votes: 0,
  }));

  return {
    ...state,
    activeSceneIndex: clamped,
    revealed: false,
    revealedHintsCount: 0,
    activeInspectionId: null,
    voting: {
      open: false,
      question: nextScene.promptQuestion,
      options: voteOptions,
    },
  };
}

export interface PublicProjectorSceneView {
  id: string;
  index: number;
  code: string;
  title: string;
  type: SceneDefinition['type'];
  participationMode: SceneDefinition['participationMode'];
  participationLabel: string;
  narrative: string;
  promptQuestion: string;
  notebookPrompt?: string;
  visibleHints: string[];
  revealed: boolean;
  publicAnswerSummary: string | null;
  scientificFeedback: string | null;
  challengeData?: SceneDefinition['challengeData'];
}

export function buildPublicProjectorView(
  session: SessionState,
  scene: SceneDefinition
): PublicProjectorSceneView {
  return {
    id: scene.id,
    index: scene.index,
    code: scene.code,
    title: scene.title,
    type: scene.type,
    participationMode: scene.participationMode,
    participationLabel: scene.participationLabel,
    narrative: scene.narrative,
    promptQuestion: scene.promptQuestion,
    notebookPrompt: scene.notebookPrompt,
    visibleHints: scene.hints.slice(0, session.revealedHintsCount),
    revealed: session.revealed,
    publicAnswerSummary: session.revealed ? scene.publicAnswerSummary : null,
    scientificFeedback: session.revealed ? scene.scientificFeedback : null,
    challengeData: scene.challengeData,
  };
}

export function getStudentTotalPoints(student: StudentState): number {
  return (
    student.points.investigacion +
    student.points.participacion +
    student.points.comportamiento +
    student.points.actitudinal
  );
}

export function calculateStudentGrade(
  student: StudentState,
  gradeConfig: { baseGrade: number; stepPerPoint: number } = { baseGrade: 3.5, stepPerPoint: 0.1 }
): number {
  const total = getStudentTotalPoints(student);
  const raw = gradeConfig.baseGrade + total * gradeConfig.stepPerPoint;
  const clamped = Math.max(1.0, Math.min(5.0, raw));
  return Math.round(clamped * 10) / 10;
}

export function getClassroomKey(schoolYear: string, classroomName: string): string {
  return `${schoolYear.trim()}-${classroomName.trim().toUpperCase()}`;
}

export function switchClassroomRoster(
  state: SessionState,
  nextYear: string,
  nextClassroom: string
): SessionState {
  const prevKey = getClassroomKey(state.schoolYear, state.classroomName);
  const nextKey = getClassroomKey(nextYear, nextClassroom);
  const savedRosters = {
    ...state.rostersByClassroom,
    [prevKey]: state.students,
  };
  if (prevKey === nextKey) {
    return { ...state, schoolYear: nextYear, classroomName: nextClassroom, rostersByClassroom: savedRosters };
  }
  const loadedStudents = savedRosters[nextKey] ?? [];
  return {
    ...state,
    schoolYear: nextYear,
    classroomName: nextClassroom,
    students: loadedStudents,
    rostersByClassroom: savedRosters,
  };
}

export function getActiveStudentsCount(students: StudentState[]): number {
  return students.filter((s) => s.active).length;
}

export function addStudentsFromText(state: SessionState, rawNames: string): SessionState {
  const names = rawNames
    .split(/[\n,;]+/)
    .map((n) => n.trim())
    .filter(Boolean);
  if (names.length === 0) return state;

  const newStudents: StudentState[] = names.map((name, idx) => ({
    id: `est-${Date.now().toString(36)}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    active: true,
    attendanceToday: 'presente',
    attendanceHistory: { presentes: 0, ausentes: 0, excusas: 0 },
    points: { ...EMPTY_POINTS },
    badges: [],
  }));

  return {
    ...state,
    students: [...state.students, ...newStudents],
  };
}

export function toggleStudentActive(state: SessionState, studentId: string): SessionState {
  return {
    ...state,
    students: state.students.map((s) => (s.id === studentId ? { ...s, active: !s.active } : s)),
  };
}

export function setStudentAttendance(
  state: SessionState,
  studentId: string,
  status: AttendanceStatus
): SessionState {
  return {
    ...state,
    students: state.students.map((s) =>
      s.id === studentId ? { ...s, attendanceToday: status } : s
    ),
  };
}

export function recordAttendanceSnapshot(state: SessionState): SessionState {
  const dateKey = state.classDate || getTodayIsoDate();
  const dayMap: Record<string, AttendanceStatus> = {};
  const nextStudents = state.students.map((s) => {
    if (!s.active) return s;
    dayMap[s.id] = s.attendanceToday;
    const h = { ...s.attendanceHistory };
    if (s.attendanceToday === 'presente') h.presentes += 1;
    if (s.attendanceToday === 'ausente') h.ausentes += 1;
    if (s.attendanceToday === 'excusa') h.excusas += 1;
    return { ...s, attendanceHistory: h };
  });

  return {
    ...state,
    students: nextStudents,
    attendanceByDate: {
      ...state.attendanceByDate,
      [dateKey]: dayMap,
    },
  };
}

export function awardStudentPoints(
  state: SessionState,
  studentId: string,
  category: RecognitionCategory,
  delta: number
): SessionState {
  return {
    ...state,
    students: state.students.map((s) => {
      if (s.id !== studentId) return s;
      return {
        ...s,
        points: {
          ...s.points,
          [category]: s.points[category] + delta,
        },
      };
    }),
  };
}

export function addResourceItem(
  state: SessionState,
  item: Omit<ResourceItem, 'id' | 'used'>
): SessionState {
  const newItem: ResourceItem = {
    ...item,
    id: `res-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    used: false,
  };
  return {
    ...state,
    resources: [newItem, ...state.resources],
  };
}

export function toggleResourceUsed(state: SessionState, resourceId: string): SessionState {
  return {
    ...state,
    resources: state.resources.map((r) => (r.id === resourceId ? { ...r, used: !r.used } : r)),
  };
}

export function removeResourceItem(state: SessionState, resourceId: string): SessionState {
  return {
    ...state,
    resources: state.resources.filter((r) => r.id !== resourceId),
  };
}
