export type SoundType = 'rain' | 'ocean' | 'forest';

export interface SoundConfig {
  type: SoundType;
  label: string;
  description: string;
  icon: string;
}

export const SOUND_CONFIGS: SoundConfig[] = [
  {
    type: 'rain',
    label: 'Rain',
    description: 'Gentle rainfall washing over a quiet afternoon.',
    icon: 'CloudRain',
  },
  {
    type: 'ocean',
    label: 'Ocean Waves',
    description: 'Soft waves rolling onto a calm shoreline.',
    icon: 'Waves',
  },
  {
    type: 'forest',
    label: 'Forest Ambience',
    description: 'A quiet forest with rustling leaves and distant birds.',
    icon: 'Trees',
  },
];

/**
 * Procedural ambient sound generator using the Web Audio API.
 * Creates real, loopable ambient audio without external files.
 */
export class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentNodes: AudioNode[] = [];
  private currentType: SoundType | null = null;
  private currentVolume = 0.4;
  private isInitialized = false;

  private ensureContext(): boolean {
    if (this.ctx) return true;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return false;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.currentVolume;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
      return true;
    } catch {
      return false;
    }
  }

  setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
  }

  getVolume(): number {
    return this.currentVolume;
  }

  async play(type: SoundType): Promise<boolean> {
    if (!this.ensureContext()) return false;

    if (this.ctx!.state === 'suspended') {
      try {
        await this.ctx!.resume();
      } catch {
        return false;
      }
    }

    this.stopCurrent();
    this.currentType = type;

    try {
      switch (type) {
        case 'rain':
          this.createRain();
          break;
        case 'ocean':
          this.createOcean();
          break;
        case 'forest':
          this.createForest();
          break;
      }
      return true;
    } catch {
      this.stopCurrent();
      return false;
    }
  }

  stop(): void {
    this.stopCurrent();
    this.currentType = null;
  }

  getCurrentType(): SoundType | null {
    return this.currentType;
  }

  isPlaying(): boolean {
    return this.currentType !== null && this.currentNodes.length > 0;
  }

  private stopCurrent(): void {
    if (this.currentNodes.length > 0 && this.ctx) {
      const now = this.ctx.currentTime;
      // Fade out to avoid clicks
      if (this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.setTargetAtTime(0, now, 0.05);
      }
      setTimeout(() => {
        this.currentNodes.forEach(node => {
          try {
            if ('stop' in node && typeof node.stop === 'function') {
              (node as AudioScheduledSourceNode).stop();
            }
            try { node.disconnect(); } catch { /* ignore */ }
          } catch { /* ignore */ }
        });
        this.currentNodes = [];
        // Restore volume for next play
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
        }
      }, 100);
    }
  }

  /**
   * Rain: white noise filtered through a bandpass filter + occasional droplet tones
   */
  private createRain(): void {
    const ctx = this.ctx!;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000;
    bandpass.Q.value = 0.5;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2500;

    const gain = ctx.createGain();
    gain.gain.value = 0.5;

    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain!);

    noise.start();
    this.currentNodes.push(noise, bandpass, lowpass, gain);

    // Add subtle high-frequency shimmer
    const shimmerBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const shimmerData = shimmerBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      shimmerData[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const shimmer = ctx.createBufferSource();
    shimmer.buffer = shimmerBuffer;
    shimmer.loop = true;

    const shimmerFilter = ctx.createBiquadFilter();
    shimmerFilter.type = 'highpass';
    shimmerFilter.frequency.value = 4000;

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.08;

    shimmer.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);
    shimmerGain.connect(this.masterGain!);
    shimmer.start();
    this.currentNodes.push(shimmer, shimmerFilter, shimmerGain);
  }

  /**
   * Ocean: low-frequency noise with LFO-modulated gain to simulate waves
   */
  private createOcean(): void {
    const ctx = this.ctx!;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 600;

    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.3;

    // LFO for wave effect
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.25;

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noise.connect(lowpass);
    lowpass.connect(waveGain);
    waveGain.connect(this.masterGain!);

    noise.start();
    lfo.start();
    this.currentNodes.push(noise, lowpass, waveGain, lfo, lfoGain);

    // Add gentle "hiss" for foam
    const foamBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const foamData = foamBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      foamData[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const foam = ctx.createBufferSource();
    foam.buffer = foamBuffer;
    foam.loop = true;

    const foamFilter = ctx.createBiquadFilter();
    foamFilter.type = 'bandpass';
    foamFilter.frequency.value = 2000;
    foamFilter.Q.value = 0.8;

    const foamGain = ctx.createGain();
    foamGain.gain.value = 0.06;

    foam.connect(foamFilter);
    foamFilter.connect(foamGain);
    foamGain.connect(this.masterGain!);
    foam.start();
    this.currentNodes.push(foam, foamFilter, foamGain);
  }

  /**
   * Forest: filtered brown noise for wind + random bird chirps
   */
  private createForest(): void {
    const ctx = this.ctx!;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.35;

    // Slow LFO for wind variation
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(windGain.gain);

    noise.connect(lowpass);
    lowpass.connect(windGain);
    windGain.connect(this.masterGain!);

    noise.start();
    lfo.start();
    this.currentNodes.push(noise, lowpass, windGain, lfo, lfoGain);

    // Bird chirps - scheduled randomly
    this.scheduleBirdChirp();
  }

  private scheduleBirdChirp(): void {
    if (!this.ctx || this.currentType !== 'forest') return;

    const ctx = this.ctx;
    const delay = 2 + Math.random() * 5;

    const timer = setTimeout(() => {
      if (this.currentType !== 'forest' || !this.ctx) return;

      const now = ctx.currentTime;
      const numChirps = 1 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numChirps; i++) {
        const start = now + i * 0.15;
        const osc = ctx.createOscillator();
        osc.type = 'sine';

        const baseFreq = 1500 + Math.random() * 1500;
        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, start + 0.05);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, start + 0.1);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0, start);
        chirpGain.gain.linearRampToValueAtTime(0.06, start + 0.01);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(chirpGain);
        chirpGain.connect(this.masterGain!);

        osc.start(start);
        osc.stop(start + 0.15);
      }

      this.scheduleBirdChirp();
    }, delay * 1000);

    // Store timer so it can be cleaned up
    this.currentNodes.push({ disconnect: () => clearTimeout(timer) } as unknown as AudioNode);
  }

  dispose(): void {
    this.stopCurrent();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch { /* ignore */ }
      this.ctx = null;
      this.masterGain = null;
    }
    this.isInitialized = false;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}
