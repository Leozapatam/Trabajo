import React from 'react';

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
};

/** `vignette` oscurece el lado donde va el texto (izquierda por defecto) */
export const TitleBackdrop: React.FC<{ vignette?: keyof typeof VIGNETTES }> = ({ vignette = 'left' }) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: '#060a13',
      }}
    >
      {/* Ilustración principal retro epic pixel art con parallax suave */}
      <img
        src="/assets/art/title-screen.jpg"
        alt=""
        className="animate-bg-parallax"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          imageRendering: 'pixelated',
          opacity: 0.88,
        }}
      />

      {/* Viñeta cinematográfica para contraste perfecto del título y formulario */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: VIGNETTES[vignette],
        }}
      />

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
