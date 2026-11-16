import React from 'react';

/** Tamaño real con que se dibuja el proyector antes de reducirlo */
const BASE_W = 1280;
const BASE_H = 720;

interface ProjectorMirrorProps {
  width?: number;
  onOpen: () => void;
}

/**
 * Minipantalla: la misma vista del proyector, en vivo y en pequeño, para ver
 * desde el puesto del profe lo que el grupo tiene enfrente. Clic abre el proyector.
 */
export const ProjectorMirror: React.FC<ProjectorMirrorProps> = ({ width = 216, onOpen }) => {
  const scale = width / BASE_W;
  return (
    <button
      type="button"
      className="mirror"
      style={{ width, height: BASE_H * scale }}
      onClick={onOpen}
      title="Lo que se ve en el proyector · clic para abrir la ventana (P)"
    >
      <iframe
        className="mirror__frame"
        src="/projector?espejo=1"
        title="Vista del proyector"
        tabIndex={-1}
        aria-hidden="true"
        style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})` }}
      />
      <span className="mirror__tag">
        <span className="mirror__dot" /> EN VIVO
      </span>
    </button>
  );
};
