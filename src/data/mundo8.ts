import type { MissionDefinition, WorldDefinition } from '../engine/types';
import {
  buildSkeletonMissionFromDba,
  buildWorldFromDbas,
  getGradeDbas,
  type ZoneMetaSpec,
} from './dbaWorldBuilder';

const dbas8 = getGradeDbas(8);

export const ZONAS_8_SPECS: ZoneMetaSpec[] = [
  {
    num: 1,
    title: 'Alianzas y bloques económicos',
    subtitle: 'Integración interestatal, Unión Europea y tratados de Colombia',
    accentColor: '#38BDF8',
    artwork: '/assets/art/z8-1-bloques.webp',
    resourceUnits: ['10', '11'],
    missionId: 'mision-801',
    missionTitle: 'El tablero de los bloques',
    centralQuestion: '¿Cómo influyen los bloques económicos y los tratados internacionales en la soberanía de los países?',
  },
  {
    num: 2,
    title: 'Rutas de la migración global',
    subtitle: 'Asimetrías de capital, IDH y flujos migratorios transnacionales',
    accentColor: '#E8B86D',
    artwork: '/assets/art/z8-2-migraciones.webp',
    resourceUnits: ['09', '10'],
    missionId: 'mision-802',
    missionTitle: 'Fronteras y movimiento humano',
    centralQuestion: '¿Por qué las diferencias en infraestructura e IDH impulsan las migraciones globales?',
  },
  {
    num: 3,
    title: 'La máquina del capitalismo',
    subtitle: 'Revolución industrial, propiedad fabril, plusvalía y sistemas económicos',
    accentColor: '#D97757',
    artwork: '/assets/art/z8-3-capitalismo.webp',
    resourceUnits: ['10'],
    missionId: 'mision-803',
    missionTitle: 'Vapor, fábrica y mercado',
    centralQuestion: '¿Cómo transformó la industrialización de los siglos XVIII y XIX el trabajo y la sociedad?',
  },
  {
    num: 4,
    title: 'Imperios y reparto del mundo',
    subtitle: 'Imperialismo del siglo XIX en África y Asia frente al poder transnacional hoy',
    accentColor: '#A78BFA',
    artwork: '/assets/art/z8-4-imperialismo.webp',
    resourceUnits: ['11', '06'],
    missionId: 'mision-804',
    missionTitle: 'El mapa repartido',
    centralQuestion: '¿Qué relación existe entre la acumulación industrial europea y el reparto colonial de África y Asia?',
  },
  {
    num: 5,
    title: 'Independencias americanas',
    subtitle: 'Crisis colonial, Ilustración y formación de los Estados republicanos',
    accentColor: '#FBBF24',
    artwork: '/assets/art/z8-5-independencias.webp',
    resourceUnits: ['06'],
    missionId: 'mision-805',
    missionTitle: 'El quiebre del orden colonial',
    centralQuestion: '¿Qué cambió y qué permaneció en América tras las independencias de los siglos XVIII y XIX?',
  },
  {
    num: 6,
    title: 'Colombia en el siglo XIX',
    subtitle: 'Enclaves agroexportadores, Comisión Corográfica y transformación ambiental',
    accentColor: '#34D399',
    artwork: '/assets/art/z8-6-corografica.webp',
    resourceUnits: ['06', '09'],
    missionId: 'mision-806',
    missionTitle: 'Rieles, tabaco y cartografía nacional',
    centralQuestion: '¿Cómo moldearon el café, el tabaco y la Comisión Corográfica el territorio colombiano en el siglo XIX?',
  },
  {
    num: 7,
    title: 'Luchas por la dignidad humana',
    subtitle: 'Abolición de la esclavitud, derechos de las mujeres y de las minorías',
    accentColor: '#F472B6',
    artwork: '/assets/art/z8-7-dignidad.webp',
    resourceUnits: ['12', '06'],
    missionId: 'mision-807',
    missionTitle: 'Conquistas contra la exclusión',
    centralQuestion: '¿Por qué persisten brechas de discriminación a pesar del reconocimiento formal de los derechos?',
  },
  {
    num: 8,
    title: 'Sindicatos y derechos colectivos',
    subtitle: 'Movimientos obreros, campesinos y estudiantiles en el Estado Social de Derecho',
    accentColor: '#60A5FA',
    artwork: '/assets/art/z8-8-sindicatos.webp',
    resourceUnits: ['12', '07'],
    missionId: 'mision-808',
    missionTitle: 'La fuerza de la asociación',
    centralQuestion: '¿Qué papel cumplen los sindicatos y movimientos sociales en la defensa de los derechos laborales?',
  },
];

