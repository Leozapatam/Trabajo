import React from 'react';
import '../styles/breeze.css';

/** `tierra`: hojas, luciérnagas y ráfagas de viento. `cosmos`: polvo de estrellas y estrellas fugaces. */
export type BreezeScene = 'tierra' | 'cosmos';

interface AmbientBreezeProps {
  scene: BreezeScene;
  /** `soft` para pantallas de trabajo: menos partículas y más tenues */
  intensity?: 'full' | 'soft';
}

const LEAF_COLORS = [
  { fill: '#86efac', vein: '#15803d' },
  { fill: '#4ade80', vein: '#166534' },
  { fill: '#fde68a', vein: '#b45309' },
  { fill: '#fdba74', vein: '#c2410c' },
];

// Generador con semilla: la brisa es siempre la misma y no salta al re-renderizar
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const rand = seeded(20261116);
const between = (min: number, max: number) => min + rand() * (max - min);

const LEAVES = Array.from({ length: 14 }, (_, i) => {
  const duration = between(13, 25);
  return {
    color: LEAF_COLORS[i % LEAF_COLORS.length],
    top: between(4, 78),
    drop: between(8, 34),
    size: Math.round(between(10, 19)),
    duration,
    delay: -between(0, duration),
    sway: between(2.2, 4.4),
    spin: between(1.6, 3.4),
  };
});

const MOTES = Array.from({ length: 12 }, () => ({
  left: between(3, 97),
  top: between(8, 92),
  size: rand() > 0.7 ? 4 : 3,
  float: between(6, 11),
  pulse: between(2.8, 5.2),
  delay: -between(0, 6),
}));

const STREAKS = Array.from({ length: 4 }, (_, i) => ({
  top: between(10, 70),
  left: between(-5, 55),
  width: Math.round(between(70, 150)),
  cycle: between(9, 17),
  delay: -between(0, 9) - i * 2.3,
}));

const Leaf: React.FC<{ fill: string; vein: string }> = ({ fill, vein }) => (
  <svg viewBox="0 0 7 7" shapeRendering="crispEdges" width="100%" height="100%">
    <path fill={fill} d="M4 0h2v1h1v2h-1v1h-1v1h-1v1h-3v1h-1v-2h1v-2h1v-1h1v-1h1z" />
    <path fill={vein} d="M5 1h1v1h-1zM4 2h1v1h-1zM3 3h1v1h-1zM2 4h1v1h-1zM1 5h1v1h-1z" />
  </svg>
);

/** Capa de ambiente sobre la ilustración: da vida sin distraer (solo anima transform y opacity) */
export const AmbientBreeze: React.FC<AmbientBreezeProps> = ({ scene, intensity = 'full' }) => {
  const soft = intensity === 'soft';
  const leaves = scene === 'tierra' ? LEAVES.slice(0, soft ? 6 : LEAVES.length) : [];
  const motes = MOTES.slice(0, soft ? 6 : MOTES.length);
  const streaks = STREAKS.slice(0, soft ? 1 : scene === 'cosmos' ? 2 : STREAKS.length);

  return (
    <div className={`breeze breeze--${scene}${soft ? ' breeze--soft' : ''}`} aria-hidden="true">
      {motes.map((m, i) => (
        <span
          key={`m${i}`}
          className="breeze__mote"
          style={
            {
              left: `${m.left}%`,
              top: `${scene === 'tierra' ? 35 + m.top * 0.65 : m.top}%`,
              width: m.size,
              height: m.size,
              '--float': `${m.float}s`,
              '--pulse': `${m.pulse}s`,
              '--delay': `${m.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {streaks.map((s, i) => (
        <span
          key={`s${i}`}
          className="breeze__streak"
          style={
            {
              top: `${scene === 'cosmos' ? s.top * 0.55 : s.top}%`,
              left: `${s.left}%`,
              width: s.width,
              '--cycle': `${s.cycle}s`,
              '--delay': `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {leaves.map((l, i) => (
        <span
          key={`l${i}`}
          className="breeze__leaf"
          style={
            {
              top: `${l.top}%`,
              '--drop': `${l.drop}vh`,
              '--dur': `${l.duration}s`,
              '--delay': `${l.delay}s`,
              '--sway': `${l.sway}s`,
              '--spin': `${l.spin}s`,
              '--size': `${l.size}px`,
            } as React.CSSProperties
          }
        >
          <span className="breeze__sway">
            <span className="breeze__spin">
              <Leaf {...l.color} />
            </span>
          </span>
        </span>
      ))}
    </div>
  );
};
