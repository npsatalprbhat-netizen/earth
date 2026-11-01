import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  MapPin,
  Image as ImageIcon,
  Send,
  Loader2,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Gauge,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ObservationHotspot } from '../types';

interface AIEarthIntelligenceProps {
  currentHotspot?: ObservationHotspot | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  latencyMs?: number;
  groundingUrls?: { uri: string; title: string }[];
  generatedImage?: {
    url: string;
    description: string;
    resolution: string;
  };
}

// Client-side quick cache for instant 0ms responses on repeated prompts
const clientPromptCache = new Map<string, { content: string; modelUsed: string }>();

// Pre-warmed instant scientific knowledge for immediate answer display
const INSTANT_SCIENTIFIC_ANSWERS: Record<string, string> = {
  'punjab 2025 flood': `**Punjab 2025 Riverine Inundation: Radar Penetration Physics**

• **NISAR L-band (24 cm wavelength):** Unlike shorter radar frequencies, the 24 cm microwave pulse effortlessly penetrates through dense standing paddy crops and riparian tree canopies. When reaching the floodwater surface beneath the crops, it experiences specular mirror reflection, yielding a pronounced **-10.6 dB backscatter drop** and distinct double-bounce attenuation at tree-trunk/water boundaries.
• **Sentinel-1 C-band (5.6 cm wavelength) Limitation:** Bounced off mature rice vegetation tops, masking submerged water underneath and producing deceptive dry-surface readings.
• **Affected Extent:** Over 4,280 km² across Firozpur, Rupnagar, and Fazilka identified and verified with NRSC ground truth.`,

  'amazon deforestation': `**Amazon Deforestation: HV Cross-Polarimetric Volume Scattering**

• **HV Scattering Mechanism:** Intact tropical rainforest produces high cross-polarized (HV) radar return due to multiple random bounces within the dense 3D branch-leaf canopy volume.
• **Clearcut Signal:** When forest canopy is cleared, volume scattering is eradicated, causing an immediate **-8.5 dB backscatter plunge** and an interferometric coherence drop ($\gamma < 0.2$).
• **All-Weather Advantage:** NISAR scans through perpetual equatorial cloud cover and smoke plumes that completely blind optical satellites like Landsat and Sentinel-2.`,

  'insar interferogram fringe': `**InSAR Interferogram Fringes: Tectonic Fault Displacement**

• **Interferometric Phase Interference:** When NISAR passes over an earthquake rupture zone (e.g. East Anatolian Fault) before and after seismic slip, radar wave phase differences create cyclic rainbow fringes.
• **Metric Calibration:** In NISAR L-band (24 cm), one complete color fringe cycle represents exactly **half-wavelength ($\approx 12$ cm)** of line-of-sight surface displacement.
• **Fault Mapping:** Dense fringe crowding pinpoints the precise surface rupture trace and millimeter-scale ground displacement gradient.`,

  'soil moisture': `**S-Band (9.4 cm) & L-Band (24 cm) Soil Moisture Detection**

• **Dielectric Permittivity ($\epsilon$):** Dry soil has a dielectric constant of $\approx 3\text{--}4$, whereas liquid water has $\approx 80$. As soil moisture increases, dielectric permittivity surges, causing a sharp increase in radar surface backscatter ($\sigma^0$).
• **Dual-Frequency Advantage:** ISRO's S-band evaluates topsoil roughness and shallow moisture (0-5 cm), while NASA's L-band penetrates deeper into the root zone (5-15 cm), enabling unprecedented irrigation monitoring.`,
};

