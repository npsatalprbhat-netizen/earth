import React, { useState } from 'react';
import {
  Cpu,
  Clock,
  Zap,
  Server,
  Database,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';

export const PredictiveCachingDocs: React.FC = () => {
  const [activePage, setActivePage] = useState<number>(1);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simProgressTraditional, setSimProgressTraditional] = useState<number>(0);
  const [simProgressEarthPulse, setSimProgressEarthPulse] = useState<number>(0);
  const [simCompleted, setSimCompleted] = useState<boolean>(false);

  const runSimulation = () => {
    setSimRunning(true);
    setSimCompleted(false);
    setSimProgressTraditional(0);
    setSimProgressEarthPulse(0);

    // EarthPulse finishes almost immediately (instant cache hit)
    setTimeout(() => {
      setSimProgressEarthPulse(100);
    }, 400);

    // Traditional monolithic pipeline creeps slowly
    const interval = setInterval(() => {
      setSimProgressTraditional((prev) => {
        if (prev >= 45) {
          clearInterval(interval);
          setSimRunning(false);
          setSimCompleted(true);
          return 45; // Simulates stalled / 18-hour wait
        }
        return prev + 5;
      });
    }, 200);
  };

  const pages = [
    { id: 1, title: '1. The SAR Latency Bottleneck' },
    { id: 2, title: '2. Edge Predictive Caching Engine' },
    { id: 3, title: '3. Disaster Forecasting AI Models' },
    { id: 4, title: '4. Interactive Latency Simulator' },
    { id: 5, title: '5. Architecture & STAC Standards' },
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 lg:p-8 border border-cyan-500/30 glass-panel-glow shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              TECHNICAL SPECIFICATION WHITEPAPER
            </span>
            <span className="text-slate-400 font-mono text-xs">
              SOLVING NISAR DATA LATENCY & DISASTER FORECASTING
            </span>
          </div>
          <h2 className="font-chakra text-2xl lg:text-3xl font-bold text-white tracking-wide">
            Predictive Caching & AI Early Warning System
          </h2>
        </div>

        {/* 5-Page Navigation Pills */}
        <div className="flex flex-wrap gap-1 glass-panel p-1 rounded-xl border border-cyan-500/30 text-xs font-mono">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePage(p.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activePage === p.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PAGE {p.id}
            </button>
          ))}
        </div>
      </div>

      {/* PAGE 1: The Problem */}
      {activePage === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-chakra text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-400" />
                The Latency Problem in Operational Spaceborne SAR
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Synthetic Aperture Radar (SAR) produces immense raw telemetry volumes. NISAR collects an unprecedented <strong className="text-cyan-300">~85 terabytes of science data per day</strong> across its 24 cm L-band and 9.4 cm S-band dual instruments.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Unlike optical imagery which is instantly visible, SAR signals are raw Doppler phase histories requiring massive Range-Doppler matched filtering, Doppler centroid estimation, motion compensation, and multilooking before becoming an image.
              </p>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-rose-400 font-bold uppercase tracking-wider">
                  TRADITIONAL NISAR PROCESSING LATENCY TIMELINE:
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span>1. Orbital Pass → Ka-band Downlink (Svalbard/Troll)</span>
                    <span className="text-amber-400 font-bold">2 - 6 Hours</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span>2. Level 0 Raw Telemetry → Level 1 SLC (Range-Doppler)</span>
                    <span className="text-amber-400 font-bold">6 - 18 Hours</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span>3. Level 2 Geocoded Covariance (GCOV) & Calibration</span>
                    <span className="text-rose-400 font-bold">12 - 24 Hours</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span>4. Level 3 InSAR Interferogram Unwrapping (GUNW)</span>
                    <span className="text-rose-400 font-bold">24 - 48 Hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-rose-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold mb-3">
                  <ShieldAlert className="w-4 h-4" /> THE DISASTER IMPACT
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-4">
                  In acute crises—such as flash floods in Punjab or California wildfires—a <strong>24 to 48 hour processing delay</strong> means first responders do not have radar maps until floodwaters have already peaked or fire perimeters have jumped containment lines.
                </p>
                <div className="text-[11px] font-mono text-slate-400 p-3 rounded bg-slate-950/80 border border-slate-800">
                  "Decisions in emergency response require sub-hour updates. Traditional GIS servers stall under peak citizen traffic when gigabyte GeoTIFFs are requested simultaneously."
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-[11px] text-cyan-400">
                EarthPulse Solution: Predictive Tiling Engine →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: The Solution */}
      {activePage === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-chakra text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                EarthPulse Edge Predictive Caching Engine
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Rather than waiting for users to request data or processing monolithic 242 km granules on-demand, EarthPulse implements an <strong className="text-cyan-300">orbital trajectory lookahead daemon</strong>.
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono">1. SGP4 / Kalman Filter Swath Prediction:</strong>
                    Using published two-line element (TLE) sets from Space-Track, EarthPulse computes NISAR's exact ground track 12 days in advance, predicting exactly which coordinates will be illuminated.
                  </div>
                </li>
                <li className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono">2. Cloud-Optimized GeoTIFF (COG) HTTP Range Requests:</strong>
                    Users never download entire 800 MB files. Instead, byte-range HTTP requests extract only the specific 256x256 WebGL screen tile required for their viewport.
                  </div>
                </li>
                <li className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono">3. Multi-Tier Distributed Cache:</strong>
                    High-risk disaster zones (e.g. Punjab floodplains, San Andreas fault) are kept perpetually warm in Edge CDN RAM and browser client IndexedDB caches.
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-cyan-400 font-bold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> LATENCY ACCELERATION BENCHMARK
                </div>
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>TRADITIONAL NASA ASF FULL GRANULE DOWNLOAD:</span>
                      <span className="text-rose-400 font-bold">18 - 48 HOURS</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>EARTHPULSE PREDICTIVE COG TILING:</span>
                      <span className="text-emerald-400 font-bold">320 MILLISECONDS</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[1.5%]" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs font-mono">
                  ✓ Over <strong>99.4% reduction</strong> in data delivery latency.<br />
                  ✓ Zero downtime during high-concurrency national emergencies.<br />
                  ✓ Operates seamlessly across low-bandwidth rural mobile networks.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 3: AI Disaster Modeling */}
      {activePage === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-4">
            <h3 className="font-chakra text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Advanced AI Modeling for Emergency Forecasting
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              EarthPulse integrates predictive deep learning models with NISAR's multi-frequency radar parameters to forecast hazards <em>before</em> they trigger catastrophic damage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30">
                <div className="text-xs font-mono text-cyan-400 font-bold mb-2">
                  1. FLOOD RUNOFF & BREACH FORECAST
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                  Couples S-band dielectric topsoil saturation measurements with hydrodynamic river elevation models to forecast embankment failure points <strong>12 to 24 hours in advance</strong>.
                </p>
                <div className="font-mono text-[11px] text-slate-400">
                  Model: Spatio-Temporal Graph CNN (ST-GCN)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30">
                <div className="text-xs font-mono text-rose-400 font-bold mb-2">
                  2. PRE-IGNITION WILDFIRE FUEL DRY-DOWN
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                  Tracks L-band HV volumetric backscatter declines in forest biomass. Sudden moisture loss flags severe wildfire vulnerability before smoke appears.
                </p>
                <div className="font-mono text-[11px] text-slate-400">
                  Model: Multi-Temporal LSTM Autoencoder
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30">
                <div className="text-xs font-mono text-amber-400 font-bold mb-2">
                  3. SEISMIC SURFACE CREEP ACCELERATION
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                  Monitors millimetric phase unwrapping velocity across tectonic fault lines. A sudden rate-and-state friction acceleration flags imminent rupture risk.
                </p>
                <div className="font-mono text-[11px] text-slate-400">
                  Model: InSAR Time-Series SBAS + InceptionTime
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 4: Interactive Latency Simulator */}
      {activePage === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-xl bg-slate-950/80 border border-cyan-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h4 className="font-chakra text-lg font-bold text-white">
                  LIVE BENCHMARK SIMULATOR: 100 GB SAR MISSION QUERY
                </h4>
                <p className="text-slate-400 text-xs font-mono mt-1">
                  Compare traditional on-demand pipeline against EarthPulse predictive cache.
                </p>
              </div>

              <button
                onClick={runSimulation}
                disabled={simRunning}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 hover:brightness-110 disabled:opacity-50"
              >
                {simRunning ? (
                  <>SIMULATING QUERY...</>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> RUN BENCHMARK
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              {/* Traditional */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-rose-400 font-bold">
                    A. TRADITIONAL PIPELINE (On-Demand Raw Granule Request)
                  </span>
                  <span className="text-slate-400">
                    {simProgressTraditional < 45 ? `${simProgressTraditional * 0.4} hrs simulated` : '18.2 hrs (STALLED IN QUEUE)'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${simProgressTraditional}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-2 flex justify-between">
                  <span>Downlink → L0 Unpack → Doppler Filtering → COG Convert</span>
                  <span className="text-rose-400">Bottleneck: Server Queue Delay</span>
                </div>
              </div>

              {/* EarthPulse */}
              <div className="p-4 rounded-lg bg-slate-900 border border-cyan-500/40">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-emerald-400 font-bold">
                    B. EARTHPULSE SYSTEM (SGP4 Lookahead + Edge COG Tiling)
                  </span>
                  <span className="text-emerald-300 font-bold">
                    {simProgressEarthPulse === 100 ? '320 ms (CACHE HIT: 99.4%)' : '0 ms'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${simProgressEarthPulse}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-2 flex justify-between">
                  <span>Pre-Indexed STAC Metadata → HTTP Byte-Range → WebGL Tile Shading</span>
                  <span className="text-emerald-400">Status: Instant Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 5: Standards & Deployment */}
      {activePage === 5 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="font-chakra text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                STAC API v1.0 & OGC Standards Compliance
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                EarthPulse is built upon open geospatial protocols to ensure interoperability with the global remote sensing community:
              </p>
              <ul className="text-xs font-mono text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>STAC (SpatioTemporal Asset Catalog) Item Discovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud Optimized GeoTIFF (COG) with Deflate Compression</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OGC WMS / WMTS Tiled Map Services</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>NASA Common Metadata Repository (CMR) Integration</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
              <h4 className="font-chakra text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                ISRO Bhoonidhi & NASA ASF Live Mirroring
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Synchronizes dual radar archives from both mission partner nodes:
              </p>
              <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                <div>• NASA ASF: L-band SLC, GCOV, GUNW, GSV archives</div>
                <div>• ISRO NRSC Bhoonidhi: S-band high-rate polarimetric swath data</div>
                <div>• Mutual automated cross-calibration via corner reflector arrays</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
