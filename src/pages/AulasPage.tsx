import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AmbientBreeze } from '../components/AmbientBreeze';
import { AULAS, longDate } from '../components/aulas/aulaInfo';
import { GradeLabel } from '../components/aulas/GradeLabel';
import { getDbasForGroup } from '../engine/grades';
import {
  getActiveStudentsCount,
  getGroupRoster,
  getLastClassDate,
  loadSessionState,
  saveAndBroadcastSession,
  switchClassroomRoster,
} from '../engine/sessionStore';
import '../styles/aulas.css';

/** Aulas cuya ilustración mira al espacio: polvo de estrellas en vez de hojas */
const COSMOS_ART = /cosmos|solar|espacio|universo|globaliz/i;

/**
 * Antesala de la clase: cada aula es un espacio distinto. Al moverse entre
 * aulas cambia toda la pantalla. ← → eligen, Enter entra, Esc vuelve.
 */
export const AulasPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const manageOnly = params.get('modo') === 'gestion';
  const [session] = useState(loadSessionState);
  const [index, setIndex] = useState(() => Math.max(0, AULAS.findIndex((a) => a.id === session.classroomName)));
  const aula = AULAS[index];

  const enter = (aulaId: string) => {
    const current = loadSessionState();
    const switched = switchClassroomRoster(current, current.schoolYear, aulaId);
    if (manageOnly) {
      saveAndBroadcastSession({ ...switched, classStarted: false, active: false, status: 'idle' });
      navigate('/game-master?tab=estudiantes');
    } else {
      saveAndBroadcastSession(switched);
      navigate('/lista');
    }
  };

  const stateRef = useRef({ index, enter });
  stateRef.current = { index, enter };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { index: i, enter: go } = stateRef.current;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIndex((i + 1) % AULAS.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIndex((i - 1 + AULAS.length) % AULAS.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        go(AULAS[i].id);
      } else if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const count = getActiveStudentsCount(getGroupRoster(session, aula.id));
  const lastClass = getLastClassDate(session, aula.id);
  const territories = getDbasForGroup(aula.id).length;
  const scene = COSMOS_ART.test(aula.art) ? 'cosmos' : 'tierra';

  return (
    <div className="aulas">
      {/* Un fondo por aula, apilados: al cambiar de aula se funden */}
      <div className="aulas__art" aria-hidden="true">
        {AULAS.map((a, i) => (
          <img key={a.id} src={a.art} alt="" className={i === index ? 'is-active' : ''} decoding="async" />
        ))}
      </div>
      <div className="aulas__shade" aria-hidden="true" />
      {/* La brisa no se reinicia al cambiar de aula, salvo al pasar de paisaje a espacio */}
      <AmbientBreeze key={scene} scene={scene} />

      <header className="aulas__top">
        <button type="button" className="aulas__back" onClick={() => navigate('/')}>
          ◂ PORTADA
        </button>
        <span className="aulas__heading">{manageOnly ? 'ELIGE EL AULA A GESTIONAR' : 'ELIGE TU AULA'}</span>
        <span className="aulas__when">
          {longDate(session.classDate)} · Periodo {session.period}
        </span>
      </header>

      <section key={aula.id} className="aulas__detail" aria-live="polite">
        <span className="aulas__kicker">{aula.fused ? 'AULA FUSIONADA' : 'AULA'}</span>
        <h1 className={`aulas__grade${aula.fused ? ' is-long' : ''}`} aria-label={`Aula ${aula.id}`}>
          <GradeLabel grades={aula.grades} />
        </h1>
        <h2 className="aulas__world">{aula.world}</h2>
        <p className="aulas__tagline">{aula.tagline}</p>
        <ul className="aulas__stats">
          <li>
            <strong>{count}</strong> {count === 1 ? 'explorador' : 'exploradores'}
          </li>
          <li>
            <strong>{territories}</strong> territorios
          </li>
          <li>{lastClass ? `Última clase: ${longDate(lastClass)}` : 'Aún sin clases'}</li>
        </ul>
        <button type="button" className="aulas__enter" onClick={() => enter(aula.id)}>
          <span aria-hidden="true">➤</span> {manageOnly ? 'Gestionar aula' : 'Entrar al aula'}
        </button>
      </section>

      <nav className="aulas__strip" aria-label="Aulas">
        {AULAS.map((a, i) => {
          const n = getActiveStudentsCount(getGroupRoster(session, a.id));
          return (
            <React.Fragment key={a.id}>
              {a.fused && !AULAS[i - 1]?.fused && <span className="aulas__divider" aria-hidden="true" />}
              <button
                type="button"
                className={`aulas__slot${i === index ? ' is-active' : ''}${n === 0 ? ' is-empty' : ''}`}
                style={{ backgroundImage: `url("${a.art}")` }}
                onMouseEnter={() => setIndex(i)}
                onFocus={() => setIndex(i)}
                onClick={() => enter(a.id)}
                aria-label={`Aula ${a.id}, ${a.world}, ${n} estudiantes`}
                aria-current={i === index}
              >
                <span className="aulas__slot-count">{n > 0 ? n : '—'}</span>
                <span className="aulas__slot-grade">
                  <GradeLabel grades={a.grades} />
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <footer className="aulas__hint">← → elegir · Enter entrar · Esc volver</footer>
    </div>
  );
};
