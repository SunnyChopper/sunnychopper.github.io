import type { QueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/api-contracts';
import type { NutritionEntry, PaginatedFitness } from '@/types/fitness';
import { queryKeys } from '@/lib/react-query/query-keys';

type NutritionListCache = ApiResponse<PaginatedFitness<NutritionEntry>>;

function prependToNutritionList(
  cached: NutritionListCache | undefined,
  entries: NutritionEntry[]
): NutritionListCache | undefined {
  if (!cached?.success || !cached.data) return cached;

  const existing = cached.data.data ?? [];
  const incomingIds = new Set(entries.map((entry) => entry.id));
  const withoutDupes = existing.filter((entry) => !incomingIds.has(entry.id));
  const merged = [...entries, ...withoutDupes].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );

  return {
    ...cached,
    data: {
      ...cached.data,
      data: merged,
      total: Math.max(cached.data.total, merged.length),
    },
  };
}

/** Optimistically prepend nutrition entries into all cached nutrition list queries. */
export function prependNutritionEntriesToCache(
  queryClient: QueryClient,
  entries: NutritionEntry[]
): void {
  if (entries.length === 0) return;

  const queries = queryClient.getQueriesData<NutritionListCache>({
    queryKey: queryKeys.fitness.nutrition.all(),
  });

  queries.forEach(([key, data]) => {
    const next = prependToNutritionList(data, entries);
    if (next !== data) {
      queryClient.setQueryData(key, next);
    }
  });
}
