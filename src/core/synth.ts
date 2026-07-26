import { SoundOptions, TapToneConfig, WaveformType } from '../types';
import { HapticEngine } from './haptics';

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private haptics: HapticEngine;
  private _hasPlayedFirstSound: boolean = false;
  private config: Required<TapToneConfig> = {
    masterVolume: 1.0,
    muted: false,
    hapticsEnabled: true,
  };

  constructor(config?: TapToneConfig) {
    if (config) {
      this.configure(config);
    }
    this.haptics = new HapticEngine(this.config.hapticsEnabled);
  }

  public configure(config: TapToneConfig): void {
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

  public getConfig(): Required<TapToneConfig> {
    return { ...this.config };
  }

  /**
   * Lazily create AudioContext (does NOT resume).
   */
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const Ctor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;

      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.config.masterVolume;

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 64;

      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public getAudioContext(): AudioContext | null {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  public getAnalyserNode(): AnalyserNode | null {
    this.ensureContext();
    return this.analyserNode;
  }

  /**
   * Play a synthesized sound effect.
   *
   * Strategy: We resume the context and ALSO immediately schedule
   * oscillator nodes. Per the Web Audio spec, nodes scheduled while
   * the context is suspended will begin processing once the context
   * transitions to 'running'. If the first attempt doesn't produce
   * audible output (some browsers silently drop it), we retry once
   * after a short delay.
   */
  public play(options: SoundOptions = {}): void {
    if (this.config.muted) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    // Trigger haptic feedback immediately (doesn't need AudioContext)
    const hapticPattern = options.haptic ?? true;
    if (hapticPattern) {
      this.haptics.trigger(hapticPattern);
    }

    if (ctx.state === 'running') {
      // Context is already active — play immediately
      this.scheduleSound(ctx, options);
    } else {
      // Context is suspended. Resume it and schedule the sound.
      // The Web Audio spec says scheduled nodes will start once
      // the context resumes, but some browsers silently drop them.
      // So we also schedule a retry after resume completes.
      ctx.resume().then(() => {
        this.scheduleSound(ctx, options);
      }).catch(() => {});
    }
  }

  /**
   * Create and start oscillator / noise nodes.
   */
  private scheduleSound(ctx: AudioContext, options: SoundOptions): void {
    if (!this.masterGain) return;

    // Re-verify master gain
    this.masterGain.gain.value = this.config.masterVolume;

    let duration = options.duration ?? 0.08;

    // On very first sound after page load, boost duration to 0.18s to guarantee audibility over browser audio wake latency!
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

    if (waveType === 'noise') {
      this.playNoise(ctx, duration, volume);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.value = Math.max(20, baseFreq);

    if (endFreq !== undefined && endFreq !== baseFreq) {
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(Math.max(20, baseFreq), now);
      osc.frequency.linearRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    // Set gain to full volume instantly, then ramp down
    gain.gain.value = volume;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      try { osc.disconnect(); gain.disconnect(); } catch { /* */ }
    };

    // Start oscillator AT current time (now) so resume delay doesn't skip sound start!
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  private playNoise(ctx: AudioContext, duration: number, volume: number): void {
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

    const now = ctx.currentTime;
    gain.gain.value = volume;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    src.onended = () => {
      try { src.disconnect(); filter.disconnect(); gain.disconnect(); } catch { /* */ }
    };

    // Start noise AT current time (now)
    src.start(now);
    src.stop(now + duration + 0.01);
  }
}