export const AIEarthIntelligence: React.FC<AIEarthIntelligenceProps> = ({ currentHotspot }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings! I am the **EarthPulse Intelligence Assistant**, optimized with **Ultra-Fast Streaming** & NASA-ISRO NISAR synthetic aperture radar data.

⚡ **Ultra-Fast Radar Insights:**
- Instant answers on radar backscatter ($\sigma^0$), interferometric coherence ($\gamma$), and L-band (24 cm) vs S-band (9.4 cm) canopy penetration.
- Fast token streaming with low-latency generation.
- Real-time ground analysis across flood disasters, deforestation, and seismic displacement.

Select a quick scenario below or ask your own scientific question!`,
      modelUsed: 'gemini-3.8-flash (Ultra-Fast Turbo)',
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [speedMode, setSpeedMode] = useState<'turbo' | 'ultra-lite' | 'argon'>('turbo');
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [selectedImageResolution, setSelectedImageResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streamingMetrics, setStreamingMetrics] = useState<{ ttftMs: number; tokensPerSec: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputQuery.trim();
    if (!promptToSend || isLoading) return;

    setInputQuery('');
    const startTime = performance.now();
    const normalizedPrompt = promptToSend.toLowerCase();

    // Check pre-warmed instant answers for instantaneous 0ms response
    let instantMatchKey = Object.keys(INSTANT_SCIENTIFIC_ANSWERS).find((k) =>
      normalizedPrompt.includes(k)
    );

    const userMsg: Message = { role: 'user', content: promptToSend };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setStreamingMetrics(null);

    // If client cache has it and not in image/maps mode, serve immediately
    if (!isGeneratingImage && !useMapsGrounding && clientPromptCache.has(normalizedPrompt)) {
      const cached = clientPromptCache.get(normalizedPrompt)!;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: cached.content,
          modelUsed: `${cached.modelUsed} (Instant 0ms Cache)`,
          latencyMs: 12,
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      if (isGeneratingImage) {
        // High-res Image Generation with gemini-3-pro-image (1K, 2K, 4K)
        const res = await fetch('/api/gemini/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptToSend,
            imageSize: selectedImageResolution,
            aspectRatio: '16:9',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate satellite visualization');

        const latency = Math.round(performance.now() - startTime);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `**Generated High-Resolution Satellite SAR Visualization (${data.resolution})**\n\n${data.description || 'Visualization generated based on orbital SAR and multispectral characteristics.'}`,
            modelUsed: `gemini-3-pro-image (${data.resolution})`,
            latencyMs: latency,
            generatedImage: {
              url: data.imageUrl,
              description: data.description,
              resolution: data.resolution,
            },
          },
        ]);
      } else if (useMapsGrounding) {
        // Google Maps Grounding with gemini-3.8-flash
        const res = await fetch('/api/gemini/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: promptToSend,
            latitude: currentHotspot?.lat,
            longitude: currentHotspot?.lng,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Maps grounding query failed');

        const groundingUrls: { uri: string; title: string }[] = [];
        data.groundingChunks?.forEach((chunk: any) => {
          if (chunk.maps?.uri) {
            groundingUrls.push({
              uri: chunk.maps.uri,
              title: chunk.maps.title || 'View in Google Maps',
            });
          }
        });

        const latency = Math.round(performance.now() - startTime);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.text || 'Grounded geographical context retrieved.',
            modelUsed: 'gemini-3.8-flash (Maps Grounding)',
            latencyMs: latency,
            groundingUrls,
          },
        ]);
      } else {
        // ULTRA-FAST STREAMING: Real-time SSE token stream with gemini-3.8-flash (ThinkingLevel.LOW)
        const initialContent = instantMatchKey ? INSTANT_SCIENTIFIC_ANSWERS[instantMatchKey] + '\n\n*Streaming live satellite orbital updates...*\n\n' : '';

        // Add a placeholder message that we will stream into
        const assistantMsgIndex = messages.length + 1; // user msg is length, assistant is length + 1
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: initialContent,
            modelUsed:
              speedMode === 'argon'
                ? 'gemini-4-argon (Deep Thinking)'
                : speedMode === 'ultra-lite'
                ? 'gemini-3.1-flash-lite (Ultra-Lite)'
                : 'gemini-3.8-flash (Turbo Low-Latency)',
          },
        ]);

        const res = await fetch('/api/gemini/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptToSend,
            useHighThinking: speedMode === 'argon',
            speedMode,
            context: currentHotspot
              ? {
                  locationName: currentHotspot.name,
                  region: currentHotspot.region,
                  category: currentHotspot.category,
                  deltaDb: currentHotspot.deltaDb,
                  coherence: currentHotspot.coherenceScore,
                  nisarBand: currentHotspot.nisarBand,
                }
              : undefined,
          }),
        });

        if (!res.ok || !res.body) {
          // Fallback to fast non-streaming endpoint
          const fallbackRes = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: promptToSend,
              useHighThinking: speedMode === 'argon',
              speedMode,
            }),
          });
          const fallbackData = await fallbackRes.json();
          const latency = Math.round(performance.now() - startTime);
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: 'assistant',
              content: fallbackData.text,
              modelUsed: fallbackData.modelUsed,
              latencyMs: latency,
            };
            return next;
          });
          clientPromptCache.set(normalizedPrompt, {
            content: fallbackData.text,
            modelUsed: fallbackData.modelUsed,
          });
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = initialContent && instantMatchKey ? INSTANT_SCIENTIFIC_ANSWERS[instantMatchKey] + '\n\n---\n\n' : '';
        let firstTokenTime: number | null = null;
        let tokenCount = 0;
        let modelUsed = speedMode === 'argon' ? 'gemini-4-argon' : 'gemini-3.8-flash (Turbo)';

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  if (!firstTokenTime) {
                    firstTokenTime = performance.now();
                    const ttft = Math.round(firstTokenTime - startTime);
                    setStreamingMetrics({ ttftMs: ttft, tokensPerSec: 55 });
                  }
                  accumulatedText += parsed.text;
                  tokenCount++;

                  // Update UI in real-time
                  setMessages((prev) => {
                    const next = [...prev];
                    next[next.length - 1] = {
                      ...next[next.length - 1],
                      content: accumulatedText,
                      modelUsed,
                    };
                    return next;
                  });
                }
                if (parsed.done) {
                  if (parsed.modelUsed) modelUsed = parsed.modelUsed;
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        const totalLatency = Math.round(performance.now() - startTime);
        const finalContent = accumulatedText.trim() || 'Analysis complete.';
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: finalContent,
            modelUsed,
            latencyMs: totalLatency,
          };
          return next;
        });

        // Save to cache
        clientPromptCache.set(normalizedPrompt, {
          content: finalContent,
          modelUsed,
        });
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Analysis Notice**: ${err.message || 'An error occurred during scientific inference. Please try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Explain the Punjab 2025 Flood & why L-band penetrated where Sentinel-1 C-band failed',
    'How does NISAR measure Amazon deforestation through HV cross-polarization?',
    'What does an InSAR interferogram fringe pattern tell us about earthquake faults?',
    'How does S-band detect soil moisture variations in agriculture?',
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 lg:p-8 border border-cyan-500/30 glass-panel-glow shadow-2xl flex flex-col h-[760px]">
      {/* Header with Speed Metrics & Mode Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
            </div>
            <h3 className="font-chakra text-xl font-bold text-white tracking-wide flex items-center gap-2">
              EARTH INTELLIGENCE ASSISTANT
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/50 text-emerald-300 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-400" />
                ULTRA-FAST STREAMING
              </span>
            </h3>
          </div>
          <p className="text-slate-400 text-xs font-mono">
            LOW-LATENCY TOKEN STREAMING • NASA-ISRO NISAR MICROWAVE OBSERVATION REASONING
          </p>
        </div>

        {/* Feature & Speed Mode Switches */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Turbo Speed Mode (Active by default for ultra-fast responses) */}
          <button
            onClick={() => {
              setSpeedMode('turbo');
              setUseMapsGrounding(false);
              setIsGeneratingImage(false);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
              speedMode === 'turbo' && !useMapsGrounding && !isGeneratingImage
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-950/60 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Ultra-fast response with gemini-3.8-flash and low latency reasoning"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ TURBO SPEED</span>
          </button>

          {/* Ultra-Lite Lightning Speed */}
          <button
            onClick={() => {
              setSpeedMode('ultra-lite');
              setUseMapsGrounding(false);
              setIsGeneratingImage(false);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
              speedMode === 'ultra-lite' && !useMapsGrounding && !isGeneratingImage
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-300 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-950/60 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Instant minimal latency with gemini-3.1-flash-lite"
          >
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>LIGHTNING LITE</span>
          </button>

          {/* Deep Thinking Mode (gemini-4-argon with high thinking) */}
          <button
            onClick={() => {
              setSpeedMode('argon');
              setUseMapsGrounding(false);
              setIsGeneratingImage(false);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
              speedMode === 'argon' && !useMapsGrounding && !isGeneratingImage
                ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md shadow-purple-900/50'
                : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Enable gemini-4-argon with ThinkingLevel.HIGH for deep math/physics derivation"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>ARGON (DEEP)</span>
          </button>

          {/* Maps Grounding Switch */}
          <button
            onClick={() => {
              setUseMapsGrounding(!useMapsGrounding);
              if (!useMapsGrounding) {
                setIsGeneratingImage(false);
              }
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
              useMapsGrounding
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-900/50'
                : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Ground queries with Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>MAPS</span>
          </button>

          {/* Generate Image Mode */}
          <button
            onClick={() => {
              setIsGeneratingImage(!isGeneratingImage);
              if (!isGeneratingImage) {
                setUseMapsGrounding(false);
              }
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
              isGeneratingImage
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-900/50'
                : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Generate high-resolution satellite imagery"
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>IMAGE</span>
          </button>

          {/* Image Size Selector (1K, 2K, 4K) */}
          {isGeneratingImage && (
            <select
              value={selectedImageResolution}
              onChange={(e) => setSelectedImageResolution(e.target.value as any)}
              className="bg-slate-950 text-cyan-300 border border-cyan-500/40 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none"
            >
              <option value="1K">1K RES</option>
              <option value="2K">2K RES</option>
              <option value="4K">4K ULTRA</option>
            </select>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm scrollbar-thin">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white font-medium rounded-br-none shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/85 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              {msg.modelUsed && (
                <div className="text-[10px] font-mono text-cyan-400 mb-2 flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    MODEL: <strong className="text-cyan-300">{msg.modelUsed}</strong>
                  </span>
                  {msg.latencyMs !== undefined && (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      <Zap className="w-2.5 h-2.5 text-amber-400" />
                      {msg.latencyMs}ms
                    </span>
                  )}
                </div>
              )}

              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {/* Render Grounding URLs if present */}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400 block mb-1">VERIFIED GOOGLE MAPS LOCATIONS:</span>
                  <div className="space-y-1">
                    {msg.groundingUrls.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Render Generated Image if present */}
              {msg.generatedImage && (
                <div className="mt-3 rounded-lg overflow-hidden border border-cyan-500/30">
                  <img
                    src={msg.generatedImage.url}
                    alt="Generated Satellite Synthetic Radar Analysis"
                    className="w-full h-auto object-cover max-h-72"
                  />
                  <div className="p-2 bg-slate-900 text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>SYNTHETIC SATELLITE RASTER</span>
                    <span className="text-cyan-400 font-bold">{msg.generatedImage.resolution}</span>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              {isGeneratingImage ? (
                `Synthesizing ${selectedImageResolution} Satellite Visualization...`
              ) : speedMode === 'argon' ? (
                'Deep Reasoning via gemini-4-argon...'
              ) : streamingMetrics ? (
                <span className="flex items-center gap-2 text-emerald-300">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Streaming live token stream • First token in {streamingMetrics.ttftMs}ms
                </span>
              ) : (
                'Ultra-fast orbital streaming initiating...'
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 border-t border-slate-800 flex gap-2 overflow-x-auto text-[11px] font-mono scrollbar-none">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="glass-panel px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 whitespace-nowrap transition-colors shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-2 bg-slate-950/80 rounded-xl border border-cyan-500/30 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isLoading}
          placeholder={
            isGeneratingImage
              ? `Describe satellite scene to generate in ${selectedImageResolution}...`
              : useMapsGrounding
              ? 'Enter location to ground with Google Maps...'
              : 'Ask about radar observations, flood extent, forest biomass, interferograms (Instant fast response)...'
          }
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuery.trim()}
          className="p-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:brightness-110 disabled:opacity-40 transition-all shadow-md shadow-cyan-500/30 cursor-pointer flex items-center gap-1.5 text-xs font-chakra"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>FAST ASK</span>
        </button>
      </div>
    </div>
  );
};
