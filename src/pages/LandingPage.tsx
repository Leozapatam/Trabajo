import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, FolderCog, Play, Sparkles } from 'lucide-react';
import { TitleBackdrop } from '../components/TitleBackdrop';
import {
  getTodayIsoDate,
  loadSessionState,
  saveAndBroadcastSession,
  switchClassroomRoster,
} from '../engine/sessionStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const initial = loadSessionState();

  const [classDate, setClassDate] = useState<string>(initial.classDate || getTodayIsoDate());
  const [classroomName, setClassroomName] = useState<string>(initial.classroomName || '6°A');
  const [period, setPeriod] = useState<1 | 2 | 3>(initial.period || 1);

  const handleStartNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    const current = loadSessionState();
    const switched = switchClassroomRoster(current, current.schoolYear, classroomName.trim() || '6°A');
    saveAndBroadcastSession({
      ...switched,
      classDate,
      period,
      classStarted: true,
      active: true,
      status: 'running',
      projectorMode: 'intro',
    });
    navigate('/game-master');
  };

  const handleManageOnly = () => {
    const current = loadSessionState();
    const switched = switchClassroomRoster(current, current.schoolYear, classroomName.trim() || '6°A');
    saveAndBroadcastSession({
      ...switched,
      classDate,
      period,
      classStarted: false,
      active: false,
      status: 'idle',
    });
    navigate('/game-master?tab=estudiantes');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(20px, 4vw, 56px)',
      }}
    >
      <TitleBackdrop />

      <main
        className="animate-title-enter"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 500px) 1fr',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Bloque izquierdo: Pantalla de Título + Formulario Mínimo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <span className="pixel-badge" style={{ marginBottom: 14 }}>
              <Compass size={14} /> EXPEDICIÓN 6 · MUNDO 1
            </span>

            <h1
              className="font-pixel"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                margin: '12px 0 8px',
                lineHeight: 1.15,
                color: '#F8FAFC',
                textShadow: '4px 4px 0 #060A13, 6px 6px 0 rgba(232, 184, 109, 0.38)',
              }}
            >
              ORÍGENES
            </h1>
            <p
              className="font-display"
              style={{
                fontSize: 'clamp(1.25rem, 2vw, 1.65rem)',
                color: '#FDE68A',
                margin: 0,
                fontStyle: 'italic',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)',
              }}
            >
              Del universo a la Tierra
            </p>
          </div>

          <section
            className="pixel-frame"
            style={{
              padding: '22px 22px 18px',
              background: 'rgba(8, 14, 28, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <form onSubmit={handleStartNewClass} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Fecha
                  <input
                    type="date"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      marginTop: 5,
                      background: '#0F172A',
                      color: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      padding: '9px 10px',
                      fontSize: '0.94rem',
                    }}
                  />
                </label>

                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Grado / Salón
                  <input
                    type="text"
                    value={classroomName}
                    onChange={(e) => setClassroomName(e.target.value)}
                    placeholder="Ej. 6°A"
                    required
                    style={{
                      width: '100%',
                      marginTop: 5,
                      background: '#0F172A',
                      color: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      padding: '9px 10px',
                      fontSize: '0.94rem',
                    }}
                  />
                </label>
              </div>

              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Periodo
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value) as 1 | 2 | 3)}
                  style={{
                    width: '100%',
                    marginTop: 5,
                    background: '#0F172A',
                    color: '#FDE68A',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    padding: '9px 10px',
                    fontSize: '0.94rem',
                  }}
                >
                  <option value={1}>Periodo 1</option>
                  <option value={2}>Periodo 2</option>
                  <option value={3}>Periodo 3</option>
                </select>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 6 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '13px 18px',
                    fontSize: '1rem',
                    boxShadow: '0 8px 24px rgba(232, 184, 109, 0.35)',
                  }}
                >
                  <Play size={18} /> Empezar nueva clase
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '10px 18px', fontSize: '0.92rem' }}
                  onClick={handleManageOnly}
                >
                  <FolderCog size={17} /> Solo gestionar
                </button>
              </div>
            </form>

            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <Link to="/origenes" style={{ color: 'var(--accent-teal)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={13} /> Mapa de Orígenes
              </Link>
              <Link to="/explorar" style={{ color: 'var(--text-secondary)' }}>
                Explorar en Casa
              </Link>
            </div>
          </section>
        </div>

        {/* Espacio abierto a la derecha para lucir la ilustración pixel art */}
        <div className="hide-mobile" aria-hidden="true" />
      </main>
    </div>
  );
};
