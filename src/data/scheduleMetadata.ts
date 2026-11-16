import type { AcademicPeriod } from '../engine/types';

export interface PlannedEvaluation {
  code: 'P1' | 'P2' | 'P3' | 'P4' | 'C1' | 'C2' | 'C3' | 'C4' | 'A1_A2';
  tag: 'taller' | 'quiz' | 'plan_lector' | 'exposicion' | 'cuaderno' | 'examen' | 'actitudinal';
  label: string;
  component: 'Procedimental' | 'Cognitivo' | 'Actitudinal';
  componentWeight: string;
  totalWeight: string;
  description: string;
}

export interface PeriodMovie {
  title: string;
  focus: string;
  directorOrSource?: string;
}

export interface PeriodTransversal {
  tag: 'ebejico' | 'afrocolombianidad' | 'democracia' | 'paz' | 'territorio';
  title: string;
  description: string;
}

/**
 * 8 notas formales por periodo según el SIE de la I.E.R. Boyacá (Acuerdo 06 de 2023):
 * - Cognitivo 35%: Examen Final Saber (30% del comp = 10.5%), Quiz 1 (25% = 8.75%), Quiz 2 (25% = 8.75%), Control Oral (20% = 7.0%).
 * - Procedimental 40%: Taller 1 (25% = 10%), Plan Lector (25% = 10%), Exposición (25% = 10%), Cuaderno (25% = 10%).
 * - Actitudinal 25%: Heteroevaluación 60% (= 15%), Autoevaluación 40% (= 10%).
 */
export const EVALUATION_SLOTS: Record<string, PlannedEvaluation> = {
  // Semana 3, Clase 2 (Clase 6 del periodo)
  's3-c2': {
    code: 'P1',
    tag: 'taller',
    label: 'Taller 1 de Aplicación',
    component: 'Procedimental',
    componentWeight: '25 %',
    totalWeight: '10.0 %',
    description: 'Taller individual o por escuadrones aplicando los conceptos trabajados en clase.',
  },
  // Semana 4, Clase 2 (Clase 8 del periodo)
  's4-c2': {
    code: 'C2',
    tag: 'quiz',
    label: 'Quiz 1 de Comprobación',
    component: 'Cognitivo',
    componentWeight: '25 %',
    totalWeight: '8.75 %',
    description: 'Preguntas cortas de verificación conceptual de la primera mitad del periodo.',
  },
  // Semana 5, Clase 2 (Clase 10 del periodo)
  's5-c2': {
    code: 'P2',
    tag: 'plan_lector',
    label: 'Plan Lector (Informe / Ficha)',
    component: 'Procedimental',
    componentWeight: '25 %',
    totalWeight: '10.0 %',
    description: 'Control de lectura crítica, debate o entrega de ficha del texto asignado.',
  },
  // Semana 6, Clase 2 (Clase 12 del periodo)
  's6-c2': {
    code: 'C3',
    tag: 'quiz',
    label: 'Quiz 2 de Comprobación',
    component: 'Cognitivo',
    componentWeight: '25 %',
    totalWeight: '8.75 %',
    description: 'Preguntas de análisis sobre la segunda unidad temática del periodo.',
  },
  // Semana 8, Clase 1 (Clase 15 del periodo)
  's8-c1': {
    code: 'P3',
    tag: 'exposicion',
    label: 'Exposición por Escuadrones',
    component: 'Procedimental',
    componentWeight: '25 %',
    totalWeight: '10.0 %',
    description: 'Sustentación oral cooperativa y trabajo en equipo con rúbrica.',
  },
  // Semana 8, Clase 2 (Clase 16 del periodo)
  's8-c2': {
    code: 'C4',
    tag: 'quiz',
    label: 'Control Oral y Síntesis',
    component: 'Cognitivo',
    componentWeight: '20 %',
    totalWeight: '7.0 %',
    description: 'Preguntas individuales de síntesis y argumentación sobre el tema de la exposición.',
  },
  // Semana 9, Clase 1 (Clase 17 del periodo)
  's9-c1': {
    code: 'P4',
    tag: 'cuaderno',
    label: 'Día Único del Cuaderno',
    component: 'Procedimental',
    componentWeight: '25 %',
    totalWeight: '10.0 %',
    description: 'Revisión general de apuntes, esquemas, glosarios y talleres completos en el cuaderno.',
  },
  // Semana 12, Clase 1 (Clase 23 del periodo)
  's12-c1': {
    code: 'C1',
    tag: 'examen',
    label: 'Examen Final Tipo Saber',
    component: 'Cognitivo',
    componentWeight: '30 %',
    totalWeight: '10.5 %',
    description: 'Prueba escrita de 10 a 15 preguntas de opción múltiple con única respuesta (SIE).',
  },
  // Semana 13, Clase 1 (Clase 25 del periodo)
  's13-c1': {
    code: 'A1_A2',
    tag: 'actitudinal',
    label: 'Auto y Heteroevaluación',
    component: 'Actitudinal',
    componentWeight: '100 %',
    totalWeight: '25.0 %',
    description: 'Autoevaluación guiada (40 %) y Heteroevaluación del docente (60 %) según el SIE.',
  },
};

