import type { WorldDefinition } from '../engine/types';

export const ORIGENES_WORLD: WorldDefinition = {
  id: 'origenes',
  title: 'ORÍGENES',
  subtitle: 'Del universo a la Tierra',
  description:
    'Primer territorio de Expedición 6. Un viaje de investigación desde las primeras pistas del cosmos hasta la formación y transformación de nuestro planeta, preparando el escenario para la historia de la vida.',
  zones: [
    {
      id: 'zona-1',
      number: 1,
      title: 'El comienzo de todo',
      subtitle: 'Evidencias del cosmos y formas de explicar el origen',
      accentColor: '#38BDF8',
      mapPosition: { x: 18, y: 26 },
      fundamentalQuestions: [
        '¿Cómo se originó el universo?',
        '¿Cómo sabemos lo que sabemos?',
        '¿Qué evidencias permiten construir explicaciones científicas?',
        '¿Qué diferencia existe entre una observación, una hipótesis, un modelo y una teoría científica?',
        '¿Cómo explican diferentes culturas el origen del mundo?',
      ],
      mechanics: [
        'Exploración espacial',
        'Investigación de evidencias',
        'Comparación de explicaciones',
        'Clasificación de pistas',
      ],
      summary:
        'Explora cómo la astronomía reconstruye la historia del universo a partir de la luz y la radiación que llegan desde el espacio profundo, y dialoga con respeto frente a las cosmogonías de distintas culturas.',
      nodes: [
        {
          id: 'z1-evidencias',
          title: 'Observatorio de Pistas Cósmicas',
          kind: 'exploracion',
          summary: 'Desplazamiento al rojo de galaxias y radiación cósmica de fondo.',
          scientificDetail:
            'La luz de galaxias lejanas llega estirada hacia el rojo porque el espacio mismo se expande. Además, en todas direcciones detectamos una radiación muy fría (radiación cósmica de fondo), vestigio de cuando el universo era joven, denso y caliente.',
        },
        {
          id: 'z1-metodo',
          title: 'Observación, Hipótesis, Modelo y Teoría',
          kind: 'comparacion',
          summary: 'Cómo construye explicaciones la ciencia sin adivinar.',
          scientificDetail:
            'Una observación registra un fenómeno medible; una hipótesis propone una explicación provisional que debe ponerse a prueba; un modelo representa cómo funciona un sistema; y una teoría científica integra múltiples evidencias comprobadas (como el modelo del Big Bang).',
        },
        {
          id: 'z1-cosmovisiones',
          title: 'Voces del Origen: Ciencia y Cosmogonías',
          kind: 'comparacion',
          summary: 'Diálogo respetuoso entre modelos científicos y tradiciones culturales.',
          scientificDetail:
            'El modelo científico del Big Bang describe la expansión del espacio hace unos 13.800 millones de años a partir de mediciones físicas y matemáticas.',
          culturalNote:
            'Las cosmogonías ancestrales —como el relato muisca de Chiminigagua, creador de la luz, o los mitos de origen de pueblos andinos y amazónicos— expresan valores, identidad y sentido de pertenencia de las comunidades. No compiten como mediciones físicas ni deben descalificarse: cumplen propósitos humanos distintos y valiosos.',
        },
        {
          id: 'z1-mision-001',
          title: 'Misión 001 — El comienzo de todo',
          kind: 'mision',
          summary: 'Expedición completa de aula (40–50 min) y versión individual para explorar en casa.',
          scientificDetail:
            'Recorrido guiado por 7 escenas con evidencias reales, construcción de línea temporal, formación del vecindario cósmico y escala geológica.',
          linkedMissionId: 'mision-001',
        },
      ],
    },
    {
      id: 'zona-2',
      number: 2,
      title: 'Nuestro vecindario cósmico',
      subtitle: 'Formación del Sistema Solar y singularidad de la Tierra',
      accentColor: '#E8B86D',
      mapPosition: { x: 42, y: 42 },
      fundamentalQuestions: [
        '¿Cómo nació el Sol y por qué los planetas giran en un mismo plano?',
        '¿Qué diferencia a los planetas rocosos de los gigantes gaseosos?',
        '¿Qué condiciones hacen particular a la Tierra?',
      ],
      mechanics: [
        'Exploración de cuerpos celestes',
        'Ordenamiento de acontecimientos',
        'Identificación de características',
        'Resolución de desafíos espaciales',
      ],
      summary:
        'Viaja al interior de una nebulosa solar en colapso hace unos 4.600 millones de años para descubrir cómo la gravedad organizó al Sol, los planetas y el lugar privilegiado de la Tierra.',
      nodes: [
        {
          id: 'z2-nebulosa',
          title: 'De la Nebulosa al Disco Solar',
          kind: 'simulacion',
          summary: 'Cómo la gravedad transformó gas y polvo en estrella y planetas.',
          scientificDetail:
            'Una nube fría de gas y polvo colapsó por gravedad, giró más rápido y se aplanó en un disco. En el centro nació el Sol; en el disco, pequeños granos chocaron y se unieron (acreción) hasta formar planetesimales y planetas.',
        },
        {
          id: 'z2-planetas',
          title: 'Arquitectura del Sistema Solar',
          kind: 'exploracion',
          summary: 'Planetas rocosos interiores, gigantes gaseosos y helados exteriores.',
          scientificDetail:
            'Cerca del Sol joven hacía demasiado calor para conservar hielo, por eso Mercurio, Venus, Tierra y Marte son rocosos. Más lejos, el frío permitió acumular hielos y gases formando a Júpiter, Saturno, Urano y Neptuno.',
        },
        {
          id: 'z2-tierra',
          title: 'La Zona Habitable y la Tierra',
          kind: 'comparacion',
          summary: 'Agua líquida, atmósfera protectora y campo magnético.',
          scientificDetail:
            'La distancia de la Tierra al Sol permite que el agua exista en estado líquido en la superficie. Su masa retiene una atmósfera protectora y su núcleo metálico genera un campo magnético que desvía parte de la radiación solar.',
        },
      ],
    },
    {
      id: 'zona-3',
      number: 3,
      title: 'Un planeta en transformación',
      subtitle: 'Tiempo geológico, deriva continental y relieve vivo',
      accentColor: '#D97757',
      mapPosition: { x: 66, y: 58 },
      fundamentalQuestions: [
        '¿Cuál es la diferencia entre millones y miles de millones de años?',
        '¿Por qué los continentes encajan como piezas de un rompecabezas?',
        '¿Cómo cambia el relieve de la Tierra a lo largo del tiempo?',
      ],
      mechanics: [
        'Reconstrucción de procesos',
        'Comparación temporal',
        'Interpretación de mapas',
        'Simulación de transformaciones planetarias',
      ],
      summary:
        'Comprende la magnitud del tiempo profundo y observa cómo las placas tectónicas mueven continentes, levantan cordilleras como los Andes y transforman el clima y los paisajes.',
      nodes: [
        {
          id: 'z3-tiempo',
          title: 'Escala del Tiempo Geológico',
          kind: 'comparacion',
          summary: 'Visualizar 4.540 millones de años sin perder la proporción.',
          scientificDetail:
            'Mil millones equivale a mil veces un millón. Si toda la historia de la Tierra fuera un día de 24 horas, los continentes modernos y las grandes cordilleras llevan formándose apenas en las últimas horas, y la historia humana escrita ocuparía menos de un segundo.',
        },
        {
          id: 'z3-pangea',
          title: 'De Pangea a los Continentes Actuales',
          kind: 'simulacion',
          summary: 'Evidencias de la deriva continental y tectónica de placas.',
          scientificDetail:
            'Fósiles idénticos de reptiles y helechos en Sudamérica y África, junto con la coincidencia de sus costas y cadenas rocosas, demostraron que hace más de 200 millones de años formaban un supercontinente llamado Pangea.',
        },
        {
          id: 'z3-relieve',
          title: 'Relieve Vivo y Cordilleras',
          kind: 'exploracion',
          summary: 'Volcanismo, sismos y formación de montañas.',
          scientificDetail:
            'La corteza terrestre está dividida en placas que flotan sobre el manto. Cuando chocan —como la placa de Nazca bajo la Sudamericana— se elevan cordilleras como los Andes y ocurren sismos y volcanes.',
        },
      ],
    },
    {
      id: 'zona-4',
      number: 4,
      title: 'El umbral de la vida',
      subtitle: 'Primeros océanos, oxígeno y evolución biológica',
      accentColor: '#34D399',
      mapPosition: { x: 84, y: 34 },
      fundamentalQuestions: [
        '¿Cómo cambiaron los océanos y la atmósfera primitiva?',
        '¿Qué evidencias muestran que la vida evoluciona a través del tiempo?',
        '¿Cómo se conecta la historia del planeta con nuestra propia existencia?',
      ],
      mechanics: [
        'Secuenciación de procesos',
        'Interpretación de evidencias',
        'Construcción de explicaciones',
      ],
      summary:
        'Observa cómo una Tierra inhóspita se cubrió de océanos, albergó microorganismos capaces de liberar oxígeno y abrió el camino para la diversidad biológica.',
      nodes: [
        {
          id: 'z4-oceanos',
          title: 'Océanos Primitivos y Estromatolitos',
          kind: 'exploracion',
          summary: 'Las primeras huellas fósiles de vida hace más de 3.500 millones de años.',
          scientificDetail:
            'Al enfriarse la Tierra, el vapor de agua se condensó en océanos. Allí surgieron microorganismos simples; las cianobacterias formaron estromatolitos y comenzaron a liberar oxígeno mediante fotosíntesis.',
        },
        {
          id: 'z4-evolucion',
          title: 'La Evolución como Proceso Lento',
          kind: 'comparacion',
          summary: 'Cambios en las condiciones ambientales y diversificación de especies.',
          scientificDetail:
            'La evolución biológica no ocurre de un día para otro ni tiene una meta predeterminada: las poblaciones cambian a lo largo de millones de años en interacción con un planeta que también se transforma.',
        },
      ],
      narrativeBridge:
        'La Tierra ya tiene una larga historia. Ahora comienza otra pregunta: ¿cómo llegamos nosotros a existir?',
    },
  ],
};
