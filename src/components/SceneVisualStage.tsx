import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Layers,
  Sparkles,
  Telescope,
} from 'lucide-react';
import type { PublicProjectorSceneView } from '../engine/sessionStore';

interface SceneVisualStageProps {
  scene: PublicProjectorSceneView;
  activeInspectionId?: string | null;
  onSelectInspection?: (id: string) => void;
  compact?: boolean;
}

export const SceneVisualStage: React.FC<SceneVisualStageProps> = ({
  scene,
  activeInspectionId,
  onSelectInspection,
  compact = false,
}) => {
  const { type, challengeData, revealed } = scene;

  if (type === 'opening') {
    return (
      <div
        className="editorial-card"
        style={{
          padding: compact ? 20 : 32,
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : '1.1fr 1fr',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <div>
          <span className="badge-pill" style={{ color: 'var(--accent-gold)', borderColor: 'var(--border-gold)' }}>
            <Sparkles size={14} /> Hipótesis inicial · Cuaderno
          </span>
          <h2
            className="font-display"
            style={{
              fontSize: compact ? '1.7rem' : 'clamp(2rem, 3.2vw, 3rem)',
              lineHeight: 1.15,
              margin: '16px 0 14px',
              color: 'var(--text-primary)',
            }}
          >
            «{scene.promptQuestion}»
          </h2>
          <p style={{ fontSize: compact ? '1rem' : '1.18rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {scene.narrative}
          </p>
          {scene.notebookPrompt && (
            <div
              style={{
                marginTop: 18,
                padding: '14px 16px',
                borderRadius: 10,
                background: 'var(--accent-gold-soft)',
                border: '1px solid var(--border-gold)',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <BookOpen size={20} color="#E8B86D" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: compact ? '0.92rem' : '1.05rem', color: '#FDE68A' }}>
                <strong>En tu cuaderno:</strong> {scene.notebookPrompt}
              </div>
            </div>
          )}
        </div>

        {/* Ilustración vectorial del universo temprano en expansión */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg
            viewBox="0 0 400 320"
            style={{ width: '100%', maxWidth: 420, height: 'auto' }}
            role="img"
            aria-label="Representación de la expansión inicial del espacio"
          >
            <defs>
              <radialGradient id="earlyCosmos" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.95" />
                <stop offset="32%" stopColor="#D97757" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#060A13" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="160" r="145" fill="url(#earlyCosmos)" className="animate-drift" />
            <circle
              cx="200"
              cy="160"
              r="65"
              fill="none"
              stroke="rgba(232, 184, 109, 0.45)"
              strokeDasharray="4 6"
              className="animate-pulse-ring"
            />
            <circle cx="200" cy="160" r="105" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeDasharray="3 8" />
            <circle cx="200" cy="160" r="14" fill="#FEF3C7" />
            <text
              x="200"
              y="296"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="12"
              fontFamily="JetBrains Mono, monospace"
            >
              EXPANSIÓN DEL ESPACIO · ESTADO DENSO Y CALIENTE
            </text>
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'evidence-challenge' && challengeData?.evidences) {
    return (
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {challengeData.evidences.map((ev) => {
            const isSelected = activeInspectionId === ev.id;
            const borderColor = revealed
              ? ev.isValidEvidence
                ? 'var(--accent-emerald)'
                : 'rgba(251, 113, 133, 0.55)'
              : isSelected
              ? 'var(--accent-gold)'
              : 'var(--border-subtle)';

            return (
              <div
                key={ev.id}
                role={onSelectInspection ? 'button' : undefined}
                tabIndex={onSelectInspection ? 0 : undefined}
                onClick={() => onSelectInspection?.(ev.id)}
                onKeyDown={(e) => {
                  if (onSelectInspection && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectInspection(ev.id);
                  }
                }}
                className="editorial-card"
                style={{
                  padding: compact ? 16 : 22,
                  borderColor,
                  background: isSelected ? 'rgba(232, 184, 109, 0.08)' : 'var(--bg-panel)',
                  cursor: onSelectInspection ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: 700,
                      fontSize: compact ? '1rem' : '1.15rem',
                      color: 'var(--accent-teal)',
                    }}
                  >
                    <Telescope size={18} /> {ev.title}
                  </span>
                  {revealed && (
                    <span
                      className="badge-pill"
                      style={{
                        color: ev.isValidEvidence ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        borderColor: ev.isValidEvidence ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      }}
                    >
                      {ev.isValidEvidence ? (
                        <>
                          <CheckCircle2 size={14} /> Evidencia válida
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} /> Descartada
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p style={{ margin: '10px 0 8px', color: 'var(--text-primary)', fontSize: compact ? '0.95rem' : '1.08rem' }}>
                  {ev.summary}
                </p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: compact ? '0.86rem' : '0.95rem', lineHeight: 1.5 }}>
                  {ev.detail}
                </p>

                {revealed && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: '1px solid var(--border-subtle)',
                      color: ev.isValidEvidence ? '#A7F3D0' : '#FECDD3',
                      fontSize: '0.92rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {ev.scientificFeedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'timeline-construction' && challengeData?.timelineEvents) {
    // Antes de revelar, mostramos los eventos en orden investigativo mezclado para que los equipos deliberen
    const events = revealed
      ? [...challengeData.timelineEvents].sort((a, b) => a.order - b.order)
      : [
          challengeData.timelineEvents[2],
          challengeData.timelineEvents[0],
          challengeData.timelineEvents[3],
          challengeData.timelineEvents[1],
        ].filter(Boolean);

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : 'repeat(4, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        {events.map((item, idx) => (
          <div
            key={item.id}
            className="editorial-card"
            style={{
              padding: compact ? 16 : 20,
              borderColor: revealed ? 'var(--border-gold)' : 'var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent-gold)' }}>
                  {revealed ? `PASO ${item.order}` : `BLOQUE ${String.fromCharCode(65 + idx)}`}
                </span>
                {revealed && idx < events.length - 1 && !compact && (
                  <ArrowRight size={16} color="var(--accent-gold)" />
                )}
              </div>
              <h3
                className="font-display"
                style={{ fontSize: compact ? '1.25rem' : '1.42rem', margin: '8px 0 6px', lineHeight: 1.2 }}
              >
                {item.title}
              </h3>
              <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', marginBottom: 8 }}>
                {item.relativeEra}
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.48 }}>
                {item.causalExplanation}
              </p>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
              {item.visualCue}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'solar-reconstruction' && challengeData?.solarStages) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Diagrama ilustrado del Sistema Solar */}
        <div className="editorial-card" style={{ padding: compact ? 14 : 18 }}>
          <svg
            viewBox="0 0 900 180"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            role="img"
            aria-label="Esquema comparativo del Sol, planetas rocosos interiores y gigantes exteriores"
          >
            <defs>
              <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="65%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="48" cy="90" r="44" fill="url(#sunGrad)" />
            <text x="48" y="156" textAnchor="middle" fill="#FDE68A" fontSize="11" fontFamily="JetBrains Mono">
              SOL
            </text>

            {/* Línea divisoria térmica */}
            <line x1="415" y1="20" x2="415" y2="160" stroke="rgba(56,189,248,0.35)" strokeDasharray="4 4" />
            <text x="255" y="26" textAnchor="middle" fill="#D97757" fontSize="11" fontFamily="JetBrains Mono">
              ZONA CÁLIDA · PLANETAS ROCOSOS
            </text>
            <text x="655" y="26" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">
              ZONA FRÍA · GIGANTES GASEOSOS Y HELADOS
            </text>

            {/* Planetas */}
            {[
              { name: 'Mercurio', x: 140, r: 6, color: '#94A3B8' },
              { name: 'Venus', x: 198, r: 9, color: '#E8B86D' },
              { name: 'Tierra', x: 265, r: 10, color: '#38BDF8', highlight: true },
              { name: 'Marte', x: 335, r: 7, color: '#D97757' },
              { name: 'Júpiter', x: 485, r: 24, color: '#E0A96D' },
              { name: 'Saturno', x: 605, r: 20, color: '#FDE68A', ring: true },
              { name: 'Urano', x: 720, r: 14, color: '#67E8F9' },
              { name: 'Neptuno', x: 825, r: 14, color: '#60A5FA' },
            ].map((p) => (
              <g key={p.name}>
                {p.highlight && (
                  <circle cx={p.x} cy={90} r={p.r + 7} fill="none" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3 3" />
                )}
                {p.ring && (
                  <ellipse cx={p.x} cy={90} rx={34} ry={8} fill="none" stroke="rgba(253,230,138,0.65)" strokeWidth="2.5" />
                )}
                <circle cx={p.x} cy={90} r={p.r} fill={p.color} />
                <text
                  x={p.x}
                  y={156}
                  textAnchor="middle"
                  fill={p.highlight ? '#34D399' : '#CBD5E1'}
                  fontSize="11"
                  fontWeight={p.highlight ? '700' : '400'}
                >
                  {p.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : 'repeat(4, minmax(0, 1fr))',
            gap: 14,
          }}
        >
          {challengeData.solarStages.map((stage) => (
            <div key={stage.id} className="editorial-card" style={{ padding: 16 }}>
              <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--accent-gold)' }}>
                ETAPA {stage.order}
              </span>
              <h3 className="font-display" style={{ fontSize: '1.3rem', margin: '6px 0' }}>
                {stage.title}
              </h3>
              <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.45 }}>
                {stage.description}
              </p>
              {revealed && (
                <div style={{ fontSize: '0.84rem', color: 'var(--accent-teal)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  {stage.keyRelation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'geological-scale' && challengeData?.geologicalEpochs) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Comparador visual: 1 millón vs 1.000 millones */}
        <div className="editorial-card" style={{ padding: compact ? 14 : 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--accent-gold)' }}>
              ESCALA DE TIEMPO PROFUNDO · 4.540 MILLONES DE AÑOS
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              1.000 millones = 1.000 veces un millón
            </span>
          </div>
          <div style={{ height: 14, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '23%', background: '#D97757' }} title="Tierra primitiva" />
            <div style={{ width: '71%', background: '#38BDF8' }} title="Océanos y vida microbiana" />
            <div style={{ width: '5%', background: '#E8B86D' }} title="Pangea y dinosaurios" />
            <div style={{ width: '1%', background: '#34D399' }} title="Era reciente y relieve actual" />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : 'repeat(4, minmax(0, 1fr))',
            gap: 14,
          }}
        >
          {challengeData.geologicalEpochs.map((epoch) => (
            <div key={epoch.id} className="editorial-card" style={{ padding: 16 }}>
              <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--accent-terra)' }}>
                {epoch.timeAgoLabel}
              </span>
              <h3 className="font-display" style={{ fontSize: '1.3rem', margin: '6px 0' }}>
                {epoch.name}
              </h3>
              <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.45 }}>
                {epoch.summary}
              </p>
              {revealed && (
                <div style={{ fontSize: '0.84rem', color: 'var(--accent-emerald)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  {epoch.keyChange}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'notebook-expedition' && challengeData?.rubric) {
    return (
      <div className="editorial-card" style={{ padding: compact ? 18 : 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Layers size={20} color="#E8B86D" />
          <h3 className="font-display" style={{ fontSize: '1.6rem', margin: 0 }}>
            Expediente del Explorador · Rúbrica de Evaluación en Cuaderno
          </h3>
        </div>
        {scene.notebookPrompt && (
          <p style={{ color: '#FDE68A', fontSize: compact ? '0.95rem' : '1.08rem', marginBottom: 18 }}>
            {scene.notebookPrompt}
          </p>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: compact ? '0.84rem' : '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-gold)', textAlign: 'left', color: 'var(--accent-gold)' }}>
                <th style={{ padding: '10px 12px' }}>Criterio</th>
                <th style={{ padding: '10px 12px' }}>Inicial</th>
                <th style={{ padding: '10px 12px' }}>En proceso</th>
                <th style={{ padding: '10px 12px' }}>Logrado</th>
              </tr>
            </thead>
            <tbody>
              {challengeData.rubric.map((row) => (
                <tr key={row.criterion} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.criterion}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{row.inicial}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.enProceso}</td>
                  <td style={{ padding: '12px', color: '#A7F3D0' }}>{row.logrado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'closing' && challengeData) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1.2fr 1fr', gap: 18 }}>
        <div className="editorial-card" style={{ padding: compact ? 18 : 26 }}>
          <span className="badge-pill" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}>
            <Compass size={14} /> Síntesis de la Expedición
          </span>
          <ul style={{ margin: '16px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {challengeData.closingSynthesis?.map((point, idx) => (
              <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: compact ? '0.95rem' : '1.08rem', lineHeight: 1.55 }}>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="editorial-card" style={{ padding: compact ? 16 : 22 }}>
            <h3 className="font-display" style={{ fontSize: '1.35rem', margin: '0 0 10px', color: 'var(--accent-gold)' }}>
              Ideas por revisar con cuidado
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {challengeData.commonMisconceptions?.map((m, idx) => (
                <div key={idx} style={{ fontSize: '0.92rem', lineHeight: 1.45 }}>
                  <div style={{ color: '#FECDD3', fontWeight: 600 }}>{m.misconception}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{m.clarification}</div>
                </div>
              ))}
            </div>
          </div>

          {challengeData.nextExpeditionBridge && (
            <div
              className="editorial-card"
              style={{
                padding: compact ? 16 : 22,
                borderColor: 'var(--border-gold)',
                background: 'linear-gradient(135deg, rgba(232,184,109,0.12), rgba(56,189,248,0.08))',
              }}
            >
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                PUENTE HACIA LA PRÓXIMA EXPEDICIÓN
              </span>
              <p className="font-display" style={{ fontSize: compact ? '1.35rem' : '1.65rem', margin: '8px 0 0', lineHeight: 1.25 }}>
                {challengeData.nextExpeditionBridge}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
