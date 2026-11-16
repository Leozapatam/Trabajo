import React, { useEffect, useState } from 'react';
import { HardDrive, HardDriveUpload, TriangleAlert } from 'lucide-react';
import { getDiskSyncInfo, subscribeDiskSync, type DiskSyncInfo } from '../../engine/diskSync';

function formatTime(ts: number | null): string {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

/** Indicador discreto de guardado en disco para la barra del Game Master */
export const DiskStatusBadge: React.FC = () => {
  const [info, setInfo] = useState<DiskSyncInfo>(getDiskSyncInfo);
  useEffect(() => subscribeDiskSync(setInfo), []);

  if (info.status === 'conflicto') {
    return (
      <button
        type="button"
        className="badge-pill"
        style={{ color: '#FDE68A', borderColor: '#E8B86D', cursor: 'pointer', background: 'rgba(232,184,109,0.12)' }}
        onClick={() => window.location.reload()}
        title="Otra ventana o navegador guardó cambios más recientes. Recarga para trabajar sobre esa versión; el último cambio de esta ventana no se guardó."
      >
        <TriangleAlert size={13} /> Otra ventana guardó cambios · Recargar
      </button>
    );
  }
  if (info.status === 'sin-disco') {
    return (
      <span
        className="badge-pill"
        style={{ color: '#FCA5A5', borderColor: '#F87171' }}
        title="El servidor local no responde: los datos solo quedan en este navegador. Abre la app con el acceso directo de Expedición 6."
      >
        <TriangleAlert size={13} /> Sin respaldo en disco
      </span>
    );
  }
  if (info.status === 'guardando') {
    return (
      <span className="badge-pill" style={{ color: '#FDE68A' }}>
        <HardDriveUpload size={13} /> Guardando…
      </span>
    );
  }
  if (info.status === 'guardado') {
    return (
      <span className="badge-pill" style={{ color: '#6EE7B7' }} title="Datos guardados en el disco del PC">
        <HardDrive size={13} /> Guardado {formatTime(info.savedAt)}
      </span>
    );
  }
  return null;
};
