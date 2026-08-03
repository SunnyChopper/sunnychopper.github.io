import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/react-query/query-keys';
import { chatbotService } from '@/services/chatbot.service';

const STALE_MS = 60_000;
const REFETCH_INTERVAL_MS = 45_000;

export function useRelevantNow() {
  return useQuery({
    queryKey: queryKeys.chatbot.relevantNow(),
    queryFn: () => chatbotService.getRelevantNow(),
    staleTime: STALE_MS,
    refetchOnWindowFocus: true,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
