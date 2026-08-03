import { describe, expect, it } from 'vitest';
import type { ProactiveAutomationRun } from '@/types/api-contracts';
import {
  findMostRecentFailedRunId,
  isFailedAutomationRun,
  isSucceededAutomationRun,
} from './automation-run-history';

function makeRun(overrides: Partial<ProactiveAutomationRun> = {}): ProactiveAutomationRun {
  return {
    id: 'run-1',
    automationId: 'auto-1',
    status: 'succeeded',
    ranAt: '2026-07-23T12:00:00.000Z',
    runSource: 'scheduled',
    ...overrides,
  };
}

describe('automation-run-history', () => {
  describe('isFailedAutomationRun', () => {
    it('recognizes failed status aliases', () => {
      expect(isFailedAutomationRun('failed')).toBe(true);
      expect(isFailedAutomationRun('error')).toBe(true);
      expect(isFailedAutomationRun('failure')).toBe(true);
      expect(isFailedAutomationRun('Failed')).toBe(true);
    });

    it('returns false for success statuses', () => {
      expect(isFailedAutomationRun('succeeded')).toBe(false);
      expect(isFailedAutomationRun('success')).toBe(false);
    });
  });

  describe('isSucceededAutomationRun', () => {
    it('recognizes success status aliases', () => {
      expect(isSucceededAutomationRun('succeeded')).toBe(true);
      expect(isSucceededAutomationRun('success')).toBe(true);
      expect(isSucceededAutomationRun('ok')).toBe(true);
    });

    it('returns false for failed statuses', () => {
      expect(isSucceededAutomationRun('failed')).toBe(false);
      expect(isSucceededAutomationRun('error')).toBe(false);
    });
  });

  describe('findMostRecentFailedRunId', () => {
    it('returns the first failed run in newest-first order', () => {
      const runs = [
        makeRun({ id: 'run-newest-fail', status: 'failed', ranAt: '2026-07-23T14:00:00.000Z' }),
        makeRun({ id: 'run-older-ok', status: 'succeeded', ranAt: '2026-07-23T13:00:00.000Z' }),
        makeRun({ id: 'run-older-fail', status: 'failed', ranAt: '2026-07-23T12:00:00.000Z' }),
      ];
      expect(findMostRecentFailedRunId(runs)).toBe('run-newest-fail');
    });

    it('returns null when no runs failed', () => {
      const runs = [
        makeRun({ id: 'run-1', status: 'succeeded' }),
        makeRun({ id: 'run-2', status: 'ok' }),
      ];
      expect(findMostRecentFailedRunId(runs)).toBeNull();
    });

    it('returns null for an empty list', () => {
      expect(findMostRecentFailedRunId([])).toBeNull();
    });
  });
});
