'use client';

import { useCallback, useMemo } from 'react';
import { SoundOptions, TapToneConfig } from './types';
import { taptone } from './index';

/**
 * Custom React Hook for TapTone audio & haptic FX.
 */
export function useTapTone(defaultOptions?: SoundOptions) {
  const play = useCallback(
    (options?: SoundOptions) => {
      taptone.play({ ...defaultOptions, ...options });
    },
    [defaultOptions]
  );

  const presets = useMemo(
    () => ({
      click: (opts?: SoundOptions) => taptone.click(opts),
      pop: (opts?: SoundOptions) => taptone.pop(opts),
      toggleOn: (opts?: SoundOptions) => taptone.toggleOn(opts),
      toggleOff: (opts?: SoundOptions) => taptone.toggleOff(opts),
      success: (opts?: SoundOptions) => taptone.success(opts),
      error: (opts?: SoundOptions) => taptone.error(opts),
      slide: (opts?: SoundOptions) => taptone.slide(opts),
      laser: (opts?: SoundOptions) => taptone.laser(opts),
      nudge: (opts?: SoundOptions) => taptone.nudge(opts),
      zip: (opts?: SoundOptions) => taptone.zip(opts),
      sparkle: (opts?: SoundOptions) => taptone.sparkle(opts),
    }),
    []
  );

  const configure = useCallback((config: TapToneConfig) => {
    taptone.configure(config);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    taptone.configure({ muted });
  }, []);

  const setMasterVolume = useCallback((masterVolume: number) => {
    taptone.configure({ masterVolume });
  }, []);

  return {
    play,
    ...presets,
    configure,
    setMuted,
    setMasterVolume,
    taptone,
  };
}
