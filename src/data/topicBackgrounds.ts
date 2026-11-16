/**
 * Fondo fotográfico (Full HD o más) de cada tema, para la pantalla del profe y el proyector.
 * Los archivos viven en public/assets/temas/<id de misión>.webp, a 3840 px de ancho.
 * Todas las imágenes son de dominio público o con licencia libre: la licencia CC BY-SA
 * pide citar autor y licencia, por eso cada fondo lleva su crédito (se ve en la app).
 * Un tema sin fondo aquí usa la ilustración de su territorio, como antes.
 */
export interface TopicBackground {
  src: string;
  /** Qué muestra la imagen */
  caption: string;
  author: string;
  license: string;
  /** Página del archivo original en Wikimedia Commons */
  source: string;
  /** object-position para encuadrar lo importante */
  position?: string;
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;

export const TOPIC_BACKGROUNDS: Record<string, TopicBackground> = {
  'mision-001': {
    src: '/assets/temas/mision-001.webp',
    caption: 'Acantilados Cósmicos, nebulosa de Carina (telescopio James Webb)',
    author: 'NASA, ESA, CSA, STScI',
    license: 'Dominio público',
    source: commons("NASA’s Webb Reveals Cosmic Cliffs, Glittering Landscape of Star Birth.jpg"),
  },
  'mision-602': {
    src: '/assets/temas/mision-602.webp',
    caption: 'Fuente de lava en Hawái',
    author: 'J. B. Judd, USGS',
    license: 'Dominio público',
    source: commons('Lava fountain dome 2.jpg'),
  },
  'mision-603': {
    src: '/assets/temas/mision-603.webp',
    caption: 'Cueva de las Manos, Santa Cruz, Argentina',
    author: 'Pablo A. Gimenez',
    license: 'CC BY-SA 2.0',
    source: commons('Cueva de las Manos (6811931046).jpg'),
  },
  'mision-604': {
    src: '/assets/temas/mision-604.webp',
    caption: 'El delta del Nilo visto desde la Estación Espacial Internacional',
    author: 'NASA Johnson Space Center',
    license: 'Dominio público',
    source: commons("Egypt's Nile Delta region (iss072e905240).jpg"),
  },
  'mision-605': {
    src: '/assets/temas/mision-605.webp',
    caption: 'Machu Picchu, Perú',
    author: 'Martin St-Amant',
    license: 'CC BY-SA 3.0',
    source: commons('99 - Machu Picchu - Juin 2009.edit3.jpg'),
  },
  'mision-606': {
    src: '/assets/temas/mision-606.webp',
    caption: 'Capitolio Nacional, Bogotá',
    author: 'Luis Alejandro Bernal Romero (Aztlek)',
    license: 'CC BY-SA 3.0',
    source: commons('Capitolio Nacional en la lluvia III.jpg'),
  },
  'mision-607': {
    src: '/assets/temas/mision-607.webp',
    caption: 'La Acrópolis de Atenas vista desde la Pnyx, donde se reunía la asamblea',
    author: 'George E. Koronaios',
    license: 'CC BY-SA 4.0',
    source: commons('The Acropolis of Athens from the Pnyx on February 26, 2020.jpg'),
  },
  'mision-608': {
    src: '/assets/temas/mision-608.webp',
    caption: 'Carnaval de Negros y Blancos, Pasto',
    author: 'Felipe Jurado',
    license: 'CC BY-SA 4.0',
    source: commons('Carnaval de Blancos y Negros de Pasto.jpg'),
  },
};

export function getTopicBackground(missionId: string | null | undefined): TopicBackground | null {
  return (missionId && TOPIC_BACKGROUNDS[missionId]) || null;
}

export function creditLine(bg: TopicBackground): string {
  return `${bg.caption} · ${bg.author} · ${bg.license}`;
}
