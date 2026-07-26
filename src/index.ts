import { SynthEngine } from './core/synth';
import { PresetsManager } from './presets';
import { SoundOptions, TapTonesConfig } from './types';

export * from './types';
export { SynthEngine } from './core/synth';
export { HapticEngine } from './core/haptics';
export { PresetsManager } from './presets';
export { useTapTones, useTapTone } from './react';

/**
 * Main TapTones class unifying synthesizer engine & sound presets.
 */
export class TapTones {
  public synth: SynthEngine;
  private presets: PresetsManager;

  constructor(config?: TapTonesConfig) {
    this.synth = new SynthEngine(config);
    this.presets = new PresetsManager(this.synth);
  }

  /** Play a custom sound configuration */
  public play(options?: SoundOptions): void {
    this.synth.play(options);
  }

  /** Update global configurations */
  public configure(config: TapTonesConfig): void {
    this.synth.configure(config);
  }

  /** Get current global configurations */
  public getConfig(): Required<TapTonesConfig> {
    return this.synth.getConfig();
  }

  /** Get current AnalyserNode for visualization */
  public getAnalyser(): AnalyserNode | null {
    return this.synth.getAnalyserNode();
  }

  /** Get AnalyserNode ONLY if AudioContext is running (safe for requestAnimationFrame loops) */
  public getExistingAnalyser(): AnalyserNode | null {
    return this.synth.getExistingAnalyser();
  }

  // --- Preset shortcuts ---
  public click(custom?: Partial<SoundOptions>): void { this.presets.click(custom); }
  public pop(custom?: Partial<SoundOptions>): void { this.presets.pop(custom); }
  public tap(custom?: Partial<SoundOptions>): void { this.presets.tap(custom); }
  public press(custom?: Partial<SoundOptions>): void { this.presets.press(custom); }
  public release(custom?: Partial<SoundOptions>): void { this.presets.release(custom); }
  public select(custom?: Partial<SoundOptions>): void { this.presets.select(custom); }
  public toggleOn(custom?: Partial<SoundOptions>): void { this.presets.toggleOn(custom); }
  public toggleOff(custom?: Partial<SoundOptions>): void { this.presets.toggleOff(custom); }
  public switchFlip(custom?: Partial<SoundOptions>): void { this.presets.switchFlip(custom); }
  public slide(custom?: Partial<SoundOptions>): void { this.presets.slide(custom); }
  public success(custom?: Partial<SoundOptions>): void { this.presets.success(custom); }
  public error(custom?: Partial<SoundOptions>): void { this.presets.error(custom); }
  public warning(custom?: Partial<SoundOptions>): void { this.presets.warning(custom); }
  public info(custom?: Partial<SoundOptions>): void { this.presets.info(custom); }
  public notification(custom?: Partial<SoundOptions>): void { this.presets.notification(custom); }
  public laser(custom?: Partial<SoundOptions>): void { this.presets.laser(custom); }
  public nudge(custom?: Partial<SoundOptions>): void { this.presets.nudge(custom); }
  public zip(custom?: Partial<SoundOptions>): void { this.presets.zip(custom); }
  public sparkle(custom?: Partial<SoundOptions>): void { this.presets.sparkle(custom); }
  public coin(custom?: Partial<SoundOptions>): void { this.presets.coin(custom); }
  public powerUp(custom?: Partial<SoundOptions>): void { this.presets.powerUp(custom); }
  public delete(custom?: Partial<SoundOptions>): void { this.presets.delete(custom); }
}

/**
 * Default singleton instance of TapTones for quick import and use.
 * @example
 * import { taptones } from 'taptones';
 * taptones.click();
 */
export const taptones = new TapTones();
export const taptone = taptones;

/**
 * Factory function to create custom TapTones instances with isolated configs.
 */
export function createTapTones(config?: TapTonesConfig): TapTones {
  return new TapTones(config);
}

export default taptones;
