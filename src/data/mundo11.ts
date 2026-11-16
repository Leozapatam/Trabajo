import type { MissionDefinition, WorldDefinition } from '../engine/types';
import {
  buildSkeletonMissionFromDba,
  buildWorldFromDbas,
  getGradeDbas,
  type ZoneMetaSpec,
} from './dbaWorldBuilder';

const dbas11 = getGradeDbas(11);

export const ZONAS_11_SPECS: ZoneMetaSpec[] = [
  {
    num: 1,
    title: 'Economía ecológica y clima global',
    subtitle: 'Límites de carbono, crecimiento industrial, Kioto y Acuerdo de París',
    accentColor: '#34D399',
    artwork: '/assets/art/z11-1-clima.webp',
    resourceUnits: ['09', '10', '11'],
    missionId: 'mision-1101',
    missionTitle: 'Límites del planeta y tratados climáticos',
    centralQuestion:
      '¿Por qué entran en tensión las agendas de crecimiento industrial de los bloques hegemónicos y los tratados climáticos globales?',
  },
  {
    num: 2,
    title: 'Justicia transicional y paz negociada',
    subtitle: 'Verdad, reparación a víctimas y dilemas jurídicos de la transición',
    accentColor: '#38BDF8',
    artwork: '/assets/art/z11-2-transicional.webp',
    resourceUnits: ['08', '12'],
    missionId: 'mision-1102',
    missionTitle: 'Arquitectura de la justicia transicional',
    centralQuestion:
      '¿Cómo equilibrar la paz como derecho constitucional supremo con los estándares de verdad, justicia y reparación?',
  },
  {
    num: 3,
    title: 'Geopolítica de recursos estratégicos',
    subtitle: 'Conflictos contemporáneos por hidrocarburos, agua, litio y coltán',
    accentColor: '#D97757',
    artwork: '/assets/art/z11-3-recursos.webp',
    resourceUnits: ['11'],
    missionId: 'mision-1103',
    missionTitle: 'Cartografía de las guerras por recursos',
    centralQuestion:
      '¿Qué intereses materiales y actores estatales o corporativos subyacen a los conflictos geopolíticos contemporáneos?',
  },
  {
    num: 4,
    title: 'Guerra Fría en América Latina',
    subtitle: 'Bipolaridad mundial, Doctrina de Seguridad Nacional, dictaduras e insurgencia',
    accentColor: '#A78BFA',
    artwork: '/assets/art/z11-4-guerrafria.webp',
    resourceUnits: ['07', '11'],
    missionId: 'mision-1104',
    missionTitle: 'El continente bajo la Guerra Fría',
    centralQuestion:
      '¿Cómo impactaron el enfrentamiento bipolar y la Doctrina de Seguridad Nacional la historia política de América Latina?',
  },
  {
    num: 5,
    title: 'Globalización, TLC y resistencias',
    subtitle: 'Apertura comercial, desregulación financiera, trabajo e identidades locales',
    accentColor: '#E8B86D',
    artwork: '/assets/art/z11-5-mercados.webp',
    resourceUnits: ['10', '11'],
    missionId: 'mision-1105',
    missionTitle: 'El laberinto de la globalización',
    centralQuestion:
      '¿Qué efectos han tenido los Tratados de Libre Comercio y la desregulación financiera sobre el agro, la industria y la soberanía en Colombia?',
  },
];

export const MUNDO_11_WORLD: WorldDefinition = buildWorldFromDbas(
  11,
  '11°',
  'mundo-11',
  'DILEMAS DEL MUNDO ACTUAL',
  'Mundo 1 de Undécimo · Ciencias Sociales (I.E.R. Boyacá)',
  'Territorio culminante de undécimo grado alineado con el núcleo depurado de los DBA 1 a 5: economía ecológica y acuerdos climáticos, justicia transicional, geopolítica de minerales críticos, Guerra Fría en América Latina y tensiones de la globalización.',
  '/assets/art/mundo-11-globalizacion.webp',
  ZONAS_11_SPECS
);

const dba11_1 = dbas11[0];

