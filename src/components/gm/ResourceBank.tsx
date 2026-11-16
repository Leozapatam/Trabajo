import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Database,
  ExternalLink,
  FileText,
  Film,
  FolderOpen,
  Gamepad2,
  Image as ImageIcon,
  Play,
  Presentation,
  RefreshCw,
  Search,
} from 'lucide-react';
import type { ResourceUsageEntry, SessionState } from '../../engine/types';
import { GameWindow } from '../overlay/GameWindow';

export interface LiveResourceItem {
  id: string;
  title: string;
  fileName: string;
  code: string | null;
  unit: { code: string; name: string; label: string };
  type: 'diapositivas' | 'video' | 'pdf' | 'documento' | 'actividad' | 'datos' | 'imagen' | 'archivo';
  ext: string;
  opcional: boolean;
  size: number;
  mtimeMs: number;
  isDriveShortcut: boolean;
}

interface ResourceUnit {
  code: string;
  name: string;
  label: string;
}

interface ResourceBankProps {
  session: SessionState;
  commit: (updater: (prev: SessionState) => SessionState) => void;
}

const TYPE_OPTIONS: { key: string; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'diapositivas', label: 'Diapositivas' },
  { key: 'video', label: 'Videos' },
  { key: 'pdf', label: 'PDF' },
  { key: 'actividad', label: 'Actividades' },
  { key: 'documento', label: 'Documentos' },
];

function renderTypeIcon(type: LiveResourceItem['type']) {
  switch (type) {
    case 'diapositivas':
      return <Presentation size={16} color="#E8B86D" />;
    case 'video':
      return <Film size={16} color="#38BDF8" />;
    case 'pdf':
      return <FileText size={16} color="#FB7185" />;
    case 'actividad':
      return <Gamepad2 size={16} color="#34D399" />;
    case 'imagen':
      return <ImageIcon size={16} color="#A78BFA" />;
    case 'datos':
      return <Database size={16} color="#F472B6" />;
    default:
      return <Archive size={16} color="#94A3B8" />;
  }
}

