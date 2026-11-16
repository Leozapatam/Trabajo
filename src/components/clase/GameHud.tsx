import React from 'react';
import { Heart, Star } from 'lucide-react';
import { getHeartsLeft, getStarProgress, HEARTS_PER_CLASS, POINTS_PER_STAR, STARS_GOAL } from '../../engine/classGame';
import type { SessionState } from '../../engine/types';
import '../../styles/game-hud.css';

interface GameHudProps {
  session: SessionState;
  /** Sin manejadores es solo lectura (proyector) */
  onHeart?: (lost: 1 | -1) => void;
  onStar?: (delta: 1 | -1) => void;
  onClaim?: () => void;
  size?: 'sm' | 'md' | 'lg';
  /** En el proyector van separados: corazones a la izquierda, estrellas a la derecha */
  show?: 'both' | 'hearts' | 'stars';
}

/**
 * Corazones del grupo (llamados de atención de la clase) y estrellas de participación.
 * Clic apaga un corazón o da una estrella; clic derecho lo deshace.
 */
export const GameHud: React.FC<GameHudProps> = ({ session, onHeart, onStar, onClaim, size = 'md', show = 'both' }) => {
  const hearts = getHeartsLeft(session);
  const stars = getStarProgress(session);
  const readOnly = !onHeart;
  const icon = size === 'lg' ? 34 : size === 'sm' ? 18 : 22;

  const right = (fn?: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    fn?.();
  };

  return (
    <div className={`game-hud is-${size}`}>
      {show !== 'stars' && (
      <button
        type="button"
        className={`game-hud__hearts${hearts === 0 ? ' is-out' : ''}`}
        disabled={readOnly}
        onClick={() => onHeart?.(1)}
        onContextMenu={right(() => onHeart?.(-1))}
        title={readOnly ? undefined : 'Clic: llamado de atención al grupo · clic derecho: devolver corazón'}
        aria-label={`${hearts} de ${HEARTS_PER_CLASS} corazones`}
      >
        {Array.from({ length: HEARTS_PER_CLASS }, (_, i) => (
          <Heart
            key={i}
            size={icon}
            className={`game-hud__heart${i < hearts ? ' is-on' : ''}`}
            fill={i < hearts ? 'currentColor' : 'none'}
            strokeWidth={2.2}
          />
        ))}
        {hearts === 0 && <span className="game-hud__tag">TAREA EXTENSA</span>}
      </button>
      )}

      {show !== 'hearts' && (
      <button
        type="button"
        className={`game-hud__stars${stars.goalReached ? ' is-full' : ''}`}
        disabled={readOnly}
        onClick={() => (stars.goalReached ? onClaim?.() : onStar?.(1))}
        onContextMenu={right(() => onStar?.(-1))}
        title={
          readOnly
            ? undefined
            : stars.goalReached
              ? 'Clic: el grupo cobra su recompensa'
              : `Cada ${POINTS_PER_STAR} puntos de aporte encienden una estrella · clic: dar estrella · clic derecho: quitar`
        }
        aria-label={`${stars.stars} de ${STARS_GOAL} estrellas`}
      >
        {Array.from({ length: STARS_GOAL }, (_, i) => {
          const on = i < stars.stars;
          const filling = i === stars.stars && !stars.goalReached;
          return (
            <span key={i} className="game-hud__star-slot">
              <Star
                size={icon}
                className={`game-hud__star${on ? ' is-on' : ''}`}
                fill={on ? 'currentColor' : 'none'}
                strokeWidth={2.2}
              />
              {filling && stars.partial > 0 && (
                <span className="game-hud__star-fill" style={{ width: `${(stars.partial / POINTS_PER_STAR) * 100}%` }} />
              )}
            </span>
          );
        })}
        {stars.goalReached && <span className="game-hud__tag is-gold">¡RECOMPENSA!</span>}
      </button>
      )}
    </div>
  );
};
