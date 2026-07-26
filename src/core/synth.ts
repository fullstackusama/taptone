import { SoundOptions, TapToneConfig, WaveformType } from '../types';
import { HapticEngine } from './haptics';

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private haptics: HapticEngine;
  private _unlocked: boolean = false;
  private _pendingPlays: SoundOptions[] = [];
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
    this.setupUserGestureListener();
  }

  /**
   * Update global configurations.
   */
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

  /**
   * Get current configuration.
   */
  public getConfig(): Required<TapToneConfig> {
    return { ...this.config };
  }

  /**
   * Initialize AudioContext (does NOT resume — that requires user gesture).
   */
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;

      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.config.masterVolume;

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 64;

      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    }

    return this.ctx;
  }

  /**
   * Public accessor for AudioContext (also triggers resume).
   */
  public getAudioContext(): AudioContext | null {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  /**
   * Get AnalyserNode for audio visualization.
   */
  public getAnalyserNode(): AnalyserNode | null {
    this.ensureContext();
    return this.analyserNode;
  }

  /**
   * Unlock the audio pipeline by playing a silent buffer.
   * This forces the browser's audio rendering thread to fully activate.
   * Returns a promise that resolves once audio is truly ready.
   */
  private unlock(ctx: AudioContext): Promise<void> {
    if (this._unlocked && ctx.state === 'running') {
      return Promise.resolve();
    }

    return ctx.resume().then(() => {
      return new Promise<void>((resolve) => {
        // Play a tiny silent buffer to force audio pipeline open
        const silentBuffer = ctx.createBuffer(1, 1, ctx.sampleRate);
        const source = ctx.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          source.disconnect();
          this._unlocked = true;
          resolve();
        };
        source.start(0);
      });
    });
  }

  /**
   * Play a synthesized sound effect.
   */
  public play(options: SoundOptions = {}): void {
    if (this.config.muted) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    // Already unlocked and running — play immediately
    if (this._unlocked && ctx.state === 'running') {
      this.playNode(ctx, options);
      return;
    }

    // First interaction: unlock pipeline, then play the sound
    // Also store the options so haptic feedback fires
    if (options.haptic !== false) {
      this.haptics.trigger(options.haptic ?? true);
    }

    this.unlock(ctx).then(() => {
      this.playNode(ctx, options);
      // Flush any other pending plays that accumulated during unlock
      while (this._pendingPlays.length > 0) {
        const pending = this._pendingPlays.shift()!;
        this.playNode(ctx, pending);
      }
    });
  }

  /**
   * Internal: create and start audio nodes. Only call when ctx is running.
   */
  private playNode(ctx: AudioContext, options: SoundOptions): void {
    if (!this.masterGain) return;

    this.masterGain.gain.value = this.config.masterVolume;

    const duration = options.duration ?? 0.04;
    let baseFreq = options.frequency ?? 800;
    const endFreq = options.endFrequency;
    const waveType: WaveformType = options.type ?? 'sine';
    const volume = (options.volume ?? 0.25) * this.config.masterVolume;
    const hapticPattern = options.haptic ?? true;

    // Apply pitch jitter
    if (options.jitter && options.jitter > 0) {
      const jitterRange = options.jitter * baseFreq;
      baseFreq += (Math.random() * 2 - 1) * jitterRange;
    }

    const now = ctx.currentTime;

    // Trigger haptics (skip if already triggered during unlock path)
    if (this._unlocked && hapticPattern) {
      this.haptics.trigger(hapticPattern);
    }

    // Noise synthesis
    if (waveType === 'noise') {
      this.playNoise(ctx, now, duration, volume);
      return;
    }

    // Oscillator synthesis
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = waveType;
    osc.frequency.value = Math.max(20, baseFreq);

    // Pitch slide
    if (endFreq !== undefined && endFreq !== baseFreq) {
      osc.frequency.setValueAtTime(Math.max(20, baseFreq), now);
      osc.frequency.linearRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    // Gain envelope — use .value for instant start, ramp for decay
    gainNode.gain.value = volume;
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    const stopTime = now + duration + 0.02;

    osc.onended = () => {
      try { osc.disconnect(); gainNode.disconnect(); } catch { /* */ }
    };

    osc.start(0); // start immediately, not at scheduled 'now'
    osc.stop(stopTime);
  }

  /**
   * Noise synthesis for tactile micro clicks.
   */
  private playNoise(ctx: AudioContext, now: number, duration: number, volume: number): void {
    if (!this.noiseBuffer) {
      const bufferSize = ctx.sampleRate * 0.5;
      this.noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    const noiseSource = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = 1000;
    noiseSource.buffer = this.noiseBuffer;

    gainNode.gain.value = volume;
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain!);

    const stopTime = now + duration + 0.02;

    noiseSource.onended = () => {
      try { noiseSource.disconnect(); filter.disconnect(); gainNode.disconnect(); } catch { /* */ }
    };

    noiseSource.start(0);
    noiseSource.stop(stopTime);
  }

  /**
   * Setup capture-phase listeners to unlock AudioContext on first user gesture.
   */
  private setupUserGestureListener(): void {
    if (typeof window === 'undefined') return;

    const onGesture = () => {
      const ctx = this.ensureContext();
      if (ctx && !this._unlocked) {
        this.unlock(ctx).catch(() => {});
      }
    };

    // Capture phase fires before any button click handlers
    window.addEventListener('pointerdown', onGesture, { capture: true, passive: true });
    window.addEventListener('mousedown', onGesture, { capture: true, passive: true });
    window.addEventListener('touchstart', onGesture, { capture: true, passive: true });
  }
}
