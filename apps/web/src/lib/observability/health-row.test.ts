import { describe, expect, it } from 'vitest';
import type { ObservabilityHealthRow } from '@/types/observability';
import {
  buildHealthErrorCopyText,
  formatHealthFailureAt,
  formatHealthSummaryFailureAt,
  healthRowFailureAt,
  isFailedHealthStatus,
} from './health-row';

function makeRow(overrides: Partial<ObservabilityHealthRow> = {}): ObservabilityHealthRow {
  return {
    rowId: 'row-1',
    jobName: 'proactive_daily',
    jobType: 'proactive_automation',
    lastStatus: 'failed',
    lastStartedAt: '2026-07-23T08:00:40.000Z',
    ...overrides,
  };
}

describe('isFailedHealthStatus', () => {
  it('returns true for failed, error, and failure', () => {
    expect(isFailedHealthStatus('failed')).toBe(true);
    expect(isFailedHealthStatus('ERROR')).toBe(true);
    expect(isFailedHealthStatus(' failure ')).toBe(true);
  });

  it('returns false for non-failure statuses', () => {
    expect(isFailedHealthStatus('succeeded')).toBe(false);
    expect(isFailedHealthStatus('running')).toBe(false);
    expect(isFailedHealthStatus('')).toBe(false);
  });
});

describe('healthRowFailureAt', () => {
  it('prefers lastFinishedAt over lastStartedAt', () => {
    const row = makeRow({
      lastStartedAt: '2026-07-23T08:00:40.000Z',
      lastFinishedAt: '2026-07-23T08:01:15.000Z',
    });
    expect(healthRowFailureAt(row)).toBe('2026-07-23T08:01:15.000Z');
  });

  it('falls back to lastStartedAt when lastFinishedAt is absent', () => {
    const row = makeRow({ lastFinishedAt: null });
    expect(healthRowFailureAt(row)).toBe('2026-07-23T08:00:40.000Z');
  });
});

describe('formatHealthFailureAt', () => {
  it('formats a valid ISO timestamp', () => {
    const formatted = formatHealthFailureAt('2026-07-23T08:00:40.000Z');
    expect(formatted).toBeTruthy();
    expect(formatted).not.toBe('2026-07-23T08:00:40.000Z');
  });

  it('returns raw string for invalid dates', () => {
    expect(formatHealthFailureAt('not-a-date')).toBe('not-a-date');
  });
});

describe('formatHealthSummaryFailureAt', () => {
  it('returns em dash when missing', () => {
    expect(formatHealthSummaryFailureAt(null)).toBe('—');
    expect(formatHealthSummaryFailureAt(undefined)).toBe('—');
  });
});

describe('buildHealthErrorCopyText', () => {
  it('joins message and stack with blank line', () => {
    expect(buildHealthErrorCopyText('boom', 'Traceback...')).toBe('boom\n\nTraceback...');
  });

  it('returns only message or stack when one is missing', () => {
    expect(buildHealthErrorCopyText('boom', null)).toBe('boom');
    expect(buildHealthErrorCopyText(null, 'Traceback...')).toBe('Traceback...');
  });

  it('returns empty string when both missing', () => {
    expect(buildHealthErrorCopyText(null, null)).toBe('');
  });
});
