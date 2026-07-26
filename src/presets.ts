import { SoundOptions } from './types';
import { SynthEngine } from './core/synth';

export class PresetsManager {
  private synth: SynthEngine;

  constructor(synth: SynthEngine) {
    this.synth = synth;
  }

  /**
   * Crisp mechanical UI button click.
   */
  public click(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 1200,
      endFrequency: 400,
      duration: 0.025,
      attack: 0.001,
      decay: 0.02,
      type: 'triangle',
      volume: 0.2,
      haptic: 8,
      ...custom,
    });
  }

  /**
   * Soft bubble pop for dropdowns, modals, and tooltips.
   */
  public pop(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 320,
      endFrequency: 750,
      duration: 0.06,
      attack: 0.003,
      decay: 0.05,
      type: 'sine',
      volume: 0.25,
      haptic: 12,
      ...custom,
    });
  }

  /**
   * Switch toggle ON sound (rising pitch).
   */
  public toggleOn(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 440,
      endFrequency: 880,
      duration: 0.05,
      attack: 0.002,
      decay: 0.045,
      type: 'sine',
      volume: 0.22,
      haptic: 15,
      ...custom,
    });
  }

  /**
   * Switch toggle OFF sound (falling pitch).
   */
  public toggleOff(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 720,
      endFrequency: 360,
      duration: 0.05,
      attack: 0.002,
      decay: 0.045,
      type: 'sine',
      volume: 0.22,
      haptic: 15,
      ...custom,
    });
  }

  /**
   * Upbeat dual success chime for form submissions and task completion.
   */
  public success(custom?: Partial<SoundOptions>): void {
    // Play note 1
    this.synth.play({
      frequency: 523.25, // C5
      duration: 0.08,
      attack: 0.005,
      decay: 0.07,
      type: 'sine',
      volume: 0.2,
      haptic: [10, 30, 15],
      ...custom,
    });

    // Play note 2 slightly delayed
    setTimeout(() => {
      this.synth.play({
        frequency: 659.25, // E5
        duration: 0.12,
        attack: 0.005,
        decay: 0.11,
        type: 'sine',
        volume: 0.25,
        haptic: false,
        ...custom,
      });
    }, 65);
  }

  /**
   * Low error warning buzz.
   */
  public error(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 180,
      endFrequency: 110,
      duration: 0.1,
      attack: 0.005,
      decay: 0.09,
      type: 'sawtooth',
      volume: 0.18,
      haptic: [20, 20, 20],
      ...custom,
    });
  }

  /**
   * Futuristic high-tech slider sweep.
   */
  public slide(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 300,
      endFrequency: 1400,
      duration: 0.08,
      attack: 0.002,
      decay: 0.07,
      type: 'sine',
      volume: 0.15,
      haptic: 6,
      ...custom,
    });
  }

  /**
   * Arcade laser zap sound effect.
   */
  public laser(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 1800,
      endFrequency: 120,
      duration: 0.07,
      attack: 0.001,
      decay: 0.065,
      type: 'sawtooth',
      volume: 0.2,
      haptic: [8, 10, 8],
      ...custom,
    });
  }

  /**
   * Soft tactile thump for micro interactions.
   */
  public nudge(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 140,
      endFrequency: 60,
      duration: 0.04,
      attack: 0.001,
      decay: 0.035,
      type: 'triangle',
      volume: 0.3,
      haptic: 15,
      ...custom,
    });
  }

  /**
   * Fast micro zip for tab switches and filter pills.
   */
  public zip(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 600,
      endFrequency: 1500,
      duration: 0.03,
      attack: 0.001,
      decay: 0.025,
      type: 'triangle',
      volume: 0.18,
      haptic: 5,
      ...custom,
    });
  }

  /**
   * Ascending shimmer for sparkles, achievements, or rewards.
   */
  public sparkle(custom?: Partial<SoundOptions>): void {
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.play({
          frequency: freq,
          duration: 0.08,
          attack: 0.002,
          decay: 0.07,
          type: 'sine',
          volume: 0.15,
          haptic: idx === 0 ? 10 : false,
          ...custom,
        });
      }, idx * 45);
    });
  }
}
