import React from 'react';
import { Compass, Lock, MapPin, Sparkles } from 'lucide-react';
import { ORIGENES_WORLD } from '../data/origenesWorld';
import { WORLDS, worldArtById } from '../data/catalog';
import type { WorldDefinition, ZoneDefinition } from '../engine/types';

const LEGACY_ZONE_ARTWORKS: Record<string, string> = {
  'zona-1': '/assets/art/zona1-cosmos.webp',
  'zona-2': '/assets/art/zona2-sistema-solar.webp',
  'zona-3': '/assets/art/zona3-pangea.webp',
  'zona-4': '/assets/art/zona4-vida.webp',
};

interface TacticalOriginMapProps {
  world?: WorldDefinition;
  exploredZones: string[];
  focusedZoneId: string;
  onSelectZone?: (zoneId: string) => void;
  compact?: boolean;
}

/**
 * Calcula posiciones limpias en serpiente (S-curve) para cualquier cantidad
 * de zonas (5 u 8) evitando que las medallas o etiquetas se solapen.
 */
function computeZoneLayout(zones: ZoneDefinition[]): { zone: ZoneDefinition; x: number; y: number }[] {
  const n = zones.length;
  if (n === 0) return [];
  if (n <= 4) {
    return zones.map((zone, idx) => ({
      zone,
      x: 16 + (idx * 68) / Math.max(1, n - 1),
      y: idx % 2 === 0 ? 36 : 62,
    }));
  }

  const topCount = Math.ceil(n / 2);
  const bottomCount = n - topCount;

  return zones.map((zone, idx) => {
    if (idx < topCount) {
      const x = topCount === 1 ? 50 : 13 + (idx * 74) / (topCount - 1);
      const y = idx % 2 === 0 ? 24 : 31;
      return { zone, x, y };
    }
    const bIdx = idx - topCount;
    // Segunda fila recorre de derecha a izquierda para formar un camino continuo en S
    const revIdx = bottomCount - 1 - bIdx;
    const x = bottomCount === 1 ? 50 : 15 + (revIdx * 70) / (bottomCount - 1);
    const y = bIdx % 2 === 0 ? 69 : 75;
    return { zone, x, y };
  });
}

function resolveWorld(explicitWorld: WorldDefinition | undefined, focusedZoneId: string): WorldDefinition {
  if (explicitWorld) return explicitWorld;
  for (const w of Object.values(WORLDS)) {
    if (w.zones.some((z) => z.id === focusedZoneId)) {
      return w;
    }
  }
  return ORIGENES_WORLD;
}

