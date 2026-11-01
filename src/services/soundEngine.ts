/**
 * Space Sound Engine for EarthPulse - Powered by Web Audio API
 * Generates continuous cosmic ambient resonance, filtered radio static,
 * and periodic Synthetic Aperture Radar (SAR) chirps.
 */

class SpaceSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private chirpTimer: number | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.22; // subtle non-intrusive default
  private currentPreset: 'sar' | 'deep' | 'wind' = 'sar';
  private listeners: ((playing: boolean) => void)[] = [];

  constructor() {
    // We defer AudioContext creation until user interaction or window load
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.isPlaying));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public async initAndStart(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      if (this.isPlaying) return true;

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Cosmic Drone (Dual detuned sine oscillators)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      const droneFilter = this.ctx.createBiquadFilter();
      const droneGain = this.ctx.createGain();

      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(55.6, this.ctx.currentTime); // gentle beating

      droneGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.droneOsc1.connect(droneFilter);
      this.droneOsc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // 2. Cosmic Microwave / Ionospheric Static (Filtered pink/brown noise)
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
        lastOut = output[i];
        output[i] *= 2.8; // gain adjust
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);

      this.noiseNode.start();

      // 3. Periodic Synthetic Aperture Radar (SAR) Chirp
      this.scheduleNextChirp();

      this.isPlaying = true;
      this.notify();
      return true;
    } catch (e) {
      console.warn('Auto space sound deferred until interaction:', e);
      return false;
    }
  }

  private scheduleNextChirp() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const delay = 6000 + Math.random() * 4000; // chirp every 6-10s
    this.chirpTimer = window.setTimeout(() => {
      this.playRadarChirp();
      this.scheduleNextChirp();
    }, delay);
  }

  public playRadarChirp() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;
      const chirpOsc = this.ctx.createOscillator();
      const chirpGain = this.ctx.createGain();
      const chirpFilter = this.ctx.createBiquadFilter();

      chirpFilter.type = 'bandpass';
      chirpFilter.frequency.setValueAtTime(1200, now);

      chirpOsc.type = 'sawtooth';
      // SAR frequency sweep from 1800Hz down to 600Hz in 120ms
      chirpOsc.frequency.setValueAtTime(1800, now);
      chirpOsc.frequency.exponentialRampToValueAtTime(500, now + 0.14);

      chirpGain.gain.setValueAtTime(0.001, now);
      chirpGain.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      chirpOsc.connect(chirpFilter);
      chirpFilter.connect(chirpGain);
      chirpGain.connect(this.masterGain);

      chirpOsc.start(now);
      chirpOsc.stop(now + 0.25);
    } catch {
      // Audio node cleanup
    }
  }

  public stop() {
    if (this.chirpTimer) {
      window.clearTimeout(this.chirpTimer);
      this.chirpTimer = null;
    }

    try {
      if (this.droneOsc1) {
        this.droneOsc1.stop();
        this.droneOsc1.disconnect();
        this.droneOsc1 = null;
      }
      if (this.droneOsc2) {
        this.droneOsc2.stop();
        this.droneOsc2.disconnect();
        this.droneOsc2 = null;
      }
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
    } catch (e) {
      console.warn('Error stopping space sound:', e);
    }

    this.isPlaying = false;
    this.notify();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.initAndStart();
      return true;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }
}

export const spaceSoundEngine = new SpaceSoundEngine();
