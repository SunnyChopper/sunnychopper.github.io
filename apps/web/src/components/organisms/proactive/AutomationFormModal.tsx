import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { detectBrowserTimeZone } from '@/lib/iana-time-zones';
import { AssistantRunConfigPickerForm } from '@/components/organisms/assistant/AssistantRunConfigPickerForm';
import {
  modelPickerDraftFromRunConfig,
  runConfigFromModelPickerDraft,
  type ModelPickerDraft,
} from '@/lib/assistant/run-config-picker-draft';
import Dialog from '@/components/molecules/Dialog';
import Button from '@/components/atoms/Button';
import { parseProactiveAssistantRunConfigFromUnknown } from '@/lib/proactive/assistant-run-config';
import {
  automationFormSnapshotsEqual,
  buildAutomationFormSnapshot,
  type AutomationFormSnapshot,
} from '@/lib/proactive/automation-form-snapshot';
import { isValidProactiveLocalTime } from '@/lib/proactive/format-proactive-time';
import type {
  ProactiveAssistantRunConfig,
  ProactiveAutomation,
  ProactiveAutomationKind,
  ProactiveThreadStrategy,
} from '@/types/api-contracts';
import type { AssistantModelCatalogData } from '@/types/chatbot';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { cn } from '@/lib/utils';

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

/** Monday = 0 … Sunday = 6 (API). */
const WEEKDAY_OPTS: { value: number; label: string }[] = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
];

const fieldInputClassName =
  'border rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600';
const fieldErrorClassName = 'text-xs text-red-600 dark:text-red-400';

export interface AutomationFormDefaults {
  kind: ProactiveAutomationKind;
  localTime: string;
  timeZone: string;
  customUserPrompt: string;
  threadStrategy: ProactiveThreadStrategy;
  channelEmailEnabled: boolean;
  channelWebhookEnabled: boolean;
  title: string;
  /** Selected weekday indices; empty means every day (omit `daysOfWeek` on save). */
  daysOfWeek: number[];
  assistantRunConfig: ProactiveAssistantRunConfig | null;
}

function readKindFromPayload(payload: Record<string, unknown>): ProactiveAutomationKind {
  const k = payload.kind;
  if (
    k === 'dailyBriefing' ||
    k === 'logbookEvening' ||
    k === 'tomorrowPrep' ||
    k === 'staleEntityHunter' ||
    k === 'custom' ||
    k === 'dailyLearningTrends' ||
    k === 'dailyLearningTheory'
  )
    return k;
  return 'custom';
}

