import React, { useEffect } from 'react';
import { longDate } from '../aulas/aulaInfo';
import { GradeLabel } from '../aulas/GradeLabel';
import { formatDelta, SCORE_ACTIONS } from '../../engine/scoring';
import type { ClassSummary } from '../../engine/classFlow';

interface ClassSummaryScreenProps {
  summary: ClassSummary;
  grades: number[];
  world: string;
  backupName: string | null | undefined;
  onHome: () => void;
  onAulas: () => void;
  /** Avance del tema y cuaderno de la clase que se cierra */
  children?: React.ReactNode;
}

function nameList(names: string[]): string {
  return names.length ? names.join(', ') : 'Nadie';
}

/** Cierre de la sesión: lo que pasó hoy en el aula, de un vistazo. Enter vuelve a la portada. */
export const ClassSummaryScreen: React.FC<ClassSummaryScreenProps> = ({
  summary,
  grades,
  world,
  backupName,
  onHome,
  onAulas,
  children,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!e.repeat) onHome();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onHome]);

  const total = summary.presentes + summary.ausentes.length + summary.excusas.length;

  return (
    <div className="resumen" role="dialog" aria-modal="true" aria-label="Resumen de la clase">
      <span className="resumen__kicker">
        AULA <GradeLabel grades={grades} /> · {world}
      </span>
      <h1 className="resumen__title">Sesión completada</h1>
      <p className="resumen__date">{longDate(summary.date)}</p>
      {summary.plannedClass && <p className="resumen__class">✓ {summary.plannedClass}</p>}

      <div className="resumen__stats">
        <div className="resumen__stat">
          <strong className="is-good">
            {summary.presentes}
            <small>/{total}</small>
          </strong>
          <span>PRESENTES</span>
        </div>
        <div className="resumen__stat">
          <strong className="is-gold">{summary.totalPoints > 0 ? `+${summary.totalPoints}` : summary.totalPoints}</strong>
          <span>PUNTOS DEL GRUPO</span>
        </div>
        <div className="resumen__stat">
          <strong>{summary.resourcesUsed.length}</strong>
          <span>RECURSOS USADOS</span>
        </div>
      </div>

      <div className="resumen__cols">
        <section>
          <h2>Quienes más aportaron</h2>
          {summary.topContributors.length === 0 ? (
            <p className="resumen__muted">Hoy no se dieron puntos.</p>
          ) : (
            <ol className="resumen__top">
              {summary.topContributors.slice(0, 5).map((c) => (
                <li key={c.name}>
                  <span>{c.name}</span>
                  <strong>+{c.points}</strong>
                </li>
              ))}
            </ol>
          )}
          <p className="resumen__muted">
            {SCORE_ACTIONS.filter((a) => summary.actionCounts[a.key] > 0)
              .map((a) => `${summary.actionCounts[a.key]} × ${a.label} (${formatDelta(a.delta)})`)
              .join(' · ')}
          </p>
        </section>

        <section>
          <h2>Asistencia</h2>
          <p>
            <span className="resumen__tag is-bad">Ausentes</span> {nameList(summary.ausentes)}
          </p>
          <p>
            <span className="resumen__tag is-warn">Excusas</span> {nameList(summary.excusas)}
          </p>
          {summary.absenceAlerts.length > 0 && (
            <p className="resumen__alert">
              Ojo con las fallas sin excusa del periodo:{' '}
              {summary.absenceAlerts.map((a) => `${a.name} (${Math.round(a.rate * 100)} %)`).join(', ')}
            </p>
          )}
        </section>

        <section>
          <h2>Recursos de hoy</h2>
          {summary.resourcesUsed.length === 0 ? (
            <p className="resumen__muted">No se abrieron recursos.</p>
          ) : (
            <ul className="resumen__list">
              {summary.resourcesUsed.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {children}

      <p className="resumen__backup" role="status">
        {backupName === undefined
          ? 'Guardando respaldo…'
          : backupName
            ? `Respaldo guardado en el disco: ${backupName}`
            : 'Clase guardada. No se pudo crear el respaldo con nombre (¿servidor local apagado?).'}
      </p>

      <div className="resumen__actions">
        <button type="button" className="roll__secondary" onClick={onAulas}>
          Ir a otra aula
        </button>
        <button type="button" className="roll__start" onClick={onHome}>
          VOLVER A LA PORTADA <span aria-hidden="true">➤</span>
        </button>
      </div>
    </div>
  );
};
