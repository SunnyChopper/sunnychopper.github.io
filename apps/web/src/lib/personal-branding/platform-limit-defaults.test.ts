import { describe, expect, it } from 'vitest';
import type { PlatformRuleCatalog } from '@/types/api/personal-branding.dto';
import {
  formatLimitFieldsFromDefault,
  getPlatformLimitDefault,
  shouldReplaceLimitsWithPlatformDefaults,
} from './platform-limit-defaults';

const catalog: PlatformRuleCatalog = {
  modes: [],
  devices: [],
  strengths: ['subtle', 'light', 'moderate', 'strong', 'dominant'],
  wordsPerMinute: 200,
  limitDefaults: {
    x: { characterLimit: 280, readTimeLimitMinutes: 1 },
    linkedin: { characterLimit: 1300, readTimeLimitMinutes: 3 },
    medium: { characterLimit: 2500, readTimeLimitMinutes: 6 },
  },
};

describe('getPlatformLimitDefault', () => {
  it('returns defaults for a known platform', () => {
    expect(getPlatformLimitDefault('x', catalog)).toEqual({
      characterLimit: 280,
      readTimeLimitMinutes: 1,
    });
  });

  it('returns null when catalog is missing', () => {
    expect(getPlatformLimitDefault('x', undefined)).toBeNull();
  });

  it('returns null when platform has no entry', () => {
    expect(getPlatformLimitDefault('youtube', catalog)).toBeNull();
  });
});

describe('formatLimitFieldsFromDefault', () => {
  it('formats numeric defaults as strings', () => {
    expect(formatLimitFieldsFromDefault({ characterLimit: 1300, readTimeLimitMinutes: 3 })).toEqual(
      {
        characterLimit: '1300',
        readTimeLimitMinutes: '3',
      }
    );
  });
});

describe('shouldReplaceLimitsWithPlatformDefaults', () => {
  it('replaces when both fields are blank', () => {
    expect(
      shouldReplaceLimitsWithPlatformDefaults({
        previousPlatform: 'linkedin',
        nextPlatform: 'x',
        characterLimit: '',
        readTimeLimitMinutes: '',
        catalog,
      })
    ).toBe(true);
  });

  it('replaces when values still match previous platform defaults', () => {
    expect(
      shouldReplaceLimitsWithPlatformDefaults({
        previousPlatform: 'x',
        nextPlatform: 'linkedin',
        characterLimit: '280',
        readTimeLimitMinutes: '1',
        catalog,
      })
    ).toBe(true);
  });

  it('does not replace when user customized values', () => {
    expect(
      shouldReplaceLimitsWithPlatformDefaults({
        previousPlatform: 'x',
        nextPlatform: 'linkedin',
        characterLimit: '500',
        readTimeLimitMinutes: '2',
        catalog,
      })
    ).toBe(false);
  });

  it('does not replace when platform is unchanged', () => {
    expect(
      shouldReplaceLimitsWithPlatformDefaults({
        previousPlatform: 'x',
        nextPlatform: 'x',
        characterLimit: '',
        readTimeLimitMinutes: '',
        catalog,
      })
    ).toBe(false);
  });
});
