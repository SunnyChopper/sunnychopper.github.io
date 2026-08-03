import { describe, expect, it } from 'vitest';
import {
  LIBRARY_FILTER_CROSSFADE_SECONDS,
  getLibraryFilterCrossfadeDuration,
  getLibraryFilterCrossfadeTransition,
  getLibraryFilterHeightTransition,
  getLibraryFilterPanelMotion,
  getLibraryVaultItemExit,
} from './library-filter-motion';

describe('library-filter-motion', () => {
  it('uses 180ms cross-fade when motion is allowed', () => {
    expect(LIBRARY_FILTER_CROSSFADE_SECONDS).toBe(0.18);
    expect(getLibraryFilterCrossfadeDuration(false)).toBe(0.18);
    expect(getLibraryFilterCrossfadeTransition(false)).toMatchObject({ duration: 0.18 });
    expect(getLibraryFilterHeightTransition(false)).toMatchObject({ duration: 0.18 });
  });

  it('disables fade and height tween when reduced motion is preferred', () => {
    expect(getLibraryFilterCrossfadeDuration(true)).toBe(0);
    expect(getLibraryFilterCrossfadeTransition(true)).toMatchObject({ duration: 0 });
    expect(getLibraryFilterHeightTransition(true)).toMatchObject({ duration: 0 });
  });

  it('exposes enter/exit opacity variants for the filter panel', () => {
    const motion = getLibraryFilterPanelMotion(false);
    expect(motion.initial).toMatchObject({ opacity: 0 });
    expect(motion.animate).toMatchObject({ opacity: 1 });
    expect(motion.exit).toMatchObject({ opacity: 0, position: 'absolute' });
    expect(motion.transition).toMatchObject({ duration: 0.18 });
  });

  it('skips panel opacity animation when reduced motion is preferred', () => {
    const motion = getLibraryFilterPanelMotion(true);
    expect(motion.initial).toMatchObject({ opacity: 1 });
    expect(motion.exit).toMatchObject({ opacity: 1 });
    expect(motion.transition).toMatchObject({ duration: 0 });
  });

  it('disables vault item exit fade when reduced motion is preferred', () => {
    expect(getLibraryVaultItemExit(true)).toMatchObject({
      opacity: 0,
      transition: { duration: 0 },
    });
    expect(getLibraryVaultItemExit(false)).toMatchObject({
      opacity: 0,
      transition: { duration: 0.18 },
    });
  });
});
