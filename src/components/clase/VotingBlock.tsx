import React from 'react';
import { adjustVote, resetVotes, startQuickVote, toggleVotingOpen } from '../../engine/classFlow';
import type { SessionState } from '../../engine/types';

interface VotingBlockProps {
  session: SessionState;
  commit: (updater: (prev: SessionState) => SessionState) => void;
  /** Pregunta de la escena, para la votación rápida de Sí / No */
  question: string;
}

/** Votación a mano alzada: el profe cuenta manos y suma; V la muestra en el proyector */
export const VotingBlock: React.FC<VotingBlockProps> = ({ session, commit, question }) => {
  const { options, open } = session.voting;
  const total = options.reduce((sum, o) => sum + o.votes, 0);
  const top = Math.max(1, ...options.map((o) => o.votes));

  if (options.length === 0) {
    return (
      <section className="clase__block is-quiet">
        <h2>VOTACIÓN</h2>
        <button type="button" className="clase__vote-quick" onClick={() => commit((prev) => startQuickVote(prev, question))}>
          Abrir votación rápida de Sí / No
        </button>
      </section>
    );
  }

  return (
    <section className={`clase__block clase__vote${open ? ' is-open' : ''}`}>
      <h2>
        VOTACIÓN A MANO ALZADA · {total} {total === 1 ? 'VOTO' : 'VOTOS'} · {open ? 'EN EL PROYECTOR' : 'SOLO LA VES TÚ'}
      </h2>
      <ul className="clase__vote-list">
        {options.map((o) => (
          <li key={o.id}>
            <span className="clase__vote-label">{o.label}</span>
            <span className="clase__vote-bar" aria-hidden="true">
              <span style={{ width: `${(o.votes / top) * 100}%` }} />
            </span>
            <button
              type="button"
              className="clase__vote-btn"
              onClick={() => commit((prev) => adjustVote(prev, o.id, -1))}
              disabled={o.votes === 0}
              aria-label={`Quitar un voto a ${o.label}`}
            >
              −
            </button>
            <strong className="clase__vote-count">{o.votes}</strong>
            <button
              type="button"
              className="clase__vote-btn is-plus"
              onClick={() => commit((prev) => adjustVote(prev, o.id, 1))}
              aria-label={`Sumar un voto a ${o.label}`}
            >
              +
            </button>
          </li>
        ))}
      </ul>
      <div className="clase__vote-actions">
        <button type="button" className="clase__vote-quick" onClick={() => commit(toggleVotingOpen)}>
          <kbd>V</kbd> {open ? 'Quitar del proyector' : 'Mostrar en el proyector'}
        </button>
        {total > 0 && (
          <button type="button" className="clase__vote-quick" onClick={() => commit(resetVotes)}>
            Poner en cero
          </button>
        )}
      </div>
    </section>
  );
};
