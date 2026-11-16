import type { MissionDefinition } from '../engine/types';

export const MISION_00: MissionDefinition = {
  id: 'mision-00',
  worldId: 'origenes',
  zoneId: 'zona-1',
  code: 'CLASE 1 · REGLAS',
  title: 'Las reglas del viaje',
  subtitle: 'Introducción narrativa al videojuego de Ciencias Sociales',
  centralQuestion: '¿Cómo vamos a explorar este año la historia del universo, la Tierra y la humanidad?',
  grade: 'Grado 6° — Ciencias Sociales',
  area: 'Ciencias Sociales',
  estimatedDurations: [30, 45, 50],
  objectives: [
    'Comprender que el año escolar funciona como una expedición por mundos y misiones.',
    'Conocer las reglas de participación individual: escuchar, pensar, preguntar y escribir en el cuaderno.',
    'Entender cómo se ganan puntos por investigar, pensar y descubrir.',
  ],
  curriculumRefs: [
    {
      code: 'Acuerdo de Aula — Inicio de Año',
      source: 'Lineamientos Curriculares de Ciencias Sociales (MEN)',
      statement:
        'Presentación del enfoque problematizador y participativo para superar la memorización mecánica.',
      nature: 'directa',
      evidences: ['Reconoce el sentido de investigar con evidencias y participar con respeto.'],
    },
  ],
  glossary: [
    {
      term: 'Mundo',
      definition: 'Un gran territorio del año escolar (por ejemplo, Orígenes). Cada mundo dura varias clases.',
    },
    {
      term: 'Misión',
      definition: 'Cada clase o reto dentro de un mundo, con una historia y una pregunta por resolver.',
    },
    {
      term: 'Bitácora (Cuaderno)',
      definition: 'Tu cuaderno de clase. Allí guardas tus hipótesis, dibujos y conclusiones.',
    },
  ],
  sources: [
    {
      id: 'src-men-00',
      title: 'Lineamientos Curriculares de Ciencias Sociales',
      institution: 'Ministerio de Educación Nacional (Colombia)',
      note: 'Enfoque de preguntas problematizadoras.',
    },
  ],
  scenes: [
    {
      id: 'm0-e0',
      index: 0,
      code: 'PANTALLA 1',
      title: '¡Bienvenidos a Expedición 6!',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Narración del profe · Escucha activa',
      narrative:
        'Este año no vamos a abrir un libro para memorizar fechas aburridas. Vamos a viajar juntos por 8 grandes mundos, desde antes de que existiera la Tierra hasta las primeras civilizaciones.',
      promptQuestion: '¿Qué es este juego?',
      notebookPrompt: 'Abre tu cuaderno en una hoja limpia y escribe el título: EXPEDICIÓN 6.',
      defaultTimerSeconds: 120,
      hints: ['Cada clase será una nueva pantalla de nuestra aventura.'],
      publicAnswerSummary:
        'Expedición 6 es una historia continua: cada mundo tiene misiones y cada misión nos deja una pista nueva.',
      scientificFeedback: 'Todos empezamos en el mismo punto de partida, sin importar cuánto sepamos hoy.',
      teacherNotes: {
        pedagogicalGoal: 'Captar la atención desde el primer minuto con tono épico y sencillo.',
        facilitationScript:
          'Narre con calma qué es Expedición 6. Explique que usted es el narrador y guía del mapa, y que cada estudiante es un explorador individual.',
        whatToWatchFor: 'Que todos tengan listo su cuaderno sobre el pupitre antes de pasar de pantalla.',
        adaptationShortSession: '1 minuto de bienvenida y pase a Pantalla 2.',
      },
    },
    {
      id: 'm0-e1',
      index: 1,
      code: 'PANTALLA 2',
      title: 'Regla 1: Tu cuaderno es tu bitácora',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Regla de oro · Trabajo individual',
      narrative:
        'En clase no necesitamos celulares ni computadores. Tu mente, tu voz y tu cuaderno son tus herramientas de exploración. Cada idea que escribes cuenta.',
      promptQuestion: '¿Qué guardamos en la bitácora?',
      notebookPrompt: 'Anota: "1. Mis ideas iniciales · 2. Las pistas del profe · 3. Lo que descubrí".',
      defaultTimerSeconds: 120,
      hints: ['Equivocarse al principio es normal: los científicos también cambian de idea cuando encuentran pruebas.'],
      publicAnswerSummary:
        'En el cuaderno anotamos preguntas, dibujos, líneas de tiempo y explicaciones con nuestras propias palabras.',
      scientificFeedback: 'Un buen explorador no copia todo sin pensar: anota lo que le ayuda a entender.',
      teacherNotes: {
        pedagogicalGoal: 'Establecer el uso del cuaderno como herramienta central sin dispositivos.',
        facilitationScript:
          'Explique que escribir a mano ayuda a recordar y pensar mejor. Aclare que una hipótesis inicial nunca se califica como "mala".',
        whatToWatchFor: 'Verifique que los estudiantes anoten los 3 puntos brevemente.',
        adaptationShortSession: 'Lectura rápida y confirmación oral.',
      },
    },
    {
      id: 'm0-e2',
      index: 2,
      code: 'PANTALLA 3',
      title: 'Regla 2: Cómo jugamos cada clase',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Dinámica de clase',
      narrative:
        'Primero escuchamos la historia y observamos el mapa en la pantalla. Luego pensamos en silencio, levantamos la mano para opinar o votar, y al final revelamos el hallazgo.',
      promptQuestion: '¿Cómo participamos sin desorden?',
      notebookPrompt: 'Escucha primero, piensa después y levanta la mano para compartir tu razón.',
      defaultTimerSeconds: 120,
      hints: ['No gana quien grita más rápido, sino quien explica mejor por qué piensa eso.'],
      publicAnswerSummary:
        '1) El profe cuenta la escena · 2) Cada uno piensa y anota · 3) Votamos o opinamos · 4) Descubrimos la explicación.',
      scientificFeedback: 'El respeto por la palabra del compañero es parte fundamental de la expedición.',
      teacherNotes: {
        pedagogicalGoal: 'Acordar turnos de palabra, escucha y votación con mano alzada.',
        facilitationScript:
          'Haga una prueba rápida: pida que levanten la mano quienes creen que la Tierra es más joven que el Sol.',
        whatToWatchFor: 'Establezca la señal de silencio cuando el temporizador termine.',
        adaptationShortSession: 'Explique los 4 pasos en 60 segundos.',
      },
    },
    {
      id: 'm0-e3',
      index: 3,
      code: 'PANTALLA 4',
      title: 'Regla 3: Puntos por pensar, no por correr',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Sistema de puntos individual',
      narrative:
        'Cada estudiante suma puntos individuales en su expediente durante el año. No premiamos solo responder rápido: premiamos cuatro habilidades reales.',
      promptQuestion: '¿Por qué 4 cosas puedes ganar puntos?',
      notebookPrompt: 'Anota las 4 palabras: Investigar · Pensar · Participar · Descubrir.',
      defaultTimerSeconds: 150,
      hints: ['Hacer una buena pregunta también suma puntos de investigación.'],
      publicAnswerSummary:
        '1) Investigar (buscar pruebas) · 2) Pensar (explicar causas) · 3) Participar (aportar con respeto) · 4) Descubrir (completar retos).',
      scientificFeedback: 'Si alguien falta o le cuesta un tema, siempre habrá nuevas misiones para avanzar.',
      teacherNotes: {
        pedagogicalGoal: 'Presentar la gamificación individual basada en procesos de pensamiento.',
        facilitationScript:
          'Muestre cómo usted registra los puntos de cada estudiante desde su consola privada.',
        whatToWatchFor: 'Refuerce que no hay castigos por equivocarse.',
        adaptationShortSession: 'Nombre las 4 categorías y continúe.',
      },
    },
    {
      id: 'm0-e4',
      index: 4,
      code: 'PANTALLA 5',
      title: 'Nuestro Primer Mundo: ORÍGENES',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Presentación del Mundo 1',
      narrative:
        'Nuestro primer territorio se llama ORÍGENES. Antes de hablar de reyes, ciudades o culturas antiguas, tenemos que descubrir cómo nació el escenario donde vivimos: el universo y la Tierra.',
      promptQuestion: '¿De qué trata el Mundo 1: Orígenes?',
      notebookPrompt: 'Escribe una pregunta que siempre hayas tenido sobre el espacio, los planetas o los dinosaurios.',
      defaultTimerSeconds: 180,
      hints: ['Piensa en las estrellas, el Sol, los continentes o los primeros seres vivos.'],
      publicAnswerSummary:
        'En Orígenes recorreremos 4 tierras: El comienzo de todo, Nuestro vecindario cósmico, Un planeta en transformación y El umbral de la vida.',
      scientificFeedback: 'Las mejores preguntas del grupo guiarán nuestras próximas clases.',
      teacherNotes: {
        pedagogicalGoal: 'Despertar curiosidad genuina sobre el primer mundo y recoger preguntas de los estudiantes.',
        facilitationScript:
          'Puede cambiar un momento el proyector al "Mapa Táctico (AoE)" para mostrar las 4 zonas cubiertas por la niebla de guerra.',
        whatToWatchFor: 'Recoja 3 o 4 preguntas en voz alta y anótelas si desea retomarlas en la Misión 01.',
        adaptationShortSession: 'Muestre el mapa táctico 30 segundos y pase al cierre.',
      },
    },
    {
      id: 'm0-e5',
      index: 5,
      code: 'PANTALLA 6',
      title: '¿Aceptan la misión?',
      type: 'closing',
      participationMode: 'individual',
      participationLabel: 'Compromiso de expedición',
      narrative:
        'La lista de exploradores está abierta. En la próxima clase abriremos la niebla del primer territorio y comenzaremos la Misión 01: El comienzo de todo.',
      promptQuestion: '¿Qué necesitas traer para la próxima misión?',
      defaultTimerSeconds: 90,
      hints: [],
      publicAnswerSummary:
        'Solo tu cuaderno, tu lápiz y mucha curiosidad para hacer preguntas.',
      scientificFeedback: '¡Expedición 6 ha comenzado oficialmente!',
      challengeData: {
        closingSynthesis: [
          'El año escolar es una aventura por 8 mundos; el primero es ORÍGENES (5 a 6 clases).',
          'Trabajamos de forma individual con cuaderno, escucha, preguntas y votaciones.',
          'Ganamos puntos por investigar, pensar, participar con respeto y descubrir.',
        ],
        nextExpeditionBridge:
          'Próxima clase — Misión 01: Antes de que existieran las estrellas y la Tierra, ¿cómo era el universo?',
      },
      teacherNotes: {
        pedagogicalGoal: 'Cerrar la primera clase con entusiasmo y claridad sobre las reglas.',
        facilitationScript:
          'Felicite al grupo por su primer día y cierre la sesión desde la consola.',
        whatToWatchFor: 'Verifique que todos los estudiantes de la lista estén registrados en la consola.',
        adaptationShortSession: 'Cierre directo con la pregunta de la próxima clase.',
      },
    },
  ],
};
