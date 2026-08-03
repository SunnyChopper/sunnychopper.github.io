import { startTransition, useCallback, useState } from 'react';
import { Archive, RefreshCw, Skull } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { upsertMessageTreeNodeCache } from '@/lib/react-query/chatbot-cache';
import { queryKeys } from '@/lib/react-query/query-keys';
import { chatbotService } from '@/services/chatbot.service';
import type { AssistantDecisionRequest, DecisionAction, StaleEntityAction } from '@/types/chatbot';

type StaleEntityDecisionCardProps = {
  threadId: string;
  messageId: string;
  decision: AssistantDecisionRequest;
};

const ACTION_LABELS: Record<StaleEntityAction, string> = {
  archive: 'Archive',
  kill: 'Kill',
  revive: 'Revive',
};

function isStaleEntityAction(action: DecisionAction | undefined): action is StaleEntityAction {
  return action === 'archive' || action === 'kill' || action === 'revive';
}

function actionIcon(action: StaleEntityAction) {
  if (action === 'archive') return Archive;
  if (action === 'kill') return Skull;
  return RefreshCw;
}

export function StaleEntityDecisionCard({
  threadId,
  messageId,
  decision,
}: StaleEntityDecisionCardProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const resolved = decision.status === 'resolved';
  const resolutionAction = isStaleEntityAction(decision.resolution?.action)
    ? decision.resolution.action
    : undefined;
  const staleOptions = (decision.options ?? []).filter(isStaleEntityAction);

  const resolveMutation = useMutation({
    mutationFn: (action: StaleEntityAction) =>
      chatbotService.resolveAssistantDecision(threadId, messageId, decision.id, action),
    onSuccess: (updatedMessage) => {
      setError(null);
      upsertMessageTreeNodeCache(queryClient, threadId, updatedMessage);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chatbot.messages.tree(threadId),
      });
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to apply decision');
    },
  });

  const handleAction = useCallback(
    (action: StaleEntityAction) => {
      if (resolved || resolveMutation.isPending) return;
      startTransition(() => {
        resolveMutation.mutate(action);
      });
    },
    [resolveMutation, resolved]
  );

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        resolved
          ? 'border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-800/40'
          : 'border-amber-400/70 bg-amber-50/90 dark:border-amber-700/50 dark:bg-amber-950/25'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 dark:text-slate-100">{decision.title}</p>
          <p className="text-xs uppercase tracking-wide text-amber-800/80 dark:text-amber-200/80">
            {decision.entityType} · {decision.daysInactive ?? 0}d inactive
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">{decision.rationale}</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-500">
            Suggested: {decision.suggestedNextAction}
          </p>
        </div>
        {resolved && resolutionAction ? (
          <span className="rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            {ACTION_LABELS[resolutionAction]}
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {staleOptions.map((action) => {
              const Icon = actionIcon(action);
              const isKill = action === 'kill';
              return (
                <button
                  key={action}
                  type="button"
                  disabled={resolveMutation.isPending}
                  onClick={() => handleAction(action)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50',
                    isKill
                      ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                      : action === 'revive'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                        : 'bg-gray-800 text-gray-100 hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {ACTION_LABELS[action]}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type StaleEntityDecisionCardListProps = {
  threadId: string;
  messageId: string;
  decisions: AssistantDecisionRequest[];
};

export function StaleEntityDecisionCardList({
  threadId,
  messageId,
  decisions,
}: StaleEntityDecisionCardListProps) {
  if (!decisions.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {decisions.map((decision) => (
        <StaleEntityDecisionCard
          key={decision.id}
          threadId={threadId}
          messageId={messageId}
          decision={decision}
        />
      ))}
    </div>
  );
}
