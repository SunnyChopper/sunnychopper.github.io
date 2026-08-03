import { describe, expect, it } from 'vitest';
import {
  proactiveSettingsCardClassForTone,
  proactiveSettingsCardClassName,
  proactiveSettingsDangerCardClassName,
  proactiveSettingsReferenceCardClassName,
} from './proactive-settings-surfaces';

describe('proactiveSettingsCardClassForTone', () => {
  it('returns default card surface for default tone', () => {
    expect(proactiveSettingsCardClassForTone('default')).toBe(proactiveSettingsCardClassName);
  });

  it('returns danger surface for danger tone', () => {
    expect(proactiveSettingsCardClassForTone('danger')).toBe(proactiveSettingsDangerCardClassName);
  });

  it('returns reference surface for reference tone', () => {
    expect(proactiveSettingsCardClassForTone('reference')).toBe(
      proactiveSettingsReferenceCardClassName
    );
  });
});
