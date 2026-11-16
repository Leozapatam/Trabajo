import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { WorldMapPage } from './pages/WorldMapPage';
import { GameMasterPage } from './pages/GameMasterPage';
import { ProjectorPage } from './pages/ProjectorPage';
import { ExplorerPage } from './pages/ExplorerPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/origenes" element={<WorldMapPage />} />
        <Route path="/game-master" element={<GameMasterPage />} />
        <Route path="/projector" element={<ProjectorPage />} />
        <Route path="/explorar" element={<ExplorerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
