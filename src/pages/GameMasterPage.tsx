import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FolderOpen,
  Gamepad2,
  Lightbulb,
  Map as MapIcon,
  MonitorPlay,
  Pause,
  Play,
  Radio,
  Square,
  Users,
} from 'lucide-react';
import { getMission, MISSIONS_LIST } from '../data/catalog';
import { ORIGENES_WORLD } from '../data/origenesWorld';
import {
  changeSceneState,
  createInitialSessionState,
  getActiveStudentsCount,
  getAttendanceOnClassDate,
  getTodayIsoDate,
  loadSessionState,
  recordAttendanceSnapshot,
  saveAndBroadcastSession,
  subscribeToNewerSession,
} from '../engine/sessionStore';
import type {
  ActiveEventBanner,
  ProjectorViewMode,
  SessionState,
} from '../engine/types';
import { TitleBackdrop } from '../components/TitleBackdrop';
import { DiskStatusBadge } from '../components/gm/DiskStatusBadge';
import { ResourceBank } from '../components/gm/ResourceBank';
import { ClassSettings } from '../components/gm/ClassSettings';
import { StudentArena } from '../components/gm/StudentArena';
import { requestDiskBackup } from '../engine/diskSync';
import { TacticalOriginMap } from '../components/TacticalOriginMap';

const QUICK_EVENTS: ActiveEventBanner[] = [
  {
    id: 'ev-cuaderno',
    title: 'Cuaderno de Campo',
    subtitle: 'Escriban su idea en el cuaderno con sus propias palabras.',
    kind: 'cuaderno',
  },
  {
    id: 'ev-debate',
    title: 'Participación',
    subtitle: 'Levanten la mano para compartir qué piensan y por qué.',
    kind: 'debate',
  },
  {
    id: 'ev-cosmos',
    title: 'Mapa de Expedición',
    subtitle: 'Observemos en qué territorio del viaje estamos hoy.',
    kind: 'cosmos',
  },
];

type MainTab = 'tablero' | 'estudiantes' | 'recursos';