export const TacticalOriginMap: React.FC<TacticalOriginMapProps> = ({
  world,
  exploredZones,
  focusedZoneId,
  onSelectZone,
  compact = false,
}) => {
  const currentWorld = resolveWorld(world, focusedZoneId);
  const zones = currentWorld.zones;
  const focusedZone = zones.find((z) => z.id === focusedZoneId) ?? zones[0];
  const isFocusedExplored = focusedZone ? exploredZones.includes(focusedZone.id) : false;

  const exploredInWorld = zones.filter((z) => exploredZones.includes(z.id)).length;
  const layout = computeZoneLayout(zones);

  const svgPoints = layout.map((p) => `${Math.round(p.x * 10)},${Math.round(p.y * 5.62)}`).join(' ');
  const fallbackWorldArt =
    currentWorld.artwork ?? worldArtById[currentWorld.id] ?? '/assets/art/mundo-6-origenes.webp';

  return (
    <div
      className="editorial-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: compact ? 12 : 20,
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
          marginBottom: compact ? 8 : 12,
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Compass size={compact ? 15 : 19} color="#E8B86D" />
          <span
            className="font-mono"
            style={{
              fontSize: compact ? '0.68rem' : '0.82rem',
              color: 'var(--accent-gold)',
              letterSpacing: '0.06em',
            }}
          >
            MAPA DE EXPEDICIÓN · {currentWorld.title.toUpperCase()} ({exploredInWorld}/{zones.length} TERRITORIOS)
          </span>
        </div>
        <span className="badge-pill" style={{ fontSize: compact ? '0.64rem' : '0.74rem' }}>
          {currentWorld.grade ? `Grado ${currentWorld.grade}` : 'Vista Estratégica'}
        </span>
      </div>

      {/* Tablero cenital estilo estrategia con cuadrícula, rutas y niebla de guerra */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid rgba(232, 184, 109, 0.45)',
          boxShadow: 'inset 0 0 28px rgba(0,0,0,0.65)',
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
        <svg
          viewBox="0 0 1000 562"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <ellipse cx="240" cy="180" rx="180" ry="105" fill="none" stroke="rgba(56,189,248,0.09)" strokeWidth="1" />
          <ellipse cx="520" cy="340" rx="220" ry="125" fill="none" stroke="rgba(232,184,109,0.09)" strokeWidth="1" />
          <ellipse cx="790" cy="210" rx="170" ry="110" fill="none" stroke="rgba(52,211,153,0.09)" strokeWidth="1" />

          {svgPoints && (
            <polyline
              points={svgPoints}
              fill="none"
              stroke="rgba(232, 184, 109, 0.48)"
              strokeWidth="3"
              strokeDasharray="10 8"
              strokeLinejoin="round"
            />
          )}

          <g transform="translate(948, 510)" opacity="0.55">
            <circle cx="0" cy="0" r="22" fill="none" stroke="#E8B86D" strokeWidth="1" />
            <path d="M 0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z" fill="#E8B86D" opacity="0.65" />
            <text x="0" y="-25" textAnchor="middle" fill="#E8B86D" fontSize="9" fontFamily="JetBrains Mono">
              N
            </text>
          </g>
        </svg>

        {/* Nodos territoriales dinámicos sin solapes */}
        {layout.map(({ zone, x, y }) => {
          const explored = exploredZones.includes(zone.id);
          const focused = focusedZone?.id === zone.id;
          const artSrc =
            zone.artwork ?? LEGACY_ZONE_ARTWORKS[zone.id] ?? fallbackWorldArt;
          const medalSize = compact ? (zones.length > 5 ? 42 : 52) : zones.length > 5 ? 74 : 92;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone?.(zone.id)}
              disabled={!onSelectZone}
              title={`Zona ${zone.number}: ${zone.title}`}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: compact ? 3 : 6,
                cursor: onSelectZone ? 'pointer' : 'default',
                zIndex: focused ? 6 : 3,
              }}
              aria-label={`Zona ${zone.number}: ${zone.title}`}
            >
              <div
                style={{
                  position: 'relative',
                  width: medalSize,
                  height: medalSize,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${focused ? '#FDE68A' : explored ? zone.accentColor : 'rgba(148,163,184,0.35)'}`,
                  boxShadow: focused
                    ? `0 0 22px ${zone.accentColor}99`
                    : explored
                    ? '0 6px 16px rgba(0,0,0,0.65)'
                    : 'none',
                  background: '#0F172A',
                }}
              >
                <img
                  src={artSrc}
                  alt={zone.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: explored ? 'none' : 'grayscale(100%) brightness(0.25) blur(2px)',
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
                    <Lock size={compact ? 12 : 18} color="#94A3B8" />
                  </div>
                )}
              </div>

              <div
                style={{
                  maxWidth: compact ? 96 : 168,
                  padding: compact ? '2px 5px' : '4px 9px',
                  borderRadius: 2,
                  background: focused ? '#E8B86D' : '#0D1526',
                  border: `2px solid ${focused ? '#FDE68A' : 'rgba(232,184,109,0.4)'}`,
                  boxShadow: '2px 2px 0 #04070E',
                  color: focused ? '#060A13' : '#F8FAFC',
                  fontSize: compact ? '0.58rem' : '0.74rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {focused && <MapPin size={compact ? 9 : 11} style={{ flexShrink: 0 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {zone.number}. {zone.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pie de lectura rápida del territorio enfocado */}
      {!compact && focusedZone && (
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 2,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div className="font-mono" style={{ fontSize: '0.74rem', color: focusedZone.accentColor }}>
              TERRITORIO ACTUAL · ZONA {focusedZone.number}
              {focusedZone.resourceUnits?.length
                ? ` · UNIDADES DRIVE: ${focusedZone.resourceUnits.join(', ')}`
                : ''}
            </div>
            <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {isFocusedExplored ? focusedZone.title : 'Territorio cubierto por la niebla'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {isFocusedExplored
                ? focusedZone.subtitle
                : 'El Game Master revelará este territorio cuando comience su exploración.'}
            </div>
          </div>

          {focusedZone.narrativeBridge && isFocusedExplored && (
            <div style={{ maxWidth: 420, color: '#FDE68A', fontSize: '0.9rem', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Sparkles size={18} style={{ flexShrink: 0 }} />
              <span>{focusedZone.narrativeBridge}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
