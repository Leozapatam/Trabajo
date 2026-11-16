import React from 'react';
import { Compass, Lock, MapPin, Sparkles } from 'lucide-react';
import { ORIGENES_WORLD } from '../data/origenesWorld';

const ZONE_ARTWORKS: Record<string, string> = {
  'zona-1': '/assets/art/zona1-cosmos.jpg',
  'zona-2': '/assets/art/zona2-sistema-solar.jpg',
  'zona-3': '/assets/art/zona3-pangea.jpg',
  'zona-4': '/assets/art/zona4-vida.jpg',
};

interface TacticalOriginMapProps {
  exploredZones: string[];
  focusedZoneId: string;
  onSelectZone?: (zoneId: string) => void;
  compact?: boolean;
}

export const TacticalOriginMap: React.FC<TacticalOriginMapProps> = ({
  exploredZones,
  focusedZoneId,
  onSelectZone,
  compact = false,
}) => {
  const focusedZone =
    ORIGENES_WORLD.zones.find((z) => z.id === focusedZoneId) ?? ORIGENES_WORLD.zones[0];
  const isFocusedExplored = exploredZones.includes(focusedZone.id);

  return (
    <div
      className="editorial-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: compact ? 14 : 22,
        borderColor: 'var(--border-gold)',
        background:
          'radial-gradient(circle at 50% 45%, rgba(18, 32, 58, 0.92), rgba(6, 10, 19, 0.98))',
      }}
    >
      {/* Cabecera cartográfica limpia */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: compact ? 10 : 14,
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Compass size={compact ? 16 : 20} color="#E8B86D" />
          <span
            className="font-mono"
            style={{ fontSize: compact ? '0.72rem' : '0.84rem', color: 'var(--accent-gold)', letterSpacing: '0.08em' }}
          >
            MAPA DE EXPEDICIÓN · ORÍGENES ({exploredZones.length}/4 TERRITORIOS)
          </span>
        </div>
        <span className="badge-pill" style={{ fontSize: compact ? '0.68rem' : '0.76rem' }}>
          Vista Estratégica
        </span>
      </div>

      {/* Tablero cenital estilo estrategia con cuadrícula, rutas y niebla de guerra */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid rgba(232, 184, 109, 0.28)',
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
            radial-gradient(circle at 22% 30%, rgba(56, 189, 248, 0.14), transparent 36%),
            radial-gradient(circle at 52% 58%, rgba(232, 184, 109, 0.12), transparent 34%),
            radial-gradient(circle at 78% 36%, rgba(52, 211, 153, 0.14), transparent 38%)
          `,
          backgroundSize: '64px 64px, 64px 64px, 100% 100%, 100% 100%, 100% 100%',
          backgroundColor: '#070D1A',
        }}
      >
        {/* Curvas de nivel y rutas de expedición SVG */}
        <svg
          viewBox="0 0 1000 562"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {/* Curvas topográficas sutiles */}
          <ellipse cx="220" cy="180" rx="170" ry="110" fill="none" stroke="rgba(56,189,248,0.1)" strokeWidth="1" />
          <ellipse cx="520" cy="330" rx="210" ry="130" fill="none" stroke="rgba(232,184,109,0.1)" strokeWidth="1" />
          <ellipse cx="800" cy="210" rx="165" ry="115" fill="none" stroke="rgba(52,211,153,0.1)" strokeWidth="1" />

          {/* Camino de exploración entre las 4 zonas */}
          <path
            d="M 190 190 Q 320 290 410 315 T 640 345 T 820 195"
            fill="none"
            stroke="rgba(232, 184, 109, 0.48)"
            strokeWidth="3"
            strokeDasharray="10 8"
          />

          {/* Rosa de los vientos minimalista */}
          <g transform="translate(925, 485)" opacity="0.55">
            <circle cx="0" cy="0" r="28" fill="none" stroke="#E8B86D" strokeWidth="1" />
            <path d="M 0 -24 L 5 -5 L 24 0 L 5 5 L 0 24 L -5 5 L -24 0 L -5 -5 Z" fill="#E8B86D" opacity="0.65" />
            <text x="0" y="-32" textAnchor="middle" fill="#E8B86D" fontSize="10" fontFamily="JetBrains Mono">
              N
            </text>
          </g>
        </svg>

        {/* Nodos territoriales (Zonas 1 a 4) */}
        {[
          { zone: ORIGENES_WORLD.zones[0], left: '19%', top: '34%' },
          { zone: ORIGENES_WORLD.zones[1], left: '41%', top: '57%' },
          { zone: ORIGENES_WORLD.zones[2], left: '64%', top: '61%' },
          { zone: ORIGENES_WORLD.zones[3], left: '82%', top: '35%' },
        ].map(({ zone, left, top }) => {
          const explored = exploredZones.includes(zone.id);
          const focused = focusedZoneId === zone.id;
          const artSrc = ZONE_ARTWORKS[zone.id];

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone?.(zone.id)}
              disabled={!onSelectZone}
              style={{
                position: 'absolute',
                left,
                top,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: compact ? 4 : 8,
                cursor: onSelectZone ? 'pointer' : 'default',
                zIndex: focused ? 5 : 3,
              }}
              aria-label={`Zona ${zone.number}: ${zone.title}`}
            >
              {/* Medallón territorial con ilustración + niebla de guerra */}
              <div
                style={{
                  position: 'relative',
                  width: compact ? 64 : 112,
                  height: compact ? 64 : 112,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `3px solid ${focused ? '#E8B86D' : explored ? zone.accentColor : 'rgba(148,163,184,0.3)'}`,
                  boxShadow: focused
                    ? `0 0 28px ${zone.accentColor}88`
                    : explored
                    ? '0 10px 24px rgba(0,0,0,0.6)'
                    : 'none',
                  background: '#0F172A',
                  transition: 'transform 0.2s ease',
                }}
              >
                <img
                  src={artSrc}
                  alt={zone.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: explored ? 'none' : 'grayscale(100%) brightness(0.25) blur(3px)',
                  }}
                />
                {!explored && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(6, 10, 19, 0.52)',
                    }}
                  >
                    <Lock size={compact ? 16 : 24} color="#94A3B8" />
                  </div>
                )}
              </div>

              {/* Etiqueta limpia ("menos es más") */}
              <div
                style={{
                  padding: compact ? '3px 8px' : '5px 12px',
                  borderRadius: 999,
                  background: focused ? 'rgba(232, 184, 109, 0.95)' : 'rgba(13, 21, 38, 0.9)',
                  border: `1px solid ${focused ? '#E8B86D' : 'rgba(148,163,184,0.28)'}`,
                  color: focused ? '#060A13' : '#F8FAFC',
                  fontSize: compact ? '0.68rem' : '0.84rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {focused && <MapPin size={compact ? 10 : 13} />}
                <span>
                  {zone.number}. {zone.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pie de lectura rápida del territorio enfocado */}
      {!compact && (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div className="font-mono" style={{ fontSize: '0.76rem', color: focusedZone.accentColor }}>
              TERRITORIO ACTUAL · ZONA {focusedZone.number}
            </div>
            <div className="font-display" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
              {isFocusedExplored ? focusedZone.title : 'Territorio cubierto por la niebla'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.96rem' }}>
              {isFocusedExplored
                ? focusedZone.subtitle
                : 'El Game Master revelará este territorio cuando comience su exploración.'}
            </div>
          </div>

          {focusedZone.narrativeBridge && isFocusedExplored && (
            <div style={{ maxWidth: 420, color: '#FDE68A', fontSize: '0.92rem', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Sparkles size={18} style={{ flexShrink: 0 }} />
              <span>{focusedZone.narrativeBridge}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
