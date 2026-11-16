import React, { useState } from 'react';
import { Check, Merge } from 'lucide-react';
import type { FusionCandidate } from '../../engine/groups';

interface FusionProposalProps {
  groupId: string;
  sources: string[];
  candidates: FusionCandidate[];
  onAccept: (accepted: FusionCandidate[]) => void;
}

/** Propuesta para el grupo unido: los estudiantes de cada grado entran solo si el profe acepta */
export const FusionProposal: React.FC<FusionProposalProps> = ({ groupId, sources, candidates, onAccept }) => {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const chosen = candidates.filter((c) => !excluded.has(c.student.id));

  const toggle = (id: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="fusion">
      <div className="fusion__head">
        <Merge size={18} />
        <strong>
          Unir desde {sources.join(' y ')}: {candidates.length} por aceptar
        </strong>
        <button type="button" className="btn btn-ghost fusion__all" onClick={() => setExcluded(new Set())}>
          Todos
        </button>
        <button
          type="button"
          className="btn btn-ghost fusion__all"
          onClick={() => setExcluded(new Set(candidates.map((c) => c.student.id)))}
        >
          Ninguno
        </button>
      </div>
      {sources.map((src) => {
        const list = candidates.filter((c) => c.fromGroup === src);
        if (list.length === 0) return null;
        return (
          <div key={src} className="fusion__group">
            <span className="fusion__from">{src}</span>
            <div className="fusion__chips">
              {list.map((c) => {
                const on = !excluded.has(c.student.id);
                return (
                  <button
                    key={c.student.id}
                    type="button"
                    className={`fusion__chip${on ? ' is-on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggle(c.student.id)}
                  >
                    {on && <Check size={12} strokeWidth={3} />}
                    {c.student.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        className="btn btn-primary fusion__accept"
        disabled={chosen.length === 0}
        onClick={() => {
          onAccept(chosen);
          setExcluded(new Set());
        }}
      >
        Aceptar {chosen.length} en {groupId}
      </button>
    </div>
  );
};
