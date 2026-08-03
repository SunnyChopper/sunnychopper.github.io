import Button from '@/components/atoms/Button';
import { cardSurfaceClassName } from '@/components/atoms/Card';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { cn } from '@/lib/utils';
import {
  readChannelEmailEnabled,
  readChannelWebhookEnabled,
  readThreadStrategyLabel,
  summarizeProactiveSuggestionPayload,
} from '@/lib/proactive/proactive-suggestion-summary';
import {
  formatProactiveAssistantRunConfigSummary,
  parseProactiveAssistantRunConfigFromUnknown,
} from '@/lib/proactive/assistant-run-config';
import type { ProactiveSuggestion, ProactiveSuggestionStatus } from '@/types/api-contracts';
import type { AssistantModelCatalogData } from '@/types/chatbot';

export interface ProactiveSuggestionCardProps {
  suggestion: ProactiveSuggestion;
  modelCatalog?: AssistantModelCatalogData | null;
  /** When pending, show approve/reject/edit. Otherwise read-only history. */
  variant: ProactiveSuggestionStatus;
  resolvePending: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  /** Rejected history: edit stored proposal (PATCH). */
  onUpdateFeedback?: () => void;
  /** Rejected history: create automation from proposal (resolve approve). */
  onApproveRejected?: () => void;
}

const metaChipClass =
  'rounded-md bg-gray-50/90 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-gray-950/50 dark:text-gray-300';

function effectivePayload(suggestion: ProactiveSuggestion): Record<string, unknown> {
  const r = suggestion.resolvedPayload;
  if (r && typeof r === 'object' && !Array.isArray(r)) return r as Record<string, unknown>;
  const p = suggestion.proposedPayload;
  if (p && typeof p === 'object' && !Array.isArray(p)) return p as Record<string, unknown>;
  return {};
}

export default function ProactiveSuggestionCard({
  suggestion,
  modelCatalog = null,
  variant,
  resolvePending,
  onApprove,
  onReject,
  onEdit,
  onUpdateFeedback,
  onApproveRejected,
}: ProactiveSuggestionCardProps) {
  const payload = effectivePayload(suggestion);
  const summary = summarizeProactiveSuggestionPayload(payload);
  const threadLabel = readThreadStrategyLabel(payload);
  const emailOn = readChannelEmailEnabled(payload);
  const webhookOn = readChannelWebhookEnabled(payload);
  const modelsLine = formatProactiveAssistantRunConfigSummary(
    parseProactiveAssistantRunConfigFromUnknown(payload.assistantRunConfig),
    modelCatalog
  );
  const customPrompt =
    typeof payload.customUserPrompt === 'string' ? payload.customUserPrompt.trim() : '';
  const scheduleDays = summary.daysLabel ?? 'Every day';
  const isPending = variant === 'pending';
  const isRejected = variant === 'rejected';

  const secondaryBtnClass =
    'rounded-lg !px-3 !py-2 text-xs w-full min-w-0 flex-1 sm:w-auto sm:flex-none sm:shrink-0';
  const primaryBtnClass =
    'rounded-lg !px-4 !py-2.5 text-sm font-medium w-full min-w-0 flex-1 sm:w-auto sm:flex-none sm:shrink-0';

  const statusBadge =
    variant === 'approved' ? (
      <StatusBadge status="Accepted" size="sm" className="uppercase tracking-wide text-[10px]" />
    ) : variant === 'rejected' ? (
      <StatusBadge status="Rejected" size="sm" className="uppercase tracking-wide text-[10px]" />
    ) : null;

  const feedback = suggestion.resolutionFeedback?.trim();

  return (
    <div
      className={cn(
        cardSurfaceClassName,
        'flex flex-col overflow-hidden',
        isPending ? 'shadow-sm' : 'shadow-none border-gray-100 dark:border-gray-800/80'
      )}
    >
      <div className={cn('min-w-0 flex-1', isPending ? 'p-5' : 'p-4')}>
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <h3
            className={cn(
              'font-semibold leading-snug text-gray-900 dark:text-white',
              isPending ? 'text-base' : 'text-sm'
            )}
          >
            {summary.title}
          </h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {summary.kindLabel}
          </span>
          {statusBadge}
        </div>
        {summary.reasoning ? (
          <p className="mt-2 text-sm leading-snug text-gray-700 dark:text-gray-300">
            {summary.reasoning}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-gray-500">
          Suggested {new Date(suggestion.createdAt).toLocaleString()}
          {!isPending ? ` · Resolved ${new Date(suggestion.updatedAt).toLocaleString()}` : null}
        </p>
        {variant === 'approved' && suggestion.createdAutomationId ? (
          <p className="mt-1 text-xs text-gray-500">
            Automation{' '}
            <span className="font-mono text-[11px]">{suggestion.createdAutomationId}</span>
          </p>
        ) : null}
        {feedback ? (
          <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 dark:border-amber-800/60 dark:bg-amber-950/30">
            <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
              Your feedback
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
              {feedback}
            </p>
          </div>
        ) : null}

        <div className={cn('mt-3 flex flex-col', isPending ? 'gap-3' : 'gap-2')}>
          <div className="flex flex-wrap gap-2">
            <div className={metaChipClass}>
              <span className="font-medium text-gray-500 dark:text-gray-400">Schedule · </span>
              <span className="text-gray-900 dark:text-gray-100">
                {summary.displayTime12h} · {String(payload.timeZone ?? '—')}
                <span className="text-gray-500 dark:text-gray-400"> · {scheduleDays}</span>
              </span>
            </div>
            <div className={metaChipClass}>
              <span className="font-medium text-gray-500 dark:text-gray-400">Delivery · </span>
              <span className="text-gray-900 dark:text-gray-100">
                Email {emailOn ? 'on' : 'off'} · Webhook {webhookOn ? 'on' : 'off'} · {threadLabel}
                {modelsLine ? (
                  <>
                    <span className="text-gray-500 dark:text-gray-400"> · </span>
                    {modelsLine}
                  </>
                ) : null}
              </span>
            </div>
          </div>

          {customPrompt ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 dark:bg-primary/10">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary/80 dark:text-primary/70">
                Instructions
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {customPrompt}
              </p>
            </div>
          ) : null}

          <details className="group text-xs">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 [&::-webkit-details-marker]:hidden">
              <span className="inline-block transition-transform group-open:rotate-90">›</span>
              Raw payload (debug)
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-gray-100 p-2 text-[11px] dark:bg-gray-950">
              {JSON.stringify(
                isPending
                  ? suggestion.proposedPayload
                  : {
                      proposedPayload: suggestion.proposedPayload,
                      resolvedPayload: suggestion.resolvedPayload ?? null,
                      resolutionFeedback: suggestion.resolutionFeedback ?? null,
                    },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/40 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={secondaryBtnClass}
            disabled={resolvePending}
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={secondaryBtnClass}
            disabled={resolvePending}
            onClick={onReject}
          >
            Reject
          </Button>
          <Button
            type="button"
            variant="success"
            size="default"
            className={primaryBtnClass}
            disabled={resolvePending}
            onClick={onApprove}
          >
            Approve
          </Button>
        </div>
      ) : null}
      {isRejected ? (
        <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/30 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={secondaryBtnClass}
            disabled={resolvePending}
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={secondaryBtnClass}
            disabled={resolvePending}
            onClick={onUpdateFeedback}
          >
            Feedback
          </Button>
          <Button
            type="button"
            variant="success"
            size="sm"
            className={secondaryBtnClass}
            disabled={resolvePending}
            onClick={onApproveRejected}
          >
            Approve
          </Button>
        </div>
      ) : null}
    </div>
  );
}
