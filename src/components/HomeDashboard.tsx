import React from 'react';
import {
  Globe2,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  Layers,
  ShieldCheck,
  Droplets,
  Trees,
  Flame,
  Mountain,
  Sprout,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { EarthGlobe } from './3d/EarthGlobe';
import { GLOBAL_HOTSPOTS } from '../data/earthData';
import { ObservationHotspot, EnvironmentalCategory } from '../types';

interface HomeDashboardProps {
  onExploreEarth: () => void;
  onDiscoverNISAR: () => void;
  onSelectHotspot: (hotspot: ObservationHotspot) => void;
  onSelectCategory: (category: EnvironmentalCategory | 'all') => void;
  selectedCategory: EnvironmentalCategory | 'all';
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onExploreEarth,
  onDiscoverNISAR,
  onSelectHotspot,
  onSelectCategory,
  selectedCategory,
}) => {
  const categoryButtons: { id: EnvironmentalCategory | 'all'; label: string; icon: any; count: number }[] = [
    { id: 'all', label: 'ALL REGIONS', icon: Compass, count: GLOBAL_HOTSPOTS.length },
    { id: 'flood', label: 'FLOODS & INUNDATION', icon: Droplets, count: 2 },
    { id: 'forest', label: 'FORESTS & DEFORESTATION', icon: Trees, count: 2 },
    { id: 'glacier', label: 'GLACIERS & CRYOSPHERE', icon: Mountain, count: 2 },
    { id: 'earthquake', label: 'EARTHQUAKES & FAULTS', icon: Activity, count: 1 },
    { id: 'agriculture', label: 'SOIL MOISTURE & CROPS', icon: Sprout, count: 1 },
    { id: 'wetland', label: 'WETLAND HYDROLOGY', icon: Layers, count: 1 },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 lg:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Pitch */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>NASA SPACE APPS CHALLENGE SPECIAL MISSION</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-chakra text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none">
                EARTHPULSE
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                  THE LIVING PLANET
                </span>
              </h1>
              <div className="font-chakra text-lg sm:text-xl font-semibold text-cyan-300 tracking-wide">
                Observe. Detect. Understand. Protect.
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Explore how our planet changes through the power of <strong>NASA-ISRO NISAR</strong> dual-frequency satellite radar. Transforming complex microwave observations into actionable planetary intelligence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreEarth}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-chakra font-bold text-sm tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Globe2 className="w-4 h-4" />
                <span>EXPLORE 3D EARTH</span>
              </button>

              <button
                onClick={onDiscoverNISAR}
                className="px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-white font-chakra font-bold text-sm tracking-wider flex items-center gap-2 border border-slate-700 hover:border-cyan-400/50 transition-all"
              >
                <span>DISCOVER NISAR MISSION</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Special Highlight Callout */}
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 font-mono flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Case Study Online:</strong> Punjab 2025 Flood multi-frequency radar analysis (Sentinel-1 vs. NISAR canopy penetration).
              </span>
            </div>
          </div>

          {/* Right: Embedded Interactive 3D Earth Globe */}
          <div className="lg:col-span-7">
            <EarthGlobe
              onSelectHotspot={onSelectHotspot}
              activeCategoryFilter={selectedCategory}
            />
          </div>
        </div>
      </section>

      {/* Global Statistics Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" />
            GLOBAL ENVIRONMENTAL OBSERVATION METRICS
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Source: NASA ASF & ISRO Bhoonidhi STAC Catalogs
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
            <div className="text-[11px] font-mono text-slate-400 mb-1">MONITORED REGIONS</div>
            <div className="text-2xl font-chakra font-bold text-white">142+</div>
            <div className="text-[10px] font-mono text-cyan-400 mt-1">Global coverage grid</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
            <div className="text-[11px] font-mono text-slate-400 mb-1">RADAR BACKSCATTER ANOMALIES</div>
            <div className="text-2xl font-chakra font-bold text-amber-400">8,410</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">Calibrated Δ dB triggers</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
            <div className="text-[11px] font-mono text-slate-400 mb-1">PUNJAB FLOOD EXTENT</div>
            <div className="text-2xl font-chakra font-bold text-rose-400">4,280 km²</div>
            <div className="text-[10px] font-mono text-rose-300 mt-1">2025 monsoonal benchmark</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
            <div className="text-[11px] font-mono text-slate-400 mb-1">AMAZON DISTURBANCE</div>
            <div className="text-2xl font-chakra font-bold text-emerald-400">8,950 km²</div>
            <div className="text-[10px] font-mono text-emerald-300 mt-1">L-band HV biomass loss</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20">
            <div className="text-[11px] font-mono text-slate-400 mb-1">EDGE CACHING SPEED</div>
            <div className="text-2xl font-chakra font-bold text-cyan-400">320 ms</div>
            <div className="text-[10px] font-mono text-cyan-300 mt-1">99.4% cache hit rate</div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills & Observation Hotspots Grid */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-chakra text-2xl font-bold text-white tracking-wide">
              Active Planetary Radar Hotspots
            </h2>
            <p className="text-slate-400 text-xs font-mono mt-0.5">
              Filter by environmental mechanism to inspect radar backscatter shifts & 3D relief
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 glass-panel p-1.5 rounded-xl border border-cyan-500/30 text-xs font-mono">
            {categoryButtons.map((btn) => {
              const Icon = btn.icon;
              const isSelected = selectedCategory === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => onSelectCategory(btn.id)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hotspots Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GLOBAL_HOTSPOTS.filter(
            (h) => selectedCategory === 'all' || h.category === selectedCategory
          ).map((hotspot) => (
            <div
              key={hotspot.id}
              onClick={() => onSelectHotspot(hotspot)}
              className="group rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-cyan-950/40 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={hotspot.afterImage}
                    alt={hotspot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900/90 text-cyan-300 border border-cyan-500/40">
                    {hotspot.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/90 text-white border border-slate-700">
                    {hotspot.nisarBand}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{hotspot.region}</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        hotspot.deltaDb < 0
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {hotspot.deltaDb > 0 ? `+${hotspot.deltaDb}` : hotspot.deltaDb} dB
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-chakra text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {hotspot.name}
                  </h3>
                  <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed mb-4">
                    {hotspot.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[9px]">AFFECTED AREA</span>
                      <strong className="text-white">{hotspot.affectedAreaSqKm.toLocaleString()} km²</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">InSAR COHERENCE</span>
                      <strong className="text-indigo-300">{hotspot.coherenceScore.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="w-full py-2 rounded-xl bg-slate-900 group-hover:bg-cyan-500 text-slate-300 group-hover:text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-1.5 border border-slate-700 group-hover:border-cyan-400 transition-all">
                  <span>INSPECT RADAR & 3D RELIEF</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
