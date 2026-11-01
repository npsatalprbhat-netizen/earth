import React, { useState, useRef } from 'react';
import { ObservationHotspot } from '../types';
import {
  Zap,
  Layers,
  ShieldCheck,
  Eye,
  Info,
  HelpCircle,
  Crosshair,
  TrendingDown,
  Calendar,
  Sparkles,
  Radio,
  Activity,
} from 'lucide-react';

interface ChangeDetectionSliderProps {
  hotspot: ObservationHotspot;
}

export const ChangeDetectionSlider: React.FC<ChangeDetectionSliderProps> = ({ hotspot }) => {
  const [activeViewMode, setActiveViewMode] = useState<'heatmap' | 'polarimetric' | 'satellite'>('heatmap');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.78);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number; delta: number; type: string } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = x / rect.width;
    const normY = y / rect.height;

    // Spatial radar distribution matching the hotspot geometry
    let localDelta = hotspot.deltaDb;
    let label = 'Surface Structural Change';

    if (hotspot.category === 'flood') {
      const inFloodway = normY > 0.35 && normY < 0.75 && normX > 0.2 && normX < 0.85;
      localDelta = inFloodway ? hotspot.deltaDb - Math.random() * 2 : -1.2;
      label = inFloodway
        ? 'Specular Water Inundation (High Absorption)'
        : 'Elevated Cropland (Minor Soil Moisture Shift)';
    } else if (hotspot.category === 'forest') {
      const inClearing = (normX > 0.3 && normX < 0.7) || (normY > 0.4 && normY < 0.8);
      localDelta = inClearing ? hotspot.deltaDb : -0.8;
      label = inClearing ? 'Canopy Biomass Eradication' : 'Intact Primary Canopy';
    } else if (hotspot.category === 'earthquake') {
      const fringePhase = Math.sin(normX * 18 + normY * 12);
      localDelta = fringePhase * 3.2;
      label = `InSAR Line-of-Sight Displacement Fringe (${Math.round(fringePhase * 28)} mm)`;
    } else if (hotspot.category === 'glacier') {
      localDelta = normX > 0.5 ? 2.4 : -1.8;
      label = 'Ice Discharge Flow Crevasse Velocity';
    }

    setHoverPixel({
      x: Math.round(x),
      y: Math.round(y),
      delta: Math.round(localDelta * 10) / 10,
      type: label,
    });
  };

  const handlePointerLeave = () => {
    setHoverPixel(null);
  };

  // Render authentic scientific radar heatmap overlay tailored to the disaster hotspot
  const renderScientificHeatmapOverlay = () => {
    switch (hotspot.category) {
      case 'flood':
        // Water specular reflection (-10.6 dB to -22 dB drop): Electric Cyan & Deep Indigo channels
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="none">
            <defs>
              <radialGradient id="floodGlow" cx="50%" cy="55%" r="45%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#0284c7" stopOpacity="0.75" />
                <stop offset="85%" stopColor="#1e1b4b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="riverMeander" x1="0%" y1="20%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Inundated River Basin & Floodplains */}
            <path
              d="M 50,180 Q 200,120 320,240 T 580,310 T 780,260 L 780,380 Q 600,430 450,380 T 180,340 Z"
              fill="url(#floodGlow)"
              filter="blur(8px)"
            />
            {/* Main Deep Inundation Channel (-22.4 dB) */}
            <path
              d="M 40,210 Q 190,150 330,260 T 570,330 T 760,280"
              fill="none"
              stroke="url(#riverMeander)"
              strokeWidth="38"
              strokeLinecap="round"
              filter="blur(4px)"
            />
            {/* Agricultural Field Inundation Cells */}
            <rect x="220" y="270" width="140" height="90" rx="10" fill="#00f0ff" fillOpacity="0.65" filter="blur(6px)" />
            <rect x="420" y="190" width="180" height="110" rx="12" fill="#0284c7" fillOpacity="0.65" filter="blur(6px)" />
            <rect x="110" y="290" width="90" height="70" rx="8" fill="#00f0ff" fillOpacity="0.6" filter="blur(5px)" />

            {/* Double-Bounce Dyke Edges (+2 dB backscatter spike) in Amber */}
            <path
              d="M 50,180 Q 200,120 320,240 T 580,310 T 780,260"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="8 4"
              opacity="0.8"
            />
          </svg>
        );

      case 'forest':
        // Deforestation HV cross-pol volume scattering loss (-8.5 dB): Fiery Red/Vermilion clearcut blocks
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="none">
            <defs>
              <linearGradient id="deforestBurn" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#e11d48" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#991b1b" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Fishbone logging roads and clearings */}
            <rect x="160" y="120" width="220" height="140" rx="8" fill="url(#deforestBurn)" filter="blur(6px)" />
            <rect x="440" y="210" width="260" height="180" rx="8" fill="url(#deforestBurn)" filter="blur(7px)" />
            <path
              d="M 80,200 L 720,220 M 240,120 L 250,380 M 520,100 L 530,420"
              stroke="#fb7185"
              strokeWidth="12"
              strokeLinecap="round"
              filter="blur(5px)"
              opacity="0.9"
            />
            {/* Warning outline markers */}
            <rect x="160" y="120" width="220" height="140" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" />
            <rect x="440" y="210" width="260" height="180" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
        );

      case 'earthquake':
        // InSAR Phase Interferogram Cyclic Fringes: Repeating Spectral Rainbow contours representing fault rupture
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="none">
            <defs>
              <radialGradient id="ruptureFringe1" cx="38%" cy="48%" r="40%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#eab308" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.75" />
                <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
              </radialGradient>
              <radialGradient id="ruptureFringe2" cx="62%" cy="52%" r="35%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
                <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#10b981" stopOpacity="0.75" />
                <stop offset="85%" stopColor="#eab308" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
              </radialGradient>
            </defs>

            {/* West Fault Block InSAR Fringes */}
            <ellipse cx="320" cy="240" rx="220" ry="160" fill="url(#ruptureFringe1)" filter="blur(10px)" opacity="0.85" />
            {/* East Fault Block InSAR Fringes */}
            <ellipse cx="510" cy="260" rx="190" ry="140" fill="url(#ruptureFringe2)" filter="blur(10px)" opacity="0.85" />

            {/* East Anatolian Fault Trace Rupture Line */}
            <path
              d="M 120,440 L 260,330 L 410,240 L 580,160 L 720,80"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeDasharray="10 5"
              filter="drop-shadow(0 0 6px #ef4444)"
            />
            {/* Concentric InSAR Iso-Displacement Contours */}
            <ellipse cx="320" cy="240" rx="140" ry="100" fill="none" stroke="#facc15" strokeWidth="2.5" opacity="0.8" />
            <ellipse cx="320" cy="240" rx="70" ry="50" fill="none" stroke="#22c55e" strokeWidth="2.5" opacity="0.9" />
            <ellipse cx="510" cy="260" rx="110" ry="80" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.8" />
          </svg>
        );

      case 'glacier':
      default:
        // Glacier Ice Discharge Velocity & Calving Retreat: Cyan & Violet Flow Vector Gradient
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="none">
            <defs>
              <radialGradient id="glacierFlow" cx="50%" cy="50%" r="45%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.3" />
              </radialGradient>
            </defs>
            <path
              d="M 120,80 Q 420,180 480,420 L 620,400 Q 520,160 220,60 Z"
              fill="url(#glacierFlow)"
              filter="blur(8px)"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-cyan-500/30 glass-panel-glow shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-950 border border-rose-500/40 text-rose-300 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
              POST-DISASTER SAR RADAR PIPELINE
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {hotspot.radarCharacteristics.processingLevel} • {hotspot.nisarBand}
            </span>
          </div>
          <h3 className="font-chakra text-2xl font-bold text-white tracking-wide">
            {hotspot.name}
          </h3>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2 glass-panel p-1 rounded-xl border border-cyan-500/30 text-xs font-mono">
          <button
            onClick={() => setActiveViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'heatmap'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Δ HEATMAP OVERLAY
          </button>
          <button
            onClick={() => setActiveViewMode('polarimetric')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'polarimetric'
                ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            RGB POLARIMETRIC
          </button>
          <button
            onClick={() => setActiveViewMode('satellite')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'satellite'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            DISASTER SATELLITE
          </button>
        </div>
      </div>

      {/* Main Interactive Display: Pure Post-Disaster Satellite Observation with Calibrated SAR Heatmap */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full h-[460px] md:h-[540px] rounded-xl overflow-hidden select-none cursor-crosshair border border-cyan-500/30 bg-slate-950"
      >
        {/* Disaster Satellite Imagery Base Layer */}
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${hotspot.afterImage})` }}
        >
          {/* Scientific Radar False-Color Heatmap Layer (Active in Heatmap Mode) */}
          {activeViewMode === 'heatmap' && (
            <div
              className="absolute inset-0 transition-opacity duration-150"
              style={{ opacity: heatmapOpacity }}
            >
              {renderScientificHeatmapOverlay()}
            </div>
          )}

          {/* Pauli Polarimetric Color-Dodge Layer (Active in Polarimetric Mode) */}
          {activeViewMode === 'polarimetric' && (
            <div className="absolute inset-0 bg-indigo-950/45 mix-blend-color-dodge pointer-events-none" />
          )}

          {/* Top Left: Active Radar Status Badge */}
          <div className="absolute top-4 left-4 glass-panel p-2.5 rounded-xl border border-cyan-500/40 text-xs font-mono flex flex-wrap items-center gap-3 z-10 shadow-lg">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              {activeViewMode === 'heatmap' ? (
                <>
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>CALIBRATED SAR Δσ⁰ RADAR HEATMAP OVERLAY</span>
                </>
              ) : activeViewMode === 'polarimetric' ? (
                <>
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>PAULI POLARIMETRIC RGB DECOMPOSITION</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>NASA SATELLITE DISASTER EVENT OBSERVATION</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>ACQUISITION: <strong className="text-white">{hotspot.afterDate}</strong></span>
            </div>
          </div>

          {/* Top Right: What is a SAR Heatmap Help Trigger */}
          <button
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="absolute top-4 right-4 glass-panel px-3 py-1.5 rounded-lg border border-cyan-400/50 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer z-10 shadow-lg"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>WHAT IS A SAR HEATMAP?</span>
          </button>

          {/* Real-time Hover Pixel Probe HUD */}
          {hoverPixel && (
            <div
              className="absolute z-20 pointer-events-none glass-panel-glow px-3 py-2 rounded-lg border border-cyan-400 text-xs font-mono text-white shadow-2xl"
              style={{
                left: Math.min(window.innerWidth > 800 ? 560 : 200, hoverPixel.x + 15),
                top: Math.min(360, hoverPixel.y + 15),
              }}
            >
              <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                <Crosshair className="w-3 h-3" />
                RADAR CELL PROBE [{hoverPixel.x}, {hoverPixel.y}]
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-slate-300">Δσ⁰ SHIFT:</span>
                <span className={`font-bold ${hoverPixel.delta < 0 ? 'text-cyan-300' : 'text-amber-400'}`}>
                  {hoverPixel.delta > 0 ? `+${hoverPixel.delta}` : hoverPixel.delta} dB
                </span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">{hoverPixel.type}</div>
            </div>
          )}

          {/* Bottom Floating Controls (For Heatmap Mode) */}
          {activeViewMode === 'heatmap' && (
            <div className="absolute bottom-4 left-4 right-4 glass-panel p-3 rounded-xl border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono z-10">
              {/* Opacity slider */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-slate-300 text-[11px] shrink-0">HEATMAP BLENDING:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                  className="w-28 sm:w-36 accent-cyan-400 cursor-pointer"
                />
                <span className="text-cyan-300 font-bold w-10 text-right">
                  {Math.round(heatmapOpacity * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">(Slide to adjust radar overlay intensity)</span>
              </div>

              {/* Color Ramp Legend */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-cyan-400 font-bold">-24 dB (Absorption / Water)</span>
                <div className="w-28 sm:w-40 h-3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-600 via-slate-800 to-rose-500 border border-slate-700" />
                <span className="text-rose-400 font-bold">+6 dB (Double-Bounce)</span>
              </div>
            </div>
          )}

          {/* Polarimetric Legend (For Polarimetric Mode) */}
          {activeViewMode === 'polarimetric' && (
            <div className="absolute bottom-4 left-4 right-4 glass-panel p-3 rounded-xl border border-indigo-500/30 text-xs font-mono text-indigo-300 z-10 flex items-center justify-between">
              <span>FALSE-COLOR PAULI POLARIMETRIC DECOMPOSITION</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-rose-400 font-bold">RED: |HH-VV| Double-Bounce</span>
                <span className="text-emerald-400 font-bold">GREEN: 2|HV| Volume Canopy</span>
                <span className="text-cyan-400 font-bold">BLUE: |HH+VV| Roughness</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explanatory Scientific Drawer / Modal */}
      {showInfoModal && (
        <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-cyan-500/40 font-mono text-xs text-slate-200 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm font-chakra">
              <Info className="w-4 h-4 text-cyan-400" />
              SCIENTIFIC GUIDE: WHAT IS A SAR RADAR CHANGE HEATMAP?
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
            >
              ✕ CLOSE
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 leading-relaxed">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-cyan-300 block mb-1">1. MICROWAVE BACKSCATTER RATIO (Δσ⁰):</strong>
              Synthetic Aperture Radar pulses microwaves to Earth and records returned energy intensity (sigma-0). The change heatmap calculates the calibrated log difference in decibels:
              <code className="block bg-slate-950 p-1.5 rounded text-cyan-400 mt-1 text-[11px]">
                Δσ⁰ = 10 · log₁₀(Power_post / Power_baseline) dB
              </code>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-cyan-300 block mb-1">2. SPECULAR VS. VOLUME SCATTERING:</strong>
              Smooth floodwater acts like a mirror, reflecting radar pulses away from the antenna into space, causing a deep blue drop (-10.6 dB). Conversely, trees produce volumetric leaf scattering; logging eradicates it, producing severe red drops.
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-cyan-300 block mb-1">3. InSAR INTERFEROGRAM FRINGES:</strong>
              In tectonic events (earthquakes), phase interference forms cyclic rainbow fringes. Each complete color cycle represents a half-wavelength (12 cm in L-band) line-of-sight surface displacement!
            </div>
          </div>
        </div>
      )}

      {/* Comparison Statistics & Calibration Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
          <div className="text-xs text-slate-400 font-mono mb-1">RADAR BACKSCATTER SHIFT</div>
          <div className="text-xl font-chakra font-bold text-white flex items-baseline gap-2">
            <span className={hotspot.deltaDb < 0 ? 'text-cyan-400' : 'text-emerald-400'}>
              {hotspot.deltaDb > 0 ? `+${hotspot.deltaDb}` : hotspot.deltaDb} dB
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Observed Intensity: {hotspot.afterBackscatterDb} dB
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
          <div className="text-xs text-slate-400 font-mono mb-1">INTERFEROMETRIC COHERENCE</div>
          <div className="text-xl font-chakra font-bold text-indigo-300">
            γ = {hotspot.coherenceScore.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            {hotspot.coherenceScore > 0.5 ? 'Stable Ground Phase' : 'Surface Decorrelation'}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
          <div className="text-xs text-slate-400 font-mono mb-1">AFFECTED REGION EXTENT</div>
          <div className="text-xl font-chakra font-bold text-white">
            {hotspot.affectedAreaSqKm.toLocaleString()} km²
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Calibrated polygon boundary
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
          <div className="text-xs text-slate-400 font-mono mb-1">VALIDATION STATUS</div>
          <div className="text-sm font-chakra font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            GROUND-VERIFIED
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            {hotspot.radarCharacteristics.spatialResolutionM}m GSD Resolution
          </div>
        </div>
      </div>
    </div>
  );
};
