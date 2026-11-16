import type { MissionDefinition, WorldDefinition } from '../engine/types';
import {
  buildSkeletonMissionFromDba,
  buildWorldFromDbas,
  getGradeDbas,
  type ZoneMetaSpec,
} from './dbaWorldBuilder';

const dbas9 = getGradeDbas(9);

export const ZONAS_9_SPECS: ZoneMetaSpec[] = [
  {
    num: 1,
    title: 'Geosistemas estratégicos',
    subtitle: 'Selvas, páramos, arrecifes coralinos y dilemas frente al extractivismo',
    accentColor: '#34D399',
    artwork: '/assets/art/z9-1-geosistemas.webp',
    resourceUnits: ['09', '10'],
    missionId: 'mision-901',
    missionTitle: 'Guardianes de los geosistemas',
    centralQuestion: '¿Por qué chocan la expansión extractiva y la preservación de selvas, páramos y arrecifes en Colombia?',
  },
  {
    num: 2,
    title: 'Desplazamiento y territorio',
    subtitle: 'Concentración rural, desplazamiento forzado y periferias urbanas',
    accentColor: '#D97757',
    artwork: '/assets/art/z9-2-desplazamiento.webp',
    resourceUnits: ['07', '08'],
    missionId: 'mision-902',
    missionTitle: 'Desarraigo y ciudad periférica',
    centralQuestion: '¿Cómo transformó el desplazamiento forzado la estructura rural y urbana de Colombia?',
  },
  {
    num: 3,
    title: 'Crisis económicas en Colombia',
    subtitle: 'UPAC, pacto cafetero, choques fiscales y canasta familiar',
    accentColor: '#E8B86D',
    artwork: '/assets/art/z9-3-crisis.webp',
    resourceUnits: ['07', '10'],
    missionId: 'mision-903',
    missionTitle: 'Cuando tiembla la economía del hogar',
    centralQuestion: '¿Cómo impactan las crisis macroeconómicas y el endeudamiento externo la vida cotidiana de las familias?',
  },
  {
    num: 4,
    title: 'Colombia en el siglo XX',
    subtitle: 'Infraestructura, movimiento obrero, exclusión política y conflicto',
    accentColor: '#38BDF8',
    artwork: '/assets/art/z9-4-modernizacion.webp',
    resourceUnits: ['07', '08'],
    missionId: 'mision-904',
    missionTitle: 'Modernización, huelgas y exclusión',
    centralQuestion: '¿Qué tensiones sociales y políticas acompañaron la modernización colombiana del siglo XX?',
  },
  {
    num: 5,
    title: 'Defensa constitucional y participación',
    subtitle: 'Tutela, Acciones Populares, Cumplimiento y democracia directa',
    accentColor: '#A78BFA',
    artwork: '/assets/art/z9-5-estado-derecho.webp',
    resourceUnits: ['12'],
    missionId: 'mision-905',
    missionTitle: 'Las llaves de la Constitución',
    centralQuestion: '¿Qué mecanismo constitucional corresponde usar ante cada vulneración de derechos fundamentales o colectivos?',
  },
  {
    num: 6,
    title: 'Mujeres y derechos en la historia',
    subtitle: 'Sufragio femenino, educación, paridad laboral y economía del cuidado',
    accentColor: '#F472B6',
    artwork: '/assets/art/z9-6-mujeres.webp',
    resourceUnits: ['07', '12'],
    missionId: 'mision-906',
    missionTitle: 'Ciudadanía plena y paridad',
    centralQuestion: '¿Cómo conquistaron las mujeres derechos políticos y laborales y qué brechas estructurales persisten?',
  },
  {
    num: 7,
    title: 'Deconstruir el discurso de guerra',
    subtitle: 'Acuerdos de paz, sesgos ideológicos y crítica de fuentes',
    accentColor: '#60A5FA',
    artwork: '/assets/art/z9-7-acuerdos.webp',
    resourceUnits: ['08', '12'],
    missionId: 'mision-907',
    missionTitle: 'La palabra frente a las armas',
    centralQuestion: '¿Cómo detectar prejuicios y agendas ocultas en los discursos que justifican la violencia?',
  },
  {
    num: 8,
    title: 'Centro, periferia y desigualdad regional',
    subtitle: 'IDH, coeficiente de Gini, regalías y presencia diferenciada del Estado',
    accentColor: '#FBBF24',
    artwork: '/assets/art/z9-8-regiones.webp',
    resourceUnits: ['09', '10'],
    missionId: 'mision-908',
    missionTitle: 'Geografía de la desigualdad',
    centralQuestion: '¿Por qué existe una brecha histórica de inversión e infraestructura entre el centro andino y las periferias?',
  },
];

