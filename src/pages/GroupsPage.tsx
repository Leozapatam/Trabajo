import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserMinus, UserPlus, UserRoundCheck } from 'lucide-react';
import { TitleBackdrop } from '../components/TitleBackdrop';
import { DiskStatusBadge } from '../components/gm/DiskStatusBadge';
import { FusionProposal } from '../components/groups/FusionProposal';
import { SquadBoard } from '../components/groups/SquadBoard';
import { acceptFusionCandidates, getFusionCandidates } from '../engine/groups';
import { getGradeGroup, GRADE_GROUPS } from '../engine/grades';
import {
  enrollStudents,
  getActiveStudentsCount,
  getGroupRoster,
  loadSessionState,
  saveAndBroadcastSession,
  setStudentEnrollment,
  subscribeToNewerSession,
} from '../engine/sessionStore';
import type { SessionState } from '../engine/types';
import '../styles/groups.css';

/** Matrícula y retiros de todos los grupos del año; el tablero solo muestra a los activos */
export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionState>(loadSessionState);
  const [groupId, setGroupId] = useState<string>(session.classroomName);
  const [names, setNames] = useState('');
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [view, setView] = useState<'lista' | 'escuadrones'>('lista');

  const commit = (next: SessionState) => setSession(saveAndBroadcastSession(next));
  useEffect(() => subscribeToNewerSession(setSession), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key === 'Escape' && el?.tagName !== 'TEXTAREA') navigate('/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const group = getGradeGroup(groupId);
  const roster = getGroupRoster(session, groupId);
  const activeCount = getActiveStudentsCount(roster);
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('es');
    const indexed = roster.map((s, i) => ({ s, num: i + 1 }));
    return indexed
      .filter(({ s }) => !q || s.name.toLocaleLowerCase('es').includes(q))
      .sort((a, b) => Number(b.s.active) - Number(a.s.active));
  }, [roster, query]);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    const result = enrollStudents(session, groupId, names);
    if (result.added > 0) commit(result.state);
    setNames('');
    const parts = [`${result.added} matriculado${result.added === 1 ? '' : 's'} en ${group.id}`];
    if (result.skipped.length) parts.push(`${result.skipped.length} ya estaba${result.skipped.length === 1 ? '' : 'n'}`);
    setFeedback(parts.join(' · '));
  };

  const candidates = group.fused ? getFusionCandidates(session, groupId) : [];
  const acceptFusion: React.ComponentProps<typeof FusionProposal>['onAccept'] = (accepted) => {
    const result = acceptFusionCandidates(session, groupId, accepted);
    if (result.added > 0) commit(result.state);
    setFeedback(`${result.added} unido${result.added === 1 ? '' : 's'} a ${group.id}`);
  };

  const selectGroup = (id: string) => {
    setGroupId(id);
    setQuery('');
    setFeedback(null);
  };

  const counts = Object.fromEntries(
    GRADE_GROUPS.map((g) => [g.id, getActiveStudentsCount(getGroupRoster(session, g.id))])
  );

  return (
    <div className="groups-screen retro-scope">
      <TitleBackdrop vignette="left" />
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(6,10,19,0.58)' }} />

      <header className="groups-header retro-hud" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')} title="Volver (Esc)">
            <ArrowLeft size={16} /> Portada
          </button>
          <h1 className="groups-title">GESTIÓN DE GRUPOS</h1>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <DiskStatusBadge /> Año lectivo {session.schoolYear}
        </span>
      </header>

      <div className="groups-layout" style={{ position: 'relative', zIndex: 2 }}>
        <nav className="groups-panel" aria-label="Grupos">
          <ul className="groups-list">
            {GRADE_GROUPS.map((g, i) => (
              <React.Fragment key={g.id}>
                {g.fused && !GRADE_GROUPS[i - 1]?.fused && <li aria-hidden="true" className="groups-list__sep" />}
                <li>
                  <button
                    type="button"
                    className={`groups-list__item${g.id === groupId ? ' is-active' : ''}`}
                    onClick={() => selectGroup(g.id)}
                  >
                    <span>
                      {g.id} {g.label}
                    </span>
                    <span className={`groups-list__count${counts[g.id] ? '' : ' is-empty'}`}>
                      {counts[g.id] ? `${counts[g.id]} est.` : 'vacío'}
                    </span>
                  </button>
                </li>
              </React.Fragment>
            ))}
          </ul>
        </nav>

        <section className="groups-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="font-display" style={{ margin: 0, fontSize: '1.8rem' }}>
              {group.id} {group.label}
            </h2>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              {activeCount} activos{roster.length > activeCount ? ` · ${roster.length - activeCount} retirados` : ''}
            </span>
          </div>

          {candidates.length > 0 && (
            <FusionProposal
              key={groupId}
              groupId={group.id}
              sources={group.grades.map((n) => `${n}°`)}
              candidates={candidates}
              onAccept={acceptFusion}
            />
          )}

          <div className="groups-view" role="tablist" aria-label="Vista del grupo">
            {(['lista', 'escuadrones'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                className={`groups-view__tab${view === v ? ' is-active' : ''}`}
                onClick={() => setView(v)}
              >
                {v === 'lista' ? 'Lista y matrícula' : 'Escuadrones'}
              </button>
            ))}
          </div>

          {view === 'escuadrones' ? (
            <SquadBoard session={session} roster={roster} />
          ) : (
          <>

          <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Matricular estudiantes (pega la lista: un nombre por línea)
              <textarea
                className="groups-input"
                rows={4}
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder={'Apellidos Nombres\nApellidos Nombres'}
                style={{ marginTop: 6, resize: 'vertical' }}
              />
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={!names.trim()}>
                <UserPlus size={16} /> Matricular en {group.id}
              </button>
              {feedback && (
                <span role="status" style={{ fontSize: '0.85rem', color: '#6EE7B7' }}>
                  {feedback}
                </span>
              )}
            </div>
          </form>

          {roster.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {group.fused
                ? 'Grupo unido vacío. Acepta arriba a los estudiantes de cada grado o matricúlalos aquí.'
                : 'Aún no hay estudiantes matriculados en este grado.'}
            </p>
          ) : (
            <>
              <label style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  className="groups-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar estudiante…"
                  aria-label="Buscar estudiante"
                  style={{ paddingLeft: 32 }}
                />
              </label>
              <ul className="groups-roster">
                {visible.map(({ s, num }) => (
                  <li key={s.id} className={`groups-roster__row${s.active ? '' : ' is-retired'}`}>
                    <span className="groups-roster__num">{num}</span>
                    <span className="groups-roster__name">{s.name}</span>
                    <span className="groups-roster__chip" style={{ color: s.active ? '#6EE7B7' : '#FCA5A5' }}>
                      {s.active ? 'Matriculado' : 'Retirado'}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => commit(setStudentEnrollment(session, groupId, s.id, !s.active))}
                    >
                      {s.active ? <UserMinus size={14} /> : <UserRoundCheck size={14} />}
                      {s.active ? 'Retirar' : 'Reintegrar'}
                    </button>
                  </li>
                ))}
              </ul>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Retirar no borra notas ni asistencia: el estudiante deja de aparecer en el tablero de clase.
              </p>
            </>
          )}
          </>
          )}
        </section>
      </div>
    </div>
  );
};