export const GameMasterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const [mainTab, setMainTab] = useState<MainTab>(
    initialTabParam === 'estudiantes'
      ? 'estudiantes'
      : initialTabParam === 'recursos'
      ? 'recursos'
      : 'tablero'
  );

  const [session, setSession] = useState<SessionState>(() => loadSessionState());
  const [decisionText, setDecisionText] = useState('');
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);

  const [guideSubTab, setGuideSubTab] = useState<'guion' | 'ritmo' | 'glosario'>('guion');

  const mission = getMission(session.missionId);
  const scene = mission.scenes[session.activeSceneIndex] ?? mission.scenes[0];
  const activeStudentsCount = getActiveStudentsCount(session.students);

  // Otra ventana del mismo navegador (portada, grupos) puede cambiar la sesión
  useEffect(() => subscribeToNewerSession(setSession), []);

  const commit = (updater: (prev: SessionState) => SessionState) => {
    setSession((prev) => {
      const next = updater(prev);
      return saveAndBroadcastSession(next);
    });
  };

  const handleOpenProjector = () => {
    window.open('/projector', 'expedicion6-projector', 'noopener,noreferrer');
  };

  const handleSelectMission = (nextMissionId: string) => {
    const nextMission = getMission(nextMissionId);
    commit((prev) => ({
      ...prev,
      missionId: nextMission.id,
      activeSceneIndex: 0,
      revealed: false,
      revealedHintsCount: 0,
      voting: {
        open: false,
        question: nextMission.scenes[0].promptQuestion,
        options: (nextMission.scenes[0].challengeData?.defaultVoteOptions ?? []).map((o) => ({
          id: o.id,
          label: o.label,
          votes: 0,
        })),
      },
    }));
  };

  const handleStartSession = () => {
    commit((prev) => {
      const fresh = createInitialSessionState(mission.id);
      return {
        ...fresh,
        active: true,
        classStarted: true,
        classDate: prev.classDate || getTodayIsoDate(),
        status: 'running',
        schoolYear: prev.schoolYear,
        classroomName: prev.classroomName,
        period: prev.period,
        resources: prev.resources,
        students: prev.students,
        attendanceByDate: prev.attendanceByDate,
        periodByDate: prev.periodByDate,
        gradeConfig: prev.gradeConfig,
        rostersByClassroom: prev.rostersByClassroom,
        projectorMode: 'scene',
        exploredZones: prev.exploredZones.length ? prev.exploredZones : ['zona-1'],
        focusedZoneId: prev.focusedZoneId || 'zona-1',
      };
    });
  };

  const handleTogglePauseSession = () => {
    commit((prev) => ({
      ...prev,
      status: prev.status === 'paused' ? 'running' : 'paused',
    }));
  };

  const handleCloseSession = () => {
    commit((prev) => ({
      ...prev,
      active: false,
      classStarted: false,
      status: 'completed',
      projectorMode: 'intro',
      activeEventBanner: null,
    }));
    // Respaldo con nombre al terminar cada clase, después de que el cierre se guarde
    window.setTimeout(() => {
      void requestDiskBackup(`cierre-${session.classroomName}`);
    }, 0);
  };

  const handleSetProjectorMode = (mode: ProjectorViewMode) => {
    commit((prev) => ({ ...prev, projectorMode: mode }));
  };

  const handleToggleZoneFog = (zoneId: string) => {
    commit((prev) => {
      const exists = prev.exploredZones.includes(zoneId);
      const nextZones = exists
        ? prev.exploredZones.filter((z) => z !== zoneId)
        : [...prev.exploredZones, zoneId];
      return {
        ...prev,
        exploredZones: nextZones.length ? nextZones : ['zona-1'],
        focusedZoneId: zoneId,
      };
    });
  };

  const handleFocusZone = (zoneId: string) => {
    commit((prev) => ({
      ...prev,
      focusedZoneId: zoneId,
      exploredZones: prev.exploredZones.includes(zoneId) ? prev.exploredZones : [...prev.exploredZones, zoneId],
    }));
  };

  const handleGoToScene = (index: number) => {
    const targetScene = mission.scenes[Math.max(0, Math.min(mission.scenes.length - 1, index))];
    commit((prev) => ({
      ...changeSceneState(prev, index, targetScene, mission.scenes.length),
      projectorMode: 'scene',
    }));
  };

  const handleSaveAttendanceToday = () => {
    // Confirma la lista del día: lo no marcado queda Presente
    commit((prev) =>
      recordAttendanceSnapshot({
        ...prev,
        students: prev.students.map((s) => ({ ...s, attendanceToday: getAttendanceOnClassDate(prev, s.id) })),
      })
    );
    setAttendanceSavedToast(true);
    window.setTimeout(() => setAttendanceSavedToast(false), 2500);
  };

  const handleRecordDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionText.trim()) return;
    commit((prev) => ({
      ...prev,
      decisions: [
        {
          id: `dec-${Date.now().toString(36)}`,
          sceneId: scene.id,
          summary: decisionText.trim(),
          timestamp: Date.now(),
        },
        ...prev.decisions,
      ],
    }));
    setDecisionText('');
  };

  const savedDatesCount = Object.keys(session.attendanceByDate).length;

  return (
    <div className="retro-scope" style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      <TitleBackdrop vignette="full" />
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(6, 10, 19, 0.62)' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1440, margin: '0 auto', padding: '16px 20px 48px' }}>
        {/* Barra superior tipo HUD de videojuego */}
        <header
          className="retro-hud"
          style={{
            marginBottom: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-ghost" style={{ padding: '7px 12px' }}>
              <ArrowLeft size={16} /> Inicio
            </Link>
            <span className="retro-hud__title">
              GAME MASTER
            </span>
            <span className="badge-pill" style={{ color: session.classStarted ? '#6EE7B7' : '#94A3B8' }}>
              {session.classStarted ? 'En clase' : 'Solo gestión'} · {session.classDate} · {session.classroomName} · P{session.period}
            </span>
            <DiskStatusBadge />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {!session.active ? (
              <button type="button" className="btn btn-primary" onClick={handleStartSession}>
                <Play size={16} /> Iniciar clase
              </button>
            ) : (
              <>
                <button type="button" className="btn" onClick={handleTogglePauseSession}>
                  {session.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                  {session.status === 'paused' ? 'Reanudar' : 'Pausar'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={handleCloseSession}>
                  <Square size={15} /> Cerrar clase
                </button>
              </>
            )}

            <button type="button" className="btn btn-teal" onClick={handleOpenProjector}>
              <MonitorPlay size={16} /> Abrir Proyector
            </button>
          </div>
        </header>

        {/* Menú de juego principal con cursor ➤ */}
        <nav className="retro-tabs" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`retro-tab${mainTab === 'tablero' ? ' is-active' : ''}`}
            onClick={() => setMainTab('tablero')}
          >
            <Gamepad2 size={16} /> Tablero de Clase
          </button>
          <button
            type="button"
            className={`retro-tab${mainTab === 'estudiantes' ? ' is-active' : ''}`}
            onClick={() => setMainTab('estudiantes')}
          >
            <Users size={16} /> Estudiantes ({activeStudentsCount})
          </button>
          <button
            type="button"
            className={`retro-tab${mainTab === 'recursos' ? ' is-active' : ''}`}
            onClick={() => setMainTab('recursos')}
          >
            <FolderOpen size={16} /> Banco de Recursos
          </button>
        </nav>

        {/* ==================== TAB 1: TABLERO DE CLASE ==================== */}
        {mainTab === 'tablero' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Barra de control de proyector y avisos */}
            <section
              className="editorial-card"
              style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <select
                  aria-label="Seleccionar misión"
                  value={mission.id}
                  onChange={(e) => handleSelectMission(e.target.value)}
                  style={{
                    background: '#0F172A',
                    color: '#FDE68A',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontWeight: 600,
                  }}
                >
                  {MISSIONS_LIST.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code}: {m.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className={session.projectorMode === 'intro' ? 'btn btn-primary' : 'btn btn-ghost'}
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  onClick={() => handleSetProjectorMode('intro')}
                >
                  <Gamepad2 size={15} /> Portada
                </button>
                <button
                  type="button"
                  className={session.projectorMode === 'map' ? 'btn btn-primary' : 'btn btn-ghost'}
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  onClick={() => handleSetProjectorMode('map')}
                >
                  <MapIcon size={15} /> Mapa AoE
                </button>
                <button
                  type="button"
                  className={session.projectorMode === 'scene' ? 'btn btn-primary' : 'btn btn-ghost'}
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  onClick={() => handleSetProjectorMode('scene')}
                >
                  <MonitorPlay size={15} /> Pantallazo
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--accent-teal)' }}>
                  <Radio size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  AVISO:
                </span>
                {QUICK_EVENTS.map((ev) => {
                  const active = session.activeEventBanner?.id === ev.id;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className={active ? 'btn btn-teal' : 'btn btn-ghost'}
                      style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      onClick={() =>
                        commit((prev) => ({
                          ...prev,
                          activeEventBanner: active ? null : ev,
                        }))
                      }
                    >
                      {ev.title}
                    </button>
                  );
                })}
                {session.activeEventBanner && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '5px 8px', fontSize: '0.76rem' }}
                    onClick={() => commit((prev) => ({ ...prev, activeEventBanner: null }))}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </section>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 16,
                alignItems: 'start',
              }}
            >
              {/* Mapa Táctico + Niebla */}
              <section className="editorial-card" style={{ padding: 14 }}>
                <TacticalOriginMap
                  compact
                  exploredZones={session.exploredZones}
                  focusedZoneId={session.focusedZoneId}
                  onSelectZone={handleFocusZone}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {ORIGENES_WORLD.zones.map((z) => {
                    const explored = session.exploredZones.includes(z.id);
                    return (
                      <button
                        key={z.id}
                        type="button"
                        className="btn"
                        style={{
                          padding: '4px 9px',
                          fontSize: '0.74rem',
                          borderColor: explored ? z.accentColor : 'var(--border-subtle)',
                          background: explored ? 'rgba(255,255,255,0.06)' : 'transparent',
                        }}
                        onClick={() => handleToggleZoneFog(z.id)}
                      >
                        {explored ? `Z${z.number} Visible` : `Z${z.number} Niebla`}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Control de Pantallazos + Pistas + Votación */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <section className="editorial-card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                      PANTALLAZOS ({session.activeSceneIndex + 1}/{mission.scenes.length})
                    </span>
                    <span className="badge-pill">Narración</span>
                  </div>

                  <h2 className="font-display" style={{ fontSize: '1.5rem', margin: '0 0 6px' }}>
                    {scene.code}: {scene.title}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 14px' }}>
                    {scene.promptQuestion}
                  </p>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ flex: 1 }}
                      disabled={session.activeSceneIndex === 0}
                      onClick={() => handleGoToScene(session.activeSceneIndex - 1)}
                    >
                      <ChevronLeft size={16} /> Anterior
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={session.activeSceneIndex >= mission.scenes.length - 1}
                      onClick={() => handleGoToScene(session.activeSceneIndex + 1)}
                    >
                      Siguiente <ChevronRight size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {mission.scenes.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="btn"
                        onClick={() => handleGoToScene(s.index)}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.78rem',
                          borderColor:
                            s.index === session.activeSceneIndex ? 'var(--accent-gold)' : 'var(--border-subtle)',
                          background:
                            s.index === session.activeSceneIndex ? 'var(--accent-gold-soft)' : 'transparent',
                        }}
                      >
                        P{s.index + 1}
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <Lightbulb size={15} style={{ verticalAlign: 'text-bottom' }} /> Pistas:{' '}
                        <strong>
                          {session.revealedHintsCount}/{scene.hints.length}
                        </strong>
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          disabled={session.revealedHintsCount >= scene.hints.length}
                          onClick={() =>
                            commit((prev) => ({
                              ...prev,
                              revealedHintsCount: Math.min(scene.hints.length, prev.revealedHintsCount + 1),
                            }))
                          }
                        >
                          Revelar pista
                        </button>
                        {session.revealedHintsCount > 0 && (
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                            onClick={() => commit((prev) => ({ ...prev, revealedHintsCount: 0 }))}
                          >
                            Ocultar
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={session.revealed ? 'btn' : 'btn btn-primary'}
                      onClick={() => commit((prev) => ({ ...prev, revealed: !prev.revealed }))}
                    >
                      {session.revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                      {session.revealed ? 'Ocultar hallazgo en proyector' : 'Revelar hallazgo'}
                    </button>
                  </div>
                </section>

                {/* Votación */}
                <section className="editorial-card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <BarChart3 size={16} color="#E8B86D" /> Votación (Mano alzada)
                    </span>
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                      onClick={() =>
                        commit((prev) => ({
                          ...prev,
                          voting: { ...prev.voting, open: !prev.voting.open },
                        }))
                      }
                    >
                      {session.voting.open ? 'Cerrar en proyector' : 'Mostrar en proyector'}
                    </button>
                  </div>

                  {session.voting.options.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      Pantallazo de narración y cuaderno individual.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {session.voting.options.map((opt) => (
                        <div
                          key={opt.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.03)',
                          }}
                        >
                          <span style={{ fontSize: '0.86rem', flex: 1 }}>{opt.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ padding: '3px 8px' }}
                              onClick={() =>
                                commit((prev) => ({
                                  ...prev,
                                  voting: {
                                    ...prev.voting,
                                    options: prev.voting.options.map((o) =>
                                      o.id === opt.id ? { ...o, votes: Math.max(0, o.votes - 1) } : o
                                    ),
                                  },
                                }))
                              }
                            >
                              -
                            </button>
                            <span className="font-mono" style={{ minWidth: 22, textAlign: 'center', fontWeight: 700 }}>
                              {opt.votes}
                            </span>
                            <button
                              type="button"
                              className="btn"
                              style={{ padding: '3px 8px' }}
                              onClick={() =>
                                commit((prev) => ({
                                  ...prev,
                                  voting: {
                                    ...prev.voting,
                                    options: prev.voting.options.map((o) =>
                                      o.id === opt.id ? { ...o, votes: o.votes + 1 } : o
                                    ),
                                  },
                                }))
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Guion privado + Glosario */}
              <section className="editorial-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={guideSubTab === 'guion' ? 'btn btn-primary' : 'btn btn-ghost'}
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    onClick={() => setGuideSubTab('guion')}
                  >
                    Guion
                  </button>
                  <button
                    type="button"
                    className={guideSubTab === 'ritmo' ? 'btn btn-primary' : 'btn btn-ghost'}
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    onClick={() => setGuideSubTab('ritmo')}
                  >
                    <Calendar size={14} /> 48 Clases
                  </button>
                  <button
                    type="button"
                    className={guideSubTab === 'glosario' ? 'btn btn-primary' : 'btn btn-ghost'}
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    onClick={() => setGuideSubTab('glosario')}
                  >
                    <BookOpen size={14} /> Glosario
                  </button>
                </div>

                {guideSubTab === 'guion' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem', lineHeight: 1.55 }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--accent-gold)' }}>
                        PROPÓSITO
                      </span>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{scene.teacherNotes.pedagogicalGoal}</p>
                    </div>
                    <div>
                      <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--accent-teal)' }}>
                        GUION PARA NARRAR
                      </span>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{scene.teacherNotes.facilitationScript}</p>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                      <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)' }}>
                        IDEA CLAVE
                      </span>
                      <p style={{ margin: '4px 0 0', color: '#A7F3D0' }}>{scene.publicAnswerSummary}</p>
                    </div>
                    <form onSubmit={handleRecordDecision} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <input
                        type="text"
                        placeholder="Nota rápida de la clase..."
                        value={decisionText}
                        onChange={(e) => setDecisionText(e.target.value)}
                        style={{
                          flex: 1,
                          background: '#0F172A',
                          color: '#F8FAFC',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 6,
                          padding: '6px 8px',
                          fontSize: '0.82rem',
                        }}
                      />
                      <button type="submit" className="btn" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                        Anotar
                      </button>
                    </form>
                    {session.decisions.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {session.decisions.slice(0, 5).map((d) => (
                          <li key={d.id}>{d.summary}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {guideSubTab === 'ritmo' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', lineHeight: 1.55 }}>
                    <strong style={{ color: 'var(--accent-gold)' }}>Año de 48 clases · Mundo 1 = 5 a 6 clases</strong>
                    <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)' }}>
                      <li><strong>Clase 1 (Misión 00):</strong> Las reglas del viaje.</li>
                      <li><strong>Clase 2 (Misión 01):</strong> El comienzo de todo.</li>
                      <li><strong>Clase 3:</strong> Ciencia y relatos culturales del origen.</li>
                      <li><strong>Clase 4:</strong> Nuestro vecindario cósmico y la Tierra.</li>
                      <li><strong>Clase 5:</strong> Tiempo profundo, Pangea y relieve vivo.</li>
                      <li><strong>Clase 6:</strong> El umbral de la vida y cierre del mundo.</li>
                    </ul>
                  </div>
                )}

                {guideSubTab === 'glosario' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {mission.glossary.map((g) => (
                      <div key={g.term} style={{ paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
                        <strong style={{ color: 'var(--accent-gold)' }}>{g.term}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {g.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ESTUDIANTES (ASISTENCIA POR FECHA + HETEROEVALUACIÓN) ==================== */}
        {mainTab === 'estudiantes' && (
          <div className="gm-students">
            <StudentArena session={session} commit={commit} />
            <ClassSettings
              session={session}
              commit={commit}
              onSaveAttendance={handleSaveAttendanceToday}
              attendanceSaved={attendanceSavedToast}
              savedDatesCount={savedDatesCount}
            />
          </div>
        )}

        {/* ==================== TAB 3: BANCO DE RECURSOS (GOOGLE DRIVE EN VIVO) ==================== */}
        {mainTab === 'recursos' && <ResourceBank session={session} commit={commit} />}
      </div>
    </div>
  );
};
