import React, { useState } from 'react';
import { NISAR_DATASET_CATALOG } from '../data/earthData';
import { NISARDatasetProduct } from '../types';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  Layers,
  Database,
  Radio,
  CheckCircle,
  FileCode,
  HardDrive,
  Cpu,
} from 'lucide-react';

export const NISARDataExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<'all' | 'L-band' | 'S-band'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'L1 SLC' | 'L2 GCOV' | 'L2 GSV' | 'L3 GUNW'>('all');
  const [selectedGranule, setSelectedGranule] = useState<NISARDatasetProduct>(NISAR_DATASET_CATALOG[0]);

  const filteredDatasets = NISAR_DATASET_CATALOG.filter((item) => {
    const matchesSearch =
      item.granuleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.polarization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFreq = selectedFrequency === 'all' || item.frequency === selectedFrequency;
    const matchesLevel = selectedLevel === 'all' || item.processingLevel === selectedLevel;
    return matchesSearch && matchesFreq && matchesLevel;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 lg:p-8 border border-cyan-500/30 glass-panel-glow shadow-2xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              OFFICIAL ARCHIVE DISCOVERY
            </span>
            <span className="text-slate-400 font-mono text-xs">
              NASA ALASKA SATELLITE FACILITY (ASF) & ISRO BHOONIDHI
            </span>
          </div>
          <h2 className="font-chakra text-2xl lg:text-3xl font-bold text-white tracking-wide">
            NISAR Radar Product Catalog & STAC Browser
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
            Search, filter, and inspect calibrated L-band (24 cm) and S-band (9.4 cm) synthetic aperture radar granules formatted as Cloud Optimized GeoTIFFs (COG).
          </p>
        </div>

        {/* Official Mission External Links */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <a
            href="https://science.nasa.gov/mission/nisar/"
            target="_blank"
            rel="noreferrer"
            className="glass-panel px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            NASA NISAR
          </a>
          <a
            href="https://bhoonidhi.nrsc.gov.in/NISAR/"
            target="_blank"
            rel="noreferrer"
            className="glass-panel px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            ISRO BHOONIDHI
          </a>
          <a
            href="https://search.asf.alaska.edu/"
            target="_blank"
            rel="noreferrer"
            className="glass-panel px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            NASA ASF VERTEX
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by region, granule ID, polarization..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 shrink-0">BAND:</span>
          <select
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value as any)}
            className="w-full py-2 px-3 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="all">ALL FREQUENCIES (L + S)</option>
            <option value="L-band">L-BAND (24 cm, NASA JPL)</option>
            <option value="S-band">S-BAND (9.4 cm, ISRO NRSC)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 shrink-0">LEVEL:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as any)}
            className="w-full py-2 px-3 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-indigo-300 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="all">ALL PROCESSING LEVELS</option>
            <option value="L1 SLC">L1 SLC (Single Look Complex)</option>
            <option value="L2 GCOV">L2 GCOV (Geocoded Covariance)</option>
            <option value="L2 GSV">L2 GSV (Soil Moisture & Veg)</option>
            <option value="L3 GUNW">L3 GUNW (Unwrapped InSAR)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Granule List & Detailed Metadata Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Granules List */}
        <div className="lg:col-span-5 space-y-3 max-h-[520px] overflow-y-auto pr-2">
          {filteredDatasets.map((granule) => (
            <div
              key={granule.id}
              onClick={() => setSelectedGranule(granule)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedGranule.id === granule.id
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    granule.frequency === 'L-band'
                      ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
                      : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {granule.frequency} • {granule.wavelength}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {granule.processingLevel}
                </span>
              </div>
              <h4 className="font-mono text-xs font-bold text-white truncate mb-1">
                {granule.granuleName}
              </h4>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>{granule.region}</span>
                <span className="text-slate-300">{granule.cloudOptimizedGeoTiffSizeMb} MB COG</span>
              </div>
            </div>
          ))}
        </div>

        {/* Granule Metadata Inspector */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">
                  STAC METADATA INSPECTOR
                </span>
                <h3 className="font-chakra text-lg font-bold text-white truncate max-w-md">
                  {selectedGranule.granuleName}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> VALIDATED COG
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-6">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">SENSOR INSTRUMENT</span>
                <strong className="text-white text-sm">{selectedGranule.frequency} SAR</strong>
                <span className="text-cyan-400 block text-[11px] mt-0.5">{selectedGranule.wavelength}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">POLARIZATION MODE</span>
                <strong className="text-white text-sm">{selectedGranule.polarization}</strong>
                <span className="text-emerald-400 block text-[11px] mt-0.5">Dual/Full Polarimetric</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">ACQUISITION TIMESTAMP</span>
                <strong className="text-white">{selectedGranule.acquisitionDate}</strong>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">SWATH WIDTH & ORBIT</span>
                <strong className="text-white">{selectedGranule.swathWidthKm} km Swath</strong>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  Track {selectedGranule.orbitTrack} ({selectedGranule.orbitDirection})
                </span>
              </div>
            </div>

            {/* STAC JSON Preview */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto mb-4">
              <div className="text-slate-400 text-[10px] mb-1 font-bold">STAC ITEM JSON SNIPPET:</div>
              <pre>{JSON.stringify({
                type: "Feature",
                stac_version: "1.0.0",
                id: selectedGranule.id,
                properties: {
                  "sar:frequency": selectedGranule.frequency,
                  "sar:polarizations": [selectedGranule.polarization],
                  "sar:instrument_mode": "SweepSAR",
                  "datetime": selectedGranule.acquisitionDate,
                  "platform": "NISAR",
                  "processing:level": selectedGranule.processingLevel
                },
                assets: {
                  data: {
                    href: `https://asf.alaska.edu/nisar/cog/${selectedGranule.id}.tif`,
                    type: "image/tiff; application=geotiff; profile=cloud-optimized"
                  }
                }
              }, null, 2)}</pre>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono">
            <span className="text-slate-400">
              SOURCE ARCHIVE: <strong className="text-white">{selectedGranule.sourceArchive}</strong>
            </span>
            <button
              onClick={() => alert(`Simulated downloading COG stream for ${selectedGranule.id}`)}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 hover:brightness-110 shadow-md shadow-cyan-500/30"
            >
              <Download className="w-3.5 h-3.5" />
              STREAM COG TILES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
