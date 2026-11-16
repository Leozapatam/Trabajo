import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Compass,
  Info,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ORIGENES_WORLD } from '../data/origenesWorld';
import { MISION_001 } from '../data/mision001';
import {
  createInitialExplorerProgress,
  loadExplorerProgress,
  saveExplorerProgress,
} from '../engine/explorerStore';
import type { ExplorerProgress } from '../engine/types';
import { CosmicBackdrop } from '../components/CosmicBackdrop';

export const ExplorerPage: React.FC = () => {
  const [progress, setProgress] = useState<ExplorerProgress>(() => loadExplorerProgress());
  const [activeZoneId, setActiveZoneId] = useState<string>(progress.lastVisitedZone || 'zona-1');

  // Estado interactivo del Reto 1 (selección de evidencias válidas)
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);
  const [evidenceChecked, setEvidenceChecked] = useState(false);

  // Estado interactivo del Reto 2 (ordenar formación solar)
  const [solarOrder, setSolarOrder] = useState<string[]>([
    'sol-3',
    'sol-1',
    'sol-4',
    'sol-2',
  ]);
  const [solarChecked, setSolarChecked] = useState(false);

  // Estado interactivo del Reto 3 (escala geológica: 1.000 millones vs 1 millón)
  const [scaleAnswer, setScaleAnswer] = useState<string | null>(null);

  const updateProgress = (updater: (prev: ExplorerProgress) => ExplorerProgress) => {
    setProgress((prev) => saveExplorerProgress(updater(prev)));
  };

  const handleSelectZone = (zoneId: string) => {
    setActiveZoneId(zoneId);
    updateProgress((prev) => ({
      ...prev,
      lastVisitedZone: zoneId,
      discoveredZones: prev.discoveredZones.includes(zoneId)
        ? prev.discoveredZones
        : [...prev.discoveredZones, zoneId],
    }));
  };

  const handleCompleteChallenge = (challengeId: string, badge: string) => {
    updateProgress((prev) => ({
      ...prev,
      completedChallenges: prev.completedChallenges.includes(challengeId)
        ? prev.completedChallenges
        : [...prev.completedChallenges, challengeId],
      earnedBadges: prev.earnedBadges.includes(badge)
        ? prev.earnedBadges
        : [...prev.earnedBadges, badge],
    }));
  };

  const evidences = MISION_001.scenes[1].challengeData?.evidences ?? [];
  const solarStages = MISION_001.scenes[3].challengeData?.solarStages ?? [];
  const activeZone = ORIGENES_WORLD.zones.find((z) => z.id === activeZoneId) ?? ORIGENES_WORLD.zones[0];

  const handleCheckEvidences = () => {
    setEvidenceChecked(true);
    const validIds = evidences.filter((e) => e.isValidEvidence).map((e) => e.id).sort();
    const chosen = [...selectedEvidences].sort();
    if (JSON.stringify(validIds) === JSON.stringify(chosen)) {
      handleCompleteChallenge('reto-evidencias', 'Investigación Cósmica');
    }
  };

  const moveSolarStage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= solarOrder.length) return;
    const copy = [...solarOrder];
    const tmp = copy[index];
    copy[index] = copy[target];
    copy[target] = tmp;
    setSolarOrder(copy);
    setSolarChecked(false);
  };

  const handleCheckSolar = () => {
    setSolarChecked(true);
    const expected = ['sol-1', 'sol-2', 'sol-3', 'sol-4'];
    if (JSON.stringify(solarOrder) === JSON.stringify(expected)) {
      handleCompleteChallenge('reto-solar', 'Pensamiento Espacial');
    }
  };

  const handleSelectScale = (option: string) => {
    setScaleAnswer(option);
    if (option === '1000') {
      handleCompleteChallenge('reto-tiempo', 'Descubrimiento Geológico');
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      <CosmicBackdrop accent={activeZone.accentColor} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto', padding: '18px 16px 64px' }}>
        {/* Navegación móvil-friendly */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <Link to="/" className="btn btn-ghost" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} /> Inicio
          </Link>
          <span className="badge-pill" style={{ color: 'var(--accent-teal)', borderColor: 'var(--border-teal)' }}>
            <Compass size={14} /> Modo Explorador (Casa)
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '7px 10px', fontSize: '0.8rem' }}
            onClick={() => {
              const fresh = createInitialExplorerProgress();
              setProgress(saveExplorerProgress(fresh));
              setSelectedEvidences([]);
              setEvidenceChecked(false);
              setSolarChecked(false);
              setScaleAnswer(null);
            }}
          >
            <RotateCcw size={14} /> Reiniciar progreso
          </button>
        </header>

        {/* Aviso transparente de almacenamiento local */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid var(--border-teal)',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            marginBottom: 18,
          }}
        >
          <Info size={18} color="#38BDF8" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Sin cuentas ni datos personales:</strong> No necesitas usuario ni contraseña. Tu progreso se
            guarda únicamente en este navegador y dispositivo, y no está sincronizado con tu docente.
          </div>
        </div>

        {/* Insignias del explorador */}
        <section className="editorial-card" style={{ padding: 16, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent-gold)' }}>
              EXPEDIENTE LOCAL · INSIGNIAS ({progress.earnedBadges.length}/3)
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {progress.earnedBadges.length === 0 ? (
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Completa los retos de las zonas para ganar insignias simbólicas.
                </span>
              ) : (
                progress.earnedBadges.map((b) => (
                  <span key={b} className="badge-pill" style={{ color: '#FDE68A', borderColor: 'var(--border-gold)' }}>
                    <Award size={13} /> {b}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Selector táctil de las 4 Zonas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 20 }}>
          {ORIGENES_WORLD.zones.map((z) => {
            const active = z.id === activeZoneId;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => handleSelectZone(z.id)}
                className="editorial-card"
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  borderColor: active ? z.accentColor : 'var(--border-subtle)',
                  background: active ? 'rgba(255,255,255,0.06)' : 'var(--bg-panel)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="font-mono" style={{ fontSize: '0.72rem', color: z.accentColor }}>
                  ZONA {z.number}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', marginTop: 2 }}>{z.title}</div>
              </button>
            );
          })}
        </div>

        {/* Contenido interactivo por zona */}
        <main className="editorial-card" style={{ padding: '20px 18px' }}>
          <h1 className="font-display" style={{ fontSize: '1.9rem', margin: '0 0 6px' }}>
            {activeZone.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.55 }}>{activeZone.summary}</p>

          {activeZoneId === 'zona-1' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '1.08rem', margin: '0 0 8px', color: 'var(--accent-teal)' }}>
                  Reto 1: Selecciona las 2 pistas científicas válidas sobre la expansión del universo
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {evidences.map((ev) => {
                    const checked = selectedEvidences.includes(ev.id);
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          setEvidenceChecked(false);
                          setSelectedEvidences((prev) =>
                            prev.includes(ev.id) ? prev.filter((x) => x !== ev.id) : [...prev, ev.id]
                          );
                        }}
                        style={{
                          textAlign: 'left',
                          padding: 12,
                          borderRadius: 10,
                          border: `1px solid ${checked ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                          background: checked ? 'var(--accent-gold-soft)' : 'rgba(0,0,0,0.2)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{ev.title}</div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>{ev.summary}</div>
                        {evidenceChecked && checked && (
                          <div style={{ fontSize: '0.84rem', marginTop: 6, color: ev.isValidEvidence ? '#6EE7B7' : '#FECDD3' }}>
                            {ev.scientificFeedback}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleCheckEvidences}>
                  Comprobar pistas
                </button>
                {evidenceChecked && progress.completedChallenges.includes('reto-evidencias') && (
                  <p style={{ color: '#6EE7B7', marginTop: 10, fontWeight: 600 }}>
                    <CheckCircle2 size={16} style={{ verticalAlign: 'text-bottom' }} /> ¡Excelente! Has ganado la insignia Investigación Cósmica.
                  </p>
                )}
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: 'var(--accent-gold-soft)', border: '1px solid var(--border-gold)' }}>
                <strong style={{ color: '#FDE68A' }}>Ciencia y Cosmogonías Culturales:</strong>
                <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeZone.nodes[2].culturalNote}
                </p>
              </div>
            </div>
          )}

          {activeZoneId === 'zona-2' && (
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontSize: '1.08rem', margin: '0 0 8px', color: 'var(--accent-gold)' }}>
                Reto 2: Ordena las 4 etapas del nacimiento del Sistema Solar
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Usa los botones Subir / Bajar para organizar la secuencia causal.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {solarOrder.map((id, idx) => {
                  const stage = solarStages.find((s) => s.id === id);
                  if (!stage) return null;
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                        padding: 12,
                        borderRadius: 10,
                        background: 'rgba(0,0,0,0.22)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{idx + 1}. {stage.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stage.description}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => moveSolarStage(idx, -1)}>
                          Subir
                        </button>
                        <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => moveSolarStage(idx, 1)}>
                          Bajar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleCheckSolar}>
                Verificar secuencia
              </button>
              {solarChecked && (
                <p style={{ marginTop: 10, color: progress.completedChallenges.includes('reto-solar') ? '#6EE7B7' : '#FDE68A' }}>
                  {progress.completedChallenges.includes('reto-solar')
                    ? '¡Correcto! La gravedad colapsó la nebulosa en un disco giratorio, encendió el Sol y formó los planetas.'
                    : 'Revisa qué debe ocurrir primero: la nube colapsa antes de aplanarse en disco y formar planetas.'}
                </p>
              )}
            </div>
          )}

          {activeZoneId === 'zona-3' && (
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontSize: '1.08rem', margin: '0 0 8px', color: 'var(--accent-terra)' }}>
                Reto 3: Dimensión del tiempo geológico
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Si 1 millón de años equivaliera a 1 paso, ¿cuántos pasos necesitarías para representar 1.000 millones de años?
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['10', '100', '1000'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={scaleAnswer === opt ? 'btn btn-primary' : 'btn'}
                    onClick={() => handleSelectScale(opt)}
                  >
                    {opt} pasos
                  </button>
                ))}
              </div>
              {scaleAnswer && (
                <p style={{ marginTop: 12, color: scaleAnswer === '1000' ? '#6EE7B7' : '#FECDD3' }}>
                  {scaleAnswer === '1000'
                    ? '¡Exacto! Mil millones es mil veces un millón. La Tierra tiene ~4.540 millones de años y Pangea existió hace ~250 millones de años.'
                    : 'Recuerda: 1.000 millones contiene mil veces a 1 millón.'}
                </p>
              )}
            </div>
          )}

          {activeZoneId === 'zona-4' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeZone.nodes.map((n) => (
                <div key={n.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--accent-emerald)' }}>{n.title}</strong>
                  <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {n.scientificDetail}
                  </p>
                </div>
              ))}
              <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-gold)', background: 'var(--accent-gold-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-gold)', fontSize: '0.8rem' }}>
                  <Sparkles size={15} /> CIERRE DE ORÍGENES
                </div>
                <p className="font-display" style={{ fontSize: '1.45rem', margin: '8px 0 0' }}>
                  {activeZone.narrativeBridge}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