/** Catálogo de dos películas por periodo para cada grado */
export const MOVIES_BY_GRADE: Record<string, Record<AcademicPeriod, [PeriodMovie, PeriodMovie]>> = {
  '6°': {
    1: [
      { title: 'El Origen de la Tierra (NatGeo / Cosmos)', focus: 'Big Bang, acreción planetaria y tiempo geológico' },
      { title: 'Alfa (2018)', focus: 'Paleolítico, tecnología lítica, fuego y domesticación' },
    ],
    2: [
      { title: 'Ciudades Perdidas de los Incas (History)', focus: 'Excedente agrícola y civilizaciones prehispánicas' },
      { title: 'Ágora (2009)', focus: 'Democracia antigua, biblioteca de Alejandría y pensamiento racional' },
    ],
    3: [
      { title: 'Invictus (2009)', focus: 'Convivencia, superación del odio y cohesión social' },
      { title: 'Selma (2014)', focus: 'Participación ciudadana, marchas pacíficas y derechos civiles' },
    ],
  },
  '7°': {
    1: [
      { title: '1492: La conquista del paraíso', focus: 'Cartografía, visiones del mundo y navegación' },
      { title: 'Roma: Auge y caída del imperio', focus: 'Caminos, senado, leyes y colapso imperial' },
    ],
    2: [
      { title: 'El nombre de la rosa (1986)', focus: 'Sociedad medieval, feudos y saber monástico' },
      { title: 'La misión (1986)', focus: 'Encuentro cultural, resistencia indígena y colonia' },
    ],
    3: [
      { title: 'La estrategia del caracol (1993)', focus: 'Acción de tutela, vivienda digna y solidaridad comunitaria' },
      { title: 'Doce hombres en pugna (1957)', focus: 'Debate judicial, argumentos y resolución de conflictos' },
    ],
  },
  '8°': {
    1: [
      { title: 'Tiempos modernos (Charles Chaplin)', focus: 'Revolución Industrial, fábricas y alienación obrera' },
      { title: 'Germinal (1993)', focus: 'Carbón, máquinas de vapor y condiciones del proletariado' },
    ],
    2: [
      { title: 'El último rey de Escocia / El Congo de Leopoldo', focus: 'Imperialismo del siglo XIX en África' },
      { title: 'Bolívar: El hombre de las dificultades', focus: 'Independencias americanas y quiebre colonial' },
    ],
    3: [
      { title: 'Historias cruzadas (The Help)', focus: 'Luchas contra la segregación y discriminación' },
      { title: 'Pan y rosas (Ken Loach)', focus: 'Movimientos sindicales y derechos de los trabajadores' },
    ],
  },
  '9°': {
    1: [
      { title: 'Los reyes del mundo (2022)', focus: 'Despojo de tierras, periferias y éxodo rural' },
      { title: 'La tierra y la sombra (2015)', focus: 'Geosistemas, monocultivo e impacto socioambiental' },
    ],
    2: [
      { title: 'Roa (2013) / El Bogotazo', focus: 'Violencia bipartidista del siglo XX en Colombia' },
      { title: 'Las sufragistas (Suffragette)', focus: 'Derechos políticos de las mujeres y paridad' },
    ],
    3: [
      { title: 'Hotel Ruanda (2004)', focus: 'Discursos de odio, prejuicios y prevención del genocidio' },
      { title: 'Silencio en el paraíso (2011)', focus: 'Juventud, desigualdad territorial y conflicto armado' },
    ],
  },
  '10°': {
    1: [
      { title: 'También la lluvia (2010)', focus: 'Guerra del agua, recursos estratégicos y soberanía' },
      { title: 'Impunity (2010) / Fragmentos de Verdad', focus: 'Anatomía del conflicto armado en Colombia' },
    ],
    2: [
      { title: 'El abrazo de la serpiente (2015)', focus: 'Territorios étnicos, Amazonía y resistencia comunitaria' },
      { title: 'La gran apuesta (The Big Short)', focus: 'Arquitectura financiera global y crisis de la deuda' },
    ],
    3: [
      { title: '1917 / Sin novedad en el frente', focus: 'Primera y Segunda Guerra Mundial en el terreno' },
      { title: 'La lista de Schindler (1993)', focus: 'Derechos humanos universales y crímenes de lesa humanidad' },
    ],
  },
  '11°': {
    1: [
      { title: 'Antes que sea tarde (Before the Flood)', focus: 'Tratados climáticos, límites planetarios y energía' },
      { title: 'Argentina, 1985 / El silencio de los fusiles', focus: 'Justicia transicional, verdad y reparación' },
    ],
    2: [
      { title: 'Diamante de sangre (Blood Diamond)', focus: 'Guerras por recursos estratégicos y geopolítica' },
      { title: 'Missing (Desaparecido) / La noche de los lápices', focus: 'Doctrina de Seguridad Nacional y Guerra Fría' },
    ],
    3: [
      { title: 'El dilema de las redes sociales (2020)', focus: 'Globalización digital, algoritmos y polarización' },
      { title: 'La corporación (The Corporation)', focus: 'Mercados transnacionales y soberanía económica' },
    ],
  },
  '6°–7°': {
    1: [
      { title: 'El Origen de la Tierra (NatGeo)', focus: 'De la formación del cosmos y la Tierra a los mapas del mundo' },
      { title: 'Alfa (2018)', focus: 'Paleolítico, herramientas líticas y supervivencia ancestral' },
    ],
    2: [
      { title: 'Ciudades Perdidas de los Incas', focus: 'América prehispánica y las primeras ciudades imperiales' },
      { title: 'La misión (1986)', focus: 'Conquista, resistencia indígena y encuentro cultural' },
    ],
    3: [
      { title: 'La estrategia del caracol', focus: 'Ciudadanía, acción de tutela y dignidad comunitaria' },
      { title: 'Invictus (2009)', focus: 'Resolución pacífica de conflictos y respeto a la diferencia' },
    ],
  },
  '8°–9°': {
    1: [
      { title: 'Tiempos modernos (Charles Chaplin)', focus: 'Revolución Industrial y transformaciones laborales' },
      { title: 'Los reyes del mundo (2022)', focus: 'Territorio, desarraigo campesino y periferias en Colombia' },
    ],
    2: [
      { title: 'Bolívar: El hombre de las dificultades', focus: 'De las independencias a la construcción de la república' },
      { title: 'Las sufragistas (Suffragette)', focus: 'Luchas civiles, sufragio femenino y derechos colectivos' },
    ],
    3: [
      { title: 'Pan y rosas (Ken Loach)', focus: 'Sindicatos, movimientos sociales y defensa del trabajo digno' },
      { title: 'Hotel Ruanda (2004)', focus: 'La palabra frente al odio: prevención de la violencia' },
    ],
  },
  '10°–11°': {
    1: [
      { title: 'También la lluvia (2010)', focus: 'Soberanía sobre agua y tierra frente a tratados globales' },
      { title: 'Argentina, 1985 / El silencio de los fusiles', focus: 'Justicia transicional, no repetición y memoria histórica' },
    ],
    2: [
      { title: 'El abrazo de la serpiente (2015)', focus: 'Territorios ancestrales y recursos en disputa' },
      { title: 'Diamante de sangre (Blood Diamond)', focus: 'Geopolítica de recursos y cadenas globales' },
    ],
    3: [
      { title: 'Sin novedad en el frente (2022)', focus: 'Guerras mundiales, crisis civilizatoria y orden internacional' },
      { title: 'El dilema de las redes sociales', focus: 'Dilemas de la globalización y preparación Saber 11' },
    ],
  },
};

