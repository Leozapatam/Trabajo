export type ParticipationMode =
  | 'individual'
  | 'teams'
  | 'voting'
  | 'deliberation'
  | 'construction';

export type RecognitionCategory =
  | 'investigacion'
  | 'participacion'
  | 'comportamiento'
  | 'actitudinal';

export type AttendanceStatus = 'presente' | 'ausente' | 'excusa';

export type AcademicPeriod = 1 | 2 | 3;

/** Un +1 / -1 otorgado en clase. Las notas por periodo se calculan a partir de este registro. */
export interface PointEvent {
  id: string;
  category: RecognitionCategory;
  delta: number;
  period: AcademicPeriod;
  date: string;
  ts: number;
  /** Saldo trasladado desde el formato v1 (sin historial) */
  migrated?: boolean;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'diapositivas' | 'documento' | 'video' | 'actividad';
  url: string;
  zoneId: string;
  used: boolean;
  note?: string;
}

export type SceneType =
  | 'opening'
  | 'evidence-challenge'
  | 'timeline-construction'
  | 'solar-reconstruction'
  | 'geological-scale'
  | 'notebook-expedition'
  | 'closing';

export interface GlossaryEntry {
  term: string;
  definition: string;
  example?: string;
}

export interface ScientificSource {
  id: string;
  title: string;
  institution: string;
  url?: string;
  note: string;
}

export interface CurriculumReference {
  code: string;
  source: string;
  statement: string;
  nature: 'directa' | 'interdisciplinaria';
  evidences: string[];
}

export interface EvidenceCard {
  id: string;
  title: string;
  category: 'observacion' | 'pista-cosmica' | 'distractor';
  summary: string;
  detail: string;
  isValidEvidence: boolean;
  scientificFeedback: string;
}

export interface TimelineEventItem {
  id: string;
  order: number;
  title: string;
  relativeEra: string;
  causalExplanation: string;
  visualCue: string;
}

export interface SolarStageItem {
  id: string;
  order: number;
  title: string;
  description: string;
  keyRelation: string;
}

export interface GeologicalEpochItem {
  id: string;
  order: number;
  name: string;
  timeAgoLabel: string;
  millionsOfYearsAgo: number;
  summary: string;
  keyChange: string;
}

export interface RubricCriterion {
  criterion: string;
  inicial: string;
  enProceso: string;
  logrado: string;
}

export interface SceneChallengeData {
  evidences?: EvidenceCard[];
  timelineEvents?: TimelineEventItem[];
  solarStages?: SolarStageItem[];
  geologicalEpochs?: GeologicalEpochItem[];
  rubric?: RubricCriterion[];
  commonMisconceptions?: { misconception: string; clarification: string }[];
  closingSynthesis?: string[];
  nextExpeditionBridge?: string;
  defaultVoteOptions?: { id: string; label: string }[];
}

export interface SceneDefinition {
  id: string;
  index: number;
  code: string;
  title: string;
  type: SceneType;
  participationMode: ParticipationMode;
  participationLabel: string;
  narrative: string;
  promptQuestion: string;
  notebookPrompt?: string;
  defaultTimerSeconds: number;
  hints: string[];
  publicAnswerSummary: string;
  scientificFeedback: string;
  challengeData?: SceneChallengeData;
  /** Solo visible en la consola privada del Game Master */
  teacherNotes: {
    pedagogicalGoal: string;
    facilitationScript: string;
    whatToWatchFor: string;
    adaptationShortSession: string;
  };
}

export interface MissionDefinition {
  id: string;
  worldId: string;
  zoneId: string;
  code: string;
  title: string;
  subtitle: string;
  centralQuestion: string;
  grade: string;
  area: string;
  estimatedDurations: number[];
  objectives: string[];
  curriculumRefs: CurriculumReference[];
  scenes: SceneDefinition[];
  glossary: GlossaryEntry[];
  sources: ScientificSource[];
  resourceUnits?: string[];
}

