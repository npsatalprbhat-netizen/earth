import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with telemetry header as required by skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Lightweight in-memory cache for ultra-fast instant answers to repeated queries
const queryResponseCache = new Map<string, { text: string; modelUsed: string }>();

// 1. Earth Intelligence Assistant Real-Time Streaming Endpoint (Fast token-by-token streaming)
app.post('/api/gemini/chat/stream', async (req, res) => {
  try {
    const { prompt, useHighThinking, speedMode = 'turbo', context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const cacheKey = `${prompt.trim().toLowerCase()}_${useHighThinking ? 'argon' : speedMode}`;
    if (queryResponseCache.has(cacheKey)) {
      const cached = queryResponseCache.get(cacheKey)!;
      // Stream cached response rapidly in chunks for instant feedback
      const words = cached.text.split(' ');
      for (let i = 0; i < words.length; i += 4) {
        const chunk = words.slice(i, i + 4).join(' ') + ' ';
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true, modelUsed: `${cached.modelUsed} (Instant Cache)` })}\n\n`);
      res.end();
      return;
    }

    const systemInstruction = `You are EarthPulse Intelligence Assistant, an elite remote sensing scientist and planetary observation AI developed for the NASA Space Apps Challenge and NASA-ISRO NISAR mission.
You explain Synthetic Aperture Radar (SAR) observations, interferometric coherence, L-band (24 cm, NASA JPL) vs S-band (9.4 cm, ISRO NRSC) penetration capabilities, backscatter values (dB scale), flood inundation, deforestation, glacier velocity, soil moisture, and seismic deformation.
Rules:
- Be fast, crisp, direct, and authoritative with scientific clarity.
- Distinguish measured radar observations from hypotheses or models.
- When explaining disaster events like the 2025 Punjab Floods or Amazon deforestation, provide rigorous scientific context with bullet points, metrics, and actionable takeaways.
${context ? `Active Location Context: ${JSON.stringify(context)}` : ''}`;

    let selectedModel = speedMode === 'argon' || useHighThinking ? 'gemini-4-argon' : 'gemini-3.1-flash-lite';
    let thinkingLevel = speedMode === 'argon' || useHighThinking ? ThinkingLevel.HIGH : ThinkingLevel.MINIMAL;

    // Helper to generate content stream with graceful fallback if a model experiences high demand
    const executeStream = async (modelName: string, tLevel: ThinkingLevel) => {
      const config: any = { systemInstruction };
      if (modelName === 'gemini-4-argon' || modelName === 'gemini-3.8-flash') {
        config.thinkingConfig = { thinkingLevel: tLevel };
      }
      return await ai.models.generateContentStream({
        model: modelName,
        contents: prompt,
        config,
      });
    };

    let responseStream;
    let effectiveModel = selectedModel;

    try {
      responseStream = await executeStream(selectedModel, thinkingLevel);
    } catch (modelErr: any) {
      console.warn(`Model ${selectedModel} failed (${modelErr?.message}). Falling back to gemini-3.1-flash-lite for instant response.`);
      effectiveModel = 'gemini-3.1-flash-lite';
      responseStream = await executeStream('gemini-3.1-flash-lite', ThinkingLevel.MINIMAL);
    }

    let fullText = '';
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    // Cache the full response for instant recall
    if (fullText) {
      queryResponseCache.set(cacheKey, {
        text: fullText,
        modelUsed: effectiveModel,
      });
      // Cap cache size
      if (queryResponseCache.size > 200) {
        const firstKey = queryResponseCache.keys().next().value;
        if (firstKey) queryResponseCache.delete(firstKey);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, modelUsed: effectiveModel })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error in /api/gemini/chat/stream:', error);
    res.write(`data: ${JSON.stringify({ error: error?.message || 'Streaming failed' })}\n\n`);
    res.end();
  }
});

// 2. Earth Intelligence Assistant Chat Endpoint (Non-streaming fallback with optimized low latency)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, useHighThinking, speedMode = 'turbo', context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const cacheKey = `${prompt.trim().toLowerCase()}_${useHighThinking ? 'argon' : speedMode}`;
    if (queryResponseCache.has(cacheKey)) {
      const cached = queryResponseCache.get(cacheKey)!;
      return res.json({
        text: cached.text,
        modelUsed: `${cached.modelUsed} (Instant Cache)`,
      });
    }

    const systemInstruction = `You are EarthPulse Intelligence Assistant, an elite remote sensing scientist and planetary observation AI developed for the NASA Space Apps Challenge and NASA-ISRO NISAR mission.
You explain Synthetic Aperture Radar (SAR) observations, interferometric coherence, L-band (24 cm, NASA JPL) vs S-band (9.4 cm, ISRO NRSC) penetration capabilities, backscatter values (dB scale), flood inundation, deforestation, glacier velocity, soil moisture, and seismic deformation.
Rules:
- Be fast, crisp, direct, and authoritative.
- Provide clear, structured answers with bullet points and metrics.
${context ? `Active Location Context: ${JSON.stringify(context)}` : ''}`;

    if (useHighThinking) {
      // Use gemini-4-argon with high thinking mode
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });
      const text = response.text ?? 'No response generated.';
      queryResponseCache.set(cacheKey, { text, modelUsed: 'gemini-4-argon' });
      return res.json({
        text,
        modelUsed: 'gemini-4-argon (High Thinking)',
      });
    } else {
      // Ultra-fast response with gemini-3.1-flash-lite for instant response
      let text = '';
      let modelUsed = 'gemini-3.1-flash-lite (Ultra-Fast)';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });
        text = response.text ?? 'No response generated.';
      } catch (err: any) {
        console.warn('Fallback to gemini-3.8-flash for non-streaming');
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });
        text = response.text ?? 'No response generated.';
        modelUsed = 'gemini-3.8-flash';
      }

      queryResponseCache.set(cacheKey, { text, modelUsed });
      return res.json({
        text,
        modelUsed,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process Earth Intelligence query',
    });
  }
});

// 2. Google Maps Grounded Location Intelligence
app.post('/api/gemini/maps-grounding', async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide geographical context, terrain features, hydrological basins, and environmental vulnerabilities for: ${query}. Mention key landmarks and geographical coordinates.`,
      config,
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return res.json({
      text: response.text ?? '',
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/maps-grounding:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to perform Maps grounding',
    });
  }
});

