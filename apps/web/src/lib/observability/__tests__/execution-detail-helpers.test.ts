import { describe, expect, it } from 'vitest';
import {
  getRawPayloadEntries,
  getTraceSummary,
  hasFailureDetails,
  isExecutionFailure,
} from '@/lib/observability/execution-detail-helpers';

describe('execution-detail-helpers', () => {
  it('detects execution failure statuses', () => {
    expect(isExecutionFailure('failed')).toBe(true);
    expect(isExecutionFailure('succeeded')).toBe(false);
  });

  it('collects raw payload entries in stable order', () => {
    const entries = getRawPayloadEntries({
      id: 'x',
      occurredAt: new Date().toISOString(),
      module: 'assistant',
      provider: 'openai',
      model: 'gpt',
      status: 'succeeded',
      promptPayloadJson: { a: 1 },
      requestMetadataJson: { b: 2 },
      pricingSnapshotJson: { c: 3 },
    });
    expect(entries.map((e) => e.label)).toEqual([
      'promptPayloadJson',
      'requestMetadataJson',
      'pricingSnapshotJson',
    ]);
  });

  it('summarizes trace ids with thread preference', () => {
    expect(
      getTraceSummary({
        id: '1',
        occurredAt: '',
        module: 'assistant',
        provider: 'openai',
        model: 'm',
        status: 'succeeded',
        threadId: 't1',
        runId: 'r1',
        requestId: 'req',
      })
    ).toBe('t1');
  });

  it('detects failure details presence', () => {
    expect(
      hasFailureDetails({
        id: '1',
        occurredAt: '',
        module: 'assistant',
        provider: 'openai',
        model: 'm',
        status: 'failed',
        errorMessage: 'boom',
      })
    ).toBe(true);
    expect(
      hasFailureDetails({
        id: '1',
        occurredAt: '',
        module: 'assistant',
        provider: 'openai',
        model: 'm',
        status: 'succeeded',
      })
    ).toBe(false);
  });
});
