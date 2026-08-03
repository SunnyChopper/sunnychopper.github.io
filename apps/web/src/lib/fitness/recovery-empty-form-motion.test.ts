import { describe, expect, it } from 'vitest';
import {
  RECOVERY_EMPTY_FORM_CROSSFADE_SECONDS,
  getRecoveryEmptyFormCrossfadeDuration,
  getRecoveryEmptyFormCrossfadeTransition,
  getRecoveryEmptyFormHeightTransition,
  getRecoveryEmptyFormPanelMotion,
} from './recovery-empty-form-motion';

describe('recovery-empty-form-motion', () => {
  it('uses 200ms cross-fade when motion is allowed', () => {
    expect(RECOVERY_EMPTY_FORM_CROSSFADE_SECONDS).toBe(0.2);
    expect(getRecoveryEmptyFormCrossfadeDuration(false)).toBe(0.2);
    expect(getRecoveryEmptyFormCrossfadeTransition(false)).toMatchObject({ duration: 0.2 });
    expect(getRecoveryEmptyFormHeightTransition(false)).toMatchObject({ duration: 0.2 });
  });

  it('disables fade and height tween when reduced motion is preferred', () => {
    expect(getRecoveryEmptyFormCrossfadeDuration(true)).toBe(0);
    expect(getRecoveryEmptyFormCrossfadeTransition(true)).toMatchObject({ duration: 0 });
    expect(getRecoveryEmptyFormHeightTransition(true)).toMatchObject({ duration: 0 });
  });

  it('exposes enter/exit opacity variants for the empty/form panel', () => {
    const motion = getRecoveryEmptyFormPanelMotion(false);
    expect(motion.initial).toMatchObject({ opacity: 0 });
    expect(motion.animate).toMatchObject({ opacity: 1 });
    expect(motion.exit).toMatchObject({ opacity: 0, position: 'absolute' });
    expect(motion.transition).toMatchObject({ duration: 0.2 });
  });

  it('skips panel opacity animation when reduced motion is preferred', () => {
    const motion = getRecoveryEmptyFormPanelMotion(true);
    expect(motion.initial).toMatchObject({ opacity: 1 });
    expect(motion.exit).toMatchObject({ opacity: 1 });
    expect(motion.transition).toMatchObject({ duration: 0 });
  });
});
