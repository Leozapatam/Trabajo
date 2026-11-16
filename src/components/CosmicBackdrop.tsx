import React from 'react';

interface CosmicBackdropProps {
  accent?: string;
}

export const CosmicBackdrop: React.FC<CosmicBackdropProps> = ({ accent = '#38BDF8' }) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 20% 18%, rgba(56, 189, 248, 0.12), transparent 45%), radial-gradient(circle at 82% 76%, rgba(232, 184, 109, 0.11), transparent 48%), linear-gradient(180deg, #050811 0%, #091121 55%, #060a13 100%)',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.72 }}
      >
        <defs>
          <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="1220" cy="240" r="320" fill="url(#nebulaGlow)" className="animate-drift" />

        {/* Órbitas editoriales sutiles */}
        <circle
          cx="800"
          cy="450"
          r="260"
          fill="none"
          stroke="rgba(232, 184, 109, 0.08)"
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        <circle
          cx="800"
          cy="450"
          r="430"
          fill="none"
          stroke="rgba(56, 189, 248, 0.07)"
          strokeWidth="1"
        />

        {/* Campo de estrellas calibrado */}
        {[
          [110, 120, 1.6],
          [240, 340, 1.1],
          [380, 90, 2.0],
          [520, 220, 1.2],
          [690, 140, 1.5],
          [880, 80, 1.8],
          [1040, 190, 1.2],
          [1290, 110, 2.1],
          [1460, 260, 1.4],
          [180, 620, 1.4],
          [340, 760, 1.9],
          [580, 690, 1.1],
          [790, 810, 1.6],
          [1010, 740, 1.3],
          [1260, 670, 2.0],
          [1430, 790, 1.5],
          [1510, 510, 1.2],
          [90, 460, 1.7],
        ].map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={i % 4 === 0 ? '#E8B86D' : '#F8FAFC'}
            opacity={i % 3 === 0 ? 0.85 : 0.45}
          />
        ))}
      </svg>
    </div>
  );
};
