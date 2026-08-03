import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useUpsertRecoveryMutation } from '@/hooks/useFitness';
import { fitnessService } from '@/services/fitness.service';

vi.mock('@/services/fitness.service', () => ({
  fitnessService: {
    upsertRecovery: vi.fn(),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useUpsertRecoveryMutation', () => {
  beforeEach(() => {
    vi.mocked(fitnessService.upsertRecovery).mockReset();
  });

  it('throws when ApiResponse.success is false', async () => {
    vi.mocked(fitnessService.upsertRecovery).mockResolvedValue({
      success: false,
      data: undefined,
      error: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
    });

    const { result } = renderHook(() => useUpsertRecoveryMutation(), { wrapper });

    await expect(
      act(async () => {
        await result.current.mutateAsync({ date: '2026-07-29', body: { sleepHours: 7 } });
      })
    ).rejects.toThrow('Validation failed');
  });

  it('resolves when ApiResponse.success is true', async () => {
    vi.mocked(fitnessService.upsertRecovery).mockResolvedValue({
      success: true,
      data: {
        date: '2026-07-29',
        userId: 'user-1',
        sleepHours: 7,
        sleepQuality: null,
        energyLevel: null,
        restingHeartRate: null,
        sorenessLevel: null,
        stressLevel: null,
        bodyWeight: null,
        notes: null,
        recoveryScore: null,
        linkedFields: {},
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      error: undefined,
    });

    const { result } = renderHook(() => useUpsertRecoveryMutation(), { wrapper });

    await act(async () => {
      const res = await result.current.mutateAsync({
        date: '2026-07-29',
        body: { sleepHours: 7 },
      });
      expect(res.success).toBe(true);
    });
  });
});