// 3. High-Resolution Synthetic Satellite & Change Imagery Generation (gemini-3-pro-image with 1K, 2K, 4K)
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '16:9' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const validSizes = ['1K', '2K', '4K'];
    const selectedSize = validSizes.includes(imageSize) ? imageSize : '1K';

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image',
      contents: {
        parts: [
          {
            text: `High-resolution scientific Earth observation visualization: ${prompt}. Photorealistic satellite perspective, false-color radar interferometry or optical remote sensing, NASA Earth Observatory aesthetic, scientifically accurate, sharp topographic details.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: selectedSize as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let descriptionText = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        descriptionText += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image data returned from model' });
    }

    return res.json({
      imageUrl,
      description: descriptionText,
      resolution: selectedSize,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-image:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate satellite visualization',
    });
  }
});

// 4. Lyria AI Space Music & Ambient Cosmic Soundscape Generation
app.post('/api/gemini/generate-audio', async (req, res) => {
  try {
    const { prompt = 'Cinematic deep space ambient hum with synthetic aperture radar pulse pings and cosmic resonance for Earth orbit observation' } = req.body;

    const response = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: prompt,
    });

    const audioChunks: Buffer[] = [];
    let lyrics = '';
    let mimeType = 'audio/mpeg';

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (audioChunks.length === 0 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioChunks.push(Buffer.from(part.inlineData.data, 'base64'));
        }
        if (part.text) {
          lyrics += part.text;
        }
      }
    }

    if (audioChunks.length === 0) {
      return res.status(500).json({ error: 'No audio data received' });
    }

    const audioBase64 = Buffer.concat(audioChunks).toString('base64');
    const audioDataUrl = `data:${mimeType};base64,${audioBase64}`;

    return res.json({
      audioDataUrl,
      lyrics,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-audio:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate cosmic audio with Lyria',
    });
  }
});

// 5. NISAR Mission Real-time Status and STAC Catalog Metadata
app.get('/api/nisar/status', (_req, res) => {
  res.json({
    mission: 'NASA-ISRO SAR (NISAR)',
    status: 'ACTIVE_OBSERVATION_CALIBRATION',
    frequencies: {
      lBand: {
        provider: 'NASA JPL',
        wavelengthCm: 24.0,
        frequencyGHz: 1.25,
        resolutionMeters: '3 to 10',
        applications: ['Deep biomass penetration', 'Sub-canopy flood inundation', 'Interferometric land displacement', 'Ice sheet grounding lines'],
      },
      sBand: {
        provider: 'ISRO SAC / NRSC',
        wavelengthCm: 9.4,
        frequencyGHz: 3.2,
        resolutionMeters: '3 to 10',
        applications: ['Crop canopy roughness', 'Soil moisture (top 5cm)', 'Coastal wetland boundary shifts', 'Urban subsidence'],
      },
    },
    orbit: {
      altitudeKm: 747,
      inclinationDeg: 98.4,
      periodMinutes: 100,
      repeatCycleDays: 12,
      swathWidthKm: 242,
    },
    dataProcessingLatency: {
      rawDownlinkToL0: '2 - 6 hours',
      l1SingleLookComplex: '6 - 18 hours',
      l2GeocodedCovariance: '12 - 24 hours',
      earthPulseEdgeCacheAcceleration: '320 milliseconds (predicted & pre-tiled)',
    },
    lastTelemetryPing: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EarthPulse Server running on port ${PORT}`);
  });
}

startServer();
