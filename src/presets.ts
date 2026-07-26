import { SoundOptions } from './types';
import { SynthEngine } from './core/synth';

export class PresetsManager {
  private synth: SynthEngine;

  constructor(synth: SynthEngine) {
    this.synth = synth;
  }

  // --- UI & BUTTONS ---

  /** Crisp mechanical UI button click */
  public click(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 1200,
      endFrequency: 400,
      duration: 0.08,
      type: 'triangle',
      volume: 0.22,
      haptic: 8,
      ...custom,
    });
  }

  /** Soft bubble pop for dropdowns, modals, and tooltips */
  public pop(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 320,
      endFrequency: 750,
      duration: 0.09,
      type: 'sine',
      volume: 0.25,
      haptic: 12,
      ...custom,
    });
  }

  /** Sharp tactile glass tap */
  public tap(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 1400,
      endFrequency: 600,
      duration: 0.05,
      type: 'triangle',
      volume: 0.2,
      haptic: 6,
      ...custom,
    });
  }

  /** Soft button press down */
  public press(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 350,
      duration: 0.06,
      type: 'sine',
      volume: 0.22,
      haptic: 10,
      ...custom,
    });
  }

  /** Soft button release up */
  public release(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 550,
      duration: 0.05,
      type: 'sine',
      volume: 0.18,
      haptic: 5,
      ...custom,
    });
  }

  /** Clean item selection chime */
  public select(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 900,
      endFrequency: 1200,
      duration: 0.06,
      type: 'sine',
      volume: 0.2,
      haptic: 8,
      ...custom,
    });
  }

  // --- TOGGLES & SWITCHES ---

  /** Switch toggle ON sound (rising pitch) */
  public toggleOn(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 440,
      endFrequency: 880,
      duration: 0.08,
      type: 'sine',
      volume: 0.22,
      haptic: 15,
      ...custom,
    });
  }

  /** Switch toggle OFF sound (falling pitch) */
  public toggleOff(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 720,
      endFrequency: 360,
      duration: 0.08,
      type: 'sine',
      volume: 0.22,
      haptic: 15,
      ...custom,
    });
  }

  /** Sharp mechanical switch flip */
  public switchFlip(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 480,
      endFrequency: 720,
      duration: 0.05,
      type: 'square',
      volume: 0.15,
      haptic: 12,
      ...custom,
    });
  }

  /** Futuristic slider pitch sweep */
  public slide(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 300,
      endFrequency: 1400,
      duration: 0.1,
      type: 'sine',
      volume: 0.15,
      haptic: 6,
      ...custom,
    });
  }

  // --- FEEDBACK & STATUS ---

  /** Upbeat dual success chime */
  public success(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 523.25, // C5
      duration: 0.1,
      type: 'sine',
      volume: 0.2,
      haptic: [10, 30, 15],
      ...custom,
    });

    setTimeout(() => {
      this.synth.play({
        frequency: 659.25, // E5
        duration: 0.14,
        type: 'sine',
        volume: 0.25,
        haptic: false,
        ...custom,
      });
    }, 65);
  }

  /** Low error warning buzz */
  public error(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 180,
      endFrequency: 110,
      duration: 0.12,
      type: 'sawtooth',
      volume: 0.18,
      haptic: [20, 20, 20],
      ...custom,
    });
  }

  /** Double-pulse warning alert */
  public warning(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 440,
      duration: 0.07,
      type: 'square',
      volume: 0.18,
      haptic: [15, 30, 15],
      ...custom,
    });

    setTimeout(() => {
      this.synth.play({
        frequency: 350,
        duration: 0.09,
        type: 'square',
        volume: 0.18,
        haptic: false,
        ...custom,
      });
    }, 80);
  }

  /** Friendly info chime */
  public info(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 600,
      endFrequency: 800,
      duration: 0.09,
      type: 'sine',
      volume: 0.2,
      haptic: 10,
      ...custom,
    });
  }

  /** Soft dual-tone notification bell */
  public notification(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 587.33, // D5
      duration: 0.1,
      type: 'sine',
      volume: 0.2,
      haptic: [12, 25, 12],
      ...custom,
    });

    setTimeout(() => {
      this.synth.play({
        frequency: 880, // A5
        duration: 0.18,
        type: 'sine',
        volume: 0.22,
        haptic: false,
        ...custom,
      });
    }, 70);
  }

  // --- ACTIONS & GAMING ---

  /** Arcade laser zap */
  public laser(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 1800,
      endFrequency: 120,
      duration: 0.09,
      type: 'sawtooth',
      volume: 0.2,
      haptic: [8, 10, 8],
      ...custom,
    });
  }

  /** Soft tactile thump for micro interactions */
  public nudge(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 140,
      endFrequency: 60,
      duration: 0.08,
      type: 'triangle',
      volume: 0.3,
      haptic: 15,
      ...custom,
    });
  }

  /** Fast micro zip for tab switches */
  public zip(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 600,
      endFrequency: 1500,
      duration: 0.07,
      type: 'triangle',
      volume: 0.18,
      haptic: 5,
      ...custom,
    });
  }

  /** Ascending shimmer for sparkles and achievements */
  public sparkle(custom?: Partial<SoundOptions>): void {
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.play({
          frequency: freq,
          duration: 0.1,
          type: 'sine',
          volume: 0.15,
          haptic: idx === 0 ? 10 : false,
          ...custom,
        });
      }, idx * 45);
    });
  }

  /** Classic arcade pickup coin chime */
  public coin(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 987.77, // B5
      duration: 0.07,
      type: 'triangle',
      volume: 0.22,
      haptic: 10,
      ...custom,
    });

    setTimeout(() => {
      this.synth.play({
        frequency: 1318.51, // E6
        duration: 0.15,
        type: 'triangle',
        volume: 0.25,
        haptic: 15,
        ...custom,
      });
    }, 60);
  }

  /** 3-note ascending power-up chord */
  public powerUp(custom?: Partial<SoundOptions>): void {
    const freqs = [440, 554.37, 659.25];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.play({
          frequency: freq,
          duration: 0.1,
          type: 'sine',
          volume: 0.2,
          haptic: idx === 0 ? [10, 20, 30] : false,
          ...custom,
        });
      }, idx * 55);
    });
  }

  /** Heavy trash/delete sound effect */
  public delete(custom?: Partial<SoundOptions>): void {
    this.synth.play({
      frequency: 220,
      endFrequency: 70,
      duration: 0.1,
      type: 'sawtooth',
      volume: 0.22,
      haptic: [15, 15, 15],
      ...custom,
    });
  }
}
