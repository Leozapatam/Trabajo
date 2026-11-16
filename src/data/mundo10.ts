import type { MissionDefinition, WorldDefinition } from '../engine/types';
import {
  buildSkeletonMissionFromDba,
  buildWorldFromDbas,
  getGradeDbas,
  type ZoneMetaSpec,
} from './dbaWorldBuilder';

const dbas10 = getGradeDbas(10);

export const ZONAS_10_SPECS: ZoneMetaSpec[] = [
  {
    num: 1,
    title: 'Ecología política y territorio',
    subtitle: 'Gobernanza del agua, concesiones minero-energéticas y economías ilícitas',
    accentColor: '#34D399',
    artwork: '/assets/art/z10-1-ecologia.webp',
    resourceUnits: ['08', '09', '10'],
    missionId: 'mision-1001',
    missionTitle: 'Agua, tierra y soberanía',
    centralQuestion:
      '¿Por qué surgen conflictos territoriales entre comunidades locales, concesiones minero-energéticas y economías ilícitas en Colombia?',
  },
  {
    num: 2,
    title: 'Raíces del conflicto armado',
    subtitle: 'Violencia directa, estructural y cultural; Frente Nacional e insurgencias',
    accentColor: '#D97757',
    artwork: '/assets/art/z10-2-conflicto.webp',
    resourceUnits: ['07', '08'],
    missionId: 'mision-1002',
    missionTitle: 'Anatomía de la violencia en Colombia',
    centralQuestion:
      '¿Cómo interactuaron el problema agrario, la violencia bipartidista y el Frente Nacional en el origen del conflicto armado?',
  },
  {
    num: 3,
    title: 'Pluralismo jurídico y Consulta Previa',
    subtitle: 'Diversidad cultural, exclusión estructural y autonomía territorial étnica',
    accentColor: '#E8B86D',
    artwork: '/assets/art/z10-3-pluralismo.webp',
    resourceUnits: ['12'],
    missionId: 'mision-1003',
    missionTitle: 'Autonomía y defensa comunitaria',
    centralQuestion:
      '¿Cómo protegen la Consulta Previa, la Tutela y las Acciones Populares la soberanía de pueblos indígenas y afrodescendientes?',
  },
  {
    num: 4,
    title: 'Organismos multilaterales y soberanía',
    subtitle: 'FMI, Banco Mundial, OMC, ajuste estructural y políticas públicas',
    accentColor: '#38BDF8',
    artwork: '/assets/art/z10-4-multilateral.webp',
    resourceUnits: ['10', '11'],
    missionId: 'mision-1004',
    missionTitle: 'Arquitectura financiera global',
    centralQuestion:
      '¿Cómo condicionan el FMI, el Banco Mundial y los tribunales de arbitraje la soberanía económica de los Estados?',
  },
  {
    num: 5,
    title: 'Guerras totales y reordenamiento global',
    subtitle: 'Guerras mundiales, descolonización, bloques ideológicos y energía',
    accentColor: '#A78BFA',
    artwork: '/assets/art/z10-5-guerras.webp',
    resourceUnits: ['11'],
    missionId: 'mision-1005',
    missionTitle: 'El siglo de las conflagraciones',
    centralQuestion:
      '¿Qué causas económicas, territoriales e ideológicas impulsaron las guerras mundiales y el orden geopolítico actual?',
  },
];

export const MUNDO_10_WORLD: WorldDefinition = buildWorldFromDbas(
  10,
  '10°',
  'mundo-10',
  'ORDEN GLOBAL Y CONFLICTO',
  'Mundo 1 de Décimo · Ciencias Sociales (I.E.R. Boyacá)',
  'Territorio de décimo grado alineado con el núcleo depurado de los DBA 1 a 5: ecología política del territorio colombiano, historiografía del conflicto armado, pluralismo constitucional (Consulta Previa), banca multilateral y geopolítica de las guerras contemporáneas.',
  '/assets/art/mundo-10-geopolitica.webp',
  ZONAS_10_SPECS
);

const dba10_1 = dbas10[0];

