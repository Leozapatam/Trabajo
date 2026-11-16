import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CinematicStage } from './components/CinematicStage';
import { LandingPage } from './pages/LandingPage';

// La portada carga de inmediato; las demás pantallas se descargan al entrar
const AulasPage = lazy(() => import('./pages/AulasPage').then((m) => ({ default: m.AulasPage })));
const RollCallPage = lazy(() => import('./pages/RollCallPage').then((m) => ({ default: m.RollCallPage })));
const ClassPage = lazy(() => import('./pages/ClassPage').then((m) => ({ default: m.ClassPage })));
const GroupsPage = lazy(() => import('./pages/GroupsPage').then((m) => ({ default: m.GroupsPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then((m) => ({ default: m.AchievementsPage })));
const ProjectorPage = lazy(() => import('./pages/ProjectorPage').then((m) => ({ default: m.ProjectorPage })));

const Loading: React.FC = () => (
  <div
    className="font-pixel"
    style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#060a13', color: '#fde68a', fontSize: '0.7rem' }}
  >
    CARGANDO…
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Transición cinemática para todas las pantallas (no quitar: ver CinematicStage) */}
      <CinematicStage>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/aulas" element={<AulasPage />} />
            <Route path="/lista" element={<RollCallPage />} />
            <Route path="/clase" element={<ClassPage />} />
            <Route path="/grupos" element={<GroupsPage />} />
            <Route path="/logros" element={<AchievementsPage />} />
            {/* El panel clásico se retiró: los enlaces viejos llevan a la pantalla de clase */}
            <Route path="/game-master" element={<Navigate to="/clase" replace />} />
            <Route path="/projector" element={<ProjectorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </CinematicStage>
    </BrowserRouter>
  );
};

export default App;