export const MISION_1101: MissionDefinition = {
  id: 'mision-1101',
  worldId: 'mundo-11',
  zoneId: 'mundo-11-z1',
  code: 'MISIÓN 1101',
  title: 'Límites del planeta y tratados climáticos',
  subtitle: 'Economía ecológica, absorción de carbono y gobernanza climática global',
  centralQuestion:
    '¿Por qué entran en tensión las agendas de crecimiento industrial de los bloques hegemónicos y los tratados climáticos globales?',
  grade: 'Grado 11° — Ciencias Sociales',
  area: 'Ciencias Sociales (I.E.R. Boyacá)',
  estimatedDurations: [45, 50],
  resourceUnits: ['09', '10', '11'],
  objectives: [dba11_1.statement],
  curriculumRefs: [
    {
      code: 'DBA 1 — Ciencias Sociales 11° (I.E.R. Boyacá)',
      source: 'Plan DBA depurado (src/data/dbaPlan.json)',
      statement: dba11_1.statement,
      nature: 'directa',
      evidences: [...dba11_1.evidences],
    },
  ],
  glossary: [
    {
      term: 'Externalidad biofísica global',
      definition:
        'Costo o daño ambiental (como emisiones de gases de efecto invernadero) generado por una actividad industrial que afecta al planeta entero y no se incluye en el precio de mercado.',
    },
    {
      term: 'Acuerdos climáticos multilaterales',
      definition:
        'Tratados internacionales como el Protocolo de Kioto y el Acuerdo de París orientados a limitar las emisiones globales de carbono.',
    },
  ],
  sources: [
    {
      id: 'src-1101-dba',
      title: 'DBA 1 — Grado 11° (Núcleo depurado I.E.R. Boyacá)',
      institution: 'Ministerio de Educación Nacional / I.E.R. Boyacá',
      note: dba11_1.focus,
    },
  ],
  scenes: [
    {
      id: 'm1101-e0',
      index: 0,
      code: 'PANTALLA 1',
      title: 'Apertura: Crecimiento infinito en un planeta finito',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Narración docente · Hipótesis en cuaderno',
      narrative:
        'Todos los Estados declaran en las cumbres internacionales que desean proteger el clima. Sin embargo, cuando reducir emisiones implica frenar industrias, encarecer la energía o perder competitividad comercial, las potencias suelen incumplir sus metas.',
      promptQuestion:
        '¿Por qué resulta tan difícil que los Estados industrializados subordinen sus metas económicas a los límites ecológicos del planeta?',
      notebookPrompt:
        'Escribe en tu cuaderno tu hipótesis sobre la contradicción entre crecimiento económico industrial y límites biofísicos.',
      defaultTimerSeconds: 180,
      hints: [dba11_1.evidences[0]],
      publicAnswerSummary: dba11_1.statement,
      scientificFeedback: dba11_1.focus,
      teacherNotes: {
        pedagogicalGoal: dba11_1.statement,
        facilitationScript:
          'Plantee el dilema entre soberanía económica nacional y bienes comunes atmosféricos.',
        whatToWatchFor: dba11_1.focus,
        adaptationShortSession: 'Recoja 2 hipótesis argumentadas.',
      },
    },
    {
      id: 'm1101-e1',
      index: 1,
      code: 'PANTALLA 2',
      title: 'Evidencias de la gobernanza climática',
      type: 'evidence-challenge',
      participationMode: 'voting',
      participationLabel: 'Votación A/B · Evaluación de tratados',
      narrative:
        'Examinemos las contradicciones estructurales entre la economía industrial y la eficacia jurídica del Protocolo de Kioto y el Acuerdo de París.',
      promptQuestion: '¿Qué evidencias explican los límites de la política ambiental global?',
      notebookPrompt: 'Registra en tu cuaderno el alcance y los límites de los acuerdos climáticos.',
      defaultTimerSeconds: 200,
      hints: [...dba11_1.evidences],
      publicAnswerSummary: dba11_1.evidences.join(' · '),
      scientificFeedback: dba11_1.focus,
      challengeData: {
        evidences: [
          {
            id: 'm1101-ev1',
            title: 'Evidencia A: Crecimiento industrial vs. absorción de carbono',
            category: 'observacion',
            summary: dba11_1.evidences[0],
            detail:
              'El metabolismo energético industrial supera la capacidad física de océanos y bosques para absorber emisiones.',
            isValidEvidence: true,
            scientificFeedback: 'Evidencia clave del DBA 1 de undécimo grado.',
          },
          {
            id: 'm1101-ev2',
            title: 'Evidencia B: Kioto y París frente a las agendas comerciales hegemónicas',
            category: 'observacion',
            summary: dba11_1.evidences[1],
            detail:
              'La ausencia de sanciones vinculantes fuertes hace que las potencias prioricen su competitividad comercial.',
            isValidEvidence: true,
            scientificFeedback: 'Evidencia clave para el análisis de gobernanza ambiental.',
          },
          {
            id: 'm1101-ev3',
            title: 'Evidencia C: Cumplimiento automático sin costos económicos',
            category: 'distractor',
            summary: 'Suposición de que la transición energética no implica disputas comerciales ni geopolíticas.',
            detail: 'Ignora los intereses de sectores fósiles e industriales.',
            isValidEvidence: false,
            scientificFeedback: 'Descartada.',
          },
        ],
        defaultVoteOptions: [
          { id: 'A', label: 'A. Evidencias A y B (límites de carbono + asimetrías en tratados)' },
          { id: 'B', label: 'B. Solo Evidencia C' },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Desarrollar lectura crítica de dilemas ambientales complejos tipo Saber 11.',
        facilitationScript: 'Compare responsabilidades históricas de emisiones entre países industrializados y países megadiversos como Colombia.',
        whatToWatchFor: 'Uso riguroso de conceptos como soberanía, tratado y límite ecosistémico.',
        adaptationShortSession: 'Votación y debate breve.',
      },
    },
    {
      id: 'm1101-e2',
      index: 2,
      code: 'PANTALLA 3',
      title: 'Ensayo breve en cuaderno (Nivel Saber 11)',
      type: 'notebook-expedition',
      participationMode: 'construction',
      participationLabel: 'Construcción en cuaderno · Rúbrica SIE',
      narrative:
        'Sintetiza tu postura argumentada sobre la eficacia de los acuerdos climáticos frente al modelo económico global.',
      promptQuestion:
        '¿Qué condiciones jurídicas y económicas se requerirían para que tratados como el Acuerdo de París prevalezcan sobre los intereses comerciales inmediatos?',
      notebookPrompt:
        'Redacta en tu cuaderno un texto argumentativo breve que integre las dos evidencias del DBA 1 de 11°.',
      defaultTimerSeconds: 240,
      hints: [...dba11_1.evidences],
      publicAnswerSummary: dba11_1.evidences.join(' · '),
      scientificFeedback: dba11_1.focus,
      challengeData: {
        rubric: [
          {
            criterion: 'Contradicción crecimiento vs. límites biofísicos',
            inicial: 'Menciona la contaminación sin relación económica.',
            enProceso: 'Describe que las industrias contaminan.',
            logrado: dba11_1.evidences[0],
          },
          {
            criterion: 'Evaluación de tratados (Kioto / París)',
            inicial: 'No menciona acuerdos internacionales.',
            enProceso: 'Nombra los tratados sin evaluar sus límites.',
            logrado: dba11_1.evidences[1],
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Evaluar escritura argumentativa de grado 11°.',
        facilitationScript: 'Destaque los mejores argumentos en plenaria.',
        whatToWatchFor: 'Articulación entre ecología, derecho internacional y comercio.',
        adaptationShortSession: 'Tesis y dos argumentos en el cuaderno.',
      },
    },
    {
      id: 'm1101-e3',
      index: 3,
      code: 'PANTALLA 4',
      title: 'Cierre de la Misión 1101',
      type: 'closing',
      participationMode: 'deliberation',
      participationLabel: 'Cierre colectivo',
      narrative:
        'Así como la humanidad requiere acuerdos verificables para proteger la biosfera, las sociedades divididas por la guerra necesitan mecanismos de justicia transicional para construir una paz estable.',
      promptQuestion: '¿Cómo se resuelven negociadamente los conflictos armados sin caer en la impunidad?',
      defaultTimerSeconds: 120,
      hints: [],
      publicAnswerSummary: dba11_1.statement,
      scientificFeedback: dba11_1.focus,
      challengeData: {
        closingSynthesis: [...dba11_1.evidences],
        nextExpeditionBridge:
          'Próxima zona (DBA 2): ¿Qué tensiones jurídicas y políticas enfrentan los modelos de Justicia Transicional en la búsqueda de la paz?',
      },
      teacherNotes: {
        pedagogicalGoal: 'Conectar la gobernanza global con la solución negociada de los conflictos armados (DBA 2).',
        facilitationScript: 'Cierre con la pregunta puente hacia Justicia Transicional.',
        whatToWatchFor: 'Capacidad de análisis de perspectivas.',
        adaptationShortSession: 'Cierre directo.',
      },
    },
  ],
};

export const MISIONES_11_LIST: MissionDefinition[] = [
  MISION_1101,
  ...dbas11
    .slice(1)
    .map((dba, idx) =>
      buildSkeletonMissionFromDba('11°', 'mundo-11', `mundo-11-z${dba.num}`, dba, ZONAS_11_SPECS[idx + 1])
    ),
];