/** Efemérides y Cátedras Transversales del Año */
export const TRANSVERSALS_BY_PERIOD: Record<AcademicPeriod, { week4: PeriodTransversal; week7: PeriodTransversal }> = {
  1: {
    week4: {
      tag: 'ebejico',
      title: 'Historia y Memoria Local de Ebéjico (Marzo)',
      description: 'Poblamiento del Occidente antioqueño, caminos ancestrales, arriería y territorio de la I.E.R. Boyacá.',
    },
    week7: {
      tag: 'paz',
      title: 'Día de la Memoria y Solidaridad con las Víctimas (Abril)',
      description: 'Reflexión histórica, reconocimiento del dolor y construcción de paz desde el aula.',
    },
  },
  2: {
    week4: {
      tag: 'territorio',
      title: 'Cátedra del Agua y los Bienes Comunes (Mayo)',
      description: 'Cuidado de las fuentes hídricas rurales, gestión ecológica y soberanía territorial.',
    },
    week7: {
      tag: 'democracia',
      title: '20 de Julio y Soberanía Popular',
      description: 'Independencia, participación de los sectores populares y deudas históricas con el campo.',
    },
  },
  3: {
    week4: {
      tag: 'democracia',
      title: 'Semana por la Paz y Convivencia Escolar (Septiembre)',
      description: 'Resolución noviolenta de conflictos, escucha activa y acuerdos en el salón.',
    },
    week7: {
      tag: 'afrocolombianidad',
      title: 'Mes de la Afrocolombianidad y Diversidad Étnica (Octubre)',
      description: 'Herencia afro e indígena, Ley 70 de 1993, cimarronaje y resistencia cultural en Colombia.',
    },
  },
};
