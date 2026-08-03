import { describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { invalidateRelevantNowAfterGrowthTaskMutation } from './growth-system-mutation-invalidation';
import { queryKeys } from '@/lib/react-query/query-keys';

describe('invalidateRelevantNowAfterGrowthTaskMutation', () => {
  it('invalidates relevantNow query key', () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    invalidateRelevantNowAfterGrowthTaskMutation(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.chatbot.relevantNow() });
  });
});
