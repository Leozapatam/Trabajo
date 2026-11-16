import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Settings2, Users } from 'lucide-react';
import { GRADE_GROUPS } from '../../engine/grades';
import { switchClassroomRoster } from '../../engine/sessionStore';
import type { AcademicPeriod, SessionState } from '../../engine/types';
import '../../styles/gm-arena.css';

interface ClassSettingsProps {
  session: SessionState;
  commit: (updater: (prev: SessionState) => SessionState) => void;
  onSaveAttendance: () => void;
  attendanceSaved: boolean;
  savedDatesCount: number;
}

/** Ajustes de la clase en una franja compacta: lo que casi nunca se toca no le quita espacio a las fichas */
export const ClassSettings: React.FC<ClassSettingsProps> = ({
  session,
  commit,
  onSaveAttendance,
  attendanceSaved,
  savedDatesCount,
}) => (
  <section className="rpg-window gm-settings">
    <h2 className="gm-settings__title">
      <Settings2 size={14} /> AJUSTES DE LA CLASE
    </h2>

    <div className="gm-settings__fields">
      <label>
        Fecha
        <input
          type="date"
          value={session.classDate}
          onChange={(e) => e.target.value && commit((prev) => ({ ...prev, classDate: e.target.value }))}
        />
      </label>
      <label>
        Grado
        <select
          value={session.classroomName}
          onChange={(e) => commit((prev) => switchClassroomRoster(prev, prev.schoolYear, e.target.value))}
        >
          {GRADE_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.id} · {g.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Periodo
        <select
          value={session.period}
          onChange={(e) => commit((prev) => ({ ...prev, period: Number(e.target.value) as AcademicPeriod }))}
        >
          <option value={1}>Periodo 1</option>
          <option value={2}>Periodo 2</option>
          <option value={3}>Periodo 3</option>
        </select>
      </label>
      <label>
        Año
        <input
          type="text"
          inputMode="numeric"
          value={session.schoolYear}
          onChange={(e) => commit((prev) => switchClassroomRoster(prev, e.target.value, prev.classroomName))}
        />
      </label>
      <label title="Nota con la que empieza cada estudiante en el periodo">
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
        />
      </label>
      <label title="Cuánto sube o baja la nota cada +1 / −1">
        Valor del punto
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
        />
      </label>
    </div>

    <div className="gm-settings__actions">
      <Link to="/grupos" className="btn">
        <Users size={16} /> Gestión de grupos
      </Link>
      {session.students.length > 0 && (
        <button type="button" className="btn btn-teal" onClick={onSaveAttendance}>
          <CheckCircle2 size={16} /> Confirmar asistencia del día
        </button>
      )}
      <span className="gm-settings__note" role="status">
        {attendanceSaved
          ? `Asistencia del ${session.classDate} guardada.`
          : `${savedDatesCount} ${savedDatesCount === 1 ? 'fecha registrada' : 'fechas registradas'}`}
      </span>
    </div>
  </section>
);
