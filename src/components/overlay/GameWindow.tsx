import React, { useEffect, useRef } from 'react';
import '../../styles/game-window.css';

interface GameWindowProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

/** Semiventana tipo juego dentro de la pantalla. Esc o clic afuera la cierran. */
export const GameWindow: React.FC<GameWindowProps> = ({ title, icon, onClose, children }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="game-window__backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="game-window" role="dialog" aria-modal="true" aria-label={title}>
        <div className="game-window__bar">
          <h2 className="game-window__title">
            {icon}
            {title}
          </h2>
          <button ref={closeRef} type="button" className="game-window__close" onClick={onClose}>
            ✕ ESC
          </button>
        </div>
        <div className="game-window__body">{children}</div>
      </div>
    </div>
  );
};
