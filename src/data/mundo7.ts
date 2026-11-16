import type { MissionDefinition, WorldDefinition } from '../engine/types';
import {
  buildSkeletonMissionFromDba,
  buildWorldFromDbas,
  getGradeDbas,
  type ZoneMetaSpec,
} from './dbaWorldBuilder';

const dbas7 = getGradeDbas(7);

export const ZONAS_7_SPECS: ZoneMetaSpec[] = [
  {
    num: 1,
    title: 'Mapas y visiones del mundo',
    subtitle: 'Cartografía como construcción histórica, tecnológica y geopolítica',
    accentColor: '#38BDF8',
    artwork: '/assets/art/z7-1-cartografia.webp',
    resourceUnits: ['04', '09'],
    missionId: 'mision-701',
    missionTitle: 'El mapa y el poder',
    centralQuestion: '¿Por qué cambian los mapas según la época, la tecnología y quien los dibuja?',
  },
  {
    num: 2,
    title: 'Ciudades y población',
    subtitle: 'Urbanización, migración campo-ciudad y problemáticas urbanas',
    accentColor: '#E8B86D',
    artwork: '/assets/art/z7-2-urbana.webp',
    resourceUnits: ['09'],
    missionId: 'mision-702',
    missionTitle: 'El pulso de las metrópolis',
    centralQuestion: '¿Cómo transforma el crecimiento urbano el territorio y la vida social en Colombia?',
  },
  {
    num: 3,
    title: 'El legado de Roma',
    subtitle: 'Derecho civil, ingeniería, control territorial y crisis imperial',
    accentColor: '#D97757',
    artwork: '/assets/art/z7-3-roma.webp',
    resourceUnits: ['03'],
    missionId: 'mision-703',
    missionTitle: 'Caminos, leyes y caída de un imperio',
    centralQuestion: '¿Qué instituciones de Roma siguen vivas hoy y por qué colapsó su imperio?',
  },
  {
    num: 4,
    title: 'Edad Media y América precolombina',
    subtitle: 'Feudalismo europeo frente a sociedades precolombinas clásicas y posclásicas',
    accentColor: '#A78BFA',
    artwork: '/assets/art/z7-4-edad-media.webp',
    resourceUnits: ['04', '02'],
    missionId: 'mision-704',
    missionTitle: 'Dos mundos en el mismo tiempo',
    centralQuestion: '¿Cómo se organizaban el poder y la tierra en la Europa feudal y en la América precolombina?',
  },
  {
    num: 5,
    title: 'Renacimiento y Modernidad',
    subtitle: 'Rutas mercantiles, Reforma y giro hacia el pensamiento moderno',
    accentColor: '#FBBF24',
    artwork: '/assets/art/z7-5-renacimiento.webp',
    resourceUnits: ['04'],
    missionId: 'mision-705',
    missionTitle: 'El despertar de las ciudades comerciales',
    centralQuestion: '¿Qué cambios científicos, políticos y religiosos abrieron paso a la Modernidad?',
  },
  {
    num: 6,
    title: 'Conquista y Colonia en América',
    subtitle: 'Choque imperial, mestizaje, resistencia y orden colonial',
    accentColor: '#34D399',
    artwork: '/assets/art/z7-6-conquista.webp',
    resourceUnits: ['05'],
    missionId: 'mision-706',
    missionTitle: 'Conquista, colonia y resistencia',
    centralQuestion: '¿Qué consecuencias demográficas, sociales y culturales dejó la colonización europea en América?',
  },
  {
    num: 7,
    title: 'Derechos fundamentales y Tutela',
    subtitle: 'Constitución de 1991 y mecanismos de protección inmediata',
    accentColor: '#60A5FA',
    artwork: '/assets/art/z7-7-tutela.webp',
    resourceUnits: ['12'],
    missionId: 'mision-707',
    missionTitle: 'Escudo constitucional',
    centralQuestion: '¿Cuándo y cómo protege la Acción de Tutela los derechos fundamentales de un ciudadano?',
  },
  {
    num: 8,
    title: 'Mediación y cultura de paz',
    subtitle: 'Negociación, conciliación, arbitraje y resolución de conflictos',
    accentColor: '#F472B6',
    artwork: '/assets/art/z7-8-paz.webp',
    resourceUnits: ['08', '12'],
    missionId: 'mision-708',
    missionTitle: 'Arquitectos de acuerdos',
    centralQuestion: '¿Cómo identificar actores e intereses para resolver un conflicto sin violencia?',
  },
];

