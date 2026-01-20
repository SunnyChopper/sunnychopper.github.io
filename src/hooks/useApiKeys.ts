import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useBackendStatus } from '@/contexts/BackendStatusContext';
import { queryKeys } from '@/lib/react-query/query-keys';
import { extractApiError, isNetworkError } from '@/lib/react-query/error-utils';
import type { LLMProvider } from '@/lib/llm/config/provider-types';

/**
 * Hook to fetch all API keys
 */
export function useApiKeys() {
  const { recordError, recordSuccess } = useBackendStatus();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.apiKeys.detail(),
    queryFn: async () => {
      try {
        const result = await apiClient.getApiKeys();
        if (result.success) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes - API keys don't change often
  });

  const apiError = error ? extractApiError(error) : null;

  return {
    apiKeys: data?.data || ({} as Record<LLMProvider, string>),
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error,
  };
}

/**
 * Hook for API key mutations
 */
export function useApiKeyMutations() {
  const queryClient = useQueryClient();

  const setApiKey = useMutation({
    mutationFn: ({ provider, key }: { provider: LLMProvider; key: string }) =>
      apiClient.setApiKey(provider, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.detail() });
    },
  });

  const deleteApiKey = useMutation({
    mutationFn: (provider: LLMProvider) => apiClient.deleteApiKey(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.detail() });
    },
  });

  return {
    setApiKey: setApiKey.mutateAsync,
    deleteApiKey: deleteApiKey.mutateAsync,
    isSetting: setApiKey.isPending,
    isDeleting: deleteApiKey.isPending,
  };
}
