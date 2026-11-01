import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, Loader2, Play, Music } from 'lucide-react';
import { spaceSoundEngine } from '../services/soundEngine';

export const AudioController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.22);
  const [showAiMusicModal, setShowAiMusicModal] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>(
    'NASA-ISRO NISAR orbital pass over Earth with deep synthetic aperture radar resonance and cosmic frequencies'
  );
  const [isGeneratingAiMusic, setIsGeneratingAiMusic] = useState<boolean>(false);
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null);
  const [aiMusicError, setAiMusicError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt auto-start space noise immediately when website is opened
    const startAudio = async () => {
      const ok = await spaceSoundEngine.initAndStart();
      setIsPlaying(ok);
    };

    startAudio();

    // Browser autoplay policy handler: resume on first user interaction if blocked
    const handleFirstInteraction = () => {
      if (!spaceSoundEngine.getIsPlaying()) {
        spaceSoundEngine.initAndStart().then(ok => setIsPlaying(ok));
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    const unsubscribe = spaceSoundEngine.subscribe((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const handleToggle = () => {
    const next = spaceSoundEngine.toggle();
    setIsPlaying(next);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    spaceSoundEngine.setVolume(val);
  };

  const triggerChirp = () => {
    spaceSoundEngine.playRadarChirp();
  };

  const handleGenerateLyria = async () => {
    setIsGeneratingAiMusic(true);
    setAiMusicError(null);
    try {
      const res = await fetch('/api/gemini/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate Lyria space audio');
      }
      setAiAudioUrl(data.audioDataUrl);
    } catch (err: any) {
      setAiMusicError(err.message || 'Generation failed');
    } finally {
      setIsGeneratingAiMusic(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 px-3 py-1.5 rounded-full shadow-lg shadow-cyan-950/40 text-xs">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full font-medium transition-all ${
            isPlaying
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
          title={isPlaying ? 'Mute Space Sound' : 'Play Space Sound'}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline font-mono">SPACE SOUND ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline font-mono">SPACE SOUND OFF</span>
            </>
          )}
        </button>

        {/* Animated frequency wave visualizer */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3.5 px-1">
            <span className="w-0.5 bg-cyan-400 h-2.5 animate-[pulse_0.8s_ease-in-out_infinite]" />
            <span className="w-0.5 bg-cyan-300 h-3.5 animate-[pulse_1.2s_ease-in-out_infinite_0.2s]" />
            <span className="w-0.5 bg-cyan-400 h-1.5 animate-[pulse_0.7s_ease-in-out_infinite_0.4s]" />
            <span className="w-0.5 bg-emerald-400 h-3 animate-[pulse_1s_ease-in-out_infinite_0.1s]" />
          </div>
        )}

        {/* Volume slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-12 sm:w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />

        {/* SAR Chirp manual trigger */}
        <button
          onClick={triggerChirp}
          className="p-1 hover:text-cyan-300 text-slate-400 transition-colors"
          title="Send SAR Radar Ping (Web Audio Chirp)"
        >
          <Radio className="w-3.5 h-3.5" />
        </button>

        {/* Lyria AI space sound generator */}
        <button
          onClick={() => setShowAiMusicModal(true)}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/60 transition-colors font-mono"
          title="Generate AI Space Music via Lyria"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="hidden md:inline text-[10px]">AI LYRIA</span>
        </button>
      </div>

      {/* Lyria Modal */}
      {showAiMusicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-glow rounded-xl max-w-lg w-full p-6 border border-indigo-500/40 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20 mb-4">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-400" />
                <h3 className="font-chakra text-lg font-semibold text-white tracking-wide">
                  LYRIA-3 SPACE SOUND GENERATOR
                </h3>
              </div>
              <button
                onClick={() => setShowAiMusicModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Generate custom 30-second cosmic soundscapes and synthetic aperture radar sonifications using Google's <span className="font-mono text-indigo-300">lyria-3-clip-preview</span> model.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-mono text-cyan-400 mb-1">
                COSMIC AUDIO PROMPT
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400 font-mono"
                placeholder="Describe cosmic ambience, radar frequency shifts, orbital drones..."
              />
            </div>

            {aiMusicError && (
              <div className="p-2.5 mb-4 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
                {aiMusicError}
              </div>
            )}

            {aiAudioUrl && (
              <div className="mb-4 p-3 bg-slate-950/90 rounded-lg border border-cyan-500/30">
                <div className="text-xs font-mono text-cyan-300 mb-2 flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-cyan-400" /> GENERATED LYRIA SOUNDSCAPE:
                </div>
                <audio controls src={aiAudioUrl} autoPlay className="w-full h-8" />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAiMusicModal(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
              <button
                onClick={handleGenerateLyria}
                disabled={isGeneratingAiMusic}
                className="flex items-center gap-2 px-4 py-1.5 rounded bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium text-xs hover:brightness-110 disabled:opacity-50 shadow-md shadow-indigo-900/50"
              >
                {isGeneratingAiMusic ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating Orbit Sound...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Audio Clip
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
