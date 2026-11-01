import React, { useState, useEffect, useRef } from 'react';
import {
  Globe2,
  Search,
  Sliders,
  Sparkles,
  BookOpen,
  Database,
  Info,
  Clock,
  Radio,
  Menu,
  X,
  Droplets,
  Zap,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from 'lucide-react';
import { AudioController } from './AudioController';
import { GLOBAL_HOTSPOTS } from '../data/earthData';
import { ObservationHotspot } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectHotspot: (hotspot: ObservationHotspot) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectHotspot,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Drag-to-scroll refs and state for navigation ribbon
  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!ribbonRef.current) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - ribbonRef.current.offsetLeft;
    scrollLeftRef.current = ribbonRef.current.scrollLeft;
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !ribbonRef.current) return;
    e.preventDefault();
    const x = e.pageX - ribbonRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.6;
    ribbonRef.current.scrollLeft = scrollLeftRef.current - walk;
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => setIsDragging(false), 80);
  };

  const scrollRibbon = (offset: number) => {
    if (ribbonRef.current) {
      ribbonRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filter hotspots for search popup
  const searchResults = searchQuery.trim()
    ? GLOBAL_HOTSPOTS.filter(
        (h) =>
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const navLinks = [
    { id: 'home', label: 'DASHBOARD', icon: Globe2 },
    { id: 'explorer', label: '3D GLOBE', icon: Globe2 },
    { id: 'change-detection', label: 'CHANGE RADAR', icon: Sliders },
    { id: 'punjab-flood', label: 'PUNJAB CASE 2025', icon: Droplets, highlight: true },
    { id: 'predictive-caching', label: 'PREDICTIVE CACHING', icon: Zap },
    { id: 'earth-intelligence', label: 'AI INTEL', icon: Sparkles },
    { id: 'stories', label: 'STORIES', icon: BookOpen },
    { id: 'nisar-catalog', label: 'NISAR DATA', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl">
      {/* Top Mission Telemetry Bar */}
      <div className="hidden md:flex items-center justify-between px-6 py-1 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
            <span>NISAR L-BAND (NASA) + S-BAND (ISRO) TELEMETRY ONLINE</span>
          </div>
          <span>SWEEPSAR RESOLUTION: 3-10M</span>
          <span>SUN-SYNCHRONOUS ORBIT: 747 KM</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>MISSION UTC: <strong className="text-white">{utcTime || 'SYNCHRONIZING...'}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Header Row: Logo & Actions */}
      <div className="px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:brightness-110 transition-all border border-cyan-300/40">
            <Globe2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="font-chakra text-base sm:text-lg font-bold tracking-wider text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
              <span>EARTHPULSE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-normal bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                NISAR
              </span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 -mt-0.5 tracking-wider hidden sm:block">
              THE LIVING PLANET • NASA SPACE APPS
            </div>
          </div>
        </div>

        {/* Right Action Cluster: Search & Audio */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Drag instruction cue */}
          <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono text-cyan-400/60 bg-slate-900/60 px-2.5 py-1 rounded-full border border-cyan-500/20">
            <MoveHorizontal className="w-3 h-3 text-cyan-400" />
            <span>DRAG NAV BAR TO BROWSE</span>
          </div>

          {/* Global Search Button */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
              title="Search countries, regions, coordinates, disasters..."
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Search Dropdown Modal */}
            {searchOpen && (
              <div className="absolute right-0 top-12 w-80 md:w-96 glass-panel-glow p-4 rounded-xl border border-cyan-400/50 shadow-2xl z-50 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
                  <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Punjab, Amazon, Greenland, Flood..."
                    className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none font-mono text-xs"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-2 font-mono">
                    {searchResults.map((hotspot) => (
                      <div
                        key={hotspot.id}
                        onClick={() => {
                          onSelectHotspot(hotspot);
                          setActiveTab('change-detection');
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-400/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-bold">{hotspot.name}</span>
                          <span className="text-[10px] text-cyan-400 uppercase">
                            {hotspot.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>{hotspot.region}, {hotspot.country}</span>
                          <span className={hotspot.deltaDb < 0 ? 'text-cyan-400' : 'text-emerald-400'}>
                            {hotspot.deltaDb > 0 ? `+${hotspot.deltaDb}` : hotspot.deltaDb} dB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-4 text-slate-400 font-mono text-xs">
                    No matching satellite observation hotspots found.
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 font-mono">
                    Type a country, region, or disaster type to locate radar observations.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Integrated Space Sound Controller */}
          <AudioController />
        </div>
      </div>

      {/* Front Slanted Navigation Ribbon with Drag & Click Scroll */}
      <div className="relative w-full bg-slate-950/90 border-t border-cyan-500/20 flex items-center shadow-inner">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scrollRibbon(-220)}
          className="flex shrink-0 z-10 px-2 py-2 text-cyan-400 hover:text-white bg-slate-950/90 hover:bg-slate-900 border-r border-cyan-500/20 h-full items-center justify-center transition-colors cursor-pointer"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable & Draggable Track */}
        <div
          ref={ribbonRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 overflow-x-auto scrollbar-none py-2 px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-1 sm:gap-2 text-[11px] font-mono whitespace-nowrap min-w-max mx-auto">
            {navLinks.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && (
                    <span className="text-cyan-400/50 font-mono font-bold text-sm px-1 sm:px-1.5 select-none pointer-events-none">
                      /
                    </span>
                  )}
                  <button
                    onClick={() => {
                      if (!isDragging) {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`transform -skew-x-12 px-2.5 sm:px-3 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-400/40 border border-cyan-300'
                        : item.highlight
                        ? 'bg-rose-950/70 text-rose-300 border border-rose-500/50 hover:bg-rose-900/60'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40'
                    }`}
                  >
                    <span className="transform skew-x-12 flex items-center gap-1.5">
                      {item.highlight ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      ) : (
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                      )}
                      <span>{item.label}</span>
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scrollRibbon(220)}
          className="flex shrink-0 z-10 px-2 py-2 text-cyan-400 hover:text-white bg-slate-950/90 hover:bg-slate-900 border-l border-cyan-500/20 h-full items-center justify-center transition-colors cursor-pointer"
          title="Scroll Right (See STORIES & NISAR DATA)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
