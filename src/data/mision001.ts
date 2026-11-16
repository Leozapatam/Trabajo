import type { MissionDefinition } from '../engine/types';

export const MISION_001: MissionDefinition = {
  id: 'mision-001',
  worldId: 'origenes',
  zoneId: 'zona-1',
  code: 'MISIÓN 001',
  title: 'El comienzo de todo',
  subtitle: 'Investigación sobre el origen del universo, el Sistema Solar y un planeta en cambio',
  centralQuestion:
    '¿Podemos reconstruir la historia del universo y de nuestro planeta utilizando evidencias?',
  grade: 'Grado 6° — Ciencias Sociales (con puente interdisciplinario)',
  area: 'Ciencias Sociales / Pensamiento Histórico y Espacial',
  estimatedDurations: [30, 45, 50],
  objectives: [
    'Diferenciar entre una suposición sin respaldo y una explicación científica basada en evidencias observables.',
    'Comprender el modelo del Big Bang como expansión del espacio y no como una explosión en un lugar vacío previo.',
    'Relacionar la formación del Sistema Solar con las condiciones físicas que hicieron posible la Tierra.',
    'Dimensionar el tiempo geológico y reconocer que el relieve y los continentes cambian continuamente.',
  ],
  curriculumRefs: [
    {
      code: 'DBA 1 — Ciencias Sociales 6°',
      source: 'MEN / Colombia Aprende (verificar paginación en PDF V2)',
      statement:
        'Comprende que existen diversas explicaciones y teorías sobre el origen del universo en nuestra búsqueda por entender que hacemos parte de un mundo más amplio.',
      nature: 'directa',
      evidences: [
        'Interpreta teorías científicas sobre el origen del universo (Big Bang).',
        'Compara explicaciones científicas y relatos culturales valorando distintas perspectivas humanas.',
        'Explica los componentes del Sistema Solar y su relación con la vida en la Tierra.',
      ],
    },
    {
      code: 'DBA 2 — Ciencias Sociales 6°',
      source: 'MEN / Colombia Aprende (verificar paginación en PDF V2)',
      statement:
        'Comprende que la Tierra es un planeta en constante transformación cuyos cambios influyen en las formas del relieve terrestre y en la vida de las comunidades que la habitan.',
      nature: 'directa',
      evidences: [
        'Explica la teoría de la deriva continental y la dinámica interna de la Tierra.',
        'Reconoce que la configuración actual de continentes y relieve es resultado de procesos prolongados.',
      ],
    },
    {
      code: 'Puente Interdisciplinario — Astronomía y Geología',
      source: 'Lineamientos Curriculares de Ciencias Sociales (MEN, enfoque problematizador)',
      statement:
        'Integración de evidencias astrofísicas (desplazamiento al rojo, CMB) y geológicas (tiempo profundo, Pangea) para fortalecer la argumentación basada en pruebas.',
      nature: 'interdisciplinaria',
      evidences: [
        'Distingue observación, hipótesis, modelo y teoría científica en contexto histórico-espacial.',
      ],
    },
  ],
  glossary: [
    {
      term: 'Big Bang (Gran Expansión)',
      definition:
        'Modelo científico que describe cómo el espacio mismo comenzó a expandirse hace unos 13.800 millones de años desde un estado extremadamente caliente y denso.',
      example: 'No fue una bomba explotando dentro de un cuarto vacío; el espacio entero es lo que se estira.',
    },
    {
      term: 'Desplazamiento al rojo (Redshift)',
      definition:
        'Estiramiento de la luz de galaxias lejanas hacia tonos más rojos a medida que el espacio entre ellas y nosotros se expande.',
    },
    {
      term: 'Radiación cósmica de fondo',
      definition:
        'Luz muy tenue y fría que llena todo el universo, liberada cuando el cosmos se enfrió lo suficiente unos 380.000 años después del inicio de la expansión.',
    },
    {
      term: 'Tiempo geológico',
      definition:
        'Escala de millones y miles de millones de años con la que se miden los cambios de la Tierra.',
    },
    {
      term: 'Deriva continental',
      definition:
        'Movimiento lento pero continuo de los continentes sobre las placas tectónicas de la Tierra a lo largo de millones de años.',
    },
  ],
  sources: [
    {
      id: 'src-men-dba',
      title: 'Derechos Básicos de Aprendizaje — Ciencias Sociales (Grado 6°)',
      institution: 'Ministerio de Educación Nacional / Colombia Aprende',
      url: 'https://colombiaaprende.edu.co/recurso-coleccion/derechos-basicos-de-aprendizaje-dba-ciencias-sociales',
      note: 'Referente oficial colombiano de aprendizajes estructurantes.',
    },
    {
      id: 'src-nasa-wmap',
      title: 'The Big Bang & Cosmic Microwave Background',
      institution: 'NASA Science / Wilkinson Microwave Anisotropy Probe (WMAP)',
      url: 'https://science.nasa.gov/astrophysics/focus-areas/what-powered-the-big-bang/',
      note: 'Evidencia observacional de la expansión cósmica y radiación de fondo.',
    },
    {
      id: 'src-nasa-solar',
      title: 'Our Solar System: Formation & Worlds',
      institution: 'NASA Solar System Exploration',
      url: 'https://science.nasa.gov/solar-system/',
      note: 'Datos verificados sobre nebulosa solar, planetas rocosos y gaseosos.',
    },
    {
      id: 'src-usgs-plates',
      title: 'This Dynamic Earth: The Story of Plate Tectonics',
      institution: 'U.S. Geological Survey (USGS)',
      url: 'https://pubs.usgs.gov/gip/dynamic/dynamic.html',
      note: 'Evidencias fósiles, geográficas y tectónicas de Pangea y la deriva continental.',
    },
  ],
  scenes: [
    {
      id: 'escena-0',
      index: 0,
      code: 'ESCENA 0',
      title: 'Apertura: El silencio antes de las estrellas',
      type: 'opening',
      participationMode: 'individual',
      participationLabel: 'Modo individual · Cuaderno de campo',
      narrative:
        'Hoy no abrimos un libro para memorizar fechas. Somos una expedición científica viajando hacia atrás en el tiempo, cuando aún no existían la Tierra, el Sol ni las primeras galaxias.',
      promptQuestion:
        'Antes de que existieran las estrellas, los planetas y la Tierra, ¿cómo era el universo?',
      notebookPrompt:
        'Escribe en tu cuaderno tu hipótesis inicial en 2 o 3 líneas. No hay respuestas prohibidas: explica qué imaginas y por qué.',
      defaultTimerSeconds: 180,
      hints: [
        'Piensa en la temperatura y en qué tan cerca o lejos estaría la materia.',
        '¿Crees que el universo siempre ha tenido el mismo tamaño o que ha cambiado?',
      ],
      publicAnswerSummary:
        'Las primeras hipótesis del grupo son el punto de partida de toda investigación. La ciencia moderna sugiere que hace ~13.800 millones de años el universo era extremadamente denso, caliente y compacto, y comenzó a expandirse.',
      scientificFeedback:
        'Importante: una hipótesis inicial no es una nota ni un examen; es una idea provisional que ahora pondremos a prueba con evidencias reales del espacio.',
      challengeData: {
        defaultVoteOptions: [
          { id: 'A', label: 'A. Siempre igual y eterno, con estrellas desde siempre' },
          { id: 'B', label: 'B. Muy pequeño, denso y caliente, comenzando a expandirse' },
          { id: 'C', label: 'C. Un espacio vacío enorme donde explotó una estrella' },
          { id: 'D', label: 'D. Otra hipótesis propia en mi cuaderno' },
        ],
      },
      teacherNotes: {
        pedagogicalGoal:
          'Activar saberes previos y diferenciar entre una hipótesis inicial y una afirmación comprobada.',
        facilitationScript:
          'Pida silencio reflexivo durante 2 minutos para que cada estudiante escriba en su cuaderno. Luego invite a 3 voluntarios a leer sus hipótesis sin juzgarlas como correctas o incorrectas todavía.',
        whatToWatchFor:
          'Muchos estudiantes imaginan el Big Bang como una bomba en un espacio vacío (Opción C). Anótelo sin corregirlo aún; se resolverá con las pistas de la Escena 1.',
        adaptationShortSession: 'Reduzca el tiempo de escritura a 90 segundos y recoja 2 hipótesis orales.',
      },
    },
    {
      id: 'escena-1',
      index: 1,
      code: 'ESCENA 1',
      title: 'Las primeras pistas del cosmos',
      type: 'evidence-challenge',
      participationMode: 'voting',
      participationLabel: 'Modo votación · Equipos con tarjetas A/B/C/D o mano alzada',
      narrative:
        'Nadie estuvo allí hace miles de millones de años para tomar una fotografía. Sin embargo, los telescopios captan mensajes que viajan por el espacio desde épocas remotas.',
      promptQuestion:
        '¿Qué pistas reales permiten sostener nuestro modelo científico sobre la historia del universo?',
      notebookPrompt:
        'Anota en tu cuaderno qué dos pistas elegiste como evidencias válidas y qué descartaste.',
      defaultTimerSeconds: 240,
      hints: [
        'Observa qué ocurre con la luz de las galaxias lejanas cuando el espacio se estira.',
        'Busca una señal fría que llegue desde todas las direcciones del cielo, no desde una sola estrella.',
      ],
      publicAnswerSummary:
        'Las pistas científicas válidas son el desplazamiento al rojo de galaxias lejanas (el espacio se expande) y la radiación cósmica de fondo (el eco térmico del universo joven).',
      scientificFeedback:
        'El desplazamiento al rojo muestra que las galaxias se alejan entre sí porque el espacio mismo se estira. La radiación cósmica de fondo confirma que todo el universo estuvo alguna vez muy caliente y denso. En cambio, una explosión en un punto fijo dejaría un centro vacío, lo cual NO ocurre.',
      challengeData: {
        evidences: [
          {
            id: 'ev-redshift',
            title: 'Pista A: Luz estirada hacia el rojo',
            category: 'pista-cosmica',
            summary: 'La luz de galaxias lejanas llega con ondas más largas (rojizas) de lo normal.',
            detail:
              'Edwin Hubble y otros astrónomos observaron que casi todas las galaxias se alejan de nosotros, y cuanto más lejos están, más rápido se alejan.',
            isValidEvidence: true,
            scientificFeedback:
              '¡Evidencia válida! El estiramiento de la luz demuestra que el espacio entre galaxias se está expandiendo.',
          },
          {
            id: 'ev-cmb',
            title: 'Pista B: Eco térmico en todo el cielo',
            category: 'pista-cosmica',
            summary: 'Antenas espaciales detectan una radiación muy fría y uniforme en todas direcciones.',
            detail:
              'Llamada Radiación Cósmica de Fondo (CMB), proviene de cuando el universo tenía apenas ~380.000 años y comenzó a volverse transparente.',
            isValidEvidence: true,
            scientificFeedback:
              '¡Evidencia válida! Confirma que el universo temprano fue uniforme, denso y extremadamente caliente.',
          },
          {
            id: 'ev-center',
            title: 'Pista C: Un cráter vacío en el centro del cielo',
            category: 'distractor',
            summary: 'Supuesta zona vacía desde donde salieron disparadas todas las estrellas.',
            detail:
              'Si el Big Bang hubiera sido una explosión común dentro de un espacio vacío, veríamos un centro sin materia y un borde hacia afuera.',
            isValidEvidence: false,
            scientificFeedback:
              'Pista falsa (distractor). Los telescopios no observan ningún "centro" vacío; la expansión ocurre en todas partes a la vez.',
          },
          {
            id: 'ev-meteor',
            title: 'Pista D: Meteoritos recientes en la Tierra',
            category: 'distractor',
            summary: 'Rocas espaciales que caen hoy en nuestra atmósfera.',
            detail:
              'Los meteoritos nos ayudan a estudiar la edad del Sistema Solar (~4.500 millones de años), pero no existían en los primeros instantes del universo.',
            isValidEvidence: false,
            scientificFeedback:
              'Pista fuera de escala temporal. Sirven para estudiar el Sistema Solar, no el origen del universo.',
          },
        ],
        defaultVoteOptions: [
          { id: 'A', label: 'A. Pistas A y B (luz estirada + eco térmico)' },
          { id: 'B', label: 'B. Pistas A y C (luz estirada + cráter central)' },
          { id: 'C', label: 'C. Pistas B y D (eco térmico + meteoritos)' },
          { id: 'D', label: 'D. Solo la Pista C (explosión en un centro)' },
        ],
      },
      teacherNotes: {
        pedagogicalGoal:
          'Desmontar la idea errónea del Big Bang como explosión en un espacio preexistente y enseñar a validar evidencias.',
        facilitationScript:
          'Presente las 4 pistas en el proyector. Dé 2 minutos de discusión en equipos y realice una votación con mano alzada o tarjetas A/B/C/D antes de revelar la respuesta.',
        whatToWatchFor:
          'Si varios equipos eligen la Pista C, aproveche para usar la analogía de un globo con puntos pintados que se infla: los puntos no salen de un centro, es la superficie la que se estira.',
        adaptationShortSession: 'Haga votación directa tras leer las 4 tarjetas en voz alta.',
      },
    },
    {
      id: 'escena-2',
      index: 2,
      code: 'ESCENA 2',
      title: 'Construir una historia con sentido causal',
      type: 'timeline-construction',
      participationMode: 'deliberation',
      participationLabel: 'Modo deliberación · Equipos justifican el orden',
      narrative:
        'Ordenar acontecimientos históricos o cósmicos no es adivinar fechas: es descubrir qué tuvo que ocurrir primero para hacer posible lo que vino después.',
      promptQuestion:
        '¿En qué orden causal ocurrieron estos acontecimientos del universo y por qué uno depende del anterior?',
      notebookPrompt:
        'Dibuja en tu cuaderno la secuencia de 4 pasos y escribe una flecha con la palabra "porque..." entre cada paso.',
      defaultTimerSeconds: 240,
      hints: [
        'Para formar átomos estables primero el universo debía enfriarse lo suficiente.',
        'Los elementos pesados (como el hierro de nuestra sangre o el silicio de las rocas) se forjan dentro de estrellas antiguas.',
      ],
      publicAnswerSummary:
        'Secuencia causal: 1) Expansión y enfriamiento inicial -> 2) Formación de primeros átomos (hidrógeno y helio) -> 3) Nacimiento de primeras estrellas y galaxias -> 4) Supernovas que enriquecen el espacio con elementos para futuros planetas.',
      scientificFeedback:
        'Sin el enfriamiento inicial no existirían átomos; sin átomos no se encenderían estrellas; y sin estrellas que mueren en supernovas no habría carbono, oxígeno ni hierro para construir planetas rocosos.',
      challengeData: {
        timelineEvents: [
          {
            id: 'tl-1',
            order: 1,
            title: 'Expansión y enfriamiento inicial',
            relativeEra: 'Inicio de la expansión',
            causalExplanation:
              'Al expandirse el espacio, la temperatura descendió lo suficiente para permitir la existencia de partículas estables.',
            visualCue: 'Campo térmico denso en expansión',
          },
          {
            id: 'tl-2',
            order: 2,
            title: 'Primeros átomos y liberación de luz',
            relativeEra: '~380.000 años después',
            causalExplanation:
              'Los electrones se unieron a núcleos de hidrógeno y helio; la luz pudo viajar libremente (radiación cósmica de fondo).',
            visualCue: 'Cosmos transparente con gas primordial',
          },
          {
            id: 'tl-3',
            order: 3,
            title: 'Primeras estrellas y galaxias',
            relativeEra: 'Cientos de millones de años después',
            causalExplanation:
              'La gravedad concentró el gas en nubes densas que encendieron las primeras estrellas, agrupadas luego en galaxias.',
            visualCue: 'Cúmulos estelares nacientes',
          },
          {
            id: 'tl-4',
            order: 4,
            title: 'Fábrica estelar de elementos pesados',
            relativeEra: 'Miles de millones de años',
            causalExplanation:
              'Las estrellas masivas fabricaron carbono, oxígeno y hierro y los dispersaron al morir, sembrando futuras nebulosas.',
            visualCue: 'Remanente de supernova',
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal:
          'Desarrollar el pensamiento causal (no memorización de cifras) para comprender procesos de larga duración.',
        facilitationScript:
          'Pida a cada equipo que ordene mentalmente o en su cuaderno los 4 bloques y que explique ORALMENTE el "por qué" antes de revelar el orden en el proyector.',
        whatToWatchFor:
          'Verifique que comprendan que los planetas rocosos requieren elementos pesados fabricados por generaciones previas de estrellas.',
        adaptationShortSession: 'Asigne un bloque a cada equipo y construyan la secuencia oralmente en grupo.',
      },
    },
    {
      id: 'escena-3',
      index: 3,
      code: 'ESCENA 3',
      title: 'Nace nuestro vecindario cósmico',
      type: 'solar-reconstruction',
      participationMode: 'teams',
      participationLabel: 'Modo equipos · Reconstrucción del Sistema Solar',
      narrative:
        'Hace unos 4.600 millones de años, en un rincón de la Vía Láctea, una nube de gas y polvo enriquecida por estrellas antiguas comenzó a colapsar bajo su propia gravedad.',
      promptQuestion:
        '¿Cómo pasó una nube desordenada de gas y polvo a convertirse en el Sol y los planetas, incluida la Tierra?',
      notebookPrompt:
        'Clasifica en tu cuaderno qué caracteriza a los planetas interiores (rocosos) frente a los exteriores (gaseosos/helados).',
      defaultTimerSeconds: 240,
      hints: [
        'Cuando una nube gira y se encoge, tiende a aplanarse como un disco.',
        'Cerca del Sol joven hacía mucho calor: solo sobrevivieron materiales con alto punto de fusión, como rocas y metales.',
      ],
      publicAnswerSummary:
        '1) Colapso de la nebulosa solar -> 2) Disco protoplanetario giratorio y nacimiento del Sol -> 3) Acreción de rocas cerca del Sol (planetas rocosos) y gases/hielos lejos del Sol (gigantes) -> 4) Tierra primitiva en zona templada.',
      scientificFeedback:
        'La relación entre el Sol y los planetas no es casual: nacieron del mismo disco de material. La temperatura del disco explica por qué la Tierra es rocosa y Júpiter es gigante gaseoso.',
      challengeData: {
        solarStages: [
          {
            id: 'sol-1',
            order: 1,
            title: 'Nebulosa solar en colapso',
            description: 'Una nube fría de gas y polvo comienza a contraerse por acción de la gravedad.',
            keyRelation: 'Contiene hidrógeno primordial y polvo rico en minerales de estrellas previas.',
          },
          {
            id: 'sol-2',
            order: 2,
            title: 'Disco protoplanetario y proto-Sol',
            description: 'La rotación aplana la nube en un disco; el centro se calienta y enciende el Sol.',
            keyRelation: 'Explica por qué todos los planetas orbitan en un mismo plano y dirección.',
          },
          {
            id: 'sol-3',
            order: 3,
            title: 'Acreción: rocas adentro, gases afuera',
            description: 'Granos chocan y forman planetesimales. Cerca del Sol quedan rocas; lejos, hielos y gases.',
            keyRelation: 'Origina los 4 planetas rocosos (Mercurio, Venus, Tierra, Marte) y los 4 gigantes.',
          },
          {
            id: 'sol-4',
            order: 4,
            title: 'La Tierra en su órbita particular',
            description: 'Nuestro planeta se estabiliza a una distancia donde el agua puede mantenerse líquida.',
            keyRelation: 'Combinación de distancia solar, masa suficiente y campo magnético protector.',
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal:
          'Conectar el DBA 1 (componentes del sistema solar y su relación con la vida en la Tierra) mediante procesos físicos comprensibles.',
        facilitationScript:
          'Muestre las etapas en el proyector. Pregunte por qué creen que todos los planetas giran casi en el mismo plano y por qué los planetas cercanos al Sol son pequeños y rocosos.',
        whatToWatchFor:
          'Aclare que el Sol se formó casi al mismo tiempo que el disco que dio origen a los planetas, hace ~4.600 millones de años.',
        adaptationShortSession: 'Enfóquese en la comparación entre planeta rocoso cercano y gigante gaseoso lejano.',
      },
    },
    {
      id: 'escena-4',
      index: 4,
      code: 'ESCENA 4',
      title: 'Un planeta que cambia: el tiempo profundo',
      type: 'geological-scale',
      participationMode: 'teams',
      participationLabel: 'Modo equipos · Escala geológica y deriva continental',
      narrative:
        'La Tierra no nació con los continentes, montañas y océanos que vemos hoy en un mapa. Nuestro planeta tiene cerca de 4.540 millones de años y su superficie nunca ha dejado de moverse.',
      promptQuestion:
        '¿Qué tan grande es el tiempo geológico y qué pruebas muestran que los continentes no siempre estuvieron en el mismo lugar?',
      notebookPrompt:
        'Compara en tu cuaderno: si 1 millón de años fuera 1 paso, ¿cuántos pasos serían 1.000 millones de años? Anota una prueba de que existió Pangea.',
      defaultTimerSeconds: 240,
      hints: [
        'Mil millones = 1.000 veces un millón. No son cifras parecidas.',
        'Observa las costas de Sudamérica y África, y los fósiles compartidos entre ambos continentes.',
      ],
      publicAnswerSummary:
        'Orden geológico: Formación de la Tierra (~4.540 Ma) -> Primeros océanos y microorganismos (>3.500 Ma) -> Supercontinente Pangea (~300–200 Ma) -> Separación de continentes y levantamiento de cordilleras actuales.',
      scientificFeedback:
        'La deriva continental y la tectónica de placas muestran que la Tierra es un sistema dinámico. Los paisajes y relieves cambian lentamente, preparando los entornos donde luego surgirían los seres vivos y las sociedades humanas.',
      challengeData: {
        geologicalEpochs: [
          {
            id: 'geo-1',
            order: 1,
            name: 'Tierra primitiva y bombardeo',
            timeAgoLabel: 'Hace ~4.540 millones de años',
            millionsOfYearsAgo: 4540,
            summary: 'Superficie incandescente que se enfría gradualmente hasta formar una corteza sólida.',
            keyChange: 'Diferenciación del núcleo metálico y aparición de la primera atmósfera.',
          },
          {
            id: 'geo-2',
            order: 2,
            name: 'Primeros océanos y señales de vida',
            timeAgoLabel: 'Hace >3.500 millones de años',
            millionsOfYearsAgo: 3500,
            summary: 'El vapor condensado llena las cuencas oceánicas; aparecen microorganismos y estromatolitos.',
            keyChange: 'Inicio lento de la liberación de oxígeno a los océanos y atmósfera.',
          },
          {
            id: 'geo-3',
            order: 3,
            name: 'Supercontinente Pangea',
            timeAgoLabel: 'Hace ~300 a 200 millones de años',
            millionsOfYearsAgo: 250,
            summary: 'Casi todas las masas continentales estuvieron reunidas en un único supercontinente.',
            keyChange: 'Fósiles de las mismas especies quedaron luego separados por el océano Atlántico.',
          },
          {
            id: 'geo-4',
            order: 4,
            name: 'Continentes actuales y cordilleras',
            timeAgoLabel: 'Últimos ~65 millones de años hasta hoy',
            millionsOfYearsAgo: 20,
            summary: 'Las placas siguen desplazándose centímetros cada año, elevando cadenas como los Andes.',
            keyChange: 'El relieve actual es resultado de millones de años de movimiento interno y erosión.',
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal:
          'Articular el DBA 2 (Tierra en constante transformación y deriva continental) y evitar la confusión entre millones y miles de millones.',
        facilitationScript:
          'Use el comparador visual de escala en el proyector. Pida a los estudiantes que miren el mapa de Sudamérica y África y expliquen por qué se encuentran fósiles terrestres idénticos a ambos lados del Atlántico.',
        whatToWatchFor:
          'Refuerce que Pangea ocurrió mucho después de que la Tierra ya tuviera miles de millones de años de historia.',
        adaptationShortSession: 'Muestre directamente los 4 hitos geológicos y haga énfasis en la proporción 1.000 vs 1.',
      },
    },
    {
      id: 'escena-5',
      index: 5,
      code: 'ESCENA 5',
      title: 'El expediente del explorador',
      type: 'notebook-expedition',
      participationMode: 'construction',
      participationLabel: 'Modo construcción · Producción escrita en cuaderno',
      narrative:
        'Todo investigador cierra su trabajo reuniendo sus pruebas en un expediente claro. Es momento de sintetizar lo descubierto con tus propias palabras.',
      promptQuestion:
        '¿Qué procesos permitieron que la Tierra se transformara hasta convertirse en el planeta que conocemos?',
      notebookPrompt:
        'Redacta en tu cuaderno una explicación breve (1 párrafo o esquema comentado) que incluya: (1) una secuencia de acontecimientos, (2) al menos dos relaciones de causa o transformación, y (3) una evidencia o concepto científico que la sustente.',
      defaultTimerSeconds: 300,
      hints: [
        'Usa conectores causales: "debido a que...", "esto permitió que...", "como consecuencia...".',
        'Puedes citar evidencias como la radiación cósmica de fondo, el disco protoplanetario o los fósiles de Pangea.',
      ],
      publicAnswerSummary:
        'Una explicación sólida conecta el origen estelar de los materiales, la formación del Sistema Solar alrededor del Sol, el enfriamiento de la Tierra con agua líquida y el cambio continuo de su relieve por placas tectónicas.',
      scientificFeedback:
        '¡Excelente trabajo de síntesis! Lo más valioso en Ciencias Sociales es explicar por qué cambian los fenómenos, no repetir definiciones de memoria.',
      challengeData: {
        rubric: [
          {
            criterion: 'Secuencia de acontecimientos',
            inicial: 'Menciona hechos aislados sin orden temporal.',
            enProceso: 'Ordena algunos hechos pero salta etapas clave.',
            logrado: 'Presenta una secuencia coherente desde el cosmos hasta la Tierra cambiante.',
          },
          {
            criterion: 'Relaciones de causa o transformación',
            inicial: 'Solo enumera datos sin explicar cómo se relacionan.',
            enProceso: 'Explica una relación de causa-efecto.',
            logrado: 'Explica al menos dos transformaciones usando conectores causales claros.',
          },
          {
            criterion: 'Uso de evidencia o concepto',
            inicial: 'No respalda su explicación con pruebas vistas.',
            enProceso: 'Nombra un concepto sin conectarlo con la explicación.',
            logrado: 'Integra una evidencia real (ej. redshift, CMB, acreción o deriva continental).',
          },
        ],
      },
      teacherNotes: {
        pedagogicalGoal:
          'Evaluación formativa auténtica en el cuaderno sin necesidad de computadores individuales.',
        facilitationScript:
          'Proyecte los 3 requisitos y la rúbrica sencilla para que los estudiantes se autoevalúen mientras escriben. Recoja 2 o 3 cuadernos al finalizar para retroalimentación colectiva.',
        whatToWatchFor:
          'Acompañe a quienes tienden a copiar títulos de la pantalla; anímelos a usar "porque..." o "esto hizo posible...".',
        adaptationShortSession: 'Permita hacerlo en parejas en un solo cuaderno o esquema de 3 viñetas.',
      },
    },
    {
      id: 'escena-6',
      index: 6,
      code: 'ESCENA 6',
      title: 'Cierre y descubrimiento: El umbral siguiente',
      type: 'closing',
      participationMode: 'deliberation',
      participationLabel: 'Cierre colectivo · Síntesis de expedición',
      narrative:
        'Has completado tu primera expedición por Orígenes. Hoy reconstruimos, a partir de pruebas reales, cómo pasamos de un universo joven en expansión a un planeta rocoso con océanos y continentes en movimiento.',
      promptQuestion:
        'La Tierra ya tiene una larga historia. Ahora comienza otra pregunta: ¿cómo llegamos nosotros a existir?',
      defaultTimerSeconds: 120,
      hints: [],
      publicAnswerSummary:
        'Síntesis de Misión 001: La ciencia reconstruye el pasado mediante evidencias observables; el universo se expande; la Tierra nació en un disco solar hace ~4.540 millones de años y su superficie sigue transformándose.',
      scientificFeedback:
        'En nuestra próxima expedición exploraremos cómo surgió y evolucionó la vida hasta llegar a la historia de los seres humanos.',
      challengeData: {
        closingSynthesis: [
          'Las explicaciones científicas se apoyan en evidencias observables (como el desplazamiento al rojo y la radiación cósmica de fondo), mientras las cosmogonías culturales aportan sentido e identidad sin competir con la física.',
          'Los elementos de nuestro planeta fueron forjados en estrellas anteriores y organizados por la gravedad alrededor del Sol.',
          'La Tierra cambia constantemente en escalas de millones de años: océanos, atmósfera y continentes transforman el escenario de la vida.',
        ],
        commonMisconceptions: [
          {
            misconception: '«El Big Bang fue una explosión en un punto del espacio vacío»',
            clarification: 'Fue la expansión del espacio mismo en todas partes, no una bomba en un lugar previo.',
          },
          {
            misconception: '«Los continentes siempre han tenido la forma y posición actual»',
            clarification: 'Las placas tectónicas los desplazan continuamente; hace ~250 millones de años formaban Pangea.',
          },
        ],
        nextExpeditionBridge:
          'La Tierra ya tiene una larga historia. Ahora comienza otra pregunta: ¿cómo llegamos nosotros a existir?',
      },
      teacherNotes: {
        pedagogicalGoal:
          'Consolidar aprendizajes, corregir errores conceptuales frecuentes y dejar abierta la curiosidad hacia el proceso de hominización (DBA 3).',
        facilitationScript:
          'Revele la síntesis final, felicite a los equipos por sus reconocimientos (Investigación, Pensamiento, Cooperación, Descubrimiento) y cierre leyendo la pregunta puente.',
        whatToWatchFor:
          'Invite a quienes deseen profundizar voluntariamente en casa desde el Modo Explorador, recordando que no es obligatorio ni requiere celular.',
        adaptationShortSession: 'Lea los 3 puntos de síntesis y cierre con la pregunta puente.',
      },
    },
  ],
};
