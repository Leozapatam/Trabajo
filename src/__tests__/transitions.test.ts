import { describe, expect, it } from 'vitest';
import appSource from '../App.tsx?raw';
import stageSource from '../components/CinematicStage.tsx?raw';

/** Guardia: las transiciones cinemáticas no deben perderse cuando cambian las pantallas */
describe('Transiciones cinemáticas', () => {
  it('todas las rutas van dentro de CinematicStage', () => {
    const app = appSource;
    const stageStart = app.indexOf('<CinematicStage>');
    const stageEnd = app.indexOf('</CinematicStage>');
    expect(stageStart).toBeGreaterThan(-1);
    const routes = app.slice(app.indexOf('<Routes>'), app.indexOf('</Routes>'));
    expect(routes.length).toBeGreaterThan(0);
    expect(app.indexOf('<Routes>')).toBeGreaterThan(stageStart);
    expect(app.indexOf('</Routes>')).toBeLessThan(stageEnd);
  });

  it('el escenario carga sus estilos y monta la cortina', () => {
    for (const part of ["'../styles/transitions.css'", 'cine-stage', 'cine-curtain', 'key={pathname}']) {
      expect(stageSource).toContain(part);
    }
  });
});