export const MUNDO_9_WORLD: WorldDefinition = buildWorldFromDbas(
  9,
  '9°',
  'mundo-9',
  'COLOMBIA EN EL SIGLO XX',
  'Mundo 1 de Noveno · Ciencias Sociales (I.E.R. Boyacá)',
  'Territorio de noveno grado alineado con el núcleo depurado de los DBA 1 a 8: geosistemas biodiversos, desplazamiento forzado, crisis económicas, modernización del siglo XX, acciones constitucionales, derechos de las mujeres y desigualdad regional.',
  '/assets/art/mundo-9-sigloxx.webp',
  ZONAS_9_SPECS
);

const dba9_1 = dbas9[0];

export const MISION_901: MissionDefinition = {
  id: 'mision-901',
  worldId: 'mundo-9',
  zoneId: 'mundo-9-z1',
  code: 'MISIÓN 901',
  title: 'Guardianes de los geosistemas',
  subtitle: 'Selvas, páramos y arrecifes frente a la presión extractiva en Colombia',
  centralQuestion:
    '¿Por qué chocan la expansión extractiva y la preservación de selvas, páramos y arrecifes en Colombia?',
  grade: 'Grado 9° — Ciencias Sociales',
  area: 'Ciencias Sociales (I.E.R. Boyacá)',
  estimatedDurations: [45, 50],
  resourceUnits: ['09', '10'],
  objectives: [dba9_1.statement],
  curriculumRefs: [
    {
      code: 'DBA 1 — Ciencias Sociales 9° (I.E.R. Boyacá)',
      source: 'Plan DBA depurado (src/data/dbaPlan.json)',
      statement: dba9_1.statement,
      nature: 'directa',
      evidences: [...dba9_1.evidences],
    },
  ],
  glossary: [
    {
      term: 'Geosistema biodiverso estratégico',
      definition:
        'Ecosistema de alta fragilidad y valor vital (como páramos productores de agua, selvas tropicales y arrecifes coralinos).',
    },
    {
      term: 'Frontera agroindustrial y extractiva',
      definition:
        'Avance de monocultivos, ganadería extensiva o minería sobre territorios de conservación o reserva.',
    },
  ],
  sources: [
    {
      id: 'src-901-dba',
      title: 'DBA 1 — Grado 9° (Núcleo depurado I.E.R. Boyacá)',
      institution: 'Ministerio de Educación Nacional / I.E.R. Boyacá',
      note: dba9_1.focus,
    },
  ],
  scenes: [
    {
      id: 'm901-e0',
      index: 0,
      code: 'PANTALLA 1',
      title: 'Apertura: El dilema del agua y el oro',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Narración docente · Hipótesis en cuaderno',
      narrative:
        'Colombia posee la mayor proporción de páramos del planeta, además de selvas amazónicas y del Chocó y arrecifes en el Caribe y el Pacífico. Sin embargo, estos mismos territorios enfrentan presiones por minería, deforestación y megaproyectos.',
      promptQuestion:
        '¿Qué intereses entran en choque cuando se proyecta una explotación minera o agroindustrial en un páramo o una selva?',
      notebookPrompt:
        'Anota en tu cuaderno qué actores participan en este dilema y qué defiende cada uno.',
      defaultTimerSeconds: 180,
      hints: [dba9_1.evidences[0]],
      publicAnswerSummary: dba9_1.statement,
      scientificFeedback: dba9_1.focus,
      teacherNotes: {
        pedagogicalGoal: dba9_1.statement,
        facilitationScript: 'Plantee el dilema entre ingresos fiscales de corto plazo y sostenibilidad hídrica de largo plazo.',
        whatToWatchFor: dba9_1.focus,
        adaptationShortSession: 'Recoja 2 posturas iniciales y pase a las evidencias.',
      },
    },
    {
      id: 'm901-e1',
      index: 1,
      code: 'PANTALLA 2',
      title: 'Evidencias del conflicto socioambiental',
      type: 'evidence-challenge',
      participationMode: 'voting',
      participationLabel: 'Votación A/B · Análisis de tensiones',
      narrative:
        'Analicemos las causas económicas e institucionales que explican la degradación de los ecosistemas estratégicos en Colombia.',
      promptQuestion: '¿Qué factores explican la vulnerabilidad de nuestros geosistemas?',
      notebookPrompt: 'Registra las dos causas estructurales en tu cuaderno.',
      defaultTimerSeconds: 200,
      hints: [...dba9_1.evidences],
      publicAnswerSummary: dba9_1.evidences.join(' · '),
      scientificFeedback: dba9_1.focus,
      challengeData: {
        evidences: [
          {
            id: 'm901-ev1',
            title: 'Evidencia A: Presión agroindustrial, minera y megaproyectos',
            category: 'observacion',
            summary: dba9_1.evidences[0],
            detail:
              'La expansión de la frontera extractiva colisiona directamente con la preservación de áreas protegidas.',
            isValidEvidence: true,
            scientificFeedback: 'Evidencia clave del DBA 1 de noveno grado.',
          },
          {
            id: 'm901-ev2',
            title: 'Evidencia B: Centralismo estatal y debilidad en fiscalización',
            category: 'observacion',
            summary: dba9_1.evidences[1],
            detail:
              'La insuficiente presencia y control ambiental en regiones apartadas facilita la deforestación y degradación.',
            isValidEvidence: true,
            scientificFeedback: 'Evidencia clave: vincula el problema ambiental con la estructura institucional del Estado.',
          },
          {
            id: 'm901-ev3',
            title: 'Evidencia C: Ausencia total de recursos naturales en el país',
            category: 'distractor',
            summary: 'Afirmación de que Colombia carece de biodiversidad o fuentes hídricas.',
            detail: 'Falso: el conflicto surge precisamente por la disputa sobre territorios megadiversos.',
            isValidEvidence: false,
            scientificFeedback: 'Descartada.',
          },
        ],
        defaultVoteOptions: [
          { id: 'A', label: 'A. Evidencias A y B (presión extractiva + debilidad institucional)' },
          { id: 'B', label: 'B. Solo Evidencia C' },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Evaluar tensiones económicas y debilidad institucional frente a áreas protegidas.',
        facilitationScript: 'Destaque cómo se articulan economía e instituciones en los dilemas ambientales tipo Saber.',
        whatToWatchFor: 'Argumentación multicausal.',
        adaptationShortSession: 'Votación y síntesis directa.',
      },
    },
    {
      id: 'm901-e2',
      index: 2,
      code: 'PANTALLA 3',
      title: 'Expediente ambiental en cuaderno',
      type: 'notebook-expedition',
      participationMode: 'construction',
      participationLabel: 'Construcción en cuaderno · Rúbrica SIE',
      narrative:
        'Construye tu análisis escrito sobre la situación de un geosistema colombiano (páramo, selva o arrecife).',
      promptQuestion:
        '¿Cómo se relacionan los intereses económicos extractivos y la capacidad de control del Estado en la problemática de un geosistema colombiano?',
      notebookPrompt:
        'Escribe un párrafo que evalúe: 1) la tensión entre frontera extractiva y área protegida y 2) el papel de la fiscalización estatal.',
      defaultTimerSeconds: 240,
      hints: [...dba9_1.evidences],
      publicAnswerSummary: dba9_1.evidences.join(' · '),
      scientificFeedback: dba9_1.focus,
      challengeData: {
        rubric: [
          {
            criterion: 'Tensión económica vs. preservación',
            inicial: 'Menciona el ecosistema sin identificar el conflicto.',
            enProceso: 'Nombra la deforestación o minería de forma general.',
            logrado: dba9_1.evidences[0],
          },
          {
            criterion: 'Análisis institucional',
            inicial: 'No menciona al Estado ni las normas.',
            enProceso: 'Menciona que faltan leyes.',
            logrado: dba9_1.evidences[1],
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Consolidar en el cuaderno el análisis sistémico de las dos evidencias del DBA 1 de 9°.',
        facilitationScript: 'Acompañe la escritura y otorgue puntos por argumentación.',
        whatToWatchFor: 'Relación entre economía y Estado.',
        adaptationShortSession: 'Esquema de actores e intereses.',
      },
    },
    {
      id: 'm901-e3',
      index: 3,
      code: 'PANTALLA 4',
      title: 'Cierre de la Misión 901',
      type: 'closing',
      participationMode: 'deliberation',
      participationLabel: 'Cierre colectivo',
      narrative:
        'La disputa por la tierra y los recursos en el campo colombiano no solo transforma ecosistemas: también ha expulsado a millones de campesinos hacia las ciudades.',
      promptQuestion: '¿Qué consecuencias ha traído el desplazamiento forzado en la historia reciente de Colombia?',
      defaultTimerSeconds: 120,
      hints: [],
      publicAnswerSummary: dba9_1.statement,
      scientificFeedback: dba9_1.focus,
      challengeData: {
        closingSynthesis: [...dba9_1.evidences],
        nextExpeditionBridge:
          'Próxima zona (DBA 2): ¿Cómo transformó el desplazamiento forzado el campo y las periferias urbanas de Colombia?',
      },
      teacherNotes: {
        pedagogicalGoal: 'Cerrar el DBA 1 y conectar con el desplazamiento forzado (DBA 2).',
        facilitationScript: 'Lea la pregunta puente hacia la Zona 2.',
        whatToWatchFor: 'Conexión entre territorio rural y migración interna.',
        adaptationShortSession: 'Cierre directo.',
      },
    },
  ],
};

export const MISIONES_9_LIST: MissionDefinition[] = [
  MISION_901,
  ...dbas9
    .slice(1)
    .map((dba, idx) =>
      buildSkeletonMissionFromDba('9°', 'mundo-9', `mundo-9-z${dba.num}`, dba, ZONAS_9_SPECS[idx + 1])
    ),
];
