import React from 'react';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  TrendingDown,
  Activity,
  Radio,
  FileText,
} from 'lucide-react';
import { GLOBAL_HOTSPOTS } from '../data/earthData';
import { ObservationHotspot } from '../types';

interface EarthStoriesProps {
  onSelectHotspot: (hotspot: ObservationHotspot) => void;
}

export const EarthStories: React.FC<EarthStoriesProps> = ({ onSelectHotspot }) => {
  const stories = [
    {
      hotspotId: 'punjab-flood-2025',
      title: 'The Inundated Breadbasket: Punjab Monsoonal Crisis 2025',
      tagline: 'When Rivers Swell: Penetrating Mature Paddy Fields with Dual-Frequency Radar',
      category: 'EXTREME FLOODING',
      region: 'Sutlej & Beas Basin, Punjab, India',
      keyStat: '4,280 km² inundated (-10.6 dB shift)',
      radarBand: 'NISAR Dual L+S Band',
      radarInsight: 'While ESA Sentinel-1 C-band bounced off upper rice leaves and missed 56% of flooded farms, NISAR L-band (24 cm) penetrated directly to the water-stem interface, detecting 100% of flooded crops and preventing widespread agricultural loss miscalculation.',
      deltaBadge: '-10.6 dB Specular Drop',
      dateRange: 'July 18 – August 26, 2025',
    },
    {
      hotspotId: 'amazon-deforestation',
      title: 'The Scarred Canopy: Amazon Forest Fragmentation',
      tagline: 'How L-Band SAR Sees Past Rainforest Clouds into Brazil’s Arc of Deforestation',
      category: 'FOREST DISTURBANCE',
      region: 'Rondônia & Pará, Brazil',
      keyStat: '8,950 km² canopy altered',
      radarBand: 'NISAR L-band (24 cm)',
      radarInsight: 'L-band HV cross-polarization serves as a direct proxy for above-ground woody biomass, measuring logging beneath persistent equatorial cloud blankets where optical satellites are completely blinded.',
      deltaBadge: '-8.5 dB Biomass Loss',
      dateRange: 'June 2024 – September 2025',
    },
    {
      hotspotId: 'greenland-helheim',
      title: 'Glacial Acceleration: The Helheim Calving Margin',
      tagline: 'Tracking 28 Meters Per Day Ice Stream Speeds with Repeat-Pass InSAR',
      category: 'CRYOSPHERE DEFORMATION',
      region: 'Sermersooq Ice Sheet Margin, Greenland',
      keyStat: '28 m/day velocity terminus',
      radarBand: 'NISAR L-band (24 cm)',
      radarInsight: 'Interferometric phase tracking maps grounding line stability through arctic winter polar night, calculating dynamic ice discharge into the North Atlantic ocean with sub-centimeter velocity accuracy.',
      deltaBadge: '+1.4 dB Ice Velocity Strain',
      dateRange: 'August 2024 – August 2025',
    },
    {
      hotspotId: 'california-wildfires',
      title: 'Scorched Earth: Post-Wildfire Hydrophobic Soil Hazards',
      tagline: 'Evaluating Mudslide Risks in California’s Sierra Nevada with Polarimetric SAR',
      category: 'WILDFIRE RECOVERY',
      region: 'Northern California Sierra Nevada, USA',
      keyStat: '2,840 km² high-severity burn',
      radarBand: 'NISAR Dual L+S Band',
      radarInsight: 'Destruction of forest branch architecture drops volume scattering, signaling hydrophobic soils that trigger devastating winter debris flows and mudslides upon the arrival of atmospheric river storms.',
      deltaBadge: '-5.7 dB Canopy Loss',
      dateRange: 'July 2024 – September 2025',
    },
    {
      hotspotId: 'gangotri-glacier',
      title: 'Water Towers of Asia: Gangotri Glacier Lake Dynamics',
      tagline: 'Himalayan Terminus Thinning and Glacial Lake Outburst Flood (GLOF) Risks',
      category: 'HIMALAYAN MONITORING',
      region: 'Uttarkashi, Himalayas, India',
      keyStat: '22m annual terminus thinning',
      radarBand: 'NISAR L-band (24 cm)',
      radarInsight: 'Dual ascending and descending look-angle synthesis eliminates steep mountain terrain layover and shadow blind spots, tracking proglacial lake expansion and early GLOF damming hazards.',
      deltaBadge: '-1.3 dB Terminus Thinning',
      dateRange: 'September 2024 – September 2025',
    },
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 lg:p-8 border border-cyan-500/30 glass-panel-glow shadow-2xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            SCIENTIFIC STORYTELLING DOSSIERS
          </span>
        </div>
        <h2 className="font-chakra text-2xl lg:text-3xl font-bold text-white tracking-wide">
          The Changing Earth: Stories from Orbit
        </h2>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          Comprehensive scientific transformation case studies grounded in NASA-ISRO NISAR synthetic aperture radar data. Every change tells a story—discover Earth’s story.
        </p>
      </div>

      {/* Stories Cards Grid (No pictures, pure clean scientific dossier style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => {
          const hotspot = GLOBAL_HOTSPOTS.find((h) => h.id === story.hotspotId);

          return (
            <div
              key={story.hotspotId}
              className="group rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-cyan-400/50 transition-all duration-300 flex flex-col justify-between p-6 shadow-xl hover:shadow-cyan-950/40 relative overflow-hidden"
            >
              {/* Top Glow Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-4">
                {/* Meta Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    {story.category}
                  </span>
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                    {story.deltaBadge}
                  </span>
                </div>

                {/* Region & Date */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-1 truncate max-w-[65%]">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{story.region}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{story.dateRange}</span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="font-chakra text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-1.5">
                    {story.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-mono leading-relaxed">
                    {story.tagline}
                  </p>
                </div>

                {/* Quantitative Impact Box */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">EXTENT AFFECTED</span>
                    <strong className="text-cyan-300">{story.keyStat}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">INSTRUMENT BAND</span>
                    <strong className="text-emerald-300">{story.radarBand}</strong>
                  </div>
                </div>

                {/* Radar Science Insight */}
                <div className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-bold mb-1">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SAR MICROWAVE OBSERVATION:</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {story.radarInsight}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => hotspot && onSelectHotspot(hotspot)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-2 border border-slate-700 hover:border-cyan-400 transition-all cursor-pointer shadow-md"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>LAUNCH INTERACTIVE SAR ANALYSIS & 3D RELIEF</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
