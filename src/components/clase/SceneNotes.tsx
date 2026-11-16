import React from 'react';
import { BookOpen, MessageCircle, MonitorPlay } from 'lucide-react';
import type { SceneDefinition } from '../../engine/types';

/** Primera oración en negrilla y el resto normal: se lee de un vistazo */
function Emphasis({ text }: { text: string }) {
  const match = /^(.+?[.!?:])(\s+)([\s\S]*)$/.exec(text.trim());
  if (!match) return <strong>{text}</strong>;
  return (
    <>
      <strong>{match[1]}</strong> {match[3]}
    </>
  );
}

interface SceneNotesProps {
  scene: SceneDefinition;
  hintsShown: number;
}

/**
 * Notas del profe para una escena, como esquema de 3 pasos:
 * narra lo que ve el grupo → dialoga con el guion → cierra en el cuaderno.
 */
export const SceneNotes: React.FC<SceneNotesProps> = ({ scene, hintsShown }) => {
  const steps = [
    { key: 'narra', n: 1, label: 'NARRA', icon: <MonitorPlay size={16} />, text: scene.narrative },
    { key: 'dialoga', n: 2, label: 'DIALOGA', icon: <MessageCircle size={16} />, text: scene.teacherNotes.facilitationScript },
    ...(scene.notebookPrompt
      ? [{ key: 'cuaderno', n: 3, label: 'CUADERNO', icon: <BookOpen size={16} />, text: scene.notebookPrompt }]
      : []),
  ];

  return (
    <article key={scene.id} className="clase__script notes">
      <h1 className="clase__title">{scene.title}</h1>
      <p className="notes__question">{scene.promptQuestion}</p>

      <ol className="notes__flow">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            {i > 0 && <li className="notes__arrow" aria-hidden="true">➜</li>}
            <li className={`notes__step is-${s.key}`}>
              <span className="notes__step-head">
                <span className="notes__step-n">{s.n}</span>
                {s.icon}
                {s.label}
              </span>
              <p className="notes__step-text">
                <Emphasis text={s.text} />
              </p>
              {s.key === 'dialoga' && scene.hints.length > 0 && (
                <p className="notes__hints">
                  <span>Si se traban:</span>
                  {scene.hints.map((h, hi) => (
                    <span key={hi} className={`notes__hint${hi < hintsShown ? ' is-shown' : ''}`} title={h}>
                      pista {hi + 1}
                    </span>
                  ))}
                </p>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </article>
  );
};
