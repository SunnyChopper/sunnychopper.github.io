import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/client-telemetry', () => ({
  reportClientError: vi.fn(),
}));

import { reportClientError } from '@/lib/client-telemetry';
import {
  isReportableAssistantStreamCode,
  reportAssistantStreamError,
  reportAssistantStreamErrorFromWsPayload,
  resetAssistantStreamTelemetryThrottleForTests,
} from '@/lib/assistant-stream-telemetry';

describe('assistant-stream-telemetry', () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetAssistantStreamTelemetryThrottleForTests();
  });

  it('skips SESSION_EXPIRED', () => {
    expect(isReportableAssistantStreamCode('SESSION_EXPIRED')).toBe(false);
    reportAssistantStreamError({
      message: 'expired',
      code: 'SESSION_EXPIRED',
    });
    expect(reportClientError).not.toHaveBeenCalled();
  });

  it('reports WS_BACKEND_REJECTED', () => {
    reportAssistantStreamError({
      message: 'The assistant streaming service rejected the WebSocket connection.',
      code: 'WS_BACKEND_REJECTED',
      threadId: 'thread-1',
      details: { closeCode: 1006 },
    });
    expect(reportClientError).toHaveBeenCalledOnce();
    expect(reportClientError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('rejected'),
        metadata: expect.objectContaining({
          kind: 'assistant-stream',
          code: 'WS_BACKEND_REJECTED',
          threadId: 'thread-1',
        }),
      })
    );
  });

  it('throttles duplicate code+message within 60s', () => {
    reportAssistantStreamError({
      message: 'connection failed',
      code: 'CONNECTION_FAILED',
    });
    reportAssistantStreamError({
      message: 'connection failed',
      code: 'CONNECTION_FAILED',
    });
    expect(reportClientError).toHaveBeenCalledOnce();
  });

  it('reports runError payload from WsRunErrorPayload', () => {
    reportAssistantStreamErrorFromWsPayload({
      runId: 'run-1',
      threadId: 'thread-1',
      message: 'Tool execution failed',
      code: 'TOOL_ERROR',
    });
    expect(reportClientError).toHaveBeenCalledOnce();
  });

  it('skips runError when assistant content already streamed', () => {
    reportAssistantStreamErrorFromWsPayload(
      {
        runId: 'run-1',
        threadId: 'thread-1',
        message: 'late failure',
        code: 'TOOL_ERROR',
      },
      { hadStreamedAssistant: true }
    );
    expect(reportClientError).not.toHaveBeenCalled();
  });
});
