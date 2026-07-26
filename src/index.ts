import { SynthEngine } from './core/synth';
import { PresetsManager } from './presets';
import { SoundOptions, TapToneConfig } from './types';

export * from './types';
export { SynthEngine } from './core/synth';
export { HapticEngine } from './core/haptics';
export { PresetsManager } from './presets';
export { useTapTone } from './react';

/**
 * Main TapTone class unifying synthesizer engine & sound presets.
 */
export class TapTone {
  public synth: SynthEngine;
  private presets: PresetsManager;

  constructor(config?: TapToneConfig) {
    this.synth = new SynthEngine(config);
    this.presets = new PresetsManager(this.synth);
  }

  /** Play a custom sound configuration */
  public play(options?: SoundOptions): void {
    this.synth.play(options);
  }

  /** Update global configurations */
  public configure(config: TapToneConfig): void {
    this.synth.configure(config);
  }

  /** Get current global configurations */
  public getConfig(): Required<TapToneConfig> {
    return this.synth.getConfig();
  }

  /** Get current AnalyserNode for visualization */
  public getAnalyser(): AnalyserNode | null {
    return this.synth.getAnalyserNode();
  }

  // --- Preset shortcuts ---
  public click(custom?: Partial<SoundOptions>): void {
    this.presets.click(custom);
  }

  public pop(custom?: Partial<SoundOptions>): void {
    this.presets.pop(custom);
  }

  public toggleOn(custom?: Partial<SoundOptions>): void {
    this.presets.toggleOn(custom);
  }

  public toggleOff(custom?: Partial<SoundOptions>): void {
    this.presets.toggleOff(custom);
  }

  public success(custom?: Partial<SoundOptions>): void {
    this.presets.success(custom);
  }

  public error(custom?: Partial<SoundOptions>): void {
    this.presets.error(custom);
  }

  public slide(custom?: Partial<SoundOptions>): void {
    this.presets.slide(custom);
  }

  public laser(custom?: Partial<SoundOptions>): void {
    this.presets.laser(custom);
  }

  public nudge(custom?: Partial<SoundOptions>): void {
    this.presets.nudge(custom);
  }

  public zip(custom?: Partial<SoundOptions>): void {
    this.presets.zip(custom);
  }

  public sparkle(custom?: Partial<SoundOptions>): void {
    this.presets.sparkle(custom);
  }
}

/**
 * Default singleton instance of TapTone for quick import and use.
 * @example
 * import { taptone } from 'taptone';
 * taptone.click();
 */
export const taptone = new TapTone();

/**
 * Factory function to create custom TapTone instances with isolated configs.
 */
export function createTapTone(config?: TapToneConfig): TapTone {
  return new TapTone(config);
}

export default taptone;
