import React from 'react';
import { Shield, Swords, Tent } from 'lucide-react';
import { groupBySquad, SQUADS, type SquadKey } from '../../engine/groups';
import type { SessionState, StudentState } from '../../engine/types';

const ICONS: Record<SquadKey, React.ReactNode> = {
  vanguardia: <Swords size={18} />,
  centro: <Shield size={18} />,
  retaguardia: <Tent size={18} />,
};

/** Vanguardia, Centro y Retaguardia según la nota del periodo actual */
export const SquadBoard: React.FC<{ session: SessionState; roster: StudentState[] }> = ({ session, roster }) => {
  const squads = groupBySquad(session, roster);
  return (
    <div className="squads">
      {SQUADS.map((sq) => (
        <section key={sq.key} className={`squad is-${sq.key}`}>
          <header className="squad__head">
            {ICONS[sq.key]}
            <span className="squad__name">{sq.label}</span>
            <span className="squad__count">{squads[sq.key].length}</span>
          </header>
          <span className="squad__hint">{sq.hint}</span>
          <ol className="squad__list">
            {squads[sq.key].length === 0 && <li className="squad__empty">Nadie por ahora</li>}
            {squads[sq.key].map(({ student, grade }) => (
              <li key={student.id}>
                <span>{student.name}</span>
                <strong>{grade.toFixed(1)}</strong>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
};
