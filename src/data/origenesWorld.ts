import type { MissionDefinition, WorldDefinition } from '../engine/types';
import {
  buildSkeletonMissionFromDba,
  getGradeDbas,
  type ZoneMetaSpec,
} from './dbaWorldBuilder';

const dbas6 = getGradeDbas(6);

export const ZONAS_6_SPECS: ZoneMetaSpec[] = [
  {
    num: 1,
    title: 'El comienzo de todo',
    subtitle: 'Explicaciones mítico-religiosas y teorías científicas del universo',
    accentColor: '#38BDF8',
    artwork: '/assets/art/zona1-cosmos.webp',
    resourceUnits: ['01'],
    missionId: 'mision-001',
    missionTitle: 'El comienzo de todo',
    centralQuestion: '¿Podemos reconstruir la historia del universo y de nuestro planeta utilizando evidencias?',
  },
  {
    num: 2,
    title: 'Planeta en transformación',
    subtitle: 'Relieve, clima, fenómenos climáticos y sismos',
    accentColor: '#E8B86D',
    artwork: '/assets/art/zona2-sistema-solar.webp',
    resourceUnits: ['01', '09'],
    missionId: 'mision-602',
    missionTitle: 'Fuerzas de un planeta vivo',
    centralQuestion: '¿Cómo influyen el relieve, el clima y los sismos en la vida de las comunidades?',
  },
  {
    num: 3,
    title: 'Hominización y trabajo',
    subtitle: 'Evolución técnica y organización social en la prehistoria',
    accentColor: '#D97757',
    artwork: '/assets/art/zona3-pangea.webp',
    resourceUnits: ['01', '02'],
    missionId: 'mision-603',
    missionTitle: 'Las manos que transformaron el entorno',
    centralQuestion: '¿Cómo impulsaron el trabajo y las herramientas el proceso de humanización?',
  },
  {
    num: 4,
    title: 'Primeras ciudades',
    subtitle: 'Agricultura, excedente, comercio y sociedades antiguas',
    accentColor: '#34D399',
    artwork: '/assets/art/zona4-vida.webp',
    resourceUnits: ['02', '03'],
    missionId: 'mision-604',
    missionTitle: 'Del río a la ciudad amurallada',
    centralQuestion: '¿Por qué el excedente agrícola dio origen a las primeras ciudades y al Estado?',
  },
  {
    num: 5,
    title: 'América prehispánica',
    subtitle: 'Estructuras estatales y legados alimentarios de América',
    accentColor: '#A78BFA',
    artwork: '/assets/art/zona5-prehispanica.webp',
    resourceUnits: ['02', '05'],
    missionId: 'mision-605',
    missionTitle: 'Semillas e imperios de América',
    centralQuestion: '¿Qué legados políticos, urbanos y alimentarios nos dejaron las sociedades prehispánicas?',
  },
  {
    num: 6,
    title: 'Poder y formas de gobierno',
    subtitle: 'Antigüedad, legitimación del poder y democracia actual',
    accentColor: '#F472B6',
    artwork: '/assets/art/zona6-gobierno.webp',
    resourceUnits: ['03', '12'],
    missionId: 'mision-606',
    missionTitle: '¿Quién manda y por qué obedecemos?',
    centralQuestion: '¿En qué se parecen y diferencian la democracia ateniense y las democracias actuales?',
  },
  {
    num: 7,
    title: 'Ciudadanía y participación',
    subtitle: 'Conflictos de interés y toma de decisiones colectivas',
    accentColor: '#60A5FA',
    artwork: '/assets/art/zona7-ciudadania.webp',
    resourceUnits: ['12'],
    missionId: 'mision-607',
    missionTitle: 'La voz en la plaza pública',
    centralQuestion: '¿Qué ocurre en una comunidad cuando los ciudadanos participan o dejan de participar?',
  },
  {
    num: 8,
    title: 'Igualdad y no discriminación',
    subtitle: 'Derechos humanos, Constitución de 1991 e igualdad ante la ley',
    accentColor: '#FBBF24',
    artwork: '/assets/art/zona8-igualdad.webp',
    resourceUnits: ['12'],
    missionId: 'mision-608',
    missionTitle: 'Iguales en la diferencia',
    centralQuestion: '¿Cómo protege la igualdad ante la ley la diversidad de creencias, orígenes y formas de vivir?',
  },
];

export const ORIGENES_WORLD: WorldDefinition = {
  id: 'origenes',
  grade: '6°',
  title: 'ORÍGENES',
  subtitle: 'Mundo 1 de Sexto · Ciencias Sociales (I.E.R. Boyacá)',
  artwork: '/assets/art/mundo-6-origenes.webp',
  description:
    'Territorio narrativo de grado sexto alineado con el núcleo depurado de los DBA 1 a 8: desde las explicaciones sobre el origen del universo y la transformación de la Tierra hasta las primeras ciudades, el poder político y la ciudadanía democrática.',
  zones: dbas6.map((dba, idx) => {
    const spec = ZONAS_6_SPECS[idx];
    return {
      id: `zona-${dba.num}`,
      number: dba.num,
      title: spec.title,
      subtitle: spec.subtitle,
      accentColor: spec.accentColor,
      artwork: spec.artwork,
      resourceUnits: spec.resourceUnits,
      mapPosition: { x: 14 + idx * 10, y: idx % 2 === 0 ? 28 : 66 },
      fundamentalQuestions: [dba.statement, spec.centralQuestion],
      mechanics: ['Narración docente', 'Retos de evidencia', 'Cuaderno de campo'],
      summary: dba.focus,
      nodes: dba.evidences.map((ev, evIdx) => ({
        id: `dba6-${dba.num}-ret-${evIdx + 1}`,
        title: evIdx === 0 ? spec.missionTitle : `Reto ${dba.num}.${evIdx + 1}`,
        kind: evIdx === 0 ? 'mision' : 'exploracion',
        summary: ev,
        scientificDetail: dba.focus,
        linkedMissionId: evIdx === 0 ? spec.missionId : undefined,
      })),
    };
  }),
};

export const MISIONES_6_ESQUELETO: MissionDefinition[] = dbas6
  .slice(1)
  .map((dba, idx) =>
    buildSkeletonMissionFromDba('6°', 'origenes', `zona-${dba.num}`, dba, ZONAS_6_SPECS[idx + 1])
  );