export const MUNDO_8_WORLD: WorldDefinition = buildWorldFromDbas(
  8,
  '8°',
  'mundo-8',
  'REVOLUCIONES E INDUSTRIA',
  'Mundo 1 de Octavo · Ciencias Sociales (I.E.R. Boyacá)',
  'Territorio de octavo grado alineado con el núcleo depurado de los DBA 1 a 8: integración económica, migraciones, Revolución Industrial, imperialismo, independencias americanas, siglo XIX colombiano y luchas por los derechos colectivos.',
  '/assets/art/mundo-8-revoluciones.webp',
  ZONAS_8_SPECS
);

const dba8_1 = dbas8[0];

export const MISION_801: MissionDefinition = {
  id: 'mision-801',
  worldId: 'mundo-8',
  zoneId: 'mundo-8-z1',
  code: 'MISIÓN 801',
  title: 'El tablero de los bloques',
  subtitle: 'Cooperación económica, Unión Europea y acuerdos comerciales de Colombia',
  centralQuestion: '¿Cómo influyen los bloques económicos y los tratados internacionales en la soberanía de los países?',
  grade: 'Grado 8° — Ciencias Sociales',
  area: 'Ciencias Sociales (I.E.R. Boyacá)',
  estimatedDurations: [45, 50],
  resourceUnits: ['10', '11'],
  objectives: [dba8_1.statement],
  curriculumRefs: [
    {
      code: 'DBA 1 — Ciencias Sociales 8° (I.E.R. Boyacá)',
      source: 'Plan DBA depurado (src/data/dbaPlan.json)',
      statement: dba8_1.statement,
      nature: 'directa',
      evidences: [...dba8_1.evidences],
    },
  ],
  glossary: [
    {
      term: 'Bloque económico supranacional',
      definition:
        'Alianza entre Estados que acuerdan reducir aranceles, coordinar políticas económicas o compartir instituciones, como la Unión Europea.',
    },
    {
      term: 'Acuerdo aduanero y comercial',
      definition:
        'Tratado entre países para regular impuestos de importación, exportación y circulación de mercancías.',
    },
  ],
  sources: [
    {
      id: 'src-801-dba',
      title: 'DBA 1 — Grado 8° (Núcleo depurado I.E.R. Boyacá)',
      institution: 'Ministerio de Educación Nacional / I.E.R. Boyacá',
      note: dba8_1.focus,
    },
  ],
  scenes: [
    {
      id: 'm801-e0',
      index: 0,
      code: 'PANTALLA 1',
      title: 'Apertura: ¿Por qué los países se asocian en bloques?',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Narración docente · Hipótesis en cuaderno',
      narrative:
        'Ningún Estado contemporáneo produce por sí solo todo lo que consume. Tras las guerras del siglo XX, varios países europeos decidieron unir sus mercados y monedas, mientras América Latina firmó acuerdos regionales y tratados bilaterales.',
      promptQuestion: '¿Qué gana y qué arriesga un país cuando firma un tratado económico con una potencia o un bloque?',
      notebookPrompt:
        'Escribe en tu cuaderno una ventaja y una desventaja de abrir las fronteras al comercio con otros países.',
      defaultTimerSeconds: 180,
      hints: [dba8_1.evidences[0]],
      publicAnswerSummary: dba8_1.statement,
      scientificFeedback: dba8_1.focus,
      teacherNotes: {
        pedagogicalGoal: dba8_1.statement,
        facilitationScript: 'Use ejemplos cotidianos de productos importados y exportados por Colombia.',
        whatToWatchFor: dba8_1.focus,
        adaptationShortSession: 'Recoja 2 ideas en voz alta y pase al análisis de evidencias.',
      },
    },
    {
      id: 'm801-e1',
      index: 1,
      code: 'PANTALLA 2',
      title: 'Evidencias del orden económico internacional',
      type: 'evidence-challenge',
      participationMode: 'voting',
      participationLabel: 'Votación A/B · Análisis de casos',
      narrative:
        'Examinemos el caso de la Unión Europea y las relaciones comerciales que sostiene Colombia en la actualidad.',
      promptQuestion: '¿Cuáles de estas afirmaciones corresponden a las evidencias reales de cooperación entre Estados?',
      notebookPrompt: 'Registra en tu cuaderno la diferencia entre integración supranacional y acuerdo comercial.',
      defaultTimerSeconds: 200,
      hints: [...dba8_1.evidences],
      publicAnswerSummary: dba8_1.evidences.join(' · '),
      scientificFeedback: dba8_1.focus,
      challengeData: {
        evidences: [
          {
            id: 'm801-ev1',
            title: 'Caso A: La Unión Europea en el orden mundial',
            category: 'observacion',
            summary: dba8_1.evidences[0],
            detail:
              'Ejemplo de integración económica, monetaria y política que reconfiguró la arquitectura del poder global.',
            isValidEvidence: true,
            scientificFeedback: 'Evidencia válida del núcleo curricular de octavo grado.',
          },
          {
            id: 'm801-ev2',
            title: 'Caso B: Tratados y acuerdos aduaneros de Colombia',
            category: 'observacion',
            summary: dba8_1.evidences[1],
            detail:
              'Colombia participa en acuerdos regionales (como la CAN o Alianza del Pacífico) y tratados con bloques globales.',
            isValidEvidence: true,
            scientificFeedback: 'Evidencia válida: permite evaluar ventajas y asimetrías comerciales del país.',
          },
          {
            id: 'm801-ev3',
            title: 'Caso C: Aislamiento absoluto de los Estados',
            category: 'distractor',
            summary: 'Suposición de que los países actuales no tienen tratados ni acuerdos aduaneros.',
            detail: 'Contradice la interdependencia comercial y financiera contemporánea.',
            isValidEvidence: false,
            scientificFeedback: 'Descartada: el mundo actual opera mediante redes de tratados y bloques.',
          },
        ],
        defaultVoteOptions: [
          { id: 'A', label: 'A. Casos A y B (Unión Europea + acuerdos de Colombia)' },
          { id: 'B', label: 'B. Solo Caso C (aislamiento comercial)' },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Analizar la Unión Europea y los tratados de Colombia desde la geopolítica del comercio.',
        facilitationScript: 'Compare el peso económico de un bloque industrial frente a un país exportador de materias primas.',
        whatToWatchFor: 'Comprensión de la asimetría entre centro industrial y periferia.',
        adaptationShortSession: 'Votación directa y retroalimentación.',
      },
    },
    {
      id: 'm801-e2',
      index: 2,
      code: 'PANTALLA 3',
      title: 'Expediente geopolítico en cuaderno',
      type: 'notebook-expedition',
      participationMode: 'construction',
      participationLabel: 'Construcción en cuaderno · Rúbrica SIE',
      narrative:
        'Sintetiza en tu bitácora cómo funcionan los procesos de cooperación económica y política entre los Estados.',
      promptQuestion:
        '¿Por qué la integración en bloques (como la Unión Europea) y los acuerdos aduaneros influyen en la vida económica de Colombia?',
      notebookPrompt:
        'Redacta una explicación en tu cuaderno que mencione: 1) la Unión Europea como ejemplo de integración y 2) los acuerdos económicos y aduaneros de Colombia.',
      defaultTimerSeconds: 240,
      hints: [...dba8_1.evidences],
      publicAnswerSummary: dba8_1.evidences.join(' · '),
      scientificFeedback: dba8_1.focus,
      challengeData: {
        rubric: [
          {
            criterion: 'Integración internacional (Unión Europea)',
            inicial: 'Nombra la Unión Europea sin explicar su papel.',
            enProceso: 'Describe que agrupa varios países europeos.',
            logrado: dba8_1.evidences[0],
          },
          {
            criterion: 'Relaciones comerciales de Colombia',
            inicial: 'No menciona acuerdos de Colombia.',
            enProceso: 'Nombra algún tratado sin explicar sus efectos.',
            logrado: dba8_1.evidences[1],
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Evaluar en el cuaderno las dos evidencias del DBA 1 de 8°.',
        facilitationScript: 'Revise la argumentación escrita y asigne puntos de Investigación y Pensamiento.',
        whatToWatchFor: 'Claridad al relacionar tratados con economía nacional.',
        adaptationShortSession: 'Síntesis en dos puntos clave.',
      },
    },
    {
      id: 'm801-e3',
      index: 3,
      code: 'PANTALLA 4',
      title: 'Cierre de la Misión 801',
      type: 'closing',
      participationMode: 'deliberation',
      participationLabel: 'Cierre colectivo',
      narrative:
        'Si las mercancías y el capital cruzan fronteras a través de tratados, ¿qué ocurre con las personas que migran buscando mejores condiciones de vida?',
      promptQuestion: '¿Por qué migran millones de personas entre países con distinto desarrollo humano?',
      defaultTimerSeconds: 120,
      hints: [],
      publicAnswerSummary: dba8_1.statement,
      scientificFeedback: dba8_1.focus,
      challengeData: {
        closingSynthesis: [...dba8_1.evidences],
        nextExpeditionBridge:
          'Próxima zona (DBA 2): ¿Cómo afectan las migraciones a los países de origen y a los países receptores?',
      },
      teacherNotes: {
        pedagogicalGoal: 'Conectar la geopolítica comercial con los flujos migratorios (DBA 2).',
        facilitationScript: 'Cierre con la pregunta puente hacia la Zona 2.',
        whatToWatchFor: 'Relación entre desigualdad económica y migración.',
        adaptationShortSession: 'Lectura de cierre.',
      },
    },
  ],
};

export const MISIONES_8_LIST: MissionDefinition[] = [
  MISION_801,
  ...dbas8
    .slice(1)
    .map((dba, idx) =>
      buildSkeletonMissionFromDba('8°', 'mundo-8', `mundo-8-z${dba.num}`, dba, ZONAS_8_SPECS[idx + 1])
    ),
];
