'use client';

import { useCallback, useMemo } from 'react';
import { SoundOptions, TapTonesConfig } from './types';
import { taptones } from './index';

/**
 * Custom React Hook for TapTones audio & haptic FX.
 */
export function useTapTones(defaultOptions?: SoundOptions) {
  const play = useCallback(
    (options?: SoundOptions) => {
      taptones.play({ ...defaultOptions, ...options });
    },
    [defaultOptions]
  );

  const presets = useMemo(
    () => ({
      click: (opts?: SoundOptions) => taptones.click(opts),
      pop: (opts?: SoundOptions) => taptones.pop(opts),
      tap: (opts?: SoundOptions) => taptones.tap(opts),
      press: (opts?: SoundOptions) => taptones.press(opts),
      release: (opts?: SoundOptions) => taptones.release(opts),
      select: (opts?: SoundOptions) => taptones.select(opts),
      toggleOn: (opts?: SoundOptions) => taptones.toggleOn(opts),
      toggleOff: (opts?: SoundOptions) => taptones.toggleOff(opts),
      switchFlip: (opts?: SoundOptions) => taptones.switchFlip(opts),
      slide: (opts?: SoundOptions) => taptones.slide(opts),
      success: (opts?: SoundOptions) => taptones.success(opts),
      error: (opts?: SoundOptions) => taptones.error(opts),
      warning: (opts?: SoundOptions) => taptones.warning(opts),
      info: (opts?: SoundOptions) => taptones.info(opts),
      notification: (opts?: SoundOptions) => taptones.notification(opts),
      laser: (opts?: SoundOptions) => taptones.laser(opts),
      nudge: (opts?: SoundOptions) => taptones.nudge(opts),
      zip: (opts?: SoundOptions) => taptones.zip(opts),
      sparkle: (opts?: SoundOptions) => taptones.sparkle(opts),
      coin: (opts?: SoundOptions) => taptones.coin(opts),
      powerUp: (opts?: SoundOptions) => taptones.powerUp(opts),
      delete: (opts?: SoundOptions) => taptones.delete(opts),
    }),
    []
  );

  const configure = useCallback((config: TapTonesConfig) => {
    taptones.configure(config);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    taptones.configure({ muted });
  }, []);

  const setMasterVolume = useCallback((masterVolume: number) => {
    taptones.configure({ masterVolume });
  }, []);

  return {
    play,
    ...presets,
    configure,
    setMuted,
    setMasterVolume,
    taptones,
  };
}

export const useTapTone = useTapTones;
