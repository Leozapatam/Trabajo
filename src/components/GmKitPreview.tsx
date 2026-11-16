import React, { useState } from 'react';
import { AlertTriangle, Award, ShieldAlert, Sparkles } from 'lucide-react';

export const GmKitPreview: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>('investigacion');
  const [floatDemo, setFloatDemo] = useState<'plus' | 'minus' | null>('plus');
  const [showToast, setShowToast] = useState(true);

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 20px 80px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <header>
        <span className="pixel-badge">KIT VISUAL GAME MASTER · RETRO PIXEL ART</span>
        <h1 className="font-display" style={{ fontSize: '2.2rem', margin: '12px 0 4px' }}>
          Muestra de Componentes Visuales
        </h1>
      </header>

      {/* 1 y 2: .gm-token + .gm-float-plus / .gm-float-minus */}
      <section className="pixel-frame" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <h2 className="font-pixel" style={{ fontSize: '0.74rem', color: '#E8B86D', margin: 0 }}>
            1. FICHAS DE ESTUDIANTE (.gm-token) &amp; FLOTANTES
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => setFloatDemo('plus')}>
              Probar +1
            </button>
            <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => setFloatDemo('minus')}>
              Probar −1
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div className="gm-token is-presente">
            {floatDemo === 'plus' && <span className="gm-float-plus">+1</span>}
            {floatDemo === 'minus' && <span className="gm-float-minus">−1</span>}
            <div className="gm-token__header">
              <span className="gm-token__avatar">VS</span>
              <span className="gm-token__name">Valentina Silva</span>
              <span className="gm-token__status">Presente</span>
            </div>
            <div className="gm-token__grade-row">
              <div className="gm-token__grade-bar">
                <div className="gm-token__grade-fill" style={{ width: '88%' }} />
              </div>
              <span className="gm-token__grade-value">4.6</span>
            </div>
          </div>

          <div className="gm-token is-excusa">
            <div className="gm-token__header">
              <span className="gm-token__avatar">CM</span>
              <span className="gm-token__name">Carlos Mendoza</span>
              <span className="gm-token__status">Excusa</span>
            </div>
            <div className="gm-token__grade-row">
              <div className="gm-token__grade-bar">
                <div className="gm-token__grade-fill" style={{ width: '74%' }} />
              </div>
              <span className="gm-token__grade-value">4.0</span>
            </div>
          </div>

          <div className="gm-token is-ausente">
            <div className="gm-token__header">
              <span className="gm-token__avatar">SR</span>
              <span className="gm-token__name">Sebastián Rojas</span>
              <span className="gm-token__status">Ausente</span>
            </div>
            <div className="gm-token__grade-row">
              <div className="gm-token__grade-bar">
                <div className="gm-token__grade-fill" style={{ width: '48%' }} />
              </div>
              <span className="gm-token__grade-value">2.9</span>
            </div>
          </div>

          <div className="gm-token is-retirado">
            <div className="gm-token__header">
              <span className="gm-token__avatar">MG</span>
              <span className="gm-token__name">Mateo Gómez</span>
              <span className="gm-token__status">Retirado</span>
            </div>
            <div className="gm-token__grade-row">
              <div className="gm-token__grade-bar">
                <div className="gm-token__grade-fill" style={{ width: '60%' }} />
              </div>
              <span className="gm-token__grade-value">3.4</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3: .gm-category-chip */}
      <section className="pixel-frame" style={{ padding: 20 }}>
        <h2 className="font-pixel" style={{ fontSize: '0.74rem', color: '#E8B86D', margin: '0 0 14px' }}>
          2. CHIPS DE CATEGORÍA (.gm-category-chip)
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { id: 'investigacion', label: 'Investigación' },
            { id: 'participacion', label: 'Participación' },
            { id: 'comportamiento', label: 'Comportamiento' },
            { id: 'actitudinal', label: 'Actitudinal' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              className={`gm-category-chip gm-category-chip--${c.id} ${selectedCat === c.id ? 'is-selected' : ''}`}
              onClick={() => setSelectedCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4 y 5: .gm-level-up y Alertas SIE */}
      <section className="pixel-frame" style={{ padding: 20 }}>
        <h2 className="font-pixel" style={{ fontSize: '0.74rem', color: '#E8B86D', margin: '0 0 14px' }}>
          3. LOGROS SIE (.gm-level-up) &amp; ALERTAS DE INASISTENCIA
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <span className="gm-level-up gm-level-up--basico">
            <Sparkles size={14} /> NIVEL BÁSICO · 3.0
          </span>
          <span className="gm-level-up gm-level-up--alto">
            <Award size={14} /> NIVEL ALTO · 4.0
          </span>
          <span className="gm-level-up gm-level-up--superior">
            <Award size={14} /> NIVEL SUPERIOR · 4.6
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div className="gm-alert-atencion">
            <AlertTriangle size={16} /> Atención: 15% de inasistencia sin excusa
          </div>
          <div className="gm-alert-riesgo">
            <ShieldAlert size={16} /> Riesgo SIE: 25% o más de inasistencia
          </div>
        </div>
      </section>

      {/* 6: .gm-toast */}
      {showToast && (
        <div className="gm-toast" role="status">
          <span>+1 Investigación para Valentina Silva</span>
          <button type="button" className="gm-toast__undo" onClick={() => setShowToast(false)}>
            Deshacer
          </button>
        </div>
      )}
    </div>
  );
};