export const MISION_1001: MissionDefinition = {
  id: 'mision-1001',
  worldId: 'mundo-10',
  zoneId: 'mundo-10-z1',
  code: 'MISIÓN 1001',
  title: 'Agua, tierra y soberanía',
  subtitle: 'Ecología política de los conflictos territoriales en Colombia',
  centralQuestion:
    '¿Por qué surgen conflictos territoriales entre comunidades locales, concesiones minero-energéticas y economías ilícitas en Colombia?',
  grade: 'Grado 10° — Ciencias Sociales',
  area: 'Ciencias Sociales (I.E.R. Boyacá)',
  estimatedDurations: [45, 50],
  resourceUnits: ['08', '09', '10'],
  objectives: [dba10_1.statement],
  curriculumRefs: [
    {
      code: 'DBA 1 — Ciencias Sociales 10° (I.E.R. Boyacá)',
      source: 'Plan DBA depurado (src/data/dbaPlan.json)',
      statement: dba10_1.statement,
      nature: 'directa',
      evidences: [...dba10_1.evidences],
    },
  ],
  glossary: [
    {
      term: 'Gobernanza del recurso hídrico',
      definition:
        'Conjunto de decisiones comunitarias, jurídicas y estatales sobre quién controla, protege y accede al agua en una cuenca.',
    },
    {
      term: 'Ecología política',
      definition:
        'Análisis de cómo las relaciones de poder económico y político determinan el acceso a los recursos naturales y la distribución de los daños ambientales.',
    },
  ],
  sources: [
    {
      id: 'src-1001-dba',
      title: 'DBA 1 — Grado 10° (Núcleo depurado I.E.R. Boyacá)',
      institution: 'Ministerio de Educación Nacional / I.E.R. Boyacá',
      note: dba10_1.focus,
    },
  ],
  scenes: [
    {
      id: 'm1001-e0',
      index: 0,
      code: 'PANTALLA 1',
      title: 'Apertura: ¿De quién es el subsuelo y de quién es el agua?',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Narración docente · Hipótesis en cuaderno',
      narrative:
        'En distintas cuencas de Colombia, comunidades campesinas, indígenas y afrodescendientes defienden sus ríos frente a dos presiones simultáneas: por un lado, grandes concesiones minero-energéticas legales; por otro, el avance de la minería ilegal con mercurio y los cultivos de uso ilícito.',
      promptQuestion:
        '¿Qué dimensiones jurídicas, económicas y ambientales chocan en estos territorios?',
      notebookPrompt:
        'Escribe en tu cuaderno qué diferencia existe entre el impacto de una concesión extractiva legal y el de una economía ilegal en el tejido comunitario.',
      defaultTimerSeconds: 180,
      hints: [dba10_1.evidences[0]],
      publicAnswerSummary: dba10_1.statement,
      scientificFeedback: dba10_1.focus,
      teacherNotes: {
        pedagogicalGoal: dba10_1.statement,
        facilitationScript:
          'Distinga con claridad entre extractivismo corporativo titulado y economías ilegales armadas.',
        whatToWatchFor: dba10_1.focus,
        adaptationShortSession: 'Plantee el caso y recoja 2 intervenciones.',
      },
    },
    {
      id: 'm1001-e1',
      index: 1,
      code: 'PANTALLA 2',
      title: 'Evidencias del conflicto territorial',
      type: 'evidence-challenge',
      participationMode: 'voting',
      participationLabel: 'Votación A/B · Análisis multidimensional',
      narrative:
        'Examinemos las dos grandes líneas de evidencia que explican la conflictividad socioambiental en los territorios colombianos.',
      promptQuestion: '¿Qué evidencias sustentan el análisis de la ecología política en Colombia?',
      notebookPrompt: 'Registra en tu cuaderno las dimensiones jurídica, económica y sociopolítica del conflicto.',
      defaultTimerSeconds: 200,
      hints: [...dba10_1.evidences],
      publicAnswerSummary: dba10_1.evidences.join(' · '),
      scientificFeedback: dba10_1.focus,
      challengeData: {
        evidences: [
          {
            id: 'm1001-ev1',
            title: 'Evidencia A: Gobernanza del agua frente a concesiones minero-energéticas',
            category: 'observacion',
            summary: dba10_1.evidences[0],
            detail:
              'Tensión entre la propiedad estatal del subsuelo otorgada en concesión y la autonomía local sobre el suelo y el agua.',
            isValidEvidence: true,
            scientificFeedback: 'Evidencia clave del DBA 1 de décimo grado.',
          },
          {
            id: 'm1001-ev2',
            title: 'Evidencia B: Minería ilegal, cultivos ilícitos y ruptura del tejido colectivo',
            category: 'observacion',
            summary: dba10_1.evidences[1],
            detail:
              'Contaminación hídrica, cooptación armada y desarticulación de las organizaciones comunitarias.',
            isValidEvidence: true,
            scientificFeedback: 'Evidencia clave: explica la reconfiguración violenta de los territorios.',
          },
          {
            id: 'm1001-ev3',
            title: 'Evidencia C: Inexistencia de conflictos por recursos hídricos',
            category: 'distractor',
            summary: 'Suposición de que el uso del suelo y del agua no genera disputas jurídicas ni sociales.',
            detail: 'Desconoce los cientos de conflictos socioambientales documentados en el país.',
            isValidEvidence: false,
            scientificFeedback: 'Descartada.',
          },
        ],
        defaultVoteOptions: [
          { id: 'A', label: 'A. Evidencias A y B (gobernanza hídrica + impacto de economías ilegales)' },
          { id: 'B', label: 'B. Solo Evidencia C' },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Evaluar las dos evidencias del DBA 1 de 10° desde el enfoque Saber 11.',
        facilitationScript: 'Pida justificar cómo se afecta la gobernanza local en ambos casos.',
        whatToWatchFor: 'Precisión conceptual entre legalidad concesionada e ilegalidad armada.',
        adaptationShortSession: 'Votación y síntesis.',
      },
    },
    {
      id: 'm1001-e2',
      index: 2,
      code: 'PANTALLA 3',
      title: 'Expediente de ecología política en cuaderno',
      type: 'notebook-expedition',
      participationMode: 'construction',
      participationLabel: 'Construcción en cuaderno · Rúbrica SIE',
      narrative:
        'Redacta tu dictamen analítico en el cuaderno integrando las dimensiones jurídica, económica y sociopolítica.',
      promptQuestion:
        '¿Por qué la disputa por el agua y los minerales en Colombia es al mismo tiempo un problema ambiental, económico y político?',
      notebookPrompt:
        'Escribe un análisis que articule: 1) conflictos por gobernanza del agua frente a concesiones y 2) impactos de la minería ilegal y cultivos ilícitos en el tejido comunitario.',
      defaultTimerSeconds: 240,
      hints: [...dba10_1.evidences],
      publicAnswerSummary: dba10_1.evidences.join(' · '),
      scientificFeedback: dba10_1.focus,
      challengeData: {
        rubric: [
          {
            criterion: 'Gobernanza hídrica y concesiones',
            inicial: 'Menciona el agua sin analizar actores ni normas.',
            enProceso: 'Identifica a la comunidad y a las empresas.',
            logrado: dba10_1.evidences[0],
          },
          {
            criterion: 'Economías ilegales y tejido social',
            inicial: 'No diferencia minería legal de ilegal.',
            enProceso: 'Menciona daños ambientales generales.',
            logrado: dba10_1.evidences[1],
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Evaluar argumentación escrita de nivel media académica (10°).',
        facilitationScript: 'Revise el uso de categorías jurídicas y socioambientales.',
        whatToWatchFor: 'Capacidad de distinguir actores e intereses.',
        adaptationShortSession: 'Cuadro comparativo en el cuaderno.',
      },
    },
    {
      id: 'm1001-e3',
      index: 3,
      code: 'PANTALLA 4',
      title: 'Cierre de la Misión 1001',
      type: 'closing',
      participationMode: 'deliberation',
      participationLabel: 'Cierre colectivo',
      narrative:
        'Para comprender por qué estos territorios han sido escenario de disputas armadas, debemos examinar las raíces históricas de la violencia en la segunda mitad del siglo XX.',
      promptQuestion: '¿Cómo distinguir entre violencia directa, violencia estructural y violencia cultural?',
      defaultTimerSeconds: 120,
      hints: [],
      publicAnswerSummary: dba10_1.statement,
      scientificFeedback: dba10_1.focus,
      challengeData: {
        closingSynthesis: [...dba10_1.evidences],
        nextExpeditionBridge:
          'Próxima zona (DBA 2): ¿Cuáles fueron las causas y consecuencias de la violencia en la segunda mitad del siglo XX en Colombia?',
      },
      teacherNotes: {
        pedagogicalGoal: 'Conectar la ecología política con la historiografía del conflicto armado (DBA 2).',
        facilitationScript: 'Cierre presentando la pregunta puente hacia la Zona 2.',
        whatToWatchFor: 'Comprensión multicausal.',
        adaptationShortSession: 'Lectura de síntesis.',
      },
    },
  ],
};

export const MISIONES_10_LIST: MissionDefinition[] = [
  MISION_1001,
  ...dbas10
    .slice(1)
    .map((dba, idx) =>
      buildSkeletonMissionFromDba('10°', 'mundo-10', `mundo-10-z${dba.num}`, dba, ZONAS_10_SPECS[idx + 1])
    ),
];
