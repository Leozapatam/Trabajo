import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { GameMasterPage } from './pages/GameMasterPage';
import { GroupsPage } from './pages/GroupsPage';
import { ProjectorPage } from './pages/ProjectorPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/grupos" element={<GroupsPage />} />
        <Route path="/game-master" element={<GameMasterPage />} />
        <Route path="/projector" element={<ProjectorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
