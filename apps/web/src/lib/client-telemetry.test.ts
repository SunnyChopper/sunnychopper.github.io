import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    getAuthToken: vi.fn(() => 'test-token'),
  },
}));

vi.mock('@/lib/resolve-error-stack', () => ({
  resolveOriginalStack: vi.fn(async (stack: string) => stack),
}));

vi.mock('@/lib/vite-public-env', () => ({
  getResolvedApiBaseUrl: vi.fn(() => 'https://api.example.com'),
}));

import { apiClient } from '@/lib/api-client';
import {
  flushClientErrors,
  reportClientError,
  resetClientTelemetryForTests,
} from '@/lib/client-telemetry';

describe('client-telemetry', () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetClientTelemetryForTests();
  });

  it('flushes immediately when flush option is immediate', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ success: true, data: { status: 'accepted' } });
    await reportClientError({ message: 'crash' }, { flush: 'immediate' });
    expect(apiClient.post).toHaveBeenCalledOnce();
    expect(apiClient.post).toHaveBeenCalledWith(
      '/telemetry/client-error',
      expect.objectContaining({ message: 'crash', source: 'web' })
    );
  });

  it('defers flush by default', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ success: true, data: { status: 'accepted' } });
    await reportClientError({ message: 'deferred' });
    expect(apiClient.post).not.toHaveBeenCalled();
    await flushClientErrors();
    expect(apiClient.post).toHaveBeenCalledOnce();
  });
});
