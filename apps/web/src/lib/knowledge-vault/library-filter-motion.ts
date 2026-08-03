import type { TargetAndTransition, Transition } from 'framer-motion';

/** Cross-fade duration when switching Library type filter tabs (seconds). */
export const LIBRARY_FILTER_CROSSFADE_SECONDS = 0.18;

export const LIBRARY_FILTER_MOTION_EASE = [0.4, 0, 0.2, 1] as const;

export function getLibraryFilterCrossfadeDuration(shouldReduceMotion: boolean): number {
  return shouldReduceMotion ? 0 : LIBRARY_FILTER_CROSSFADE_SECONDS;
}

export function getLibraryFilterCrossfadeTransition(shouldReduceMotion: boolean): Transition {
  return {
    duration: getLibraryFilterCrossfadeDuration(shouldReduceMotion),
    ease: LIBRARY_FILTER_MOTION_EASE,
  };
}

export function getLibraryFilterHeightTransition(shouldReduceMotion: boolean): Transition {
  return getLibraryFilterCrossfadeTransition(shouldReduceMotion);
}

export interface LibraryFilterPanelMotion {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
}

/** Opacity cross-fade for the keyed Library filter panel (stacks + decks + items + empty). */
export function getLibraryFilterPanelMotion(shouldReduceMotion: boolean): LibraryFilterPanelMotion {
  const transition = getLibraryFilterCrossfadeTransition(shouldReduceMotion);

  return {
    initial: { opacity: shouldReduceMotion ? 1 : 0 },
    animate: { opacity: 1 },
    exit: {
      opacity: shouldReduceMotion ? 1 : 0,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      width: '100%',
    },
    transition,
  };
}

/** Exit variant for individual vault cards removed within the same filter (archive). */
export function getLibraryVaultItemExit(shouldReduceMotion: boolean): TargetAndTransition {
  return {
    opacity: 0,
    transition: { duration: getLibraryFilterCrossfadeDuration(shouldReduceMotion) },
  };
}
