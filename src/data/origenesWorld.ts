import type { WorldDefinition } from '../engine/types';
import dbaPlan from './dbaPlan.json';

const grade6 = dbaPlan.grades.find((g) => g.grade === 6);
const dbas6 = grade6?.dbas ?? [];

const ZONE_META: Record<
  number,
  { title: string; subtitle: string; accentColor: string; mapPosition: { x: number; y: number } }
> = {
  1: {
    title: 'El comienzo de todo',
    subtitle: 'Explicaciones mítico-religiosas y teorías científicas del universo',
    accentColor: '#38BDF8',
    mapPosition: { x: 14, y: 24 },
  },
  2: {
    title: 'Planeta en transformación',
    subtitle: 'Relieve, clima, fenómenos climáticos y sismos',
    accentColor: '#E8B86D',
    mapPosition: { x: 28, y: 48 },
  },
  3: {
    title: 'Hominización y trabajo',
    subtitle: 'Evolución técnica y organización social en la prehistoria',
    accentColor: '#D97757',
    mapPosition: { x: 42, y: 30 },
  },
  4: {
    title: 'Primeras ciudades',
    subtitle: 'Agricultura, excedente, comercio y sociedades antiguas',
    accentColor: '#34D399',
    mapPosition: { x: 56, y: 58 },
  },
  5: {
    title: 'América prehispánica',
    subtitle: 'Estructuras estatales y legados alimentarios de América',
    accentColor: '#A78BFA',
    mapPosition: { x: 68, y: 32 },
  },
  6: {
    title: 'Poder y formas de gobierno',
    subtitle: 'Antigüedad, legitimación del poder y democracia actual',
    accentColor: '#F472B6',
    mapPosition: { x: 78, y: 56 },
  },
  7: {
    title: 'Ciudadanía y participación',
    subtitle: 'Conflictos de interés y toma de decisiones colectivas',
    accentColor: '#60A5FA',
    mapPosition: { x: 86, y: 34 },
  },
  8: {
    title: 'Igualdad y no discriminación',
    subtitle: 'Derechos humanos, Constitución de 1991 e igualdad ante la ley',
    accentColor: '#FBBF24',
    mapPosition: { x: 92, y: 60 },
  },
};

export const ORIGENES_WORLD: WorldDefinition = {
  id: 'origenes',
  title: 'ORÍGENES',
  subtitle: 'Mundo 1 de Sexto · Ciencias Sociales (I.E.R. Boyacá)',
  description:
    'Territorio narrativo de grado sexto alineado con el núcleo depurado de los DBA 1 a 8: desde las explicaciones sobre el origen del universo y la transformación de la Tierra hasta las primeras ciudades, el poder político y la ciudadanía democrática.',
  zones: dbas6.map((dba) => {
    const meta = ZONE_META[dba.num] ?? {
      title: `DBA ${dba.num}`,
      subtitle: dba.focus,
      accentColor: '#38BDF8',
      mapPosition: { x: 50, y: 50 },
    };

    return {
      id: `zona-${dba.num}`,
      number: dba.num,
      title: meta.title,
      subtitle: meta.subtitle,
      accentColor: meta.accentColor,
      mapPosition: meta.mapPosition,
      fundamentalQuestions: [dba.statement],
      mechanics: ['Narración docente', 'Retos de evidencia', 'Cuaderno de campo'],
      summary: dba.focus,
      nodes: dba.evidences.map((ev, idx) => ({
        id: `dba6-${dba.num}-ret-${idx + 1}`,
        title: `Reto ${dba.num}.${idx + 1}`,
        kind: dba.num === 1 && idx === 0 ? 'mision' : 'exploracion',
        summary: ev,
        scientificDetail: dba.focus,
        linkedMissionId: dba.num === 1 && idx === 0 ? 'mision-001' : undefined,
      })),
    };
  }),
};
