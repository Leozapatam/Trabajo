import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/transitions.css';

/**
 * Transición cinemática entre pantallas: la escena entra desde negro con dos
 * franjas de cine que se abren y un leve acercamiento.
 *
 * Es la ÚNICA fuente de transiciones entre rutas: App.tsx envuelve todas las rutas
 * con este componente (lo verifica src/__tests__/transitions.test.ts). Las pantallas
 * nuevas la heredan solas; no hace falta tocarlas.
 */
export const CinematicStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  return (
    // La clave por ruta reinicia la animación en cada cambio de pantalla
    <div key={pathname} className="cine-stage">
      {children}
      <div className="cine-curtain" aria-hidden="true">
        <span className="cine-curtain__bar is-top" />
        <span className="cine-curtain__glint" />
        <span className="cine-curtain__bar is-bottom" />
      </div>
    </div>
  );
};
