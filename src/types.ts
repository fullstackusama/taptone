/**
 * Supported oscillator waveform types for synthesis.
 */
export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';

/**
 * Options for generating a synthesized sound effect.
 */
export interface SoundOptions {
  /** Initial frequency in Hz (e.g. 440, 800, 1200) */
  frequency?: number;

  /** Frequency to ramp to in Hz (for pitch slides up/down) */
  endFrequency?: number;

  /** Duration of the sound in seconds (e.g. 0.05 for micro click, 0.2 for chime) */
  duration?: number;

  /** Attack envelope time in seconds (default: 0.002) */
  attack?: number;

  /** Decay envelope time in seconds (default: duration) */
  decay?: number;

  /** Waveform shape: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise' */
  type?: WaveformType;

  /** Volume level from 0.0 to 1.0 (default: 0.25 for non-fatiguing UI sounds) */
  volume?: number;

  /** Haptic vibration duration in ms or pattern array (e.g. 10 or [10, 30, 10]) */
  haptic?: number | number[] | boolean;

  /** Optional pitch randomizer variance percentage (0 to 1, e.g. 0.1 for 10% pitch jitter) */
  jitter?: number;
}

/**
 * Built-in preset names available out-of-the-box.
 */
export type PresetName =
  | 'click'
  | 'pop'
  | 'toggleOn'
  | 'toggleOff'
  | 'success'
  | 'error'
  | 'slide'
  | 'laser'
  | 'nudge'
  | 'zip'
  | 'sparkle';

/**
 * Global configuration options for TapTones instance.
 */
export interface TapTonesConfig {
  /** Master volume multiplier (0.0 to 1.0) */
  masterVolume?: number;

  /** Global mute toggle */
  muted?: boolean;

  /** Global haptics toggle */
  hapticsEnabled?: boolean;
}
