import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, FolderCog, Play } from 'lucide-react';
import { CosmicBackdrop } from '../components/CosmicBackdrop';
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
    <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <CosmicBackdrop />
      <main
        className="pixel-frame"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 540,
          padding: '32px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Compass size={22} color="#E8B86D" />
          <span className="font-pixel" style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>
            EXPEDICIÓN 6 · ORÍGENES
          </span>
        </div>

        <h1 className="font-display" style={{ fontSize: '2.4rem', margin: '0 0 20px', lineHeight: 1.1 }}>
          Panel de Entrada
        </h1>

        <form onSubmit={handleStartNewClass} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Fecha
              <input
                type="date"
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  marginTop: 6,
                  background: '#0F172A',
                  color: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  padding: '9px 10px',
                  fontSize: '0.95rem',
                }}
              />
            </label>

            <label style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Grado / Salón
              <input
                type="text"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
                placeholder="Ej. 6°A"
                required
                style={{
                  width: '100%',
                  marginTop: 6,
                  background: '#0F172A',
                  color: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  padding: '9px 10px',
                  fontSize: '0.95rem',
                }}
              />
            </label>
          </div>

          <label style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Periodo
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value) as 1 | 2 | 3)}
              style={{
                width: '100%',
                marginTop: 6,
                background: '#0F172A',
                color: '#FDE68A',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: '9px 10px',
                fontSize: '0.95rem',
              }}
            >
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
            </select>
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 18px', fontSize: '1rem' }}>
              <Play size={18} /> Empezar nueva clase
            </button>
            <button type="button" className="btn" style={{ padding: '11px 18px' }} onClick={handleManageOnly}>
              <FolderCog size={18} /> Solo gestionar (sin iniciar clase)
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: 22,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
          }}
        >
          <Link to="/origenes" style={{ color: 'var(--accent-teal)' }}>
            Mapa de Orígenes
          </Link>
          <Link to="/explorar" style={{ color: 'var(--text-secondary)' }}>
            Explorar en Casa
          </Link>
        </div>
      </main>
    </div>
  );
};
