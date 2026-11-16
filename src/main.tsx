import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/fonts';
import './styles/theme.css';
import { flushDiskSave, restoreFromDisk } from './engine/diskSync';
import { SESSION_STORAGE_KEY } from './engine/sessionStore';

window.addEventListener('pagehide', flushDiskSave);

// Antes de pintar, trae del disco los datos si son más recientes que los del navegador
restoreFromDisk(SESSION_STORAGE_KEY).finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
