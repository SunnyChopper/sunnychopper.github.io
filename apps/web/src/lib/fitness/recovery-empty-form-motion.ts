import type { TargetAndTransition, Transition } from 'framer-motion';

/** Cross-fade duration when switching recovery empty state ↔ form (seconds). */
export const RECOVERY_EMPTY_FORM_CROSSFADE_SECONDS = 0.2;

export const RECOVERY_EMPTY_FORM_MOTION_EASE = [0.4, 0, 0.2, 1] as const;

export function getRecoveryEmptyFormCrossfadeDuration(shouldReduceMotion: boolean): number {
  return shouldReduceMotion ? 0 : RECOVERY_EMPTY_FORM_CROSSFADE_SECONDS;
}

export function getRecoveryEmptyFormCrossfadeTransition(shouldReduceMotion: boolean): Transition {
  return {
    duration: getRecoveryEmptyFormCrossfadeDuration(shouldReduceMotion),
    ease: RECOVERY_EMPTY_FORM_MOTION_EASE,
  };
}

export function getRecoveryEmptyFormHeightTransition(shouldReduceMotion: boolean): Transition {
  return getRecoveryEmptyFormCrossfadeTransition(shouldReduceMotion);
}

export interface RecoveryEmptyFormPanelMotion {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
}

/** Opacity cross-fade for the keyed recovery empty / form panel. */
export function getRecoveryEmptyFormPanelMotion(
  shouldReduceMotion: boolean
): RecoveryEmptyFormPanelMotion {
  const transition = getRecoveryEmptyFormCrossfadeTransition(shouldReduceMotion);

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
