import { SoundOptions, TapTonesConfig, WaveformType } from '../types';
import { HapticEngine } from './haptics';

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private haptics: HapticEngine;
  private _hasPlayedFirstSound: boolean = false;
  private config: Required<TapTonesConfig> = {
    masterVolume: 1.0,
    muted: false,
    hapticsEnabled: true,
  };

  constructor(config?: TapTonesConfig) {
    if (config) {
      this.configure(config);
    }
    this.haptics = new HapticEngine(this.config.hapticsEnabled);
    this.setupGlobalUnlockListener();
  }

  private initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;

      try {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.config.masterVolume;

        this.analyserNode = this.ctx.createAnalyser();
        this.analyserNode.fftSize = 64;

        this.masterGain.connect(this.analyserNode);
        this.analyserNode.connect(this.ctx.destination);
      } catch {
        // Fallback for strict environment restrictions
      }
    }
    return this.ctx;
  }

  public getAudioContext(): AudioContext | null {
    if (!this.ctx) {
      this.initAudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getAnalyserNode(): AnalyserNode | null {
    this.getAudioContext();
    return this.analyserNode;
  }

  public getExistingAnalyser(): AnalyserNode | null {
    if (!this.ctx || this.ctx.state !== 'running') return null;
    return this.analyserNode;
  }

  public configure(config: TapTonesConfig): void {
    if (config.masterVolume !== undefined) {
      this.config.masterVolume = Math.max(0, Math.min(1, config.masterVolume));
      if (this.masterGain) {
        this.masterGain.gain.value = this.config.masterVolume;
      }
    }
    if (config.muted !== undefined) {
      this.config.muted = config.muted;
    }
    if (config.hapticsEnabled !== undefined) {
      this.config.hapticsEnabled = config.hapticsEnabled;
      this.haptics.setEnabled(config.hapticsEnabled);
    }
  }

  public getConfig(): Required<TapTonesConfig> {
    return { ...this.config };
  }

  public play(options: SoundOptions = {}): void {
    if (this.config.muted) return;

    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const hapticPattern = options.haptic ?? true;
    if (hapticPattern) {
      this.haptics.trigger(hapticPattern);
    }

    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(() => {
          this.scheduleSound(ctx, options);
        })
        .catch(() => {
          this.scheduleSound(ctx, options);
        });
      return;
    }

    this.scheduleSound(ctx, options);
  }

  private scheduleSound(ctx: AudioContext, options: SoundOptions): void {
    if (!this.masterGain) return;
    this.masterGain.gain.value = this.config.masterVolume;

    let duration = options.duration ?? 0.08;

    if (!this._hasPlayedFirstSound) {
      this._hasPlayedFirstSound = true;
      duration = Math.max(duration, 0.18);
    }

    let baseFreq = options.frequency ?? 800;
    const endFreq = options.endFrequency;
    const waveType: WaveformType = options.type ?? 'sine';
    const volume = (options.volume ?? 0.25) * this.config.masterVolume;

    if (options.jitter && options.jitter > 0) {
      baseFreq += (Math.random() * 2 - 1) * options.jitter * baseFreq;
    }

    const now = ctx.currentTime;

    if (waveType === 'noise') {
      this.playNoise(ctx, now, duration, volume);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.value = Math.max(20, baseFreq);

    if (endFreq !== undefined && endFreq !== baseFreq) {
      osc.frequency.setValueAtTime(Math.max(20, baseFreq), now);
      osc.frequency.linearRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        /* */
      }
    };

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  private playNoise(ctx: AudioContext, now: number, duration: number, volume: number): void {
    if (!this.noiseBuffer) {
      const size = ctx.sampleRate * 0.5;
      this.noiseBuffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = 1000;
    src.buffer = this.noiseBuffer;

    gain.gain.setValueAtTime(volume, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    src.onended = () => {
      try {
        src.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        /* */
      }
    };

    src.start(now);
    src.stop(now + duration + 0.01);
  }

  private setupGlobalUnlockListener(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          document.removeEventListener('pointerdown', unlock, true);
          document.removeEventListener('touchstart', unlock, true);
          document.removeEventListener('keydown', unlock, true);
          document.removeEventListener('click', unlock, true);
        }).catch(() => {});
      }
    };

    document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
    document.addEventListener('touchstart', unlock, { capture: true, passive: true });
    document.addEventListener('keydown', unlock, { capture: true, passive: true });
    document.addEventListener('click', unlock, { capture: true, passive: true });
  }
}
