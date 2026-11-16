import React, { useEffect, useRef } from 'react';
import type { SceneDefinition } from '../../engine/types';
import { SceneNotes } from './SceneNotes';

interface NotesDrawerProps {
  scene: SceneDefinition;
  sceneIndex: number;
  sceneCount: number;
  hintsShown: number;
  onClose: () => void;
}

/** Notas de orador en un panel lateral: se abren con N y no tapan el mapa */
export const NotesDrawer: React.FC<NotesDrawerProps> = ({ scene, sceneIndex, sceneCount, hintsShown, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <aside className="notes-drawer" role="dialog" aria-label="Notas de orador">
      <header className="notes-drawer__bar">
        <span className="notes-drawer__label">
          NOTAS DE ORADOR · ESCENA {sceneIndex + 1} DE {sceneCount}
        </span>
        <button ref={closeRef} type="button" className="inv__close" onClick={onClose}>
          ✕ N
        </button>
      </header>
      <SceneNotes scene={scene} hintsShown={hintsShown} />
    </aside>
  );
};
