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
import { getMission, getWorld, worldArtById, worldsByGrade } from '../data/catalog';
import {
  buildPublicProjectorView,
  getActiveStudentsCount,
  loadSessionState,
  subscribeToSession,
} from '../engine/sessionStore';
import type { SessionState } from '../engine/types';
import { CosmicBackdrop } from '../components/CosmicBackdrop';
import { GameHud } from '../components/clase/GameHud';
import { SceneVisualStage } from '../components/SceneVisualStage';
import { TacticalOriginMap } from '../components/TacticalOriginMap';
import { TitleBackdrop } from '../components/TitleBackdrop';

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
  // Filtro estricto: nunca exponer nombres, notas ni respuestas no reveladas
  const publicScene = buildPublicProjectorView(session, rawScene);
  const activeStudents = getActiveStudentsCount(session.students);

  const gradeWorlds = worldsByGrade[session.classroomName] ?? [];
  const activeWorld = gradeWorlds[0] ?? getWorld(mission.worldId);
  const hasWorldForGrade = gradeWorlds.length > 0;
  const worldArt = worldArtById[activeWorld.id] ?? '/assets/art/mundo-6-origenes.webp';

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="projector-root" style={{ zIndex: 1 }}>
      {session.projectorMode === 'intro' ? <TitleBackdrop /> : <CosmicBackdrop />}

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
            <Compass size={14} />{' '}
            {session.projectorMode === 'intro'
              ? `GRADO ${session.classroomName}`
              : session.projectorMode === 'map'
              ? `${activeWorld.title} · MAPA`
              : `${mission.code} · ${publicScene.code}`}
          </span>
          {session.projectorMode === 'scene' && (
            <span className="badge-pill" style={{ color: 'var(--accent-teal)', borderColor: 'var(--border-teal)' }}>
              {publicScene.participationLabel}
            </span>
          )}
        </div>

        {session.classStarted && <GameHud session={session} size="lg" />}

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
          className="pixel-frame animate-title-enter"
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
            <span style={{ color: 'var(--text-primary)', fontSize: '1.08rem', marginLeft: 6 }}>
              {session.activeEventBanner.subtitle}
            </span>
          </div>
        </div>
      )}

      {/* MODO 1: PANTALLA DE TÍTULO ÉPICA EN PROYECTOR */}
      {session.projectorMode === 'intro' && (
        <main
          key="mode-intro"
          className="animate-title-enter"
          style={{
            position: 'relative',
            zIndex: 2,
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            alignItems: 'center',
            gap: 32,
            maxWidth: 1360,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="pixel-badge" style={{ borderColor: '#38BDF8', color: '#7DD3FC', alignSelf: 'flex-start' }}>
              <Sparkles size={14} /> CIENCIAS SOCIALES · I.E.R. BOYACÁ
            </span>

            <div className="font-mono" style={{ fontSize: '1.05rem', color: '#FDE68A', fontWeight: 700 }}>
              GRADO {session.classroomName} · PERIODO {session.period}
            </div>

            <h1
              className="font-pixel"
              style={{
                fontSize: 'clamp(2.2rem, 4.6vw, 4.2rem)',
                margin: 0,
                lineHeight: 1.15,
                color: '#F8FAFC',
                textShadow: '4px 4px 0 #060A13, 6px 6px 0 rgba(232, 184, 109, 0.38)',
              }}
            >
              {hasWorldForGrade ? activeWorld.title : `GRADO ${session.classroomName}`}
            </h1>

            <p
              className="font-display"
              style={{
                fontSize: 'clamp(1.35rem, 2.3vw, 2rem)',
                color: 'var(--accent-gold)',
                margin: 0,
                fontStyle: 'italic',
                textShadow: '0 2px 10px rgba(0,0,0,0.85)',
              }}
            >
              {hasWorldForGrade
                ? activeWorld.subtitle
                : 'Narración, investigación y pensamiento histórico'}
            </p>

            <p className="font-pixel" style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', marginTop: 12 }}>
              LISTO PARA INICIAR LA CLASE
            </p>
          </div>

          <div className="pixel-frame" style={{ overflow: 'hidden', padding: 0 }}>
            <img
              src={hasWorldForGrade ? worldArt : '/assets/art/title-screen.webp'}
              alt={hasWorldForGrade ? activeWorld.title : `Grado ${session.classroomName}`}
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                display: 'block',
                imageRendering: 'pixelated',
              }}
            />
          </div>
        </main>
      )}

      {/* MODO 2: MAPA TÁCTICO TIPO ESTRATEGIA */}
      {session.projectorMode === 'map' && (
        <main
          key="mode-map"
          className="animate-title-enter"
          style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <TacticalOriginMap
            world={activeWorld}
            exploredZones={session.exploredZones}
            focusedZoneId={session.focusedZoneId}
          />
        </main>
      )}

      {/* MODO 3: PANTALLAZO NARRATIVO / ESCENA ACTIVA */}
      {session.projectorMode === 'scene' && (
        <main
          key={`mode-scene-${publicScene.id}`}
          className="animate-title-enter"
          style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}
        >
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

      {/* Pie de proyección: sin nombres ni notas de estudiantes */}
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
            Año {session.schoolYear} · {session.classroomName} · Periodo {session.period}
          </span>
          <span className="badge-pill" style={{ color: '#7DD3FC', borderColor: 'var(--border-teal)' }}>
            <Users size={13} />{' '}
            {activeStudents > 0 ? `${activeStudents} exploradores en clase` : 'Cuaderno de Campo'}
          </span>
        </div>
        <span className="font-pixel" style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
          CIENCIAS SOCIALES · I.E.R. BOYACÁ
        </span>
      </footer>
    </div>
  );
};
