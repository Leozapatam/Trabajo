import React, { useEffect, useState } from 'react';
import fondos from 'virtual:fondos';
import '../styles/backdrop.css';

const PIXEL_STARS: { left: string; top: string; size: number; delay: string; gold?: boolean }[] = [
  { left: '8%', top: '14%', size: 3, delay: '0s' },
  { left: '19%', top: '24%', size: 4, delay: '1.1s', gold: true },
  { left: '31%', top: '10%', size: 3, delay: '2.3s' },
  { left: '46%', top: '18%', size: 4, delay: '0.6s', gold: true },
  { left: '58%', top: '9%', size: 3, delay: '1.8s' },
  { left: '72%', top: '22%', size: 4, delay: '2.9s' },
  { left: '84%', top: '12%', size: 3, delay: '0.4s', gold: true },
  { left: '92%', top: '28%', size: 3, delay: '1.5s' },
  { left: '14%', top: '42%', size: 3, delay: '2.1s' },
  { left: '66%', top: '36%', size: 4, delay: '0.9s', gold: true },
];

const VIGNETTES = {
  left: 'linear-gradient(90deg, rgba(6,10,19,0.88) 0%, rgba(6,10,19,0.58) 48%, rgba(6,10,19,0.22) 100%), linear-gradient(180deg, rgba(6,10,19,0.45) 0%, rgba(6,10,19,0.18) 45%, rgba(6,10,19,0.82) 100%)',
  right:
    'linear-gradient(270deg, rgba(6,10,19,0.78) 0%, rgba(6,10,19,0.35) 38%, rgba(6,10,19,0) 62%), linear-gradient(180deg, rgba(6,10,19,0.25) 0%, rgba(6,10,19,0) 40%, rgba(6,10,19,0.55) 100%)',
  /** Para pantallas de trabajo: la ilustración queda como ambiente detrás de los paneles */
  full: 'linear-gradient(180deg, rgba(6,10,19,0.8) 0%, rgba(6,10,19,0.7) 50%, rgba(6,10,19,0.88) 100%)',
};

const ROTATE_MS = 40_000;
const FADE_MS = 2_400;

// La portada va primero; el resto se baraja una vez por sesión
const ORDER: string[] = (() => {
  const first = fondos.find((f) => f.includes('title-screen')) ?? fondos[0];
  const rest = fondos.filter((f) => f !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return first ? [first, ...rest] : [];
})();

/** Se conserva entre pantallas: al pasar de la portada a Grupos sigue la misma ilustración */
let currentIndex = 0;

interface TitleBackdropProps {
  /** Oscurece el lado donde va el texto (izquierda por defecto) */
  vignette?: keyof typeof VIGNETTES;
  /** Cambia sola de ilustración cada 40 s */
  rotate?: boolean;
}

/**
 * Fondo ilustrado a pantalla completa. Rota con fundido entre todas las
 * ilustraciones de public/assets/art (se detectan solas al compilar).
 */
export const TitleBackdrop: React.FC<TitleBackdropProps> = ({ vignette = 'left', rotate = true }) => {
  // Hasta dos capas: la actual y, durante el fundido, la que entra encima
  const [layers, setLayers] = useState<string[]>(() => (ORDER.length ? [ORDER[currentIndex % ORDER.length]] : []));

  useEffect(() => {
    if (!rotate || ORDER.length < 2) return;
    let cancelled = false;
    let fadeTimer: number | undefined;

    const advance = () => {
      if (document.hidden) return;
      const next = ORDER[(currentIndex + 1) % ORDER.length];
      const img = new Image();
      img.src = next;
      // Solo se muestra cuando ya está descargada y decodificada: sin parpadeos
      img
        .decode()
        .then(() => {
          if (cancelled) return;
          currentIndex = (currentIndex + 1) % ORDER.length;
          setLayers((prev) => [prev[prev.length - 1], next]);
          fadeTimer = window.setTimeout(() => !cancelled && setLayers([next]), FADE_MS);
        })
        .catch(() => {
          // Imagen dañada o ausente: se salta en la próxima vuelta
          currentIndex = (currentIndex + 1) % ORDER.length;
        });
    };

    const interval = window.setInterval(advance, ROTATE_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
    };
  }, [rotate]);

  return (
    <div className="backdrop" aria-hidden="true">
      {layers.map((src, i) => (
        <div key={src} className={`backdrop__layer${i > 0 ? ' is-entering' : ''}`}>
          <img src={src} alt="" className="backdrop__image animate-bg-parallax" decoding="async" />
        </div>
      ))}

      {/* Viñeta para el contraste del título y los menús */}
      <div className="backdrop__vignette" style={{ background: VIGNETTES[vignette] }} />
      <div className="backdrop__scanlines" />

      {/* Estrellas pixel art titilantes */}
      {PIXEL_STARS.map((star, idx) => (
        <span
          key={idx}
          className="animate-star-twinkle"
          style={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            backgroundColor: star.gold ? '#FDE68A' : '#E0F2FE',
            boxShadow: star.gold ? '0 0 8px rgba(232,184,109,0.8)' : '0 0 6px rgba(56,189,248,0.7)',
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
};
