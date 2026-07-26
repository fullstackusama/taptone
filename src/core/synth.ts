import { SoundOptions, TapToneConfig, WaveformType } from '../types';
import { HapticEngine } from './haptics';

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private haptics: HapticEngine;
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
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.config.masterVolume, this.ctx.currentTime);
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
   * Lazy-initialize AudioContext safely.
   */
  public getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;

      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.config.masterVolume, this.ctx.currentTime);

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 64;

      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Get AnalyserNode for audio visualization.
   */
  public getAnalyserNode(): AnalyserNode | null {
    this.getAudioContext();
    return this.analyserNode;
  }

  /**
   * Play a synthesized sound effect.
   */
  public play(options: SoundOptions = {}): void {
    if (this.config.muted) return;

    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    // Immediately trigger resume if context is suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const duration = options.duration ?? 0.04;
    const attack = options.attack ?? 0.002;
    const decay = options.decay ?? duration;
    let baseFreq = options.frequency ?? 800;
    const endFreq = options.endFrequency;
    const waveType: WaveformType = options.type ?? 'sine';
    const volume = (options.volume ?? 0.25) * this.config.masterVolume;
    const hapticPattern = options.haptic ?? true;

    // Apply pitch jitter if provided
    if (options.jitter && options.jitter > 0) {
      const jitterRange = options.jitter * baseFreq;
      baseFreq += (Math.random() * 2 - 1) * jitterRange;
    }

    // Schedule slightly ahead (+5ms) to guarantee Web Audio clock sync
    const now = ctx.currentTime + 0.005;

    // Trigger paired haptic vibration
    if (hapticPattern) {
      this.haptics.trigger(hapticPattern);
    }

    // Handle Noise buffer (for crisp tactile clicks)
    if (waveType === 'noise') {
      this.playNoise(ctx, now, attack, decay, volume);
      return;
    }

    // Standard Oscillator synthesis
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(Math.max(20, baseFreq), now);

    // Pitch slide transition
    if (endFreq !== undefined && endFreq !== baseFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    // Gain Envelope (ADSR)
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    const stopTime = now + attack + decay + 0.01;

    osc.onended = () => {
      try {
        osc.disconnect();
        gainNode.disconnect();
      } catch {
        // Ignore disconnect errors if context closed
      }
    };

    osc.start(now);
    osc.stop(stopTime);
  }

  /**
   * Helper to synthesize white noise buffer for tactile micro clicks.
   */
  private playNoise(ctx: AudioContext, now: number, attack: number, decay: number, volume: number): void {
    if (!this.noiseBuffer) {
      const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds of noise
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
    filter.frequency.setValueAtTime(1000, now);

    noiseSource.buffer = this.noiseBuffer;

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain!);

    const stopTime = now + attack + decay + 0.01;

    noiseSource.onended = () => {
      try {
        noiseSource.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    };

    noiseSource.start(now);
    noiseSource.stop(stopTime);
  }

  /**
   * Resume AudioContext automatically on first user gesture.
   */
  private setupUserGestureListener(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('mousedown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }
}
