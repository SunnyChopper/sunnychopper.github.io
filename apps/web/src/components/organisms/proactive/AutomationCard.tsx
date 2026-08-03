import {
  Sun,
  Moon,
  Zap,
  Pencil,
  Trash2,
  Play,
  History,
  TrendingUp,
  BookMarked,
  CalendarClock,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import Button from '@/components/atoms/Button';
import { cardSurfaceClassName } from '@/components/atoms/Card';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { cn } from '@/lib/utils';
import { formatRelativeChatTimestamp } from '@/lib/chat/format-relative-time';
import { formatProactiveLocalTime12h } from '@/lib/proactive/format-proactive-time';
import { formatProactiveAssistantRunConfigSummary } from '@/lib/proactive/assistant-run-config';
import { resolveAutomationCardStatus } from '@/lib/proactive/automation-card-status';
import { getAutomationKindAccentClass } from '@/lib/proactive/automation-kind-accent';
import type { ProactiveAutomation, ProactiveAutomationKind } from '@/types/api-contracts';
import type { AssistantModelCatalogData } from '@/types/chatbot';

const KIND_ICONS: Record<ProactiveAutomationKind, typeof Sun> = {
  dailyBriefing: Sun,
  logbookEvening: Moon,
  tomorrowPrep: CalendarClock,
  custom: Zap,
  dailyLearningTrends: TrendingUp,
  dailyLearningTheory: BookMarked,
  staleEntityHunter: AlertTriangle,
};

export interface AutomationCardProps {
  automation: ProactiveAutomation;
  kindLabel: string;
  /** Optional catalog to resolve manual model ids to labels. */
  modelCatalog?: AssistantModelCatalogData | null;
  onTestRun: () => void;
  testRunPending: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  togglePending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deletePending: boolean;
  onOpenHistory: () => void;
}

interface AutomationEnabledSwitchProps {
  enabled: boolean;
  disabled: boolean;
  label: string;
  onToggle: (enabled: boolean) => void;
}

function AutomationEnabledSwitch({
  enabled,
  disabled,
  label,
  onToggle,
}: AutomationEnabledSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? `Disable ${label}` : `Enable ${label}`}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onToggle(!enabled);
      }}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
        enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-[1.125rem]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export default function AutomationCard({
  automation,
  kindLabel,
  modelCatalog = null,
  onTestRun,
  testRunPending,
  onToggleEnabled,
  togglePending,
  onEdit,
  onDelete,
  deletePending,
  onOpenHistory,
}: AutomationCardProps) {
  const Icon = KIND_ICONS[automation.kind];
  const cardStatus = resolveAutomationCardStatus(automation);
  const displayTitle = automation.title?.trim() ? automation.title.trim() : kindLabel;
  const errorPreview = automation.lastErrorPreview?.trim();
  const modelsLine = formatProactiveAssistantRunConfigSummary(
    automation.assistantRunConfig ?? null,
    modelCatalog
  );
  const lastRunRelative = automation.lastRunAt
    ? formatRelativeChatTimestamp(automation.lastRunAt)
    : null;
  const lastRunAbsolute = automation.lastRunAt
    ? new Date(automation.lastRunAt).toLocaleString()
    : undefined;

  const openHistory = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onOpenHistory();
  };

  return (
    <article
      className={cn(
        cardSurfaceClassName,
        'flex h-full min-h-0 flex-col overflow-hidden border-l-4',
        getAutomationKindAccentClass(automation.kind),
        !automation.enabled && 'opacity-80'
      )}
    >
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'flex min-h-0 flex-1 cursor-pointer gap-2.5 p-3 text-left transition-colors duration-150',
          'hover:bg-gray-50/90 dark:hover:bg-gray-800/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30'
        )}
        onClick={onOpenHistory}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpenHistory();
          }
        }}
        aria-label={`View run history for ${displayTitle}`}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                {displayTitle}
              </h3>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium tabular-nums">
                  {formatProactiveLocalTime12h(automation.localTime)}
                </span>
                <span className="mx-1.5 text-gray-400">·</span>
                <span className="truncate">{automation.timeZone}</span>
              </p>
              {modelsLine ? (
                <p
                  className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500"
                  title={modelsLine}
                >
                  <span className="font-medium">Models: </span>
                  {modelsLine}
                </p>
              ) : null}
            </div>

            <div
              className="flex shrink-0 flex-col items-end gap-1.5 text-right"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <StatusBadge status={cardStatus.badgeStatus} size="sm" />
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  {automation.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <AutomationEnabledSwitch
                  enabled={automation.enabled}
                  disabled={togglePending}
                  label={displayTitle}
                  onToggle={onToggleEnabled}
                />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-500" title={lastRunAbsolute}>
                {lastRunRelative ? (
                  <>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Last run </span>
                    {lastRunRelative}
                  </>
                ) : (
                  'No runs yet'
                )}
              </p>
            </div>
          </div>

          {errorPreview ? (
            <div className="mt-2 flex min-w-0 items-center gap-2 rounded-md bg-rose-50/70 px-2 py-1 dark:bg-rose-950/20">
              <p className="min-w-0 flex-1 truncate text-xs text-rose-800 dark:text-rose-200">
                {errorPreview}
              </p>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-rose-700 underline-offset-2 hover:underline dark:text-rose-300"
                onClick={openHistory}
              >
                <Stethoscope className="h-3.5 w-3.5" aria-hidden />
                Diagnose
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex shrink-0 flex-wrap items-center gap-2 border-t border-gray-200 px-3 py-2 dark:border-gray-700">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-11 gap-1 rounded-lg !px-3 !py-1.5 text-xs"
          disabled={testRunPending}
          onClick={onTestRun}
        >
          <Play className="h-3.5 w-3.5 shrink-0" />
          {testRunPending ? 'Running…' : 'Test run'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 gap-1 rounded-lg !px-3 !py-1.5 text-xs text-gray-700 dark:text-gray-300"
          onClick={onOpenHistory}
        >
          <History className="h-3.5 w-3.5" />
          History
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 gap-1 rounded-lg !px-3 !py-1.5 text-xs text-gray-700 dark:text-gray-300"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <button
          type="button"
          className="ml-auto inline-flex min-h-11 items-center gap-1 px-2 text-xs text-gray-500 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:text-red-400"
          disabled={deletePending}
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </article>
  );
}