export const ResourceBank: React.FC<ResourceBankProps> = ({ session, commit }) => {
  const [resources, setResources] = useState<LiveResourceItem[]>([]);
  const [units, setUnits] = useState<ResourceUnit[]>([]);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [unitFilter, setUnitFilter] = useState('todas');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [query, setQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<LiveResourceItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchIndex = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const res = await fetch(force ? '/api/recursos?refrescar=1' : '/api/recursos');
      if (!res.ok) throw new Error('Servidor local no disponible');
      const data = await res.json();
      setAvailable(Boolean(data.available));
      setUnits(Array.isArray(data.units) ? data.units : []);
      setResources(Array.isArray(data.resources) ? data.resources : []);
    } catch {
      setAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndex(false);
  }, [fetchIndex]);

  const logUsage = (item: LiveResourceItem) => {
    const entry: ResourceUsageEntry = {
      resourceId: item.id,
      title: item.title,
      date: session.classDate,
      classroom: session.classroomName,
      period: session.period,
    };
    commit((prev) => ({
      ...prev,
      resourceLog: [entry, ...(prev.resourceLog ?? [])].slice(0, 300),
    }));
  };

  const handleOpenExternal = async (item: LiveResourceItem, modo: 'presentar' | 'abrir') => {
    logUsage(item);
    try {
      const res = await fetch(`/api/recursos/${item.id}/abrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo }),
      });
      if (!res.ok) throw new Error('No se pudo abrir');
      setActionNotice(
        modo === 'presentar' ? `Presentando: ${item.title}` : `Abriendo: ${item.title}`
      );
      window.setTimeout(() => setActionNotice(null), 2600);
    } catch {
      setActionNotice('No se pudo lanzar el archivo desde el servidor local.');
      window.setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleOpenInApp = (item: LiveResourceItem) => {
    logUsage(item);
    setPreviewItem(item);
  };

  const usedTodayIds = useMemo(() => {
    const set = new Set<string>();
    for (const entry of session.resourceLog ?? []) {
      if (entry.date === session.classDate) set.add(entry.resourceId);
    }
    return set;
  }, [session.resourceLog, session.classDate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('es');
    return resources.filter((r) => {
      if (unitFilter !== 'todas' && r.unit.code !== unitFilter) return false;
      if (typeFilter !== 'todos' && r.type !== typeFilter) return false;
      if (q && !r.title.toLocaleLowerCase('es').includes(q) && !r.unit.label.toLocaleLowerCase('es').includes(q)) {
        return false;
      }
      return true;
    });
  }, [resources, unitFilter, typeFilter, query]);

  return (
    <section className="rpg-window" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FolderOpen size={20} color="#E8B86D" />
          <h2 className="font-pixel" style={{ margin: 0, fontSize: '0.8rem', color: '#FDE68A' }}>
            INVENTARIO DE RECURSOS ({filtered.length})
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {actionNotice && (
            <span className="badge-pill" style={{ color: '#6EE7B7', borderColor: '#34D399' }}>
              {actionNotice}
            </span>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => fetchIndex(true)}
            disabled={loading}
          >
            <RefreshCw size={14} /> {loading ? 'Escaneando...' : 'Refrescar'}
          </button>
        </div>
      </div>

      {/* Aviso limpio cuando Drive o el servidor local no están disponibles */}
      {available === false && !loading && (
        <div className="gm-alert-atencion" style={{ width: '100%', marginBottom: 14 }}>
          Banco de Recursos no disponible en este momento (verifica que el servidor local esté activo y Google Drive conectado).
        </div>
      )}

      {/* Filtros por unidad, tipo y buscador */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 260px) minmax(160px, 200px) 1fr', gap: 10, marginBottom: 16 }}>
        <select aria-label="Filtrar por unidad" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} style={{ padding: '8px 10px' }}>
          <option value="todas">Todas las unidades</option>
          {units.map((u) => (
            <option key={u.code} value={u.code}>
              {u.label}
            </option>
          ))}
        </select>

        <select aria-label="Filtrar por tipo" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '8px 10px' }}>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>

        <label style={{ position: 'relative', display: 'block' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#94A3B8' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar diapositiva, video, guía..."
            style={{ width: '100%', padding: '8px 10px 8px 32px' }}
          />
        </label>
      </div>

      {/* Lista de inventario */}
      {filtered.length === 0 && !loading ? (
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          No hay recursos que coincidan con este filtro.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
          {filtered.map((item) => {
            const usedToday = usedTodayIds.has(item.id);
            return (
              <div
                key={item.id}
                style={{
                  padding: 12,
                  background: usedToday ? 'rgba(52, 211, 153, 0.08)' : 'rgba(13, 21, 38, 0.85)',
                  border: `2px solid ${usedToday ? '#34D399' : 'rgba(148, 163, 184, 0.3)'}`,
                  boxShadow: '3px 3px 0 #04070E',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {renderTypeIcon(item.type)}
                      {item.unit.code !== '00' ? `U${item.unit.code}` : 'GEN'}
                      {item.code ? ` · ${item.code}` : ''}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {item.opcional && (
                        <span className="badge-pill" style={{ padding: '2px 6px', fontSize: '0.62rem', color: '#94A3B8', borderColor: '#475569' }}>
                          Opcional
                        </span>
                      )}
                      {usedToday && (
                        <span className="badge-pill" style={{ padding: '2px 6px', fontSize: '0.62rem', color: '#6EE7B7', borderColor: '#34D399' }}>
                          Usado hoy
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#F8FAFC', lineHeight: 1.3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    {item.unit.name} · {item.ext}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.type === 'diapositivas' && !item.isDriveShortcut && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '5px 11px', fontSize: '0.78rem', flex: 1 }}
                      onClick={() => handleOpenExternal(item, 'presentar')}
                    >
                      <Play size={13} /> Presentar
                    </button>
                  )}

                  {item.type === 'video' && (
                    <button
                      type="button"
                      className="btn btn-teal"
                      style={{ padding: '5px 11px', fontSize: '0.78rem', flex: 1 }}
                      onClick={() => handleOpenInApp(item)}
                    >
                      <Play size={13} /> Ver
                    </button>
                  )}

                  {item.type === 'pdf' && (
                    <button
                      type="button"
                      className="btn btn-teal"
                      style={{ padding: '5px 11px', fontSize: '0.78rem', flex: 1 }}
                      onClick={() => handleOpenInApp(item)}
                    >
                      <FileText size={13} /> Ver
                    </button>
                  )}

                  {item.type === 'actividad' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '5px 11px', fontSize: '0.78rem', flex: 1 }}
                      onClick={() => handleOpenInApp(item)}
                    >
                      <Gamepad2 size={13} /> Jugar
                    </button>
                  )}

                  {item.type === 'imagen' && (
                    <button
                      type="button"
                      className="btn btn-teal"
                      style={{ padding: '5px 11px', fontSize: '0.78rem', flex: 1 }}
                      onClick={() => handleOpenInApp(item)}
                    >
                      <ImageIcon size={13} /> Ver
                    </button>
                  )}

                  {(item.isDriveShortcut ||
                    item.type === 'documento' ||
                    item.type === 'datos' ||
                    item.type === 'archivo') && (
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '5px 11px', fontSize: '0.78rem', flex: 1 }}
                      onClick={() => handleOpenExternal(item, 'abrir')}
                    >
                      <ExternalLink size={13} /> Abrir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visor integrado en GameWindow para Video, PDF, Actividad HTML e Imagen */}
      {previewItem && (
        <GameWindow
          title={previewItem.title}
          icon={renderTypeIcon(previewItem.type)}
          onClose={() => setPreviewItem(null)}
        >
          {previewItem.type === 'video' && (
            <video
              controls
              autoPlay
              src={`/api/recursos/${previewItem.id}/archivo`}
              style={{ width: '100%', maxHeight: '72vh', background: '#000', display: 'block' }}
            />
          )}
          {previewItem.type === 'pdf' && (
            <iframe
              src={`/api/recursos/${previewItem.id}/archivo`}
              title={previewItem.title}
              style={{ width: '100%', height: '74vh', border: 'none', background: '#fff' }}
            />
          )}
          {previewItem.type === 'actividad' && (
            <iframe
              src={`/api/recursos/${previewItem.id}/archivo`}
              title={previewItem.title}
              sandbox="allow-scripts allow-forms allow-popups"
              style={{ width: '100%', height: '74vh', border: 'none', background: '#fff' }}
            />
          )}
          {previewItem.type === 'imagen' && (
            <img
              src={`/api/recursos/${previewItem.id}/archivo`}
              alt={previewItem.title}
              style={{ maxWidth: '100%', maxHeight: '74vh', display: 'block', margin: '0 auto' }}
            />
          )}
        </GameWindow>
      )}
    </section>
  );
};
