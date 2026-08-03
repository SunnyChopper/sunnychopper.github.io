import { describe, expect, it } from 'vitest';
import {
  ASSISTANT_SETTINGS_CARD_STAGGER_SECONDS,
  assistantSettingsCardStackContainerVariants,
} from './assistant-settings-motion';

describe('assistant-settings-motion', () => {
  it('staggers cards within the 40–60ms polish band', () => {
    expect(ASSISTANT_SETTINGS_CARD_STAGGER_SECONDS).toBeGreaterThanOrEqual(0.04);
    expect(ASSISTANT_SETTINGS_CARD_STAGGER_SECONDS).toBeLessThanOrEqual(0.06);
  });

  it('defines container stagger children timing', () => {
    const show = assistantSettingsCardStackContainerVariants.show;
    expect(show).toBeDefined();
    if (!show || typeof show === 'function') return;
    expect(show.transition).toMatchObject({
      staggerChildren: ASSISTANT_SETTINGS_CARD_STAGGER_SECONDS,
    });
  });
});
