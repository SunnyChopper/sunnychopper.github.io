import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/client-telemetry', () => ({
  reportClientError: vi.fn(),
}));

import { reportClientError } from '@/lib/client-telemetry';
import {
  reportMutationCacheError,
  reportQueryCacheError,
  resetQueryErrorReporterForTests,
  shouldSkipQueryCacheErrorReport,
  shouldSkipQueryErrorReport,
} from '@/lib/report-query-error';

describe('report-query-error', () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetQueryErrorReporterForTests();
  });

  it('skips HTTP_401', () => {
    expect(shouldSkipQueryErrorReport('HTTP_401')).toBe(true);
    reportQueryCacheError({ message: 'unauthorized', code: 'HTTP_401' }, ['tasks']);
    expect(reportClientError).not.toHaveBeenCalled();
  });

  it('reports query failure with metadata', () => {
    reportQueryCacheError(new Error('Request failed'), ['chatbot', 'context']);
    expect(reportClientError).toHaveBeenCalledOnce();
    expect(reportClientError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('React Query failed'),
        metadata: expect.objectContaining({
          kind: 'react-query',
          queryKey: expect.stringContaining('chatbot'),
        }),
      }),
    );
  });

  it('throttles duplicate fingerprint within 60s', () => {
    const err = new Error('same failure');
    reportQueryCacheError(err, ['dup']);
    reportQueryCacheError(err, ['dup']);
    expect(reportClientError).toHaveBeenCalledOnce();
  });

  it('reports mutation failures', () => {
    reportMutationCacheError(new Error('save failed'), ['save-task']);
    expect(reportClientError).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ kind: 'react-mutation' }),
      }),
    );
  });

  it('skips context-usage ETIMEDOUT telemetry', () => {
    const err = Object.assign(
      new Error('Request timed out. The server may be slow or unavailable.'),
      { code: 'ETIMEDOUT' },
    );
    expect(
      shouldSkipQueryCacheErrorReport(
        ['chatbot', 'context-usage', 'thread-1', 'msg-1'],
        'ETIMEDOUT',
        err.message,
      ),
    ).toBe(true);
    reportQueryCacheError(err, ['chatbot', 'context-usage', 'thread-1', 'msg-1']);
    expect(reportClientError).not.toHaveBeenCalled();
  });

  it('still reports unrelated query ETIMEDOUT', () => {
    const err = Object.assign(
      new Error('Request timed out. The server may be slow or unavailable.'),
      { code: 'ETIMEDOUT' },
    );
    reportQueryCacheError(err, ['chatbot', 'unread-summary']);
    expect(reportClientError).toHaveBeenCalledOnce();
  });
});