export interface ZoneActivityNode {
  id: string;
  title: string;
  kind: 'exploracion' | 'comparacion' | 'simulacion' | 'mision';
  summary: string;
  scientificDetail: string;
  culturalNote?: string;
  linkedMissionId?: string;
}

export interface ZoneDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  accentColor: string;
  mapPosition: { x: number; y: number };
  fundamentalQuestions: string[];
  mechanics: string[];
  summary: string;
  nodes: ZoneActivityNode[];
  narrativeBridge?: string;
  artwork?: string;
  resourceUnits?: string[];
}

export interface WorldDefinition {
  id: string;
  grade?: string;
  title: string;
  subtitle: string;
  description: string;
  artwork?: string;
  zones: ZoneDefinition[];
}

export interface TeamState {
  id: string;
  name: string;
  color: string;
  points: Record<RecognitionCategory, number>;
  badges: string[];
}

export interface StudentState {
  id: string;
  name: string;
  active: boolean;
  attendanceToday: AttendanceStatus;
  attendanceHistory: {
    presentes: number;
    ausentes: number;
    excusas: number;
  };
  /** Totales del periodo activo; se recalculan desde `pointLog` */
  points: Record<RecognitionCategory, number>;
  pointLog?: PointEvent[];
  badges: string[];
}

export interface DecisionLogEntry {
  id: string;
  sceneId: string;
  teamId?: string;
  summary: string;
  timestamp: number;
}

export interface VoteOption {
  id: string;
  label: string;
  votes: number;
}

export type ProjectorViewMode = 'intro' | 'map' | 'scene';

export interface ActiveEventBanner {
  id: string;
  title: string;
  subtitle: string;
  kind: 'cosmos' | 'debate' | 'cuaderno';
}

export interface ResourceUsageEntry {
  resourceId: string;
  title: string;
  date: string;
  classroom: string;
  period: AcademicPeriod;
}

export interface SessionState {
  schemaVersion?: number;
  sessionId: string;
  active: boolean;
  classStarted: boolean;
  classDate: string;
  status: 'idle' | 'running' | 'paused' | 'completed';
  schoolYear: string;
  classroomName: string;
  period: AcademicPeriod;
  missionId: string;
  resources: ResourceItem[];
  resourceLog?: ResourceUsageEntry[];
  /** Misión y escena en que va cada aula (clave: año-grado) */
  progressByClassroom?: Record<string, { missionId: string; sceneIndex: number }>;
  /** Ruta del año de cada aula: clase en curso y clases dadas (id → fecha) */
  classPlanByClassroom?: Record<string, { currentClassId: string; done: Record<string, string> }>;
  attendanceByDate: Record<string, Record<string, AttendanceStatus>>;
  /** Periodo académico al que pertenece cada fecha con asistencia guardada */
  periodByDate?: Record<string, AcademicPeriod>;
  gradeConfig: {
    baseGrade: number;
    stepPerPoint: number;
  };
  rostersByClassroom: Record<string, StudentState[]>;
  projectorMode: ProjectorViewMode;
  exploredZones: string[];
  focusedZoneId: string;
  activeEventBanner: ActiveEventBanner | null;
  activeSceneIndex: number;
  revealed: boolean;
  revealedHintsCount: number;
  activeInspectionId: string | null;
  timer: {
    durationSeconds: number;
    remainingSeconds: number;
    running: boolean;
    lastUpdatedAt: number | null;
  };
  voting: {
    open: boolean;
    question: string;
    options: VoteOption[];
  };
  students: StudentState[];
  teams: TeamState[];
  decisions: DecisionLogEntry[];
  discoveries: string[];
  reducedMotion: boolean;
  updatedAt: number;
}

export interface ExplorerProgress {
  discoveredZones: string[];
  inspectedNodes: string[];
  completedChallenges: string[];
  earnedBadges: string[];
  lastVisitedZone: string;
  reducedMotion: boolean;
  updatedAt: number;
}
