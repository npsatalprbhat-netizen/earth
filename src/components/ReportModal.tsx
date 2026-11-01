import React from 'react';
import { ObservationHotspot } from '../types';
import { Download, Printer, Share2, Check, ShieldCheck, FileText, X } from 'lucide-react';

interface ReportModalProps {
  hotspot: ObservationHotspot;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ hotspot, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-3xl w-full p-6 lg:p-8 text-slate-100 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Document Area */}
        <div id="printable-report" className="space-y-6">
          {/* Header */}
          <div className="border-b border-cyan-500/30 pb-4">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
              <span>NASA-ISRO NISAR OBSERVATION DISPATCH</span>
              <span>CLASSIFICATION: OPEN ACCESS SCIENCE DATA</span>
            </div>
            <h2 className="font-chakra text-2xl font-bold text-white">
              {hotspot.name}
            </h2>
            <div className="text-slate-400 text-xs font-mono mt-1">
              REGION: {hotspot.region}, {hotspot.country} | COORDINATES: {hotspot.lat.toFixed(4)}°N, {hotspot.lng.toFixed(4)}°E
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RADAR BACKSCATTER Δ</span>
              <strong className="text-base text-cyan-400">
                {hotspot.deltaDb > 0 ? `+${hotspot.deltaDb}` : hotspot.deltaDb} dB
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">InSAR COHERENCE (γ)</span>
              <strong className="text-base text-indigo-300">
                {hotspot.coherenceScore.toFixed(2)}
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">AFFECTED REGION</span>
              <strong className="text-base text-white">
                {hotspot.affectedAreaSqKm.toLocaleString()} km²
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RADAR FREQUENCY</span>
              <strong className="text-base text-emerald-400">
                {hotspot.nisarBand}
              </strong>
            </div>
          </div>

          {/* Observations Comparison Imagery */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border border-slate-800">
              <img
                src={hotspot.beforeImage}
                alt="Baseline Observation"
                className="w-full h-40 object-cover"
              />
              <div className="p-2 bg-slate-950 text-[10px] font-mono text-slate-400 flex justify-between">
                <span>BASELINE: {hotspot.beforeDate}</span>
                <span className="text-cyan-400">{hotspot.beforeBackscatterDb} dB</span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800">
              <img
                src={hotspot.afterImage}
                alt="Post-Event Observation"
                className="w-full h-40 object-cover"
              />
              <div className="p-2 bg-slate-950 text-[10px] font-mono text-slate-400 flex justify-between">
                <span>POST-EVENT: {hotspot.afterDate}</span>
                <span className="text-rose-400">{hotspot.afterBackscatterDb} dB</span>
              </div>
            </div>
          </div>

          {/* Scientific Interpretation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-mono font-bold text-cyan-400 uppercase">
              SCIENTIFIC SAR INTERPRETATION & FINDINGS:
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {hotspot.scientificFinding}
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Polarization mode: <strong>{hotspot.radarCharacteristics.polarization}</strong> | Spatial resolution: <strong>{hotspot.radarCharacteristics.spatialResolutionM}m</strong> | Processing level: <strong>{hotspot.radarCharacteristics.processingLevel}</strong>.
            </p>
          </div>

          {/* Attribution & Signature */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DATA VALIDATED BY NASA JPL & ISRO NRSC SCIENCE TEAM</span>
            </div>
            <div>STAC CATALOG ID: {hotspot.id}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'LINK COPIED' : 'SHARE ANALYSIS LINK'}
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 hover:brightness-110 shadow-lg shadow-cyan-500/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            DOWNLOAD / PRINT PDF REPORT
          </button>
        </div>
      </div>
    </div>
  );
};
