import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Layers, MonitorPlay, Sparkles } from 'lucide-react';
import { ORIGENES_WORLD } from '../data/origenesWorld';
import { CosmicBackdrop } from '../components/CosmicBackdrop';
import { TacticalOriginMap } from '../components/TacticalOriginMap';

export const WorldMapPage: React.FC = () => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(ORIGENES_WORLD.zones[0].id);
  const selectedZone =
    ORIGENES_WORLD.zones.find((z) => z.id === selectedZoneId) ?? ORIGENES_WORLD.zones[0];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      <CosmicBackdrop accent={selectedZone.accentColor} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1240, margin: '0 auto', padding: '24px 20px 60px' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <Link to="/" className="btn btn-ghost">
            <ArrowLeft size={16} /> Inicio
          </Link>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/game-master" className="btn btn-primary">
              <MonitorPlay size={16} /> Dirigir en Aula (Game Master)
            </Link>
            <Link to="/explorar" className="btn">
              <Compass size={16} /> Modo Explorador
            </Link>
          </div>
        </nav>

        <header style={{ marginBottom: 22 }}>
          <span className="font-mono" style={{ color: 'var(--accent-gold)', fontSize: '0.82rem', letterSpacing: '0.1em' }}>
            MUNDO 1 · 5 A 6 CLASES DE UN AÑO DE 48 SESIONES
          </span>
          <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.3rem)', margin: '6px 0' }}>
            {ORIGENES_WORLD.title} — <span style={{ fontStyle: 'italic', color: 'var(--accent-gold)' }}>{ORIGENES_WORLD.subtitle}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 760, margin: 0, lineHeight: 1.6 }}>
            {ORIGENES_WORLD.description}
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 22, alignItems: 'start' }}>
          {/* Mapa Táctico Ilustrado */}
          <TacticalOriginMap
            exploredZones={ORIGENES_WORLD.zones.map((z) => z.id)}
            focusedZoneId={selectedZone.id}
            onSelectZone={setSelectedZoneId}
          />

          {/* Detalle de la zona seleccionada */}
          <div className="editorial-card" style={{ padding: 24 }}>
            <span className="badge-pill" style={{ color: selectedZone.accentColor, borderColor: selectedZone.accentColor }}>
              <Layers size={14} /> Zona {selectedZone.number}
            </span>
            <h2 className="font-display" style={{ fontSize: '2rem', margin: '12px 0 6px' }}>
              {selectedZone.title}
            </h2>
            <p style={{ color: 'var(--accent-gold)', margin: '0 0 12px', fontWeight: 500 }}>{selectedZone.subtitle}</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 18px' }}>{selectedZone.summary}</p>

            <h3 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 8px' }}>
              PREGUNTAS CLAVE
            </h3>
            <ul style={{ margin: '0 0 18px', paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.55 }}>
              {selectedZone.fundamentalQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>

            <h3 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
              NODOS DE EXPLORACIÓN
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedZone.nodes.map((node) => (
                <div
                  key={node.id}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{node.title}</strong>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: selectedZone.accentColor }}>
                      {node.kind.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{node.summary}</p>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {node.scientificDetail}
                  </p>
                  {node.culturalNote && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: '#FDE68A', lineHeight: 1.5 }}>
                      <strong>Diálogo cultural:</strong> {node.culturalNote}
                    </p>
                  )}
                  {node.linkedMissionId && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link to="/game-master" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: '0.82rem' }}>
                        <MonitorPlay size={14} /> Abrir en Consola Docente
                      </Link>
                      <Link to="/explorar" className="btn" style={{ padding: '7px 12px', fontSize: '0.82rem' }}>
                        <Sparkles size={14} /> Jugar en Modo Explorador
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedZone.narrativeBridge && (
              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid var(--border-gold)',
                  background: 'var(--accent-gold-soft)',
                }}
              >
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--accent-gold)' }}>
                  TRANSICIÓN NARRATIVA
                </span>
                <p className="font-display" style={{ fontSize: '1.35rem', margin: '6px 0 0' }}>
                  {selectedZone.narrativeBridge}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
