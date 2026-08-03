import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PageContainer } from '@/components/templates/PageContainer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proactiveService } from '@/services/proactive.service';
import { detectBrowserTimeZone, getIanaTimeZoneOptions } from '@/lib/iana-time-zones';
import type {
  ProactiveAutomation,
  ProactiveAutomationKind,
  ProactiveSuggestion,
} from '@/types/api-contracts';
import type { AssistantModelCatalogData } from '@/types/chatbot';
import AutomationCard from '@/components/organisms/proactive/AutomationCard';
import AutomationFormModal from '@/components/organisms/proactive/AutomationFormModal';
import { StaleEntityHunterSettingsPanel } from '@/components/organisms/proactive/StaleEntityHunterSettingsPanel';
import { AmbientStrictPlanSettingsPanel } from '@/components/organisms/proactive/AmbientStrictPlanSettingsPanel';
import AutomationRunHistoryDialog from '@/components/molecules/proactive/AutomationRunHistoryDialog';
import AutomationCardSkeleton from '@/components/molecules/proactive/AutomationCardSkeleton';
import BrainstormProgressStrip from '@/components/molecules/proactive/BrainstormProgressStrip';
import ProactiveSuggestionCardSkeleton from '@/components/molecules/proactive/ProactiveSuggestionCardSkeleton';
import ProactiveSuggestionCard from '@/components/organisms/proactive/ProactiveSuggestionCard';
import RejectSuggestionDialog from '@/components/molecules/proactive/RejectSuggestionDialog';
import UpdateSuggestionFeedbackDialog from '@/components/molecules/proactive/UpdateSuggestionFeedbackDialog';
import Button from '@/components/atoms/Button';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { cardSurfaceClassName } from '@/components/atoms/Card';
import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import { FormInput } from '@/components/atoms/FormInput';
import { cn } from '@/lib/utils';
import Dialog from '@/components/molecules/Dialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import AnimatedSectionWrapper from '@/components/molecules/AnimatedSectionWrapper';
import ProactiveSettingsCard from '@/components/molecules/proactive/ProactiveSettingsCard';
import { ChevronDown, CheckCircle2, Inbox, Settings2, Sparkles, Zap } from 'lucide-react';
import { BrainstormModelPicker } from '@/components/molecules/assistant/BrainstormModelPicker';
import {
  brainstormValueToApiModelField,
  type BrainstormModelPickerValue,
} from '@/lib/assistant/brainstorm-model-picker';
import { chatbotService } from '@/services/chatbot.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  useProactiveAutomations,
  useProactiveSettings,
  useProactiveSuggestions,
} from '@/hooks/useProactive';
import { partitionProactiveSuggestions } from '@/pages/admin/proactive-suggestions-partition';
import { automationsAllHealthy } from '@/lib/proactive/automation-card-status';
import { Select } from '@/components/atoms/Select';
import {
  proactiveSettingsReferenceLabelClassName,
  proactiveSettingsReferenceListClassName,
} from '@/lib/proactive/proactive-settings-surfaces';
import {
  proactiveActionButtonClassName,
  proactiveSectionHeaderClassName,
} from '@/lib/proactive/proactive-section-surfaces';
import { resolveBrainstormProgress } from '@/lib/proactive/brainstorm-progress';
import { useElapsedMsWhile } from '@/lib/proactive/use-elapsed-ms-while';

const KINDS: ProactiveAutomationKind[] = [
  'dailyBriefing',
  'logbookEvening',
  'tomorrowPrep',
  'staleEntityHunter',
  'custom',
  'dailyLearningTrends',
  'dailyLearningTheory',
];

const KIND_LABELS: Record<ProactiveAutomationKind, string> = {
  dailyBriefing: 'Daily Briefing',
  logbookEvening: 'Logbook Evening',
  tomorrowPrep: 'Tomorrow Prep',
  staleEntityHunter: 'Stale Entity Hunter',
  custom: 'Custom',
  dailyLearningTrends: 'Daily Learning — Trends',
  dailyLearningTheory: 'Daily Learning — Theory',
};

const KIND_DESCRIPTIONS: Record<ProactiveAutomationKind, string> = {
  dailyBriefing: 'start your day with priorities and context.',
  logbookEvening: 'reflect on the day and capture what mattered.',
  tomorrowPrep:
    'prep tomorrow’s plan (evening) or today (early morning); pairs with Morning Briefing.',
  staleEntityHunter: 'find entities quiet longer than your threshold.',
  custom: 'follow instructions you write for each run.',
  dailyLearningTrends: 'surface trends from your learning activity.',
  dailyLearningTheory: 'deepen theory tied to what you are studying.',
};

type MainTab = 'automations' | 'suggestions' | 'settings';

const PROACTIVE_TAB_PANEL_ID: Record<MainTab, string> = {
  automations: 'proactive-tabpanel-automations',
  suggestions: 'proactive-tabpanel-suggestions',
  settings: 'proactive-tabpanel-settings',
};

const PROACTIVE_TAB_BUTTON_ID: Record<MainTab, string> = {
  automations: 'proactive-tab-automations',
  suggestions: 'proactive-tab-suggestions',
  settings: 'proactive-tab-settings',
};

const TAB_FADE_DURATION_S = 0.18;

const SUGGESTION_HISTORY_PAGE_SIZE = 5;

const pendingListContainerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

const pendingListItemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const automationListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.03 },
  },
};

const automationItemVariants = {
  hidden: { y: 12, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  },
};

function historySectionStatusBadge(variant: 'approved' | 'rejected') {
  return (
    <StatusBadge
      status={variant === 'approved' ? 'Accepted' : 'Rejected'}
      size="sm"
      className="shrink-0 uppercase tracking-wide text-[10px]"
    />
  );
}

function mergeZoneOptions(currentValues: string[]): string[] {
  const base = getIanaTimeZoneOptions();
  const set = new Set(base);
  for (const v of currentValues) {
    if (v && !set.has(v)) {
      base.push(v);
      set.add(v);
    }
  }
  return base.slice().sort((a, b) => a.localeCompare(b));
}

interface AutomationsTabProps {
  isLoading: boolean;
  automations: ProactiveAutomation[];
  modelCatalog: AssistantModelCatalogData | null;
  onCreate: () => void;
  onEdit: (a: ProactiveAutomation) => void;
  onTestRun: (a: ProactiveAutomation) => void;
  testRunPendingId: string | undefined;
  onToggle: (id: string, enabled: boolean) => void;
  togglePending: boolean;
  onDelete: (id: string) => void;
  deletePending: boolean;
  onOpenHistory: (a: ProactiveAutomation) => void;
}

