import React, { useEffect, useState } from 'react';
import {
  Compass,
  Lightbulb,
  Maximize2,
  PauseCircle,
  Radio,
  Sparkles,
  Users,
} from 'lucide-react';
import { getMission } from '../data/catalog';
import {
  buildPublicProjectorView,
  getActiveStudentsCount,
  loadSessionState,
  subscribeToSession,
} from '../engine/sessionStore';
import type { SessionState } from '../engine/types';
import { CosmicBackdrop } from '../components/CosmicBackdrop';
import { SceneVisualStage } from '../components/SceneVisualStage';
import { TacticalOriginMap } from '../components/TacticalOriginMap';

export const ProjectorPage: React.FC = () => {
  const [session, setSession] = useState<SessionState>(() => loadSessionState());

  useEffect(() => {
    const unsubscribe = subscribeToSession((nextState) => {
      setSession(nextState);
    });
    return unsubscribe;
  }, []);

  const mission = getMission(session.missionId);
  const rawScene = mission.scenes[session.activeSceneIndex] ?? mission.scenes[0];
  // Filtro estricto: nunca exponer notas privadas ni respuestas no reveladas
  const publicScene = buildPublicProjectorView(session, rawScene);
  const activeStudents = getActiveStudentsCount(session.students);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="projector-root" style={{ zIndex: 1 }}>
      <CosmicBackdrop />

      {/* Cabecera Retro Epic Pixel Art 16:9 */}
      <header
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="pixel-badge">
            <Compass size={14} /> {mission.code} · {session.projectorMode === 'map' ? 'MAPA' : publicScene.code}
          </span>
          {session.projectorMode === 'scene' && (
            <span className="badge-pill" style={{ color: 'var(--accent-teal)', borderColor: 'var(--border-teal)' }}>
              {publicScene.participationLabel}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {session.status === 'paused' && (
            <span className="pixel-badge" style={{ borderColor: '#FB7185', color: '#FECDD3' }}>
              <PauseCircle size={14} /> PAUSA
            </span>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleFullscreen}
            title="Pantalla completa"
            aria-label="Alternar pantalla completa"
            style={{ padding: '8px 10px' }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </header>

      {/* Aviso de evento rápido estilo videojuego */}
      {session.activeEventBanner && (
        <div
          className="pixel-frame"
          style={{
            position: 'relative',
            zIndex: 3,
            marginBottom: 14,
            padding: '12px 20px',
            borderColor: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Radio size={20} color="#E8B86D" />
          <div>
            <strong className="font-pixel" style={{ color: '#FDE68A', fontSize: '0.78rem' }}>
              {session.activeEventBanner.title}:
            </strong>{' '}
            <span style={{ color: 'var(--text-primary)', fontSize: '1.05rem', marginLeft: 6 }}>
              {session.activeEventBanner.subtitle}
            </span>
          </div>
        </div>
      )}

      {/* MODO 1: PANTALLA DE INICIO RETRO EPIC VIDEOJUEGO */}
      {session.projectorMode === 'intro' && (
        <main
          style={{
            position: 'relative',
            zIndex: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: 20,
          }}
        >
          <span className="pixel-badge" style={{ borderColor: '#38BDF8', color: '#7DD3FC' }}>
            <Sparkles size={14} /> CIENCIAS SOCIALES · AÑO {session.schoolYear} · {session.classroomName}
          </span>

          <h1
            className="font-pixel"
            style={{
              fontSize: 'clamp(2rem, 4.8vw, 4.1rem)',
              margin: '6px 0',
              lineHeight: 1.2,
              color: '#F8FAFC',
              textShadow: '4px 4px 0 #0D1526, 6px 6px 0 rgba(232, 184, 109, 0.35)',
            }}
          >
            ORÍGENES
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.2rem, 2.2vw, 1.8rem)',
              color: 'var(--accent-gold)',
              margin: 0,
              fontWeight: 600,
            }}
          >
            Del universo a la Tierra
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(120px, 210px))',
              gap: 14,
              marginTop: 6,
            }}
          >
            {[
              { img: '/assets/art/zona1-cosmos.jpg', label: '1. El comienzo' },
              { img: '/assets/art/zona2-sistema-solar.jpg', label: '2. Vecindario' },
              { img: '/assets/art/zona3-pangea.jpg', label: '3. Planeta vivo' },
              { img: '/assets/art/zona4-vida.jpg', label: '4. Umbral de vida' },
            ].map((item) => (
              <div key={item.label} className="pixel-frame" style={{ overflow: 'hidden', padding: 0 }}>
                <img
                  src={item.img}
                  alt={item.label}
                  style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '8px 10px', fontSize: '0.88rem', fontWeight: 700, color: '#FDE68A' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <p className="font-pixel" style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', marginTop: 10 }}>
            PRESS START EN LA CONSOLA DEL GAME MASTER
          </p>
        </main>
      )}

      {/* MODO 2: MAPA TÁCTICO TIPO ESTRATEGIA */}
      {session.projectorMode === 'map' && (
        <main style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <TacticalOriginMap
            exploredZones={session.exploredZones}
            focusedZoneId={session.focusedZoneId}
          />
        </main>
      )}

      {/* MODO 3: PANTALLAZO NARRATIVO / ESCENA ACTIVA */}
      {session.projectorMode === 'scene' && (
        <main style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          <div>
            <h1
              className="font-pixel"
              style={{
                fontSize: 'clamp(1.25rem, 2.3vw, 2.05rem)',
                margin: '0 0 10px',
                lineHeight: 1.35,
                color: '#F8FAFC',
              }}
            >
              {publicScene.title}
            </h1>
            {publicScene.type !== 'opening' && (
              <p
                style={{
                  fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)',
                  color: 'var(--accent-gold)',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {publicScene.promptQuestion}
              </p>
            )}
          </div>

          <SceneVisualStage scene={publicScene} activeInspectionId={session.activeInspectionId} />

          {publicScene.visibleHints.length > 0 && (
            <div
              className="pixel-frame"
              style={{
                padding: '12px 18px',
                borderColor: '#E8B86D',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Lightbulb size={20} color="#E8B86D" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {publicScene.visibleHints.map((hint, idx) => (
                  <div key={idx} style={{ fontSize: '1.04rem', color: '#FDE68A' }}>
                    <strong>Pista {idx + 1}:</strong> {hint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.voting.open && session.voting.options.length > 0 && (
            <div className="pixel-frame" style={{ padding: '14px 20px', borderColor: '#38BDF8' }}>
              <div className="font-pixel" style={{ fontSize: '0.68rem', color: 'var(--accent-teal)', marginBottom: 10 }}>
                VOTACIÓN DEL GRUPO
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {session.voting.options.map((opt) => (
                  <div
                    key={opt.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: '0.96rem' }}>{opt.label}</span>
                    <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {opt.votes}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {publicScene.revealed && publicScene.publicAnswerSummary && (
            <div
              className="pixel-frame"
              style={{
                padding: '16px 22px',
                borderColor: '#34D399',
                background: 'rgba(6, 78, 59, 0.45)',
              }}
            >
              <div className="font-pixel" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6EE7B7', fontSize: '0.72rem', marginBottom: 8 }}>
                <Sparkles size={16} /> HALLAZGO REVELADO
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '1.12rem', color: 'var(--text-primary)' }}>
                {publicScene.publicAnswerSummary}
              </p>
              {publicScene.scientificFeedback && (
                <p style={{ margin: 0, fontSize: '0.98rem', color: '#D1FAE5' }}>{publicScene.scientificFeedback}</p>
              )}
            </div>
          )}
        </main>
      )}

      {/* Pie de proyección: modo individual + año escolar */}
      <footer
        style={{
          position: 'relative',
          zIndex: 2,
          marginTop: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          borderTop: '2px solid rgba(232, 184, 109, 0.25)',
          paddingTop: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge-pill" style={{ color: '#FDE68A', borderColor: 'var(--border-gold)' }}>
            Año {session.schoolYear} · {session.classroomName}
          </span>
          <span className="badge-pill" style={{ color: '#7DD3FC', borderColor: 'var(--border-teal)' }}>
            <Users size={13} />{' '}
            {activeStudents > 0 ? `${activeStudents} exploradores activos` : 'Modo Individual · Cuaderno'}
          </span>
        </div>
        <span className="font-pixel" style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
          CIENCIAS SOCIALES
        </span>
      </footer>
    </div>
  );
};
