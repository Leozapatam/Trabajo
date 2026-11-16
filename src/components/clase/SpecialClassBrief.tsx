import React from 'react';
import { getAttendanceSummary, getPerformanceLevel } from '../../engine/grading';
import { calculatePeriodGrade } from '../../engine/grading';
import type { MissionDefinition, SessionState } from '../../engine/types';
import type { PlannedClass } from '../../engine/yearPlan';

interface SpecialClassBriefProps {
  cls: PlannedClass;
  plan: PlannedClass[];
  missions: MissionDefinition[];
  session: SessionState;
}

/** Misiones que se trabajan en un periodo, en orden */
function periodMissions(plan: PlannedClass[], missions: MissionDefinition[], period: number): MissionDefinition[] {
  const ids = [...new Set(plan.filter((c) => c.period === period && c.kind === 'mision' && c.missionId).map((c) => c.missionId!))];
  return ids.map((id) => missions.find((m) => m.id === id)).filter((m): m is MissionDefinition => !!m);
}

/** Clases sin misión (introducción, examen y cierre): qué hacer y qué tener a la mano */
export const SpecialClassBrief: React.FC<SpecialClassBriefProps> = ({ cls, plan, missions, session }) => {
  const topics = periodMissions(plan, missions, cls.period);
  const students = session.students.filter((s) => s.active);

  const topicList = topics.length > 0 && (
    <ol className="clase__topics">
      {topics.map((m) => (
        <li key={m.id}>
          <strong>{m.title}</strong>
          <span>{m.centralQuestion}</span>
        </li>
      ))}
    </ol>
  );

  let steps: string[] = [];
  let extra: React.ReactNode = null;

  if (cls.kind === 'intro') {
    steps =
      cls.slot === 1
        ? [
            'Proyecta el mapa del mundo (inventario → Mapa) y cuenta el viaje del periodo.',
            'Acuerda las reglas de la clase y cómo se gana o se pierde cada punto.',
            'Explica la evaluación del SIE: actitudinal 25 %, cognitivo 35 % y procedimental 40 %.',
          ]
        : [
            'Pregunta qué saben ya del primer territorio y anota sus ideas en la bitácora.',
            'Muestra la pregunta central de la primera misión y deja que el grupo apueste una respuesta.',
            'Cierra con una tarea corta de cuaderno para empezar la misión.',
          ];
    extra = topics.length > 0 && (
      <section className="clase__block">
        <h2>RUTA DEL PERIODO {cls.period}</h2>
        {topicList}
      </section>
    );
  } else if (cls.kind === 'examen') {
    steps =
      cls.slot === 1
        ? [
            'Prueba tipo Saber: opción múltiple con única respuesta, de 10 a 20 preguntas.',
            'Vale el 30 % del componente cognitivo del periodo (SIE).',
            'Ajusta la prueba según el PIAR de quien lo necesite.',
          ]
        : [
            'Revisa la prueba con el grupo: respuesta correcta y por qué.',
            'Identifica las preguntas con menos aciertos y vuelve sobre esos temas.',
            'Anota en la bitácora qué competencias necesitan refuerzo.',
          ];
    extra = topics.length > 0 && (
      <section className="clase__block">
        <h2>TEMAS EVALUADOS</h2>
        {topicList}
      </section>
    );
  } else if (cls.kind === 'cierre') {
    steps =
      cls.slot === 1
        ? [
            'Aplica la autoevaluación (40 % del componente actitudinal, con la rúbrica institucional).',
            'Revisa las notas del periodo con cada estudiante.',
            'Acuerda los planes de mejoramiento de quienes van por debajo de 3.0.',
          ]
        : [
            'Actividades de superación para quienes tienen logros pendientes.',
            'Reconoce los logros del periodo frente al grupo.',
            'Anticipa el mundo o el territorio que viene en el siguiente periodo.',
          ];
    const low = students
      .map((s) => ({ name: s.name, grade: calculatePeriodGrade(s, cls.period, session.gradeConfig) }))
      .filter((x) => !getPerformanceLevel(x.grade).approved)
      .sort((a, b) => a.grade - b.grade);
    const absent = students
      .map((s) => ({ name: s.name, summary: getAttendanceSummary(session, s.id, cls.period) }))
      .filter((x) => x.summary.alert !== 'ok');
    extra = (
      <section className="clase__block">
        <h2>PARA MEJORAMIENTO · PERIODO {cls.period}</h2>
        {low.length === 0 && absent.length === 0 ? (
          <p>Nadie va por debajo de 3.0 ni tiene alertas de inasistencia.</p>
        ) : (
          <>
            {low.length > 0 && (
              <p>
                <strong>Por debajo de 3.0:</strong> {low.map((x) => `${x.name} (${x.grade.toFixed(1)})`).join(', ')}
              </p>
            )}
            {absent.length > 0 && (
              <p>
                <strong>Inasistencia sin excusa:</strong>{' '}
                {absent.map((x) => `${x.name} (${Math.round(x.summary.unexcusedRate * 100)} %)`).join(', ')}
              </p>
            )}
          </>
        )}
      </section>
    );
  }

  return (
    <article key={cls.id} className="clase__script">
      <h1 className="clase__title">{cls.title}</h1>
      <p className="clase__question">{cls.subtitle}</p>
      {cls.evaluation && (
        <section className="clase__block">
          <h2>EVALUACIÓN SIE · {cls.evaluation.totalWeight}</h2>
          <p>
            <strong>{cls.evaluation.label}</strong> — Componente {cls.evaluation.component} ({cls.evaluation.componentWeight} del componente)
          </p>
          <p>{cls.evaluation.description}</p>
        </section>
      )}
      {cls.movie && (
        <section className="clase__block">
          <h2>CINE-FORO PEDAGÓGICO</h2>
          <p><strong>Película:</strong> {cls.movie.title}</p>
          <p><strong>Eje de análisis:</strong> {cls.movie.focus}</p>
        </section>
      )}
      {cls.transversal && (
        <section className="clase__block">
          <h2>CÁTEDRA TRANSVERSAL</h2>
          <p><strong>{cls.transversal.title}</strong></p>
          <p>{cls.transversal.description}</p>
        </section>
      )}
      <section className="clase__block">
        <h2>PASOS</h2>
        <ol className="clase__steps">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
      {extra}
    </article>
  );
};
