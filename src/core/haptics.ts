/**
 * Web Haptics vibration pattern generator.
 * Gracefully handles unsupported devices (e.g. desktop browsers).
 */
export class HapticEngine {
  private enabled: boolean = true;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Trigger a vibration pattern.
   * @param pattern Single duration in ms or pattern array [vibrate, pause, vibrate]
   */
  public trigger(pattern: number | number[] | boolean = 10): void {
    if (!this.enabled || !this.isSupported()) return;

    try {
      if (typeof pattern === 'boolean') {
        if (pattern) {
          navigator.vibrate(12);
        }
      } else if (typeof pattern === 'number') {
        navigator.vibrate(pattern);
      } else if (Array.isArray(pattern)) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration permissions or policy errors silently
    }
  }
}
