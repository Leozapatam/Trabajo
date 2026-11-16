import React from 'react';
import { NotebookPen } from 'lucide-react';
import type { EntryActivity } from '../../engine/classGame';
import type { NotebookHolder } from '../../engine/types';

export const ENTRY_EVENT_ID = 'ev-entrada';

interface EntryActivityCardProps {
  activity: EntryActivity;
  holder: NotebookHolder;
  projected: boolean;
  onProject: () => void;
}

/** Actividad de entrada: el grupo escribe apenas llega, para activarse */
export const EntryActivityCard: React.FC<EntryActivityCardProps> = ({ activity, holder, projected, onProject }) => (
  <section className="entry">
    <span className="entry__icon" aria-hidden="true">
      <NotebookPen size={20} />
    </span>
    <div className="entry__body">
      <span className="entry__kicker">AL LLEGAR · CUADERNO</span>
      <p className="entry__prompt">{activity.prompt}</p>
      <span className="entry__from">
        Repasa la clase {activity.from.number}: {activity.from.title}
        {holder === 'profe' && ' · Tú tienes los cuadernos: repártelos o hagan la actividad en voz alta.'}
      </span>
    </div>
    <button type="button" className={`entry__btn${projected ? ' is-on' : ''}`} onClick={onProject}>
      {projected ? 'Quitar del proyector' : 'Proyectar'}
    </button>
  </section>
);
