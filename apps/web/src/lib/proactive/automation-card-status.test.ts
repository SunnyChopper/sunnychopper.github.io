import { describe, expect, it } from 'vitest';
import type { ProactiveAutomation } from '@/types/api-contracts';
import {
  automationsAllHealthy,
  isAutomationInError,
  resolveAutomationCardStatus,
} from './automation-card-status';

function makeAutomation(overrides: Partial<ProactiveAutomation> = {}): ProactiveAutomation {
  return {
    id: 'auto-1',
    kind: 'dailyBriefing',
    enabled: true,
    localTime: '08:00',
    timeZone: 'America/Chicago',
    threadStrategy: 'newThreadEachRun',
    channelEmailEnabled: false,
    channelWebhookEnabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('resolveAutomationCardStatus', () => {
  it('returns error when lastStatus is error', () => {
    const result = resolveAutomationCardStatus(makeAutomation({ lastStatus: 'error' }));
    expect(result).toEqual({ badgeStatus: 'Error', label: 'Error', isError: true });
  });

  it('returns error when lastErrorPreview is set even if lastStatus is success', () => {
    const result = resolveAutomationCardStatus(
      makeAutomation({ lastStatus: 'succeeded', lastErrorPreview: 'Validation failed' })
    );
    expect(result.isError).toBe(true);
    expect(result.badgeStatus).toBe('Error');
  });

  it('maps success aliases to healthy', () => {
    for (const lastStatus of ['success', 'ok', 'succeeded'] as const) {
      const result = resolveAutomationCardStatus(makeAutomation({ lastStatus }));
      expect(result).toEqual({ badgeStatus: 'Healthy', label: 'Healthy', isError: false });
    }
  });

  it('returns pending when no runs recorded', () => {
    const result = resolveAutomationCardStatus(makeAutomation({ lastStatus: null }));
    expect(result).toEqual({ badgeStatus: 'Not run yet', label: 'Not run yet', isError: false });
  });

  it('passes through unknown lastStatus', () => {
    const result = resolveAutomationCardStatus(makeAutomation({ lastStatus: 'running' }));
    expect(result).toEqual({ badgeStatus: 'running', label: 'running', isError: false });
  });
});

describe('isAutomationInError', () => {
  it('detects error via preview whitespace trim', () => {
    expect(isAutomationInError(makeAutomation({ lastErrorPreview: '  oops  ' }))).toBe(true);
    expect(isAutomationInError(makeAutomation({ lastErrorPreview: '   ' }))).toBe(false);
  });
});

describe('automationsAllHealthy', () => {
  it('is false for empty list', () => {
    expect(automationsAllHealthy([])).toBe(false);
  });

  it('is true when every automation is healthy', () => {
    expect(
      automationsAllHealthy([
        makeAutomation({ lastStatus: 'succeeded' }),
        makeAutomation({ id: 'auto-2', lastStatus: null }),
      ])
    ).toBe(true);
  });

  it('is false when any automation has an error', () => {
    expect(
      automationsAllHealthy([
        makeAutomation({ lastStatus: 'succeeded' }),
        makeAutomation({ id: 'auto-2', lastErrorPreview: 'boom' }),
      ])
    ).toBe(false);
  });
});
