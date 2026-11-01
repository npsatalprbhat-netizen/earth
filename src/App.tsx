import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CosmicBreezeBackground } from './components/CosmicBreezeBackground';
import { HomeDashboard } from './components/HomeDashboard';
import { EarthGlobe } from './components/3d/EarthGlobe';
import { ChangeDetectionSlider } from './components/ChangeDetectionSlider';
import { Disaster3DViewer } from './components/3d/Disaster3DViewer';
import { PunjabFloodSpecial } from './components/PunjabFloodSpecial';
import { PredictiveCachingDocs } from './components/PredictiveCachingDocs';
import { AIEarthIntelligence } from './components/AIEarthIntelligence';
import { EarthStories } from './components/EarthStories';
import { NISARDataExplorer } from './components/NISARDataExplorer';
import { ReportModal } from './components/ReportModal';
import { GLOBAL_HOTSPOTS } from './data/earthData';
import { ObservationHotspot, EnvironmentalCategory } from './types';
import {
  FileText,
  Sliders,
  Globe2,
  Box,
  Droplets,
  Zap,
  Sparkles,
  BookOpen,
  Database,
  Info,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedHotspot, setSelectedHotspot] = useState<ObservationHotspot>(GLOBAL_HOTSPOTS[0]);
  const [selectedCategory, setSelectedCategory] = useState<EnvironmentalCategory | 'all'>('all');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [breezeIntensity, setBreezeIntensity] = useState<number>(0.55);

  const handleSelectHotspot = (hotspot: ObservationHotspot) => {
    setSelectedHotspot(hotspot);
    // If selected from globe or home, take them to the change detection & 3D viewer tab
    setActiveTab('change-detection');
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Calming animated botanical breeze background */}
      <CosmicBreezeBackground intensity={breezeIntensity} />

      {/* Top Futuristic Navbar with Space Sound Audio Engine & UTC Clock */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectHotspot={handleSelectHotspot}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Home Dashboard */}
        {activeTab === 'home' && (
          <HomeDashboard
            onExploreEarth={() => setActiveTab('explorer')}
            onDiscoverNISAR={() => setActiveTab('nisar-catalog')}
            onSelectHotspot={handleSelectHotspot}
            onSelectCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        )}

        {/* Tab 2: Interactive 3D Earth Explorer */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    GEOSPATIAL COMMAND CENTER
                  </span>
                  <span className="text-slate-400 font-mono text-xs">
                    747 KM SUN-SYNCHRONOUS ORBIT TRACK
                  </span>
                </div>
                <h2 className="font-chakra text-2xl lg:text-3xl font-bold text-white tracking-wide">
                  Interactive 3D Global Earth Explorer
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                  Rotate, zoom, and inspect radar backscatter markers. Click any hotspot to launch microwave analysis.
                </p>
              </div>

              {/* Quick Jump Hotspot Selector */}
              <div className="flex items-center gap-2 glass-panel p-2 rounded-xl border border-cyan-500/30 text-xs font-mono">
                <span className="text-slate-400 shrink-0">FOCUS HOTSPOT:</span>
                <select
                  value={selectedHotspot.id}
                  onChange={(e) => {
                    const found = GLOBAL_HOTSPOTS.find((h) => h.id === e.target.value);
                    if (found) setSelectedHotspot(found);
                  }}
                  className="bg-slate-950 text-cyan-300 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-cyan-400"
                >
                  {GLOBAL_HOTSPOTS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3D Earth Globe */}
            <EarthGlobe
              onSelectHotspot={handleSelectHotspot}
              selectedHotspotId={selectedHotspot.id}
              activeCategoryFilter={selectedCategory}
            />

            {/* Selected Hotspot Bottom Summary Bar */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-cyan-400 font-bold mb-1">
                  CURRENTLY SELECTED OBSERVATION TARGET
                </div>
                <h3 className="font-chakra text-xl font-bold text-white">
                  {selectedHotspot.name}
                </h3>
                <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
                  {selectedHotspot.description}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('change-detection')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold font-chakra text-xs flex items-center gap-2 shrink-0 hover:brightness-110 shadow-lg shadow-cyan-500/30 transition-all"
              >
                <span>OPEN DISASTER RADAR HEATMAP & 3D RELIEF</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Disaster SAR Radar Heatmap & 3D Relief */}
        {activeTab === 'change-detection' && (
          <div className="space-y-8">
            {/* Top Selector & Report Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">ACTIVE REGION:</span>
                <select
                  value={selectedHotspot.id}
                  onChange={(e) => {
                    const found = GLOBAL_HOTSPOTS.find((h) => h.id === e.target.value);
                    if (found) setSelectedHotspot(found);
                  }}
                  className="bg-slate-900 text-cyan-300 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none"
                >
                  {GLOBAL_HOTSPOTS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.region})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-cyan-400/40 text-xs font-mono flex items-center gap-2 transition-colors self-start sm:self-auto"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>GENERATE PDF ANALYSIS DISPATCH</span>
              </button>
            </div>

            {/* Disaster Event SAR Heatmap & Satellite Analysis */}
            <ChangeDetectionSlider hotspot={selectedHotspot} />

            {/* Interactive 3D Surface Elevation & Relief Viewer */}
            <Disaster3DViewer hotspot={selectedHotspot} />
          </div>
        )}

        {/* Tab 4: Punjab 2025 Flood Special Case Study */}
        {activeTab === 'punjab-flood' && <PunjabFloodSpecial />}

        {/* Tab 5: Predictive Caching & AI Disaster Modeling Documentation */}
        {activeTab === 'predictive-caching' && <PredictiveCachingDocs />}

        {/* Tab 6: AI-Powered Earth Intelligence Assistant */}
        {activeTab === 'earth-intelligence' && (
          <AIEarthIntelligence currentHotspot={selectedHotspot} />
        )}

        {/* Tab 7: Earth Stories ("The Changing Earth") */}
        {activeTab === 'stories' && (
          <EarthStories onSelectHotspot={handleSelectHotspot} />
        )}

        {/* Tab 8: NISAR Satellite Data Explorer & STAC Catalog */}
        {activeTab === 'nisar-catalog' && <NISARDataExplorer />}
      </main>

      {/* Printable PDF Analysis Report Modal */}
      {showReportModal && (
        <ReportModal
          hotspot={selectedHotspot}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/90 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold">
              EP
            </div>
            <span>EARTHPULSE: THE LIVING PLANET • NASA SPACE APPS CHALLENGE</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <a
              href="https://science.nasa.gov/mission/nisar/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              NASA NISAR MISSION
            </a>
            <a
              href="https://bhoonidhi.nrsc.gov.in/NISAR/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              ISRO BHOONIDHI
            </a>
            <a
              href="https://search.asf.alaska.edu/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              ALASKA SATELLITE FACILITY
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">100% OPEN SCIENCE DATA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
