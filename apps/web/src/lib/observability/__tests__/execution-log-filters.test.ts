import { describe, expect, it } from 'vitest';
import {
  ADVANCED_EXECUTION_LOG_FILTER_KEYS,
  EMPTY_EXECUTION_LOG_FILTERS,
  hasAdvancedExecutionLogFilters,
  hasAnyExecutionLogFilter,
  formatExecutionPreview,
} from '../execution-log-filters';

describe('execution-log-filters', () => {
  it('detects advanced filters when any ID field is set', () => {
    expect(hasAdvancedExecutionLogFilters(EMPTY_EXECUTION_LOG_FILTERS)).toBe(false);
    expect(
      hasAdvancedExecutionLogFilters({ ...EMPTY_EXECUTION_LOG_FILTERS, threadId: 'thread-1' })
    ).toBe(true);
    expect(hasAdvancedExecutionLogFilters({ ...EMPTY_EXECUTION_LOG_FILTERS, jobRunId: '  ' })).toBe(
      false
    );
  });

  it('detects any filter across primary and advanced keys', () => {
    expect(hasAnyExecutionLogFilter(EMPTY_EXECUTION_LOG_FILTERS)).toBe(false);
    expect(hasAnyExecutionLogFilter({ ...EMPTY_EXECUTION_LOG_FILTERS, status: 'failed' })).toBe(
      true
    );
    expect(hasAnyExecutionLogFilter({ ...EMPTY_EXECUTION_LOG_FILTERS, requestId: 'req-1' })).toBe(
      true
    );
  });

  it('lists five advanced ID filter keys', () => {
    expect(ADVANCED_EXECUTION_LOG_FILTER_KEYS).toHaveLength(5);
  });

  it('formats execution preview with em dash fallback', () => {
    expect(formatExecutionPreview(null)).toBe('—');
    expect(formatExecutionPreview('  hello  ')).toBe('hello');
  });
});