function readDaysFromPayload(payload: Record<string, unknown>): number[] {
  const raw = payload.daysOfWeek ?? payload.daysofWeek;
  if (!Array.isArray(raw)) return [];
  const out: number[] = [];
  for (const x of raw) {
    if (typeof x === 'number' && Number.isInteger(x) && x >= 0 && x <= 6) {
      out.push(x);
      continue;
    }
    const n = Number.parseInt(String(x), 10);
    if (Number.isInteger(n) && n >= 0 && n <= 6) out.push(n);
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

function buildDefaults(
  mode: 'create' | 'edit' | 'suggestion' | 'rejectedSuggestion',
  initialAutomation: ProactiveAutomation | null,
  suggestionPayload: Record<string, unknown> | null,
  defaultTimeZone: string
): AutomationFormDefaults {
  if (mode === 'edit' && initialAutomation) {
    return {
      kind: initialAutomation.kind,
      localTime: initialAutomation.localTime,
      timeZone: initialAutomation.timeZone,
      customUserPrompt: initialAutomation.customUserPrompt ?? '',
      threadStrategy: initialAutomation.threadStrategy,
      channelEmailEnabled: initialAutomation.channelEmailEnabled,
      channelWebhookEnabled: initialAutomation.channelWebhookEnabled,
      title: (initialAutomation.title ?? '').trim(),
      daysOfWeek: [...(initialAutomation.daysOfWeek ?? [])].filter(
        (d) => Number.isInteger(d) && d >= 0 && d <= 6
      ),
      assistantRunConfig: initialAutomation.assistantRunConfig ?? null,
    };
  }
  if ((mode === 'suggestion' || mode === 'rejectedSuggestion') && suggestionPayload) {
    const k = readKindFromPayload(suggestionPayload);
    const lt =
      typeof suggestionPayload.localTime === 'string' ? suggestionPayload.localTime : '08:00';
    const tz =
      typeof suggestionPayload.timeZone === 'string' ? suggestionPayload.timeZone : defaultTimeZone;
    const ts =
      suggestionPayload.threadStrategy === 'newThreadEachRun' ||
      suggestionPayload.threadStrategy === 'reuseFixedThread'
        ? suggestionPayload.threadStrategy
        : 'reuseFixedThread';
    const ce = suggestionPayload.channelEmailEnabled;
    const cw = suggestionPayload.channelWebhookEnabled;
    const prompt =
      typeof suggestionPayload.customUserPrompt === 'string'
        ? suggestionPayload.customUserPrompt
        : '';
    const title = typeof suggestionPayload.title === 'string' ? suggestionPayload.title.trim() : '';
    return {
      kind: k,
      localTime: lt,
      timeZone: tz,
      customUserPrompt: prompt,
      threadStrategy: ts,
      channelEmailEnabled: typeof ce === 'boolean' ? ce : true,
      channelWebhookEnabled: typeof cw === 'boolean' ? cw : false,
      title,
      daysOfWeek: readDaysFromPayload(suggestionPayload),
      assistantRunConfig: parseProactiveAssistantRunConfigFromUnknown(
        suggestionPayload.assistantRunConfig
      ),
    };
  }
  return {
    kind: 'dailyBriefing',
    localTime: '08:00',
    timeZone: defaultTimeZone,
    customUserPrompt: '',
    threadStrategy: 'reuseFixedThread',
    channelEmailEnabled: true,
    channelWebhookEnabled: false,
    title: '',
    daysOfWeek: [],
    assistantRunConfig: null,
  };
}

function FormSection({
  title,
  description,
  first = false,
  children,
}: {
  title: string;
  description?: string;
  first?: boolean;
  children: ReactNode;
}) {
  const sectionId = `automation-section-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <section
      className={cn('space-y-3', !first && 'border-t border-gray-200 dark:border-gray-700 pt-4')}
      aria-labelledby={sectionId}
    >
      <div>
        <h4 id={sectionId} className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h4>
        {description ? (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

interface AutomationFormFieldsProps {
  mode: 'create' | 'edit' | 'suggestion' | 'rejectedSuggestion';
  defaults: AutomationFormDefaults;
  zoneOptions: string[];
  modelCatalog: AssistantModelCatalogData | null;
  isModelCatalogLoading: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void | Promise<void>;
  render: (parts: { body: ReactNode; footer: ReactNode }) => ReactNode;
}

function AutomationFormFields({
  mode,
  defaults,
  zoneOptions,
  modelCatalog,
  isModelCatalogLoading,
  saving,
  onClose,
  onSubmit,
  render,
}: AutomationFormFieldsProps) {
  const [kind, setKind] = useState<ProactiveAutomationKind>(defaults.kind);
  const [localTime, setLocalTime] = useState(defaults.localTime);
  const [timeZone, setTimeZone] = useState(defaults.timeZone);
  const [customUserPrompt, setCustomUserPrompt] = useState(defaults.customUserPrompt);
  const [threadStrategy, setThreadStrategy] = useState<ProactiveThreadStrategy>(
    defaults.threadStrategy
  );
  const [channelEmailEnabled, setChannelEmailEnabled] = useState(defaults.channelEmailEnabled);
  const [channelWebhookEnabled, setChannelWebhookEnabled] = useState(
    defaults.channelWebhookEnabled
  );
  const [title, setTitle] = useState(defaults.title);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(defaults.daysOfWeek);
  const [modelDraft, setModelDraft] = useState<ModelPickerDraft>(() =>
    modelPickerDraftFromRunConfig(defaults.assistantRunConfig, null)
  );
  const [baseline, setBaseline] = useState<AutomationFormSnapshot | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [promptTouched, setPromptTouched] = useState(false);
  const [localTimeTouched, setLocalTimeTouched] = useState(false);

  const catalogReady = Boolean(modelCatalog?.models.length);
  const catalogSyncedRef = useRef(false);
  /* Catalog often loads after first paint; hydrate draft from defaults once per modal open. */
  useEffect(() => {
    if (!catalogReady) {
      catalogSyncedRef.current = false;
      return;
    }
    if (catalogSyncedRef.current) return;
    catalogSyncedRef.current = true;
    const hydratedDraft = modelPickerDraftFromRunConfig(defaults.assistantRunConfig, modelCatalog);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync when async catalog first becomes available
    setModelDraft(hydratedDraft);
    setBaseline(
      buildAutomationFormSnapshot({
        kind: defaults.kind,
        localTime: defaults.localTime,
        timeZone: defaults.timeZone,
        customUserPrompt: defaults.customUserPrompt,
        threadStrategy: defaults.threadStrategy,
        channelEmailEnabled: defaults.channelEmailEnabled,
        channelWebhookEnabled: defaults.channelWebhookEnabled,
        title: defaults.title,
        daysOfWeek: defaults.daysOfWeek,
        modelDraft: hydratedDraft,
      })
    );
  }, [catalogReady, defaults, modelCatalog]);

  useEffect(() => {
    if (!modelCatalog?.models.length) return;
    const ids = new Set(modelCatalog.models.map((m) => m.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- normalize manual ids against newly loaded catalog
    setModelDraft((d) => {
      if (d.mode !== 'manual') return d;
      let reasoningModelId = d.reasoningModelId;
      let responseModelId = d.responseModelId;
      if (!ids.has(reasoningModelId)) {
        reasoningModelId = modelCatalog.defaults.defaultReasoningModelId;
      }
      if (!ids.has(responseModelId)) {
        responseModelId = modelCatalog.defaults.defaultResponseModelId;
      }
      if (reasoningModelId === d.reasoningModelId && responseModelId === d.responseModelId) {
        return d;
      }
      return { ...d, reasoningModelId, responseModelId };
    });
  }, [modelCatalog]);

  const browserTimeZone = useMemo(() => detectBrowserTimeZone(), []);
  const timeZoneMismatch = timeZone !== browserTimeZone;

  const currentSnapshot = useMemo(
    () =>
      buildAutomationFormSnapshot({
        kind,
        localTime,
        timeZone,
        customUserPrompt,
        threadStrategy,
        channelEmailEnabled,
        channelWebhookEnabled,
        title,
        daysOfWeek,
        modelDraft,
      }),
    [
      kind,
      localTime,
      timeZone,
      customUserPrompt,
      threadStrategy,
      channelEmailEnabled,
      channelWebhookEnabled,
      title,
      daysOfWeek,
      modelDraft,
    ]
  );

  const isDirty = baseline !== null && !automationFormSnapshotsEqual(currentSnapshot, baseline);

  const titleError =
    kind === 'custom' && !title.trim() && (submitAttempted || titleTouched)
      ? 'Title is required for custom automations.'
      : null;
  const promptError =
    kind === 'custom' && !customUserPrompt.trim() && (submitAttempted || promptTouched)
      ? 'Custom prompt is required.'
      : null;
  const localTimeError =
    !isValidProactiveLocalTime(localTime) && (submitAttempted || localTimeTouched)
      ? 'Enter a valid 24-hour time (HH:MM, e.g. 08:00).'
      : null;

  const isFormValid =
    isValidProactiveLocalTime(localTime) &&
    (kind !== 'custom' || (title.trim().length > 0 && customUserPrompt.trim().length > 0));

  const toggleDay = (d: number) => {
    setDaysOfWeek((prev) => {
      if (prev.includes(d)) return prev.filter((x) => x !== d);
      return [...prev, d].sort((a, b) => a - b);
    });
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!isFormValid || !catalogReady) return;

    const body: Record<string, unknown> = {
      kind,
      localTime: localTime.trim(),
      timeZone,
      threadStrategy,
      channelEmailEnabled,
      channelWebhookEnabled,
    };
    const t = title.trim();
    if (t) body.title = t;
    if (kind === 'custom') {
      body.customUserPrompt = customUserPrompt.trim();
    }
    if (daysOfWeek.length > 0) {
      body.daysOfWeek = daysOfWeek;
    }
    const runCfg = runConfigFromModelPickerDraft(modelDraft, modelCatalog);
    if (runCfg) {
      body.assistantRunConfig = runCfg;
    }
    if (mode === 'create' || mode === 'suggestion' || mode === 'rejectedSuggestion') {
      body.enabled = true;
    }
    void onSubmit(body);
  };

  const primaryLabel = saving
    ? 'Saving…'
    : mode === 'create'
      ? 'Create'
      : mode === 'suggestion'
        ? 'Create automation'
        : mode === 'rejectedSuggestion'
          ? 'Save changes'
          : 'Save changes';

  const isEditMode = mode === 'edit' || mode === 'rejectedSuggestion';
  const primaryDisabled = saving || !catalogReady || !isFormValid || (isEditMode && !isDirty);

  const body = (
    <div className="space-y-4">
      <FormSection title="Identity" description="Name and automation type." first>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs flex flex-col gap-1 sm:col-span-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Title{kind === 'custom' ? ' (required)' : ' (optional)'}
            </span>
            <input
              type="text"
              className={fieldInputClassName}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              placeholder={
                kind === 'custom' ? 'e.g. Weekly project review' : 'e.g. Morning briefing'
              }
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? 'automation-title-error' : undefined}
            />
            {titleError ? (
              <span id="automation-title-error" className={fieldErrorClassName}>
                {titleError}
              </span>
            ) : null}
          </label>
          <label className="text-xs flex flex-col gap-1 sm:col-span-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Kind</span>
            <Select
              className={fieldInputClassName}
              value={kind}
              onChange={(e) => setKind(e.target.value as ProactiveAutomationKind)}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </Select>
          </label>
          {kind === 'custom' ? (
            <label className="text-xs flex flex-col gap-1 sm:col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Custom prompt</span>
              <Textarea
                className={`${fieldInputClassName} min-h-[100px]`}
                value={customUserPrompt}
                onChange={(e) => setCustomUserPrompt(e.target.value)}
                onBlur={() => setPromptTouched(true)}
                aria-invalid={promptError ? true : undefined}
                aria-describedby={promptError ? 'automation-prompt-error' : undefined}
              />
              {promptError ? (
                <span id="automation-prompt-error" className={fieldErrorClassName}>
                  {promptError}
                </span>
              ) : null}
            </label>
          ) : null}
        </div>
      </FormSection>

      <FormSection title="Schedule" description="When this automation runs in your time zone.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs flex flex-col gap-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Local time (24h HH:MM)
            </span>
            <input
              type="text"
              className={fieldInputClassName}
              value={localTime}
              onChange={(e) => setLocalTime(e.target.value)}
              onBlur={() => setLocalTimeTouched(true)}
              placeholder="08:00"
              aria-invalid={localTimeError ? true : undefined}
              aria-describedby={localTimeError ? 'automation-local-time-error' : undefined}
            />
            {localTimeError ? (
              <span id="automation-local-time-error" className={fieldErrorClassName}>
                {localTimeError}
              </span>
            ) : null}
          </label>
          <label className="text-xs flex flex-col gap-1 sm:col-span-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Time zone (IANA)</span>
            <Select
              className={fieldInputClassName}
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            >
              {zoneOptions.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </Select>
            {timeZoneMismatch ? (
              <div
                role="status"
                className="mt-2 rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100"
              >
                <p>
                  This automation uses <strong>{timeZone}</strong>. This browser is set to{' '}
                  <strong>{browserTimeZone}</strong>.
                </p>
                <p className="mt-1 text-amber-800/90 dark:text-amber-200/80">
                  Scheduled runs use the automation&apos;s time zone, not your browser clock.
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950 dark:text-amber-100 dark:hover:text-white"
                  onClick={() => setTimeZone(browserTimeZone)}
                >
                  Use browser time zone
                </button>
              </div>
            ) : null}
          </label>
          <div className="text-xs flex flex-col gap-2 sm:col-span-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Runs on</span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Leave all unchecked for every day. Otherwise select specific weekdays (Mon–Sun).
            </p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTS.map(({ value, label }) => (
                <label
                  key={value}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-400"
                    checked={daysOfWeek.includes(value)}
                    onChange={() => toggleDay(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Thread strategy"
        description="Whether each run continues an existing thread or starts fresh."
      >
        <label className="text-xs flex flex-col gap-1 max-w-md">
          <span className="font-medium text-gray-700 dark:text-gray-300">Strategy</span>
          <Select
            className={fieldInputClassName}
            value={threadStrategy}
            onChange={(e) => setThreadStrategy(e.target.value as ProactiveThreadStrategy)}
          >
            <option value="reuseFixedThread">Reuse fixed thread</option>
            <option value="newThreadEachRun">New thread each run</option>
          </Select>
        </label>
      </FormSection>

      <FormSection
        title="Models"
        description="Mode, context compaction, and model selection for this automation's runs."
      >
        {isModelCatalogLoading && !catalogReady ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading models…</p>
        ) : null}
        <AssistantRunConfigPickerForm
          catalog={modelCatalog}
          isLoading={isModelCatalogLoading}
          draft={modelDraft}
          onDraftChange={(patch) => setModelDraft((d) => ({ ...d, ...patch }))}
          disabled={saving}
          layout="settings"
          manualHelpText="Manual choices apply when you save this automation."
          compactionHelpText="Auto compacts context when this automation runs near the model limit. Manual never compacts silently—you manage thread length yourself."
        />
      </FormSection>

      <FormSection title="Notifications" description="Where to send run results.">
        <div className="flex flex-col gap-3">
          <label className="text-xs flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-400"
              checked={channelEmailEnabled}
              onChange={(e) => setChannelEmailEnabled(e.target.checked)}
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Send email notifications (when configured)
            </span>
          </label>
          <label className="text-xs flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-400"
              checked={channelWebhookEnabled}
              onChange={(e) => setChannelWebhookEnabled(e.target.checked)}
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Send webhook notifications (Discord or generic; configure in Settings)
            </span>
          </label>
        </div>
      </FormSection>
    </div>
  );

  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {isDirty ? (
        <span role="status" className="mr-auto text-sm text-amber-700 dark:text-amber-300">
          Unsaved changes
        </span>
      ) : isModelCatalogLoading && !catalogReady ? (
        <span className="mr-auto text-xs text-gray-500 dark:text-gray-400">Loading models…</span>
      ) : (
        <span className="mr-auto" aria-hidden />
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="rounded-lg"
        onClick={onClose}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        className="rounded-lg"
        disabled={primaryDisabled}
        onClick={handleSubmit}
      >
        {primaryLabel}
      </Button>
    </div>
  );

  return render({ body, footer });
}

export interface AutomationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'suggestion' | 'rejectedSuggestion';
  /** When mode is edit, pass the automation to prefill. */
  initialAutomation: ProactiveAutomation | null;
  /** When mode is suggestion or rejectedSuggestion, pass the API proposedPayload to prefill. */
  suggestionPayload: Record<string, unknown> | null;
  zoneOptions: string[];
  /** Fallback time zone when creating (user preference). */
  defaultTimeZone: string;
  /** Increment when opening the modal so the form remounts with fresh defaults. */
  formKey: number;
  modelCatalog: AssistantModelCatalogData | null;
  isModelCatalogLoading: boolean;
  saving: boolean;
  onSubmit: (body: Record<string, unknown>) => void | Promise<void>;
}

export default function AutomationFormModal({
  isOpen,
  onClose,
  mode,
  initialAutomation,
  suggestionPayload,
  zoneOptions,
  defaultTimeZone,
  formKey,
  modelCatalog,
  isModelCatalogLoading,
  saving,
  onSubmit,
}: AutomationFormModalProps) {
  const defaults = useMemo(
    () => buildDefaults(mode, initialAutomation, suggestionPayload, defaultTimeZone),
    [mode, initialAutomation, suggestionPayload, defaultTimeZone]
  );

  const dialogTitle =
    mode === 'create'
      ? 'New automation'
      : mode === 'suggestion'
        ? 'Review suggestion'
        : mode === 'rejectedSuggestion'
          ? 'Edit suggestion'
          : 'Edit automation';

  if (!isOpen) {
    return (
      <Dialog isOpen={false} onClose={onClose} title={dialogTitle} size="lg">
        {null}
      </Dialog>
    );
  }

  return (
    <AutomationFormFields
      key={formKey}
      mode={mode}
      defaults={defaults}
      zoneOptions={zoneOptions}
      modelCatalog={modelCatalog}
      isModelCatalogLoading={isModelCatalogLoading}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
      render={({ body, footer }) => (
        <Dialog isOpen onClose={onClose} title={dialogTitle} size="lg" footer={footer}>
          {body}
        </Dialog>
      )}
    />
  );
}
