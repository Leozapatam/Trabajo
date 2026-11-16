import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FolderOpen,
  Gamepad2,
  Lightbulb,
  Map as MapIcon,
  MonitorPlay,
  Pause,
  Play,
  Plus,
  Radio,
  Square,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react';
import { getMission, MISSIONS_LIST } from '../data/catalog';
import { ORIGENES_WORLD } from '../data/origenesWorld';
import {
  addResourceItem,
  addStudentsFromText,
  awardStudentPoints,
  calculateStudentGrade,
  changeSceneState,
  createInitialSessionState,
  getActiveStudentsCount,
  getStudentTotalPoints,
  getTodayIsoDate,
  loadSessionState,
  recordAttendanceSnapshot,
  removeResourceItem,
  saveAndBroadcastSession,
  setStudentAttendance,
  switchClassroomRoster,
  toggleResourceUsed,
  toggleStudentActive,
} from '../engine/sessionStore';
import type {
  ActiveEventBanner,
  AttendanceStatus,
  ProjectorViewMode,
  RecognitionCategory,
  ResourceItem,
  SessionState,
} from '../engine/types';
import { CosmicBackdrop } from '../components/CosmicBackdrop';
import { TacticalOriginMap } from '../components/TacticalOriginMap';

const CATEGORY_LABELS: { key: RecognitionCategory; label: string; color: string }[] = [
  { key: 'investigacion', label: 'Investigación', color: '#38BDF8' },
  { key: 'participacion', label: 'Participación', color: '#E8B86D' },
  { key: 'comportamiento', label: 'Comportamiento', color: '#34D399' },
  { key: 'actitudinal', label: 'Actitudinal', color: '#F472B6' },
];

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
  const [bulkNames, setBulkNames] = useState('');
  const [decisionText, setDecisionText] = useState('');
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<ResourceItem['type']>('diapositivas');
  const [resZoneId, setResZoneId] = useState<string>(session.focusedZoneId || 'zona-1');
  const [resFilterCurrentZone, setResFilterCurrentZone] = useState(false);

  const [guideSubTab, setGuideSubTab] = useState<'guion' | 'ritmo' | 'glosario'>('guion');

  const mission = getMission(session.missionId);
  const scene = mission.scenes[session.activeSceneIndex] ?? mission.scenes[0];
  const activeStudentsCount = getActiveStudentsCount(session.students);

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

  const handleAddStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkNames.trim()) return;
    commit((prev) => addStudentsFromText(prev, bulkNames));
    setBulkNames('');
  };

  const handleSaveAttendanceToday = () => {
    commit((prev) => recordAttendanceSnapshot(prev));
    setAttendanceSavedToast(true);
    window.setTimeout(() => setAttendanceSavedToast(false), 2500);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;
    commit((prev) =>
      addResourceItem(prev, {
        title: resTitle.trim(),
        url: resUrl.trim(),
        type: resType,
        zoneId: resZoneId,
      })
    );
    setResTitle('');
    setResUrl('');
  };

  const handleCopyPath = (id: string, path: string) => {
    navigator.clipboard?.writeText(path).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
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

  const visibleResources = resFilterCurrentZone
    ? session.resources.filter((r) => r.zoneId === session.focusedZoneId)
    : session.resources;

  const savedDatesCount = Object.keys(session.attendanceByDate).length;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      <CosmicBackdrop />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1440, margin: '0 auto', padding: '16px 20px 48px' }}>
        {/* Barra superior de aplicación web */}
        <header
          className="editorial-card"
          style={{
            padding: '12px 18px',
            marginBottom: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            borderColor: 'var(--border-gold)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-ghost" style={{ padding: '7px 12px' }}>
              <ArrowLeft size={16} /> Inicio
            </Link>
            <span className="font-pixel" style={{ fontSize: '0.68rem', color: 'var(--accent-gold)' }}>
              GAME MASTER
            </span>
            <span className="badge-pill" style={{ color: session.classStarted ? '#6EE7B7' : '#94A3B8' }}>
              {session.classStarted ? 'En clase' : 'Solo gestión'} · {session.classDate} · {session.classroomName} · P{session.period}
            </span>
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

        {/* Navegación principal del Tablero Web */}
        <nav
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className={mainTab === 'tablero' ? 'btn btn-primary' : 'btn'}
            onClick={() => setMainTab('tablero')}
          >
            <Gamepad2 size={16} /> Tablero de Clase
          </button>
          <button
            type="button"
            className={mainTab === 'estudiantes' ? 'btn btn-primary' : 'btn'}
            onClick={() => setMainTab('estudiantes')}
          >
            <Users size={16} /> Estudiantes ({activeStudentsCount})
          </button>
          <button
            type="button"
            className={mainTab === 'recursos' ? 'btn btn-primary' : 'btn'}
            onClick={() => setMainTab('recursos')}
          >
            <FolderOpen size={16} /> Banco de Recursos ({session.resources.length})
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, alignItems: 'start' }}>
            {/* Registro manual de fecha, clase iniciada y carga de estudiantes */}
            <section className="editorial-card" style={{ padding: 20 }}>
              <h2 className="font-display" style={{ fontSize: '1.6rem', margin: '0 0 14px' }}>
                Registro de Clase y Asistencia
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Fecha de registro
                  <input
                    type="date"
                    value={session.classDate}
                    onChange={(e) => commit((prev) => ({ ...prev, classDate: e.target.value }))}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      background: '#0F172A',
                      color: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '7px 8px',
                    }}
                  />
                </label>

                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ¿Se inicia clase hoy?
                  <button
                    type="button"
                    className={session.classStarted ? 'btn btn-teal' : 'btn'}
                    style={{ width: '100%', marginTop: 4, padding: '7px 10px' }}
                    onClick={() =>
                      commit((prev) => ({
                        ...prev,
                        classStarted: !prev.classStarted,
                        active: !prev.classStarted,
                        status: !prev.classStarted ? 'running' : 'idle',
                      }))
                    }
                  >
                    {session.classStarted ? 'Sí · Clase iniciada' : 'No · Solo gestión'}
                  </button>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Año
                  <input
                    type="text"
                    value={session.schoolYear}
                    onChange={(e) =>
                      commit((prev) => switchClassroomRoster(prev, e.target.value, prev.classroomName))
                    }
                    style={{
                      width: '100%',
                      marginTop: 4,
                      background: '#0F172A',
                      color: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  />
                </label>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Salón
                  <input
                    type="text"
                    value={session.classroomName}
                    onChange={(e) =>
                      commit((prev) => switchClassroomRoster(prev, prev.schoolYear, e.target.value))
                    }
                    style={{
                      width: '100%',
                      marginTop: 4,
                      background: '#0F172A',
                      color: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  />
                </label>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Periodo (3 al año)
                  <select
                    value={session.period}
                    onChange={(e) =>
                      commit((prev) => ({ ...prev, period: Number(e.target.value) as 1 | 2 | 3 }))
                    }
                    style={{
                      width: '100%',
                      marginTop: 4,
                      background: '#0F172A',
                      color: '#FDE68A',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  >
                    <option value={1}>Periodo 1</option>
                    <option value={2}>Periodo 2</option>
                    <option value={3}>Periodo 3</option>
                  </select>
                </label>
              </div>

              {/* Conversión matemática a nota de 1.0 a 5.0 */}
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid var(--border-teal)',
                  marginBottom: 14,
                }}
              >
                <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', marginBottom: 6 }}>
                  ESCALA DE NOTA (1.0 A 5.0 CON DECIMALES)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Nota base
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={session.gradeConfig.baseGrade}
                      onChange={(e) =>
                        commit((prev) => ({
                          ...prev,
                          gradeConfig: { ...prev.gradeConfig, baseGrade: Number(e.target.value) || 3.5 },
                        }))
                      }
                      style={{
                        width: '100%',
                        marginTop: 4,
                        background: '#0F172A',
                        color: '#F8FAFC',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        padding: '5px 8px',
                      }}
                    />
                  </label>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Valor por punto (+/-)
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="1"
                      value={session.gradeConfig.stepPerPoint}
                      onChange={(e) =>
                        commit((prev) => ({
                          ...prev,
                          gradeConfig: { ...prev.gradeConfig, stepPerPoint: Number(e.target.value) || 0.1 },
                        }))
                      }
                      style={{
                        width: '100%',
                        marginTop: 4,
                        background: '#0F172A',
                        color: '#F8FAFC',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        padding: '5px 8px',
                      }}
                    />
                  </label>
                </div>
              </div>

              <form onSubmit={handleAddStudents} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  rows={3}
                  placeholder="Agregar estudiantes (uno por línea o separados por coma)..."
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    color: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: '0.86rem',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <Plus size={16} /> Agregar estudiantes
                  </button>
                  {session.students.length > 0 && (
                    <button type="button" className="btn btn-teal" onClick={handleSaveAttendanceToday}>
                      <CheckCircle2 size={16} /> Guardar asistencia ({session.classDate})
                    </button>
                  )}
                </div>
                {attendanceSavedToast && (
                  <span style={{ fontSize: '0.84rem', color: '#6EE7B7' }}>
                    Asistencia del {session.classDate} guardada. ({savedDatesCount} fechas registradas).
                  </span>
                )}
              </form>
            </section>

            {/* Lista de estudiantes */}
            <section className="editorial-card" style={{ padding: 20, gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 className="font-display" style={{ fontSize: '1.6rem', margin: 0 }}>
                  Lista de Estudiantes ({activeStudentsCount} activos / {session.students.length})
                </h2>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Fechas guardadas: {savedDatesCount}
                </span>
              </div>

              {session.students.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                  Agrega tu lista de estudiantes a la izquierda para tomar asistencia (Presente, Ausente, Excusa) y llevar puntos +1 / -1 de heteroevaluación.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 560, overflowY: 'auto' }}>
                  {session.students.map((st) => {
                    const total = getStudentTotalPoints(st);
                    const grade = calculateStudentGrade(st, session.gradeConfig);
                    return (
                      <div
                        key={st.id}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          border: '1px solid var(--border-subtle)',
                          background: st.active ? 'rgba(255,255,255,0.03)' : 'rgba(251,113,133,0.06)',
                          opacity: st.active ? 1 : 0.65,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '1rem', textDecoration: st.active ? 'none' : 'line-through' }}>
                              {st.name}
                            </span>
                            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Historial: {st.attendanceHistory.presentes}P · {st.attendanceHistory.ausentes}A · {st.attendanceHistory.excusas}E
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              className="badge-pill"
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: grade < 3.0 ? '#FECDD3' : '#6EE7B7',
                                borderColor: grade < 3.0 ? '#FB7185' : '#34D399',
                              }}
                            >
                              Nota: {grade.toFixed(1)}
                            </span>
                            <span
                              className="font-mono"
                              style={{
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                color: total < 0 ? '#FB7185' : 'var(--accent-gold)',
                              }}
                            >
                              {total > 0 ? `+${total}` : total} pts
                            </span>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => commit((prev) => toggleStudentActive(prev, st.id))}
                            >
                              {st.active ? <UserCheck size={14} color="#34D399" /> : <UserMinus size={14} color="#FB7185" />}
                              {st.active ? 'Activo' : 'Retirado'}
                            </button>
                          </div>
                        </div>

                        {st.active && (
                          <>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              {(
                                [
                                  { id: 'presente', label: 'Presente', color: '#34D399' },
                                  { id: 'ausente', label: 'Ausente', color: '#FB7185' },
                                  { id: 'excusa', label: 'Excusa', color: '#E8B86D' },
                                ] as { id: AttendanceStatus; label: string; color: string }[]
                              ).map((att) => {
                                const selected = st.attendanceToday === att.id;
                                return (
                                  <button
                                    key={att.id}
                                    type="button"
                                    onClick={() => commit((prev) => setStudentAttendance(prev, st.id, att.id))}
                                    style={{
                                      flex: 1,
                                      padding: '5px 8px',
                                      fontSize: '0.76rem',
                                      borderRadius: 6,
                                      border: `1px solid ${selected ? att.color : 'var(--border-subtle)'}`,
                                      background: selected ? `${att.color}22` : 'transparent',
                                      color: selected ? att.color : 'var(--text-muted)',
                                      fontWeight: selected ? 700 : 400,
                                    }}
                                  >
                                    {att.label}
                                  </button>
                                );
                              })}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 6 }}>
                              {CATEGORY_LABELS.map((cat) => (
                                <div
                                  key={cat.key}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    background: 'rgba(0,0,0,0.25)',
                                    fontSize: '0.76rem',
                                  }}
                                >
                                  <span style={{ color: cat.color }}>{cat.label}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <button
                                      type="button"
                                      className="btn btn-ghost"
                                      style={{ padding: '2px 6px', fontSize: '0.74rem', color: '#FB7185' }}
                                      onClick={() => commit((prev) => awardStudentPoints(prev, st.id, cat.key, -1))}
                                      aria-label={`Restar 1 ${cat.label} a ${st.name}`}
                                    >
                                      -1
                                    </button>
                                    <span className="font-mono" style={{ minWidth: 18, textAlign: 'center' }}>
                                      {st.points[cat.key]}
                                    </span>
                                    <button
                                      type="button"
                                      className="btn"
                                      style={{ padding: '2px 6px', fontSize: '0.74rem', color: '#6EE7B7' }}
                                      onClick={() => commit((prev) => awardStudentPoints(prev, st.id, cat.key, 1))}
                                      aria-label={`Sumar 1 ${cat.label} a ${st.name}`}
                                    >
                                      +1
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ==================== TAB 3: BANCO DE RECURSOS (GOOGLE DRIVE) ==================== */}
        {mainTab === 'recursos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, alignItems: 'start' }}>
            <section className="editorial-card" style={{ padding: 20 }}>
              <h2 className="font-display" style={{ fontSize: '1.6rem', margin: '0 0 8px' }}>
                Agregar al Banco de Recursos
              </h2>
              <p style={{ margin: '0 0 14px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Carpeta base conectada: <code>G:\Mi unidad\1. 💼 Trabajo\1. Clases\Banco de Recursos</code>
              </p>

              <form onSubmit={handleAddResource} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Nombre del recurso (ej. Diapositivas Big Bang)"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  style={{
                    background: '#0F172A',
                    color: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: '0.88rem',
                  }}
                />
                <input
                  type="text"
                  placeholder="Ruta local (G:\...) o enlace web de Drive (https://...)"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  style={{
                    background: '#0F172A',
                    color: '#F8FAFC',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: '0.88rem',
                  }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as ResourceItem['type'])}
                    style={{
                      background: '#0F172A',
                      color: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '8px',
                    }}
                  >
                    <option value="diapositivas">Diapositivas</option>
                    <option value="documento">Guía / PDF</option>
                    <option value="video">Video</option>
                    <option value="actividad">Actividad</option>
                  </select>
                  <select
                    value={resZoneId}
                    onChange={(e) => setResZoneId(e.target.value)}
                    style={{
                      background: '#0F172A',
                      color: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '8px',
                    }}
                  >
                    {ORIGENES_WORLD.zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        Z{z.number}: {z.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} /> Guardar recurso
                </button>
              </form>
            </section>

            <section className="editorial-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <h2 className="font-display" style={{ fontSize: '1.6rem', margin: 0 }}>
                  Inventario ({visibleResources.length})
                </h2>
                <button
                  type="button"
                  className={resFilterCurrentZone ? 'btn btn-teal' : 'btn btn-ghost'}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setResFilterCurrentZone((v) => !v)}
                >
                  {resFilterCurrentZone ? 'Mostrando zona actual' : 'Filtrar por zona actual'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 540, overflowY: 'auto' }}>
                {visibleResources.map((r) => {
                  const z = ORIGENES_WORLD.zones.find((zn) => zn.id === r.zoneId);
                  const isWeb = r.url.startsWith('http://') || r.url.startsWith('https://');
                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid var(--border-subtle)',
                        background: r.used ? 'rgba(52, 211, 153, 0.06)' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <strong style={{ fontSize: '0.94rem', textDecoration: r.used ? 'line-through' : 'none' }}>
                          {r.title}
                        </strong>
                        <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-teal)' }}>
                          {r.type.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                        Zona {z?.number ?? 1}: {z?.title ?? 'Orígenes'}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {isWeb ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-teal"
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                          >
                            <ExternalLink size={12} /> Abrir enlace
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-teal"
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                            onClick={() => handleCopyPath(r.id, r.url)}
                          >
                            {copiedId === r.id ? <Check size={12} /> : <Copy size={12} />}
                            {copiedId === r.id ? 'Ruta copiada' : 'Copiar ruta'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                          onClick={() => commit((prev) => toggleResourceUsed(prev, r.id))}
                        >
                          {r.used ? 'Usado ✓' : 'Marcar usado'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '0.76rem', color: '#FB7185' }}
                          onClick={() => commit((prev) => removeResourceItem(prev, r.id))}
                          aria-label={`Eliminar ${r.title}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