function AutomationsTab({
  isLoading,
  automations,
  modelCatalog,
  onCreate,
  onEdit,
  onTestRun,
  testRunPendingId,
  onToggle,
  togglePending,
  onDelete,
  deletePending,
  onOpenHistory,
}: AutomationsTabProps) {
  const shouldReduceMotion = useReducedMotion();
  const allHealthy = automationsAllHealthy(automations);

  return (
    <section aria-labelledby="automations-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="automations-heading" className={proactiveSectionHeaderClassName}>
          Your automations
        </h2>
        <Button
          type="button"
          size="sm"
          className={proactiveActionButtonClassName}
          onClick={onCreate}
        >
          New automation
        </Button>
      </div>
      {allHealthy ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-green-200/80 bg-green-50/60 px-3 py-2 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          All automations healthy
        </div>
      ) : null}
      {isLoading ? (
        <AutomationCardSkeleton />
      ) : automations.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No automations yet"
          description="Create a daily briefing or evening check-in to get proactive updates on your schedule."
          actionLabel="Create your first automation"
          onAction={onCreate}
        />
      ) : (
        <motion.ul
          className="grid items-stretch gap-3 sm:grid-cols-1 lg:grid-cols-2"
          variants={shouldReduceMotion ? undefined : automationListVariants}
          initial={shouldReduceMotion ? false : 'hidden'}
          animate={shouldReduceMotion ? undefined : 'show'}
        >
          {automations.map((a: ProactiveAutomation) => (
            <motion.li
              key={a.id}
              className="min-h-0"
              variants={shouldReduceMotion ? undefined : automationItemVariants}
            >
              <AutomationCard
                automation={a}
                kindLabel={KIND_LABELS[a.kind]}
                modelCatalog={modelCatalog}
                onTestRun={() => onTestRun(a)}
                testRunPending={testRunPendingId === a.id}
                onToggleEnabled={(enabled) => onToggle(a.id, enabled)}
                togglePending={togglePending}
                onEdit={() => onEdit(a)}
                onDelete={() => onDelete(a.id)}
                deletePending={deletePending}
                onOpenHistory={() => onOpenHistory(a)}
              />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}

interface SuggestionsTabProps {
  isLoading: boolean;
  pendingSuggestions: ProactiveSuggestion[];
  acceptedSuggestions: ProactiveSuggestion[];
  rejectedSuggestions: ProactiveSuggestion[];
  resolvePending: boolean;
  onApprove: (id: string) => void;
  onRejectRequest: (s: ProactiveSuggestion) => void;
  onEditSuggestion: (s: ProactiveSuggestion) => void;
  onEditRejectedSuggestion: (s: ProactiveSuggestion) => void;
  onUpdateRejectedFeedback: (s: ProactiveSuggestion) => void;
  onApproveRejected: (id: string) => void;
  onBrainstorm: () => void;
  brainstormPending: boolean;
  brainstormError: string | null;
  brainstormStatus: string | null;
  brainstormPicker: BrainstormModelPickerValue;
  onBrainstormPickerChange: (next: BrainstormModelPickerValue) => void;
  brainstormCatalogLoading: boolean;
  brainstormModelCatalog: AssistantModelCatalogData | null;
}

function PendingSuggestionSection({
  id,
  title,
  emptyMessage,
  suggestions,
  resolvePending,
  onApprove,
  onRejectRequest,
  onEditSuggestion,
  modelCatalog,
}: {
  id: string;
  title: string;
  emptyMessage: string;
  suggestions: ProactiveSuggestion[];
  resolvePending: boolean;
  onApprove: (suggestionId: string) => void;
  onRejectRequest: (s: ProactiveSuggestion) => void;
  onEditSuggestion: (s: ProactiveSuggestion) => void;
  modelCatalog: AssistantModelCatalogData | null;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      <h3 id={id} className="text-base font-semibold text-gray-900 dark:text-white">
        {title}
        <span className="ml-2 text-sm font-normal text-gray-500 tabular-nums">
          ({suggestions.length})
        </span>
      </h3>
      {suggestions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/40 px-6 py-8 text-center dark:border-gray-700 dark:bg-gray-800/20">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden />
          <p className="text-sm text-gray-600 dark:text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <motion.ul
          className="space-y-4"
          variants={shouldReduceMotion ? undefined : pendingListContainerVariants}
          initial={shouldReduceMotion ? false : 'hidden'}
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {suggestions.map((s) => (
              <motion.li
                key={s.id}
                layout={!shouldReduceMotion}
                variants={shouldReduceMotion ? undefined : pendingListItemVariants}
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="show"
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
              >
                <ProactiveSuggestionCard
                  suggestion={s}
                  modelCatalog={modelCatalog}
                  variant="pending"
                  resolvePending={resolvePending}
                  onApprove={() => onApprove(s.id)}
                  onReject={() => onRejectRequest(s)}
                  onEdit={() => onEditSuggestion(s)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

function ExpandablePaginatedSuggestionSection({
  id,
  title,
  description,
  emptyMessage,
  suggestions,
  resolvePending,
  variant,
  onEditRejected,
  onUpdateRejectedFeedback,
  onApproveRejected,
  modelCatalog,
}: {
  id: string;
  title: string;
  description?: string;
  emptyMessage: string;
  suggestions: ProactiveSuggestion[];
  resolvePending: boolean;
  variant: 'approved' | 'rejected';
  onEditRejected?: (s: ProactiveSuggestion) => void;
  onUpdateRejectedFeedback?: (s: ProactiveSuggestion) => void;
  onApproveRejected?: (suggestionId: string) => void;
  modelCatalog: AssistantModelCatalogData | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(suggestions.length / SUGGESTION_HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (safePage - 1) * SUGGESTION_HISTORY_PAGE_SIZE;
    return suggestions.slice(start, start + SUGGESTION_HISTORY_PAGE_SIZE);
  }, [suggestions, safePage]);

  useEffect(() => {
    setPage(1);
  }, [suggestions.length]);

  const panelId = `${id}-panel`;

  return (
    <div className={cn(cardSurfaceClassName, 'overflow-hidden')}>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <ChevronDown
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400',
            isOpen && 'rotate-180'
          )}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h3 id={id} className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
            <span className="ml-2 text-sm font-normal text-gray-500 tabular-nums">
              ({suggestions.length})
            </span>
          </h3>
          {historySectionStatusBadge(variant)}
        </div>
      </button>
      <AnimatedSectionWrapper isVisible={isOpen}>
        <div
          id={panelId}
          className="border-t border-gray-200 px-4 pb-4 pt-3 dark:border-gray-700"
          role="region"
          aria-labelledby={id}
        >
          {description ? (
            <p className="mb-3 text-xs text-gray-600 dark:text-gray-400 max-w-2xl">{description}</p>
          ) : null}
          {suggestions.length === 0 ? (
            <p className="py-1 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
          ) : (
            <>
              <ul className="space-y-3">
                {pageSlice.map((s) => (
                  <li key={s.id}>
                    <ProactiveSuggestionCard
                      suggestion={s}
                      modelCatalog={modelCatalog}
                      variant={variant}
                      resolvePending={resolvePending}
                      onEdit={
                        variant === 'rejected' && onEditRejected
                          ? () => onEditRejected(s)
                          : undefined
                      }
                      onUpdateFeedback={
                        variant === 'rejected' && onUpdateRejectedFeedback
                          ? () => onUpdateRejectedFeedback(s)
                          : undefined
                      }
                      onApproveRejected={
                        variant === 'rejected' && onApproveRejected
                          ? () => onApproveRejected(s.id)
                          : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
              {totalPages > 1 ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
                  <span className="tabular-nums">
                    Page {safePage} of {totalPages}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-lg !px-3 !py-1.5 text-xs"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-lg !px-3 !py-1.5 text-xs"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </AnimatedSectionWrapper>
    </div>
  );
}

function SuggestionsTab({
  isLoading,
  pendingSuggestions,
  acceptedSuggestions,
  rejectedSuggestions,
  resolvePending,
  onApprove,
  onRejectRequest,
  onEditSuggestion,
  onEditRejectedSuggestion,
  onUpdateRejectedFeedback,
  onApproveRejected,
  onBrainstorm,
  brainstormPending,
  brainstormError,
  brainstormStatus,
  brainstormPicker,
  onBrainstormPickerChange,
  brainstormCatalogLoading,
  brainstormModelCatalog,
}: SuggestionsTabProps) {
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const brainstormElapsedMs = useElapsedMsWhile(brainstormPending);
  const brainstormProgress = resolveBrainstormProgress(brainstormElapsedMs, brainstormPending);

  const brainstormModelTriggerLabel = useMemo(() => {
    if (brainstormCatalogLoading || !brainstormModelCatalog) {
      return 'Model: …';
    }
    if (!brainstormModelCatalog.models.length) {
      return 'Model: Unavailable';
    }
    if (brainstormPicker.mode === 'auto') {
      return 'Model: Auto';
    }
    const entry = brainstormModelCatalog.models.find(
      (m) => m.id === brainstormPicker.manualCatalogModelId
    );
    const name = entry?.label ?? brainstormPicker.manualCatalogModelId;
    return `Model: ${name}`;
  }, [
    brainstormCatalogLoading,
    brainstormModelCatalog,
    brainstormPicker.mode,
    brainstormPicker.manualCatalogModelId,
  ]);

  return (
    <section
      aria-labelledby="suggestions-heading"
      aria-busy={brainstormPending || isLoading}
      className="space-y-10"
    >
      <div className="flex w-full flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h2 id="suggestions-heading" className={proactiveSectionHeaderClassName}>
            Suggestions
          </h2>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={cn(
                'w-full shrink-0 sm:w-auto inline-flex items-center justify-center gap-2',
                proactiveActionButtonClassName
              )}
              disabled={brainstormPending}
              onClick={() => setIsPickerModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isPickerModalOpen}
            >
              <Settings2 className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              {brainstormModelTriggerLabel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className={cn('w-full shrink-0 sm:w-auto', proactiveActionButtonClassName)}
              disabled={brainstormPending}
              onClick={onBrainstorm}
            >
              {brainstormPending ? 'Generating…' : 'Generate from my data'}
            </Button>
          </div>
        </div>
        <p className="w-full text-sm text-gray-600 dark:text-gray-400">
          Approve ideas to create automations — history and your workspace guide the next Generate
          run (~30–60s).
        </p>
        <BrainstormProgressStrip
          progress={brainstormProgress}
          reduceMotion={Boolean(shouldReduceMotion)}
        />
      </div>
      <Dialog
        isOpen={isPickerModalOpen}
        onClose={() => setIsPickerModalOpen(false)}
        title="Brainstorm Model"
        size="md"
      >
        <BrainstormModelPicker
          catalog={brainstormModelCatalog}
          isLoading={brainstormCatalogLoading}
          value={brainstormPicker}
          onChange={onBrainstormPickerChange}
          disabled={brainstormPending}
        />
        <div className="mt-6 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className={proactiveActionButtonClassName}
            onClick={() => setIsPickerModalOpen(false)}
          >
            Done
          </Button>
        </div>
      </Dialog>
      {brainstormError ? (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">
          {brainstormError}
        </p>
      ) : null}
      {brainstormStatus ? (
        <p className="text-sm text-green-700 dark:text-green-400 mb-3" role="status">
          {brainstormStatus}
        </p>
      ) : null}
      {isLoading ? (
        <ProactiveSuggestionCardSkeleton />
      ) : pendingSuggestions.length === 0 &&
        acceptedSuggestions.length === 0 &&
        rejectedSuggestions.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No suggestions yet"
          description="Brainstorm automations from your tasks, goals, logbook, and memory."
          actionLabel={brainstormPending ? 'Generating…' : 'Generate from my data'}
          onAction={onBrainstorm}
          actionDisabled={brainstormPending}
          className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
        />
      ) : (
        <>
          <PendingSuggestionSection
            id="pending-suggestions-heading"
            title="Pending"
            emptyMessage="You're caught up — generate again when you want fresh ideas."
            suggestions={pendingSuggestions}
            resolvePending={resolvePending}
            onApprove={onApprove}
            onRejectRequest={onRejectRequest}
            onEditSuggestion={onEditSuggestion}
            modelCatalog={brainstormModelCatalog}
          />
          <ExpandablePaginatedSuggestionSection
            id="accepted-suggestions-heading"
            title="Accepted"
            description="Suggestions you approved (final schedule may differ if you edited before saving)."
            emptyMessage="No accepted suggestions yet."
            suggestions={acceptedSuggestions}
            resolvePending={resolvePending}
            variant="approved"
            modelCatalog={brainstormModelCatalog}
          />
          <ExpandablePaginatedSuggestionSection
            id="rejected-suggestions-heading"
            title="Rejected"
            description="Dismissed ideas remain visible. Feedback you provide is used in future brainstorms."
            emptyMessage="No rejected suggestions yet."
            suggestions={rejectedSuggestions}
            resolvePending={resolvePending}
            variant="rejected"
            onEditRejected={onEditRejectedSuggestion}
            onUpdateRejectedFeedback={onUpdateRejectedFeedback}
            onApproveRejected={onApproveRejected}
            modelCatalog={brainstormModelCatalog}
          />
        </>
      )}
    </section>
  );
}

interface SettingsTabProps {
  emailTestPending: boolean;
  onEmailTest: () => void;
  emailTestError: string | null;
  emailTestMessage: string | null;
  webhookUrl: string;
  webhookFormat: 'discord' | 'generic';
  webhookEnabled: boolean;
  onWebhookUrlChange: (url: string) => void;
  onWebhookFormatChange: (format: 'discord' | 'generic') => void;
  onWebhookEnabledChange: (enabled: boolean) => void;
  webhookSaving: boolean;
  onSaveWebhook: () => void;
  webhookTestPending: boolean;
  onWebhookTest: () => void;
  webhookTestError: string | null;
  webhookTestMessage: string | null;
  webhookSaveError: string | null;
  recoveryEnabled: boolean;
  recoveryEmailEnabled: boolean;
  recoveryWebhookEnabled: boolean;
  onRecoveryEnabledChange: (enabled: boolean) => void;
  onRecoveryEmailEnabledChange: (enabled: boolean) => void;
  onRecoveryWebhookEnabledChange: (enabled: boolean) => void;
  recoverySaving: boolean;
  onSaveRecovery: () => void;
  recoverySaveError: string | null;
  morningNudgeEnabled: boolean;
  morningWindowEnd: string;
  onMorningNudgeEnabledChange: (enabled: boolean) => void;
  onMorningWindowEndChange: (value: string) => void;
  morningNudgeSaving: boolean;
  onSaveMorningNudge: () => void;
  morningNudgeSaveError: string | null;
  coachEscalationEnabled: boolean;
  coachEscalationEmailEnabled: boolean;
  coachEscalationWebhookEnabled: boolean;
  onCoachEscalationEnabledChange: (enabled: boolean) => void;
  onCoachEscalationEmailEnabledChange: (enabled: boolean) => void;
  onCoachEscalationWebhookEnabledChange: (enabled: boolean) => void;
  coachEscalationSaving: boolean;
  onSaveCoachEscalation: () => void;
  coachEscalationSaveError: string | null;
  tz: string;
  zoneOptions: string[];
  onTzChange: (z: string) => void;
  onDetectTz: () => void;
  tzSaving: boolean;
  onSaveTz: () => void;
}

function SettingsTab({
  emailTestPending,
  onEmailTest,
  emailTestError,
  emailTestMessage,
  webhookUrl,
  webhookFormat,
  webhookEnabled,
  onWebhookUrlChange,
  onWebhookFormatChange,
  onWebhookEnabledChange,
  webhookSaving,
  onSaveWebhook,
  webhookTestPending,
  onWebhookTest,
  webhookTestError,
  webhookTestMessage,
  webhookSaveError,
  recoveryEnabled,
  recoveryEmailEnabled,
  recoveryWebhookEnabled,
  onRecoveryEnabledChange,
  onRecoveryEmailEnabledChange,
  onRecoveryWebhookEnabledChange,
  recoverySaving,
  onSaveRecovery,
  recoverySaveError,
  morningNudgeEnabled,
  morningWindowEnd,
  onMorningNudgeEnabledChange,
  onMorningWindowEndChange,
  morningNudgeSaving,
  onSaveMorningNudge,
  morningNudgeSaveError,
  coachEscalationEnabled,
  coachEscalationEmailEnabled,
  coachEscalationWebhookEnabled,
  onCoachEscalationEnabledChange,
  onCoachEscalationEmailEnabledChange,
  onCoachEscalationWebhookEnabledChange,
  coachEscalationSaving,
  onSaveCoachEscalation,
  coachEscalationSaveError,
  tz,
  zoneOptions,
  onTzChange,
  onDetectTz,
  tzSaving,
  onSaveTz,
}: SettingsTabProps) {
  return (
    <section className="space-y-8" aria-labelledby="settings-heading">
      <h2 id="settings-heading" className="sr-only">
        Settings
      </h2>

      <ProactiveSettingsCard
        title="Test email notifications"
        description="Confirm proactive mail reaches your sign-in inbox—check spam if nothing arrives within a few minutes."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg"
            disabled={emailTestPending}
            onClick={onEmailTest}
          >
            {emailTestPending ? 'Sending…' : 'Send test email'}
          </Button>
        }
      >
        {emailTestError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {emailTestError}
          </p>
        ) : null}
        {emailTestMessage ? (
          <p className="text-sm text-green-700 dark:text-green-400" role="status">
            {emailTestMessage}
          </p>
        ) : null}
      </ProactiveSettingsCard>

      <ProactiveSettingsCard
        title="Discord notifications"
        description="Deliver proactive updates to a private channel via webhook; email can stay on too."
        actions={
          <>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="rounded-lg"
              disabled={webhookSaving}
              onClick={onSaveWebhook}
            >
              {webhookSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-lg"
              disabled={webhookTestPending}
              onClick={onWebhookTest}
            >
              {webhookTestPending ? 'Sending…' : 'Send test message'}
            </Button>
          </>
        }
      >
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Discord webhook URL
          <FormInput
            type="url"
            className="mt-1 w-full"
            placeholder="https://discord.com/api/webhooks/…"
            value={webhookUrl}
            onChange={(e) => onWebhookUrlChange(e.target.value)}
            autoComplete="off"
          />
        </label>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Message style
            <Select
              className="mt-1 block min-w-[12rem]"
              value={webhookFormat}
              onChange={(e) => onWebhookFormatChange(e.target.value as 'discord' | 'generic')}
            >
              <option value="discord">Rich card (Discord)</option>
              <option value="generic">Plain text (other apps)</option>
            </Select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <FormCheckbox
              checked={webhookEnabled}
              onChange={(e) => onWebhookEnabledChange(e.target.checked)}
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Turn on Discord notifications
            </span>
          </label>
        </div>
        {webhookSaveError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {webhookSaveError}
          </p>
        ) : null}
        {webhookTestError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {webhookTestError}
          </p>
        ) : null}
        {webhookTestMessage ? (
          <p className="text-sm text-green-700 dark:text-green-400" role="status">
            {webhookTestMessage}
          </p>
        ) : null}
      </ProactiveSettingsCard>

      <StaleEntityHunterSettingsPanel />

      <ProactiveSettingsCard
        title="Low recovery alerts"
        description="One daily heads-up when recovery looks low—on the dashboard, email, or Discord."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="rounded-lg"
            disabled={recoverySaving}
            onClick={onSaveRecovery}
          >
            {recoverySaving ? 'Saving…' : 'Save'}
          </Button>
        }
      >
        <label className="flex items-center gap-2 text-xs">
          <FormCheckbox
            checked={recoveryEnabled}
            onChange={(e) => onRecoveryEnabledChange(e.target.checked)}
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Warn me about low recovery
          </span>
        </label>
        <div className="flex flex-wrap gap-4 pl-1">
          <label className="flex items-center gap-2 text-xs">
            <FormCheckbox
              checked={recoveryEmailEnabled}
              disabled={!recoveryEnabled}
              onChange={(e) => onRecoveryEmailEnabledChange(e.target.checked)}
            />
            <span className="text-gray-700 dark:text-gray-300">Email me</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <FormCheckbox
              checked={recoveryWebhookEnabled}
              disabled={!recoveryEnabled}
              onChange={(e) => onRecoveryWebhookEnabledChange(e.target.checked)}
            />
            <span className="text-gray-700 dark:text-gray-300">Post to Discord</span>
          </label>
        </div>
        {recoverySaveError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {recoverySaveError}
          </p>
        ) : null}
      </ProactiveSettingsCard>

      <ProactiveSettingsCard
        title="Recovery morning nudge"
        description="After your morning window, prompt a quick recovery check-in on Dashboard and Health Overview when today's log is missing."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="rounded-lg"
            disabled={morningNudgeSaving}
            onClick={onSaveMorningNudge}
          >
            {morningNudgeSaving ? 'Saving…' : 'Save'}
          </Button>
        }
      >
        <label className="flex items-center gap-2 text-xs">
          <FormCheckbox
            checked={morningNudgeEnabled}
            onChange={(e) => onMorningNudgeEnabledChange(e.target.checked)}
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Remind me to log recovery
          </span>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-700 dark:text-gray-300">
          <span className="font-medium">Morning window ends (local time)</span>
          <input
            type="time"
            value={morningWindowEnd}
            disabled={!morningNudgeEnabled}
            onChange={(e) => onMorningWindowEndChange(e.target.value)}
            className="max-w-[8rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </label>
        {morningNudgeSaveError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {morningNudgeSaveError}
          </p>
        ) : null}
      </ProactiveSettingsCard>

      <AmbientStrictPlanSettingsPanel />

      <ProactiveSettingsCard
        title="Strict coach escalations"
        description="Pause the admin app until you acknowledge a crossed accountability threshold."
        tone={coachEscalationEnabled ? 'danger' : 'default'}
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="rounded-lg"
            disabled={coachEscalationSaving}
            onClick={onSaveCoachEscalation}
          >
            {coachEscalationSaving ? 'Saving…' : 'Save'}
          </Button>
        }
      >
        <label className="flex items-center gap-2 text-xs">
          <FormCheckbox
            checked={coachEscalationEnabled}
            onChange={(e) => onCoachEscalationEnabledChange(e.target.checked)}
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Enable strict coach escalation notifications
          </span>
        </label>
        <div className="flex flex-wrap gap-4 pl-1">
          <label className="flex items-center gap-2 text-xs">
            <FormCheckbox
              checked={coachEscalationEmailEnabled}
              disabled={!coachEscalationEnabled}
              onChange={(e) => onCoachEscalationEmailEnabledChange(e.target.checked)}
            />
            <span className="text-gray-700 dark:text-gray-300">Email me</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <FormCheckbox
              checked={coachEscalationWebhookEnabled}
              disabled={!coachEscalationEnabled}
              onChange={(e) => onCoachEscalationWebhookEnabledChange(e.target.checked)}
            />
            <span className="text-gray-700 dark:text-gray-300">Post to Discord</span>
          </label>
        </div>
        {coachEscalationSaveError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {coachEscalationSaveError}
          </p>
        ) : null}
      </ProactiveSettingsCard>

      <ProactiveSettingsCard
        title="Default time zone"
        description="Used for new automations; override per schedule anytime."
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-lg"
              onClick={onDetectTz}
            >
              Detect timezone
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="rounded-lg"
              disabled={tzSaving}
              onClick={onSaveTz}
            >
              {tzSaving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <Select
          className="min-w-[14rem] max-w-full"
          value={tz}
          onChange={(e) => onTzChange(e.target.value)}
        >
          {zoneOptions.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </Select>
      </ProactiveSettingsCard>

      <ProactiveSettingsCard
        title="Automation types"
        description="What each kind does when you create an automation."
        tone="reference"
      >
        <ul className={proactiveSettingsReferenceListClassName}>
          {KINDS.map((k) => (
            <li key={k}>
              <span className={proactiveSettingsReferenceLabelClassName}>{KIND_LABELS[k]}</span>
              {' — '}
              {KIND_DESCRIPTIONS[k]}
            </li>
          ))}
        </ul>
      </ProactiveSettingsCard>
    </section>
  );
}

export default function ProactiveAutomationsPage() {
  const shouldReduceMotion = useReducedMotion();
  const qc = useQueryClient();
  const [mainTab, setMainTab] = useState<MainTab>('automations');

  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get('section');
    if (section === 'strictPlan') {
      setMainTab('settings');
    }
  }, []);
  const [draftTimeZone, setDraftTimeZone] = useState<string | null>(null);
  const [tzSaving, setTzSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTestMessage, setEmailTestMessage] = useState<string | null>(null);
  const [emailTestError, setEmailTestError] = useState<string | null>(null);
  const [draftWebhookUrl, setDraftWebhookUrl] = useState<string | null>(null);
  const [draftWebhookFormat, setDraftWebhookFormat] = useState<'discord' | 'generic' | null>(null);
  const [draftWebhookEnabled, setDraftWebhookEnabled] = useState<boolean | null>(null);
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookSaveError, setWebhookSaveError] = useState<string | null>(null);
  const [webhookTestMessage, setWebhookTestMessage] = useState<string | null>(null);
  const [webhookTestError, setWebhookTestError] = useState<string | null>(null);
  const [draftRecoveryEnabled, setDraftRecoveryEnabled] = useState<boolean | null>(null);
  const [draftRecoveryEmailEnabled, setDraftRecoveryEmailEnabled] = useState<boolean | null>(null);
  const [draftRecoveryWebhookEnabled, setDraftRecoveryWebhookEnabled] = useState<boolean | null>(
    null
  );
  const [draftCoachEscalationEnabled, setDraftCoachEscalationEnabled] = useState<boolean | null>(
    null
  );
  const [draftCoachEscalationEmailEnabled, setDraftCoachEscalationEmailEnabled] = useState<
    boolean | null
  >(null);
  const [draftCoachEscalationWebhookEnabled, setDraftCoachEscalationWebhookEnabled] = useState<
    boolean | null
  >(null);
  const [recoverySaving, setRecoverySaving] = useState(false);
  const [recoverySaveError, setRecoverySaveError] = useState<string | null>(null);
  const [draftMorningNudgeEnabled, setDraftMorningNudgeEnabled] = useState<boolean | null>(null);
  const [draftMorningWindowEnd, setDraftMorningWindowEnd] = useState<string | null>(null);
  const [morningNudgeSaving, setMorningNudgeSaving] = useState(false);
  const [morningNudgeSaveError, setMorningNudgeSaveError] = useState<string | null>(null);
  const [coachEscalationSaving, setCoachEscalationSaving] = useState(false);
  const [coachEscalationSaveError, setCoachEscalationSaveError] = useState<string | null>(null);
  const [singleRunFeedback, setSingleRunFeedback] = useState<{
    variant: 'success' | 'error';
    message: string;
  } | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'suggestion' | 'rejectedSuggestion'>(
    'create'
  );
  const [editingAutomation, setEditingAutomation] = useState<ProactiveAutomation | null>(null);
  const [suggestionEditId, setSuggestionEditId] = useState<string | null>(null);
  const [suggestionFormPayload, setSuggestionFormPayload] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [automationFormKey, setAutomationFormKey] = useState(0);
  const [brainstormError, setBrainstormError] = useState<string | null>(null);
  const [brainstormStatus, setBrainstormStatus] = useState<string | null>(null);
  const [brainstormPicker, setBrainstormPicker] = useState<BrainstormModelPickerValue>({
    mode: 'auto',
    manualCatalogModelId: '',
  });
  const [historyAutomation, setHistoryAutomation] = useState<ProactiveAutomation | null>(null);
  const [rejectSuggestionTarget, setRejectSuggestionTarget] = useState<ProactiveSuggestion | null>(
    null
  );
  const [updateFeedbackTarget, setUpdateFeedbackTarget] = useState<ProactiveSuggestion | null>(
    null
  );

  const {
    timeZone: timeZonePrefQ,
    webhook: notificationWebhookQ,
    recovery: recoveryNotificationsQ,
    recoveryMorningNudge: recoveryMorningNudgeQ,
    coachEscalation: coachEscalationNotificationsQ,
  } = useProactiveSettings();

  const savedTimeZone = timeZonePrefQ.data?.timeZone ?? 'UTC';
  const tz = draftTimeZone ?? savedTimeZone;

  const savedWebhook = notificationWebhookQ.data ?? {
    url: null,
    format: 'discord' as const,
    enabled: false,
  };
  const webhookUrl = draftWebhookUrl ?? savedWebhook.url ?? '';
  const webhookFormat = draftWebhookFormat ?? savedWebhook.format ?? 'discord';
  const webhookEnabled = draftWebhookEnabled ?? savedWebhook.enabled ?? false;

  const savedRecovery = recoveryNotificationsQ.data ?? {
    enabled: false,
    channelEmailEnabled: true,
    channelWebhookEnabled: false,
  };
  const recoveryEnabled = draftRecoveryEnabled ?? savedRecovery.enabled ?? false;
  const recoveryEmailEnabled =
    draftRecoveryEmailEnabled ?? savedRecovery.channelEmailEnabled ?? true;
  const recoveryWebhookEnabled =
    draftRecoveryWebhookEnabled ?? savedRecovery.channelWebhookEnabled ?? false;

  const savedMorningNudge = recoveryMorningNudgeQ.data ?? {
    enabled: true,
    morningWindowEnd: '10:00',
  };
  const morningNudgeEnabled = draftMorningNudgeEnabled ?? savedMorningNudge.enabled ?? true;
  const morningWindowEnd = draftMorningWindowEnd ?? savedMorningNudge.morningWindowEnd ?? '10:00';

  const savedCoachEscalation = coachEscalationNotificationsQ.data ?? {
    enabled: true,
    channelEmailEnabled: true,
    channelWebhookEnabled: false,
  };
  const coachEscalationEnabled =
    draftCoachEscalationEnabled ?? savedCoachEscalation.enabled ?? true;
  const coachEscalationEmailEnabled =
    draftCoachEscalationEmailEnabled ?? savedCoachEscalation.channelEmailEnabled ?? true;
  const coachEscalationWebhookEnabled =
    draftCoachEscalationWebhookEnabled ?? savedCoachEscalation.channelWebhookEnabled ?? false;

  const automationsQ = useProactiveAutomations();
  const suggestionsQ = useProactiveSuggestions();

  const needsAssistantModelCatalog = mainTab === 'suggestions' || formModalOpen;

  const brainstormModelCatalogQ = useQuery({
    queryKey: queryKeys.chatbot.modelCatalog(),
    queryFn: () => chatbotService.getAssistantModelCatalog(),
    enabled: needsAssistantModelCatalog,
  });

  useEffect(() => {
    const data = brainstormModelCatalogQ.data;
    if (!data?.models.length) return;
    const fallback = data.defaults.defaultReasoningModelId || data.models[0].id;
    setBrainstormPicker((p) => {
      if (p.mode !== 'manual') return p;
      if (p.manualCatalogModelId && data.models.some((m) => m.id === p.manualCatalogModelId)) {
        return p;
      }
      return { ...p, manualCatalogModelId: fallback };
    });
  }, [brainstormModelCatalogQ.data]);

  const automations = automationsQ.data ?? [];
  const zoneOptions = useMemo(
    () =>
      mergeZoneOptions([tz, savedTimeZone, ...(automationsQ.data ?? []).map((a) => a.timeZone)]),
    [tz, savedTimeZone, automationsQ.data]
  );

  const saveTz = async () => {
    setTzSaving(true);
    const res = await proactiveService.setTimeZone({ timeZone: tz });
    setTzSaving(false);
    if (!res.success) {
      setFormError(res.error?.message ?? 'Failed to save time zone');
      return;
    }
    setDraftTimeZone(null);
    void qc.invalidateQueries({ queryKey: queryKeys.preferences.timeZone() });
  };

  const saveWebhook = async () => {
    setWebhookSaving(true);
    setWebhookSaveError(null);
    const res = await proactiveService.setNotificationWebhook({
      url: webhookUrl.trim() || null,
      format: webhookFormat,
      enabled: webhookEnabled,
    });
    setWebhookSaving(false);
    if (!res.success) {
      setWebhookSaveError(res.error?.message ?? 'Failed to save webhook settings');
      return;
    }
    setDraftWebhookUrl(null);
    setDraftWebhookFormat(null);
    setDraftWebhookEnabled(null);
    void qc.invalidateQueries({ queryKey: queryKeys.preferences.notificationWebhook() });
  };

  const saveRecovery = async () => {
    setRecoverySaving(true);
    setRecoverySaveError(null);
    const res = await proactiveService.setRecoveryNotifications({
      enabled: recoveryEnabled,
      channelEmailEnabled: recoveryEmailEnabled,
      channelWebhookEnabled: recoveryWebhookEnabled,
    });
    setRecoverySaving(false);
    if (!res.success) {
      setRecoverySaveError(res.error?.message ?? 'Failed to save recovery notifications');
      return;
    }
    setDraftRecoveryEnabled(null);
    setDraftRecoveryEmailEnabled(null);
    setDraftRecoveryWebhookEnabled(null);
    void qc.invalidateQueries({ queryKey: queryKeys.preferences.recoveryNotifications() });
  };

  const saveMorningNudge = async () => {
    setMorningNudgeSaving(true);
    setMorningNudgeSaveError(null);
    const res = await proactiveService.setRecoveryMorningNudge({
      enabled: morningNudgeEnabled,
      morningWindowEnd: morningWindowEnd,
    });
    setMorningNudgeSaving(false);
    if (!res.success) {
      setMorningNudgeSaveError(res.error?.message ?? 'Failed to save recovery morning nudge');
      return;
    }
    setDraftMorningNudgeEnabled(null);
    setDraftMorningWindowEnd(null);
    void qc.invalidateQueries({ queryKey: queryKeys.preferences.recoveryMorningNudge() });
  };

  const saveCoachEscalation = async () => {
    setCoachEscalationSaving(true);
    setCoachEscalationSaveError(null);
    const res = await proactiveService.setCoachEscalationNotifications({
      enabled: coachEscalationEnabled,
      channelEmailEnabled: coachEscalationEmailEnabled,
      channelWebhookEnabled: coachEscalationWebhookEnabled,
    });
    setCoachEscalationSaving(false);
    if (!res.success) {
      setCoachEscalationSaveError(
        res.error?.message ?? 'Failed to save coach escalation notifications'
      );
      return;
    }
    setDraftCoachEscalationEnabled(null);
    setDraftCoachEscalationEmailEnabled(null);
    setDraftCoachEscalationWebhookEnabled(null);
    void qc.invalidateQueries({
      queryKey: queryKeys.preferences.coachEscalationNotifications(),
    });
  };

  const createMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await proactiveService.createAutomation(body);
      if (!res.success) throw new Error(res.error?.message ?? 'Create failed');
      return res.data;
    },
    onSuccess: () => {
      setFormError(null);
      setFormModalOpen(false);
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.automations() });
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const res = await proactiveService.updateAutomation(id, body);
      if (!res.success) throw new Error(res.error?.message ?? 'Update failed');
      return res.data;
    },
    onSuccess: () => {
      setFormError(null);
      setFormModalOpen(false);
      setEditingAutomation(null);
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.automations() });
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await proactiveService.updateAutomation(id, { enabled });
      if (!res.success) throw new Error(res.error?.message ?? 'Update failed');
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.proactive.automations() }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await proactiveService.deleteAutomation(id);
      if (!res.success) throw new Error(res.error?.message ?? 'Delete failed');
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.proactive.automations() }),
  });

  const resolveMut = useMutation({
    mutationFn: async (payload: {
      id: string;
      approve: boolean;
      feedback?: string;
      resolvedPayload?: Record<string, unknown>;
    }) => {
      const res = await proactiveService.resolveSuggestion(payload.id, {
        approve: payload.approve,
        ...(payload.feedback ? { feedback: payload.feedback } : {}),
        ...(payload.resolvedPayload ? { resolvedPayload: payload.resolvedPayload } : {}),
      });
      if (!res.success) throw new Error(res.error?.message ?? 'Resolve failed');
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.suggestions() });
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.automations() });
    },
  });

  const suggestionWorkflowMut = useMutation({
    mutationFn: async ({
      body,
      suggestionId,
    }: {
      body: Record<string, unknown>;
      suggestionId: string;
    }) => {
      const res = await proactiveService.resolveSuggestion(suggestionId, {
        approve: true,
        resolvedPayload: body,
      });
      if (!res.success) throw new Error(res.error?.message ?? 'Could not approve suggestion');
    },
    onSuccess: () => {
      setFormError(null);
      setFormModalOpen(false);
      setEditingAutomation(null);
      setSuggestionEditId(null);
      setSuggestionFormPayload(null);
      setFormMode('create');
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.automations() });
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.suggestions() });
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const patchSuggestionMut = useMutation({
    mutationFn: async (args: {
      id: string;
      body: { feedback?: string; proposedPayload?: Record<string, unknown> };
    }) => {
      const res = await proactiveService.patchSuggestion(args.id, args.body);
      if (!res.success) throw new Error(res.error?.message ?? 'Update failed');
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.suggestions() });
    },
  });

  const brainstormMut = useMutation({
    mutationFn: async (picker: BrainstormModelPickerValue) => {
      const res = await proactiveService.brainstormSuggestions({
        timeZone: savedTimeZone,
        model: brainstormValueToApiModelField(picker),
      });
      if (!res.success || !res.data) throw new Error(res.error?.message ?? 'Suggestion run failed');
      return res.data;
    },
    onSuccess: (data) => {
      setBrainstormError(null);
      const skipped = data.skipped.length;
      setBrainstormStatus(
        `Added ${data.created.length} suggestion(s)${skipped ? ` (${skipped} skipped)` : ''} via ${data.model}. ` +
          `Context: ${data.contextStats.taskCount} tasks, ${data.contextStats.goalCount} goals, ` +
          `${data.contextStats.memorySnippetCount} memory hits, ${data.contextStats.existingAutomationCount} existing automations.`
      );
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.suggestions() });
    },
    onError: (e: Error) => {
      setBrainstormStatus(null);
      setBrainstormError(e.message);
    },
  });

  const emailTestMut = useMutation({
    mutationFn: async () => {
      const res = await proactiveService.sendTestEmail();
      if (!res.success || !res.data) throw new Error(res.error?.message ?? 'Test email failed');
      return res.data;
    },
    onSuccess: (data) => {
      setEmailTestError(null);
      setEmailTestMessage(
        `Request succeeded — SES accepted the message for ${data.sentTo}${
          data.messageId ? ` (message id: ${data.messageId})` : ''
        }. Stage ${data.deployedStage}: open thread ${data.threadId} and reply to the email to verify inbound routing. If nothing appears in the inbox, check spam and SES suppression lists.`
      );
    },
    onError: (e: Error) => {
      setEmailTestMessage(null);
      setEmailTestError(e.message);
    },
  });

  const webhookTestMut = useMutation({
    mutationFn: async () => {
      const res = await proactiveService.sendTestWebhook();
      if (!res.success || !res.data) throw new Error(res.error?.message ?? 'Test webhook failed');
      return res.data;
    },
    onSuccess: (data) => {
      setWebhookTestError(null);
      setWebhookTestMessage(
        `Webhook delivered (${data.deliveredTo}) on stage ${data.deployedStage}. Check your channel for the test message.`
      );
    },
    onError: (e: Error) => {
      setWebhookTestMessage(null);
      setWebhookTestError(e.message);
    },
  });

  const singleDispatchMut = useMutation({
    mutationFn: async (automationId: string) => {
      const res = await proactiveService.runAutomationDispatchTest(automationId);
      if (!res.success || !res.data) throw new Error(res.error?.message ?? 'Run failed');
      return res.data;
    },
    onSuccess: (data, automationId) => {
      const errCount = data.errors.length;
      if (errCount === 0) {
        setSingleRunFeedback({
          variant: 'success',
          message: `Ran automation successfully (${data.ran} run).`,
        });
      } else {
        setSingleRunFeedback({
          variant: 'error',
          message: data.errors[0]?.error ?? 'Run failed',
        });
      }
      setFormError(null);
      void qc.invalidateQueries({ queryKey: queryKeys.proactive.automations() });
      if (automationId) {
        void qc.invalidateQueries({ queryKey: queryKeys.proactive.automationRuns(automationId) });
      }
    },
    onError: (e: Error) => {
      setSingleRunFeedback(null);
      setFormError(e.message);
    },
  });

  const {
    pending: pendingSuggestions,
    accepted: acceptedSuggestions,
    rejected: rejectedSuggestions,
  } = useMemo(() => partitionProactiveSuggestions(suggestionsQ.data ?? []), [suggestionsQ.data]);

  const openCreateModal = () => {
    setFormError(null);
    setFormMode('create');
    setEditingAutomation(null);
    setSuggestionEditId(null);
    setSuggestionFormPayload(null);
    setAutomationFormKey((k) => k + 1);
    setFormModalOpen(true);
  };

  const openEditModal = (a: ProactiveAutomation) => {
    setFormError(null);
    setFormMode('edit');
    setEditingAutomation(a);
    setSuggestionEditId(null);
    setSuggestionFormPayload(null);
    setAutomationFormKey((k) => k + 1);
    setFormModalOpen(true);
  };

  const openSuggestionEditModal = (s: ProactiveSuggestion) => {
    setFormError(null);
    setFormMode('suggestion');
    setEditingAutomation(null);
    setSuggestionEditId(s.id);
    const raw = s.proposedPayload;
    setSuggestionFormPayload(
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? { ...(raw as Record<string, unknown>) }
        : {}
    );
    setAutomationFormKey((k) => k + 1);
    setFormModalOpen(true);
  };

  const openRejectedSuggestionEditModal = (s: ProactiveSuggestion) => {
    setFormError(null);
    setFormMode('rejectedSuggestion');
    setEditingAutomation(null);
    setSuggestionEditId(s.id);
    const raw = s.proposedPayload;
    setSuggestionFormPayload(
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? { ...(raw as Record<string, unknown>) }
        : {}
    );
    setAutomationFormKey((k) => k + 1);
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (
      createMut.isPending ||
      updateMut.isPending ||
      suggestionWorkflowMut.isPending ||
      patchSuggestionMut.isPending
    )
      return;
    setFormModalOpen(false);
    setEditingAutomation(null);
    setSuggestionEditId(null);
    setSuggestionFormPayload(null);
    setFormMode('create');
  };

  const handleFormSubmit = (body: Record<string, unknown>) => {
    setFormError(null);
    if ((formMode === 'suggestion' || formMode === 'rejectedSuggestion') && suggestionFormPayload) {
      const reasoning = suggestionFormPayload.reasoning;
      if (typeof reasoning === 'string' && reasoning.trim() && body.reasoning === undefined) {
        body.reasoning = reasoning.trim();
      }
    }
    if (formMode === 'rejectedSuggestion' && suggestionEditId) {
      patchSuggestionMut.mutate(
        { id: suggestionEditId, body: { proposedPayload: body } },
        {
          onSuccess: () => {
            setFormError(null);
            setFormModalOpen(false);
            setSuggestionEditId(null);
            setSuggestionFormPayload(null);
            setFormMode('create');
          },
          onError: (e: Error) => setFormError(e.message),
        }
      );
    } else if (formMode === 'suggestion' && suggestionEditId) {
      suggestionWorkflowMut.mutate({ body, suggestionId: suggestionEditId });
    } else if (formMode === 'create') {
      createMut.mutate(body);
    } else if (formMode === 'edit' && editingAutomation) {
      updateMut.mutate({ id: editingAutomation.id, body });
    }
  };

  const tabs: Array<{ id: MainTab; label: string; badge?: number }> = [
    { id: 'automations', label: 'Automations' },
    { id: 'suggestions', label: 'Suggestions', badge: pendingSuggestions.length },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain">
      <PageContainer width="narrow" className="flex flex-1 flex-col pb-12 pt-20 lg:pt-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Proactive assistant
          </h1>
          <p className="mt-1 w-full text-sm text-gray-600 dark:text-gray-400">
            Get a morning briefing and an evening logbook check-in on your schedule. When each
            automation runs, the assistant prepares an update you can open here in the app. Turn on
            email to receive a short summary with a link back—and reply to keep the conversation
            going.
          </p>
        </header>

        <div
          className="mb-6 flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800/80"
          role="tablist"
          aria-label="Proactive assistant sections"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={PROACTIVE_TAB_BUTTON_ID[tab.id]}
              aria-selected={mainTab === tab.id}
              aria-controls={PROACTIVE_TAB_PANEL_ID[tab.id]}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                mainTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              )}
              onClick={() => setMainTab(tab.id)}
            >
              {tab.label}
              {tab.badge != null && tab.badge > 0 ? (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs tabular-nums text-primary">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {formError ? (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {formError}
          </p>
        ) : null}

        {singleRunFeedback ? (
          <p
            className={
              singleRunFeedback.variant === 'success'
                ? 'mb-4 text-sm text-green-700 dark:text-green-400'
                : 'mb-4 text-sm text-red-600 dark:text-red-400'
            }
            role="status"
          >
            {singleRunFeedback.message}
          </p>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={mainTab}
            id={PROACTIVE_TAB_PANEL_ID[mainTab]}
            role="tabpanel"
            aria-labelledby={PROACTIVE_TAB_BUTTON_ID[mainTab]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : TAB_FADE_DURATION_S }}
            className="min-w-0"
          >
            {mainTab === 'automations' ? (
              <AutomationsTab
                isLoading={automationsQ.isPending}
                automations={automations}
                modelCatalog={brainstormModelCatalogQ.data ?? null}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onTestRun={(a) => {
                  setSingleRunFeedback(null);
                  singleDispatchMut.mutate(a.id);
                }}
                testRunPendingId={
                  singleDispatchMut.isPending && singleDispatchMut.variables
                    ? singleDispatchMut.variables
                    : undefined
                }
                onToggle={(id, enabled) => toggleMut.mutate({ id, enabled })}
                togglePending={toggleMut.isPending}
                onDelete={(id) => {
                  if (confirm('Delete this automation?')) deleteMut.mutate(id);
                }}
                deletePending={deleteMut.isPending}
                onOpenHistory={(a) => setHistoryAutomation(a)}
              />
            ) : null}

            {mainTab === 'suggestions' ? (
              <SuggestionsTab
                isLoading={suggestionsQ.isPending}
                pendingSuggestions={pendingSuggestions}
                acceptedSuggestions={acceptedSuggestions}
                rejectedSuggestions={rejectedSuggestions}
                resolvePending={
                  resolveMut.isPending ||
                  suggestionWorkflowMut.isPending ||
                  patchSuggestionMut.isPending
                }
                onApprove={(id) => resolveMut.mutate({ id, approve: true })}
                onRejectRequest={(s) => setRejectSuggestionTarget(s)}
                onEditSuggestion={openSuggestionEditModal}
                onEditRejectedSuggestion={openRejectedSuggestionEditModal}
                onUpdateRejectedFeedback={(s) => {
                  setFormError(null);
                  setUpdateFeedbackTarget(s);
                }}
                onApproveRejected={(id) => resolveMut.mutate({ id, approve: true })}
                onBrainstorm={() => {
                  setBrainstormError(null);
                  setBrainstormStatus(null);
                  brainstormMut.mutate(brainstormPicker);
                }}
                brainstormPending={brainstormMut.isPending}
                brainstormError={brainstormError}
                brainstormStatus={brainstormStatus}
                brainstormPicker={brainstormPicker}
                onBrainstormPickerChange={setBrainstormPicker}
                brainstormCatalogLoading={brainstormModelCatalogQ.isLoading}
                brainstormModelCatalog={brainstormModelCatalogQ.data ?? null}
              />
            ) : null}

            {mainTab === 'settings' ? (
              <SettingsTab
                emailTestPending={emailTestMut.isPending}
                onEmailTest={() => {
                  setEmailTestMessage(null);
                  setEmailTestError(null);
                  emailTestMut.mutate();
                }}
                emailTestError={emailTestError}
                emailTestMessage={emailTestMessage}
                webhookUrl={webhookUrl}
                webhookFormat={webhookFormat}
                webhookEnabled={webhookEnabled}
                onWebhookUrlChange={setDraftWebhookUrl}
                onWebhookFormatChange={setDraftWebhookFormat}
                onWebhookEnabledChange={setDraftWebhookEnabled}
                webhookSaving={webhookSaving}
                onSaveWebhook={() => void saveWebhook()}
                webhookTestPending={webhookTestMut.isPending}
                onWebhookTest={() => {
                  setWebhookTestMessage(null);
                  setWebhookTestError(null);
                  webhookTestMut.mutate();
                }}
                webhookTestError={webhookTestError}
                webhookTestMessage={webhookTestMessage}
                webhookSaveError={webhookSaveError}
                recoveryEnabled={recoveryEnabled}
                recoveryEmailEnabled={recoveryEmailEnabled}
                recoveryWebhookEnabled={recoveryWebhookEnabled}
                onRecoveryEnabledChange={setDraftRecoveryEnabled}
                onRecoveryEmailEnabledChange={setDraftRecoveryEmailEnabled}
                onRecoveryWebhookEnabledChange={setDraftRecoveryWebhookEnabled}
                recoverySaving={recoverySaving}
                onSaveRecovery={() => void saveRecovery()}
                recoverySaveError={recoverySaveError}
                morningNudgeEnabled={morningNudgeEnabled}
                morningWindowEnd={morningWindowEnd}
                onMorningNudgeEnabledChange={setDraftMorningNudgeEnabled}
                onMorningWindowEndChange={setDraftMorningWindowEnd}
                morningNudgeSaving={morningNudgeSaving}
                onSaveMorningNudge={() => void saveMorningNudge()}
                morningNudgeSaveError={morningNudgeSaveError}
                coachEscalationEnabled={coachEscalationEnabled}
                coachEscalationEmailEnabled={coachEscalationEmailEnabled}
                coachEscalationWebhookEnabled={coachEscalationWebhookEnabled}
                onCoachEscalationEnabledChange={setDraftCoachEscalationEnabled}
                onCoachEscalationEmailEnabledChange={setDraftCoachEscalationEmailEnabled}
                onCoachEscalationWebhookEnabledChange={setDraftCoachEscalationWebhookEnabled}
                coachEscalationSaving={coachEscalationSaving}
                onSaveCoachEscalation={() => void saveCoachEscalation()}
                coachEscalationSaveError={coachEscalationSaveError}
                tz={tz}
                zoneOptions={zoneOptions}
                onTzChange={setDraftTimeZone}
                onDetectTz={() => setDraftTimeZone(detectBrowserTimeZone())}
                tzSaving={tzSaving}
                onSaveTz={() => void saveTz()}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        <AutomationFormModal
          isOpen={formModalOpen}
          onClose={closeFormModal}
          mode={formMode}
          initialAutomation={editingAutomation}
          suggestionPayload={
            formMode === 'suggestion' || formMode === 'rejectedSuggestion'
              ? suggestionFormPayload
              : null
          }
          zoneOptions={zoneOptions}
          defaultTimeZone={savedTimeZone}
          formKey={automationFormKey}
          modelCatalog={brainstormModelCatalogQ.data ?? null}
          isModelCatalogLoading={brainstormModelCatalogQ.isLoading}
          saving={
            createMut.isPending ||
            updateMut.isPending ||
            suggestionWorkflowMut.isPending ||
            patchSuggestionMut.isPending
          }
          onSubmit={handleFormSubmit}
        />

        <AutomationRunHistoryDialog
          isOpen={historyAutomation !== null}
          onClose={() => setHistoryAutomation(null)}
          automation={historyAutomation}
          kindLabel={historyAutomation ? KIND_LABELS[historyAutomation.kind] : ''}
        />

        <RejectSuggestionDialog
          isOpen={rejectSuggestionTarget !== null}
          suggestion={rejectSuggestionTarget}
          onClose={() => {
            if (!resolveMut.isPending) setRejectSuggestionTarget(null);
          }}
          isSubmitting={resolveMut.isPending}
          onConfirm={(feedback) => {
            if (!rejectSuggestionTarget) return;
            const id = rejectSuggestionTarget.id;
            resolveMut.mutate(
              { id, approve: false, ...(feedback ? { feedback } : {}) },
              { onSuccess: () => setRejectSuggestionTarget(null) }
            );
          }}
        />

        <UpdateSuggestionFeedbackDialog
          isOpen={updateFeedbackTarget !== null}
          suggestion={updateFeedbackTarget}
          onClose={() => {
            if (!patchSuggestionMut.isPending) setUpdateFeedbackTarget(null);
          }}
          isSubmitting={patchSuggestionMut.isPending}
          onSave={(feedback) => {
            if (!updateFeedbackTarget) return;
            setFormError(null);
            patchSuggestionMut.mutate(
              { id: updateFeedbackTarget.id, body: { feedback: feedback.trim() } },
              {
                onSuccess: () => setUpdateFeedbackTarget(null),
                onError: (e: Error) => setFormError(e.message),
              }
            );
          }}
        />
      </PageContainer>
    </div>
  );
}
