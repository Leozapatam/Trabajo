import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Pencil, Trophy as TrophyIcon } from 'lucide-react';
import { TitleBackdrop } from '../components/TitleBackdrop';
import { DEFAULT_GOAL_WEEKS, DEFAULT_PENSION_AGE, summarizeAchievements, type Trophy } from '../engine/achievements';
import { loadSessionState, saveAndBroadcastSession, subscribeToNewerSession } from '../engine/sessionStore';
import type { SessionState, TeacherProfile } from '../engine/types';
import '../styles/logros.css';

const fmtDate = (iso: string | null) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtNum = (n: number) => n.toLocaleString('es-CO');

/** Vitrina de logros de docencia: años dando clase y semanas cotizadas */
export const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionState>(loadSessionState);
  const profile = session.teacherProfile;
  const [editing, setEditing] = useState(!profile?.startDate);

  useEffect(() => subscribeToNewerSession(setSession), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editing) navigate('/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, editing]);

  const summary = useMemo(() => summarizeAchievements(profile), [profile]);
  const save = (next: TeacherProfile) => {
    setSession(saveAndBroadcastSession({ ...session, teacherProfile: next }));
    setEditing(false);
  };

  const years = summary.trophies.filter((t) => t.kind === 'anios');
  const weeks = summary.trophies.filter((t) => t.kind === 'semanas');
  const pct = Math.min(100, (summary.totalWeeks / summary.goalWeeks) * 100);

  return (
    <div className="logros retro-scope">
      <TitleBackdrop vignette="left" />
      <div className="logros__shade" aria-hidden="true" />

      <header className="logros__head">
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')} title="Volver (Esc)">
          <ArrowLeft size={16} /> Portada
        </button>
        <h1 className="logros__title">
          <TrophyIcon size={26} /> Logros de docencia
        </h1>
        {editing ? (
          <span />
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            <Pencil size={14} /> Mis datos
          </button>
        )}
      </header>

      {editing ? (
        <ProfileForm initial={profile} onSave={save} onCancel={profile?.startDate ? () => setEditing(false) : undefined} />
      ) : (
        <main className="logros__main">
          <section className="logros__stats">
            <Stat value={summary.age ?? '—'} label="años de edad" />
            <Stat value={summary.yearsTeaching} label={summary.yearsTeaching === 1 ? 'año dando clase' : 'años dando clase'} />
            <Stat value={fmtNum(summary.totalWeeks)} label="semanas cotizadas" accent />
            <Stat value={fmtNum(summary.weeksLeft)} label="semanas para la meta" />
          </section>

          <section className="logros__meter" aria-label="Avance hacia la pensión">
            <div className="logros__meter-top">
              <strong>
                {fmtNum(summary.totalWeeks)} de {fmtNum(summary.goalWeeks)} semanas
              </strong>
              <span>
                Pensión estimada: <strong>{fmtDate(summary.pensionDate)}</strong> · {summary.pensionAge} años y{' '}
                {fmtNum(summary.goalWeeks)} semanas
              </span>
            </div>
            <div className="logros__bar">
              <div className="logros__bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="logros__note">
              Semanas = días trabajados ÷ 7{profile?.priorWeeks ? `, más ${fmtNum(profile.priorWeeks)} previas` : ''}. Es
              una estimación: el dato oficial lo da tu fondo (FOMAG o Colpensiones).
            </p>
          </section>

          <TrophyRow title="Años dando clase" trophies={years} />
          <TrophyRow title="Semanas cotizadas" trophies={weeks} />
        </main>
      )}
    </div>
  );
};

const Stat: React.FC<{ value: React.ReactNode; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className={`logros__stat${accent ? ' is-accent' : ''}`}>
    <span className="logros__stat-value">{value}</span>
    <span className="logros__stat-label">{label}</span>
  </div>
);

const TrophyRow: React.FC<{ title: string; trophies: Trophy[] }> = ({ title, trophies }) => (
  <section className="logros__row">
    <h2>{title}</h2>
    <ul className="logros__shelf">
      {trophies.map((t) => (
        <li key={t.id} className={`logros__trophy is-${t.kind}${t.unlocked ? ' is-unlocked' : ''}`} title={t.label}>
          <span className="logros__cup" aria-hidden="true">
            {t.unlocked ? <TrophyIcon size={30} /> : <Lock size={22} />}
          </span>
          <span className="logros__trophy-value">{t.kind === 'anios' ? t.value : fmtNum(t.value)}</span>
          <span className="logros__trophy-label">{t.kind === 'anios' ? (t.value === 1 ? 'año' : 'años') : 'semanas'}</span>
          <span className="logros__trophy-date">{t.unlocked ? fmtDate(t.date) : `llega ${fmtDate(t.date)}`}</span>
        </li>
      ))}
    </ul>
  </section>
);

const ProfileForm: React.FC<{
  initial?: TeacherProfile;
  onSave: (p: TeacherProfile) => void;
  onCancel?: () => void;
}> = ({ initial, onSave, onCancel }) => {
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [priorWeeks, setPriorWeeks] = useState(String(initial?.priorWeeks ?? 0));
  const [goalWeeks, setGoalWeeks] = useState(String(initial?.goalWeeks ?? DEFAULT_GOAL_WEEKS));
  const [pensionAge, setPensionAge] = useState(String(initial?.pensionAge ?? DEFAULT_PENSION_AGE));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = (v: string, fallback: number) => {
      const n = Math.floor(Number(v));
      return v.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : fallback;
    };
    onSave({
      birthDate: birthDate || undefined,
      startDate,
      priorWeeks: num(priorWeeks, 0),
      goalWeeks: num(goalWeeks, DEFAULT_GOAL_WEEKS) || DEFAULT_GOAL_WEEKS,
      pensionAge: num(pensionAge, DEFAULT_PENSION_AGE) || DEFAULT_PENSION_AGE,
    });
  };

  return (
    <form className="logros__form" onSubmit={submit}>
      <h2>Tus datos para contar</h2>
      <p>Se guardan solo en tu archivo de datos, nunca en GitHub.</p>
      <label>
        Fecha de nacimiento
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </label>
      <label>
        Primer día como docente
        <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      <label>
        Semanas cotizadas antes de ser docente
        <input type="number" min={0} value={priorWeeks} onChange={(e) => setPriorWeeks(e.target.value)} />
      </label>
      <div className="logros__form-pair">
        <label>
          Meta de semanas
          <input type="number" min={1} value={goalWeeks} onChange={(e) => setGoalWeeks(e.target.value)} />
        </label>
        <label>
          Edad de pensión
          <input type="number" min={1} value={pensionAge} onChange={(e) => setPensionAge(e.target.value)} />
        </label>
      </div>
      <p className="logros__note">
        Docentes oficiales vinculados desde 2003 (Ley 812): 1300 semanas y 57 años. Si tu régimen es otro, cámbialo aquí.
      </p>
      <div className="logros__form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
};