export const MUNDO_7_WORLD: WorldDefinition = buildWorldFromDbas(
  7,
  '7°',
  'mundo-7',
  'IMPERIOS Y ENCUENTROS',
  'Mundo 1 de Séptimo · Ciencias Sociales (I.E.R. Boyacá)',
  'Recorrido histórico y geográfico de séptimo grado (DBA 1 a 8): desde las representaciones cartográficas del mundo, Roma y la Edad Media hasta la Conquista de América, la urbanización y la defensa constitucional de los derechos.',
  '/assets/art/mundo-7-imperios.webp',
  ZONAS_7_SPECS
);

const dba7_1 = dbas7[0];

export const MISION_701: MissionDefinition = {
  id: 'mision-701',
  worldId: 'mundo-7',
  zoneId: 'mundo-7-z1',
  code: 'MISIÓN 701',
  title: 'El mapa y el poder',
  subtitle: 'Cómo las visiones del mundo y la tecnología transforman los mapas',
  centralQuestion: '¿Por qué cambian los mapas según la época, la tecnología y quien los dibuja?',
  grade: 'Grado 7° — Ciencias Sociales',
  area: 'Ciencias Sociales (I.E.R. Boyacá)',
  estimatedDurations: [45, 50],
  resourceUnits: ['04', '09'],
  objectives: [dba7_1.statement],
  curriculumRefs: [
    {
      code: 'DBA 1 — Ciencias Sociales 7° (I.E.R. Boyacá)',
      source: 'Plan DBA depurado (src/data/dbaPlan.json)',
      statement: dba7_1.statement,
      nature: 'directa',
      evidences: [...dba7_1.evidences],
    },
  ],
  glossary: [
    {
      term: 'Mapa T en O (Medieval)',
      definition:
        'Representación medieval del mundo influenciada por la visión bíblica, con Jerusalén en el centro y el oriente hacia arriba.',
    },
    {
      term: 'Proyección cartográfica',
      definition:
        'Sistema matemático para representar la esfera terrestre en una superficie plana; toda proyección prioriza ciertos rasgos.',
    },
    {
      term: 'Teledetección satelital',
      definition:
        'Observación y representación contemporánea de la superficie terrestre mediante satélites y sistemas de información geográfica.',
    },
  ],
  sources: [
    {
      id: 'src-701-dba',
      title: 'DBA 1 — Grado 7° (Núcleo depurado I.E.R. Boyacá)',
      institution: 'Ministerio de Educación Nacional / I.E.R. Boyacá',
      note: dba7_1.focus,
    },
  ],
  scenes: [
    {
      id: 'm701-e0',
      index: 0,
      code: 'PANTALLA 1',
      title: 'Apertura: ¿Existe un único mapa verdadero?',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Narración docente · Hipótesis en cuaderno',
      narrative:
        'Cuando miramos un mapamundi en la pared del salón, solemos creer que es un retrato neutro de la Tierra. Pero en la Edad Media los mapas ponían el oriente arriba y Jerusalén en el centro.',
      promptQuestion: '¿Por qué dos épocas distintas dibujan el mismo planeta de formas tan diferentes?',
      notebookPrompt:
        'Escribe en tu cuaderno qué crees que influye en la mente de un cartógrafo al dibujar el mundo.',
      defaultTimerSeconds: 180,
      hints: [
        'Piensa tanto en los instrumentos técnicos (brújula, satélites) como en las creencias religiosas y políticas.',
      ],
      publicAnswerSummary: dba7_1.evidences[1],
      scientificFeedback: dba7_1.focus,
      teacherNotes: {
        pedagogicalGoal: 'Problematizar el mapa como construcción cultural, ideológica y tecnológica.',
        facilitationScript:
          'Pregunte a los estudiantes por qué creen que el norte aparece arriba en los mapas actuales y si en el espacio existe "arriba" o "abajo".',
        whatToWatchFor: 'Identificar quiénes creen que los antiguos solo dibujaban distinto por "falta de tecnología".',
        adaptationShortSession: 'Recoja 2 hipótesis rápidas y avance a las pistas.',
      },
    },
    {
      id: 'm701-e1',
      index: 1,
      code: 'PANTALLA 2',
      title: 'Pistas cartográficas a través del tiempo',
      type: 'evidence-challenge',
      participationMode: 'voting',
      participationLabel: 'Votación A/B/C/D · Análisis de evidencias',
      narrative:
        'Comparemos tres representaciones del mundo: un mapa medieval europeo, un portulano renacentista de navegación y una imagen satelital actual.',
      promptQuestion: '¿Qué demuestran estas evidencias sobre la evolución de los mapas?',
      notebookPrompt: 'Anota qué cambia y qué permanece entre el mapa medieval y la representación actual.',
      defaultTimerSeconds: 210,
      hints: [dba7_1.evidences[0], dba7_1.evidences[2]],
      publicAnswerSummary: dba7_1.evidences[0],
      scientificFeedback: dba7_1.evidences[2],
      challengeData: {
        evidences: [
          {
            id: 'm701-ev1',
            title: 'Pista A: Mapamundi medieval (T en O)',
            category: 'observacion',
            summary: dba7_1.evidences[0],
            detail:
              'Organizaba los tres continentes conocidos (Asia, Europa y África) según relatos bíblicos y centros espirituales.',
            isValidEvidence: true,
            scientificFeedback:
              'Evidencia clave: muestra cómo la cosmovisión religiosa estructuraba el espacio en la Edad Media.',
          },
          {
            id: 'm701-ev2',
            title: 'Pista B: Cartografía satelital y SIG actuales',
            category: 'observacion',
            summary: dba7_1.evidences[2],
            detail:
              'Los satélites miden con precisión costas, relieve y clima, aunque las fronteras y nombres siguen siendo decisiones políticas.',
            isValidEvidence: true,
            scientificFeedback:
              'Evidencia clave: la tecnología transforma la precisión física, pero el mapa sigue representando relaciones de poder.',
          },
          {
            id: 'm701-ev3',
            title: 'Pista C: Los mapas nunca han tenido intención política',
            category: 'distractor',
            summary: 'Afirmación de que todo mapa es únicamente un dibujo técnico sin ideología.',
            detail: 'Ignora por qué ciertos imperios o continentes se dibujaban en el centro o con mayor tamaño.',
            isValidEvidence: false,
            scientificFeedback:
              'Descartada: el enfoque crítico demuestra que toda representación espacial refleja intereses y visiones de su época.',
          },
        ],
        defaultVoteOptions: [
          { id: 'A', label: 'A. Pistas A y B: cambian por cosmovisión y tecnología' },
          { id: 'B', label: 'B. Solo Pista C: los mapas no tienen ideología' },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Contrastar la concepción medieval con la representación satelital moderna.',
        facilitationScript: 'Compare cómo cada mapa responde a lo que esa sociedad consideraba prioritario.',
        whatToWatchFor: 'Que reconozcan tanto cambios tecnológicos como continuidades geopolíticas.',
        adaptationShortSession: 'Votación directa A vs B.',
      },
    },
    {
      id: 'm701-e2',
      index: 2,
      code: 'PANTALLA 3',
      title: 'Del pergamino al satélite',
      type: 'timeline-construction',
      participationMode: 'deliberation',
      participationLabel: 'Deliberación · Secuencia histórica',
      narrative:
        'Ordenemos cómo se transformó la representación del mundo a medida que cambiaron las sociedades y sus instrumentos.',
      promptQuestion: '¿Cómo se relacionan las creencias, la navegación y los satélites en esta secuencia?',
      notebookPrompt: 'Registra los 3 hitos en tu cuaderno explicando por qué cambió la forma de ver el mundo.',
      defaultTimerSeconds: 180,
      hints: ['Cada etapa responde a una necesidad histórica distinta: fe, comercio transoceánico y control global.'],
      publicAnswerSummary: dba7_1.statement,
      scientificFeedback: dba7_1.focus,
      challengeData: {
        timelineEvents: [
          {
            id: 'm701-t1',
            order: 1,
            title: 'Cartografía simbólica medieval',
            relativeEra: 'Edad Media',
            causalExplanation: dba7_1.evidences[0],
            visualCue: 'Mapa T en O con centro teológico',
          },
          {
            id: 'm701-t2',
            order: 2,
            title: 'Portulanos y expansión transoceánica',
            relativeEra: 'Siglos XV–XVI',
            causalExplanation: dba7_1.evidences[1],
            visualCue: 'Brújula, astrolabio y rutas marítimas',
          },
          {
            id: 'm701-t3',
            order: 3,
            title: 'Imágenes satelitales y geopolítica global',
            relativeEra: 'Mundo contemporáneo',
            causalExplanation: dba7_1.evidences[2],
            visualCue: 'Red orbital y mapas digitales',
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Articular las tres evidencias del DBA 1 de 7° en una secuencia histórica coherente.',
        facilitationScript: 'Pida a 2 exploradores que expliquen qué cambió entre los tres momentos.',
        whatToWatchFor: 'Comprensión de cambios y continuidades.',
        adaptationShortSession: 'Revele la secuencia comentando el paso del pergamino al satélite.',
      },
    },
    {
      id: 'm701-e3',
      index: 3,
      code: 'PANTALLA 4',
      title: 'Expediente del cartógrafo crítico',
      type: 'notebook-expedition',
      participationMode: 'construction',
      participationLabel: 'Construcción en cuaderno · Rúbrica SIE',
      narrative:
        'Es momento de escribir tu conclusión en la bitácora comparando la visión medieval y la actual.',
      promptQuestion:
        '¿Por qué las representaciones del espacio son producto de las imágenes del mundo de cada época?',
      notebookPrompt:
        'Escribe un párrafo comparando los mapas de la Edad Media con las imágenes satelitales actuales, señalando un cambio tecnológico y una razón ideológica o cultural.',
      defaultTimerSeconds: 240,
      hints: [dba7_1.evidences[1]],
      publicAnswerSummary: dba7_1.evidences.join(' · '),
      scientificFeedback: dba7_1.focus,
      challengeData: {
        rubric: [
          {
            criterion: 'Comparación Edad Media vs. Actualidad',
            inicial: 'Menciona solo un tipo de mapa sin compararlo.',
            enProceso: 'Describe diferencias visuales básicas.',
            logrado: dba7_1.evidences[2],
          },
          {
            criterion: 'Reconocimiento de visiones e ideología',
            inicial: 'Asume que el mapa cambia solo por dibujo.',
            enProceso: 'Menciona creencias o tecnología por separado.',
            logrado: dba7_1.evidences[1],
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal: 'Evaluar la apropiación escrita de las tres evidencias del DBA 1 de 7°.',
        facilitationScript: 'Supervise la redacción en cuaderno y otorgue puntos de Investigación y Pensamiento.',
        whatToWatchFor: 'Que conecten tecnología y visión cultural.',
        adaptationShortSession: 'Esquema comparativo de dos columnas en el cuaderno.',
      },
    },
    {
      id: 'm701-e4',
      index: 4,
      code: 'PANTALLA 5',
      title: 'Cierre de la Misión 701',
      type: 'closing',
      participationMode: 'deliberation',
      participationLabel: 'Cierre colectivo',
      narrative:
        'Hemos descubierto que ningún mapa es inocente: detrás de cada línea hay tecnología, cultura y poder.',
      promptQuestion: '¿Cómo influye el espacio en el crecimiento de las ciudades que habitamos hoy?',
      defaultTimerSeconds: 120,
      hints: [],
      publicAnswerSummary: dba7_1.statement,
      scientificFeedback: dba7_1.focus,
      challengeData: {
        closingSynthesis: [...dba7_1.evidences],
        nextExpeditionBridge:
          'Próxima zona (DBA 2): ¿Cómo se relacionan el crecimiento de la población, los centros urbanos y las problemáticas sociales?',
      },
      teacherNotes: {
        pedagogicalGoal: 'Cerrar el DBA 1 y dejar planteado el puente hacia Geografía Urbana (DBA 2).',
        facilitationScript: 'Cierre la misión destacando las mejores reflexiones del grupo.',
        whatToWatchFor: 'Claridad en el concepto de representación espacial.',
        adaptationShortSession: 'Lectura de síntesis y cierre.',
      },
    },
  ],
};

export const MISIONES_7_LIST: MissionDefinition[] = [
  MISION_701,
  ...dbas7
    .slice(1)
    .map((dba, idx) =>
      buildSkeletonMissionFromDba('7°', 'mundo-7', `mundo-7-z${dba.num}`, dba, ZONAS_7_SPECS[idx + 1])
    ),
];
