import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PageContainer } from '@/components/templates/PageContainer';
import { AssistantRunConfigPickerForm } from '@/components/organisms/assistant/AssistantRunConfigPickerForm';
import { AssistantMemoryIngestionForm } from '@/components/organisms/settings/AssistantMemoryIngestionForm';
import { AssistantSettingsDirtyBar } from '@/components/molecules/settings/AssistantSettingsDirtyBar';
import { AssistantSettingsPageHeader } from '@/components/molecules/settings/AssistantSettingsPageHeader';
import { AssistantSettingsPageSkeleton } from '@/components/molecules/settings/AssistantSettingsPageSkeleton';
import {
  assistantSettingsCardClassName,
  assistantSettingsCardFooterClassName,
  assistantSettingsResetButtonClassName,
  assistantSettingsSectionDescClassName,
  assistantSettingsSectionTitleClassName,
} from '@/components/molecules/settings/assistant-settings-surfaces';
import {
  assistantSettingsCardStackContainerVariants,
  assistantSettingsCardStackItemVariants,
} from '@/lib/settings/assistant-settings-motion';
import {
  emptyFactCriteria,
  normalizeFactCriteria,
  withFactCriteriaFromApi,
} from '@/lib/settings/assistantMemoryIngestionFactCriteria';
import {
  assistantSettingsSnapshotsEqual,
  buildAssistantSettingsSnapshot,
  type AssistantSettingsSnapshot,
} from '@/lib/settings/assistant-settings-snapshot';
import { AssistantToolApprovalForm } from '@/components/organisms/settings/AssistantToolApprovalForm';
import {
  defaultModelsFromDraft,
  draftFromDefaultModels,
  type ModelPickerDraft,
} from '@/lib/assistant/run-config-picker-draft';
import { apiClient } from '@/lib/api-client';
import type {
  AssistantDefaultModelsConfig,
  AssistantMemoryIngestionFactCriteria,
  AssistantToolApprovalMode,
  AssistantToolRegistryEntry,
} from '@/types/api-contracts';
import type { AssistantModelCatalogData } from '@/types/chatbot';

function applySnapshotToState(
  snapshot: AssistantSettingsSnapshot,
  setters: {
    setMode: (mode: AssistantToolApprovalMode) => void;
    setDangerousSet: (set: Set<string>) => void;
    setDeniedReadSet: (set: Set<string>) => void;
    setMemProvider: (provider: string) => void;
    setMemModel: (model: string) => void;
    setMemFactCriteria: (criteria: AssistantMemoryIngestionFactCriteria) => void;
    setDefaultModelsDraft: (draft: ModelPickerDraft) => void;
  }
) {
  setters.setMode(snapshot.mode);
  setters.setDangerousSet(new Set(snapshot.dangerousTools));
  setters.setDeniedReadSet(new Set(snapshot.deniedReadTools));
  setters.setMemProvider(snapshot.memProvider);
  setters.setMemModel(snapshot.memModel);
  setters.setMemFactCriteria({ ...snapshot.factCriteria });
  setters.setDefaultModelsDraft({ ...snapshot.defaultModelsDraft });
}

export default function AssistantSettingsPage() {
  const [mode, setMode] = useState<AssistantToolApprovalMode>('allWrites');
  const [dangerousSet, setDangerousSet] = useState<Set<string>>(() => new Set());
  const [deniedReadSet, setDeniedReadSet] = useState<Set<string>>(() => new Set());
  const [memProvider, setMemProvider] = useState('groq');
  const [memModel, setMemModel] = useState('');
  const [memFactCriteria, setMemFactCriteria] =
    useState<AssistantMemoryIngestionFactCriteria>(emptyFactCriteria);
  const [memIsCustom, setMemIsCustom] = useState(false);
  const [defaultModelsDraft, setDefaultModelsDraft] = useState<ModelPickerDraft>({
    mode: 'auto',
    reasoningModelId: '',
    responseModelId: '',
    optimizeFor: 'intelligence',
    compactionMode: 'auto',
  });
  const [defaultModelsIsCustom, setDefaultModelsIsCustom] = useState(false);

  const [registry, setRegistry] = useState<AssistantToolRegistryEntry[]>([]);
  const [catalog, setCatalog] = useState<AssistantModelCatalogData | null>(null);
  const [baseline, setBaseline] = useState<AssistantSettingsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resettingDefaultModels, setResettingDefaultModels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const currentSnapshot = useMemo(
    () =>
      buildAssistantSettingsSnapshot({
        mode,
        dangerousSet,
        deniedReadSet,
        memProvider,
        memModel,
        memFactCriteria,
        defaultModelsDraft,
      }),
    [dangerousSet, deniedReadSet, defaultModelsDraft, memFactCriteria, memModel, memProvider, mode]
  );

  const isDirty = baseline !== null && !assistantSettingsSnapshotsEqual(currentSnapshot, baseline);

  const applyLoadedSettings = useCallback(
    (
      data: {
        toolApproval: {
          mode: AssistantToolApprovalMode;
          dangerousTools: string[];
          deniedReadTools?: string[];
        };
        memoryIngestion: {
          provider: string;
          model: string;
          factCriteria?: AssistantMemoryIngestionFactCriteria;
        };
        memoryIngestionIsCustom: boolean;
        defaultModels: AssistantDefaultModelsConfig;
        defaultModelsIsCustom: boolean;
      },
      cat: AssistantModelCatalogData | null
    ) => {
      const draft = draftFromDefaultModels(data.defaultModels, cat);
      setMode(data.toolApproval.mode);
      setDangerousSet(new Set(data.toolApproval.dangerousTools));
      setDeniedReadSet(new Set(data.toolApproval.deniedReadTools ?? []));
      setMemProvider(data.memoryIngestion.provider);
      setMemModel(data.memoryIngestion.model);
      setMemFactCriteria(withFactCriteriaFromApi(data.memoryIngestion.factCriteria));
      setMemIsCustom(data.memoryIngestionIsCustom);
      setDefaultModelsDraft(draft);
      setDefaultModelsIsCustom(data.defaultModelsIsCustom);
      setBaseline(
        buildAssistantSettingsSnapshot({
          mode: data.toolApproval.mode,
          dangerousSet: new Set(data.toolApproval.dangerousTools),
          deniedReadSet: new Set(data.toolApproval.deniedReadTools ?? []),
          memProvider: data.memoryIngestion.provider,
          memModel: data.memoryIngestion.model,
          memFactCriteria: withFactCriteriaFromApi(data.memoryIngestion.factCriteria),
          defaultModelsDraft: draft,
        })
      );
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      const [settingsRes, regRes, catRes] = await Promise.all([
        apiClient.getAssistantSettings(),
        apiClient.getAssistantToolRegistry(),
        apiClient.getAssistantModelCatalog(),
      ]);
      if (cancelled) return;
      if (!settingsRes.success || !settingsRes.data) {
        setError(settingsRes.error?.message ?? 'Failed to load assistant settings');
        setLoading(false);
        return;
      }
      if (!regRes.success || !regRes.data) {
        setError(regRes.error?.message ?? 'Failed to load tool list');
        setLoading(false);
        return;
      }
      if (!catRes.success || !catRes.data) {
        setError(catRes.error?.message ?? 'Failed to load model catalog');
        setLoading(false);
        return;
      }
      applyLoadedSettings(settingsRes.data, catRes.data);
      setRegistry(regRes.data);
      setCatalog(catRes.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyLoadedSettings]);

  const pickFirstModelForProvider = useCallback(
    (p: string, cat: AssistantModelCatalogData | null) => {
      const list = (cat?.models ?? []).filter((m) => m.provider === p);
      list.sort((a, b) => a.label.localeCompare(b.label));
      return list[0]?.apiModelId ?? '';
    },
    []
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSavedOk(false);
    const defaultModels = defaultModelsFromDraft(defaultModelsDraft, catalog);
    const res = await apiClient.setAssistantSettings({
      toolApproval: {
        mode,
        dangerousTools: Array.from(dangerousSet),
        deniedReadTools: Array.from(deniedReadSet),
      },
      memoryIngestion: {
        provider: memProvider,
        model: memModel,
        factCriteria: normalizeFactCriteria(memFactCriteria),
      },
      ...(defaultModels ? { defaultModels } : {}),
    });
    setSaving(false);
    if (res.success && res.data) {
      applyLoadedSettings(res.data, catalog);
      setSavedOk(true);
    } else {
      setError(res.error?.message ?? 'Save failed');
    }
  }, [
    applyLoadedSettings,
    catalog,
    dangerousSet,
    deniedReadSet,
    defaultModelsDraft,
    memFactCriteria,
    memModel,
    memProvider,
    mode,
  ]);

  const handleDiscard = useCallback(() => {
    if (!baseline) return;
    applySnapshotToState(baseline, {
      setMode,
      setDangerousSet,
      setDeniedReadSet,
      setMemProvider,
      setMemModel,
      setMemFactCriteria,
      setDefaultModelsDraft,
    });
    setSavedOk(false);
    setError(null);
  }, [baseline]);

  const handleResetMemory = useCallback(async () => {
    setResetting(true);
    setError(null);
    setSavedOk(false);
    const res = await apiClient.resetAssistantMemoryIngestion();
    setResetting(false);
    if (res.success && res.data) {
      applyLoadedSettings(res.data, catalog);
      setSavedOk(true);
    } else {
      setError(res.error?.message ?? 'Reset failed');
    }
  }, [applyLoadedSettings, catalog]);

  const handleResetDefaultModels = useCallback(async () => {
    setResettingDefaultModels(true);
    setError(null);
    setSavedOk(false);
    const res = await apiClient.resetAssistantDefaultModels();
    setResettingDefaultModels(false);
    if (res.success && res.data) {
      applyLoadedSettings(res.data, catalog);
      setSavedOk(true);
    } else {
      setError(res.error?.message ?? 'Reset failed');
    }
  }, [applyLoadedSettings, catalog]);

  const shouldReduceMotion = useReducedMotion();
  const CardStack = shouldReduceMotion ? 'div' : motion.div;
  const CardSection = shouldReduceMotion ? 'section' : motion.section;
  const cardStackMotionProps = shouldReduceMotion
    ? { 'data-testid': 'assistant-settings-card-stack-static' }
    : {
        'data-testid': 'assistant-settings-card-stack-animated',
        initial: 'hidden' as const,
        animate: 'show' as const,
        variants: assistantSettingsCardStackContainerVariants,
      };
  const cardItemMotionProps = shouldReduceMotion
    ? {}
    : { variants: assistantSettingsCardStackItemVariants };

  return (
    <div className="h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain">
      <PageContainer
        width="narrow"
        className={`min-w-0 pt-16 lg:pt-8 ${isDirty ? 'pb-28' : 'pb-12'}`}
      >
        <AssistantSettingsPageHeader />

        {loading ? (
          <AssistantSettingsPageSkeleton />
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}

            {savedOk && (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
                Settings saved.
              </div>
            )}

            <CardStack className="space-y-8" {...cardStackMotionProps}>
              <CardSection className={assistantSettingsCardClassName} {...cardItemMotionProps}>
                <h2 className={assistantSettingsSectionTitleClassName}>Tool safety</h2>
                <p className={assistantSettingsSectionDescClassName}>
                  Control when the assistant must ask you to approve a tool before it runs.
                  Approvals appear in the chat execution trace while a reply is streaming.
                </p>
                <AssistantToolApprovalForm
                  mode={mode}
                  dangerousSet={dangerousSet}
                  deniedReadSet={deniedReadSet}
                  registry={registry}
                  onModeChange={(m) => {
                    setMode(m);
                    setSavedOk(false);
                  }}
                  onDangerousSetChange={(s) => {
                    setDangerousSet(s);
                    setSavedOk(false);
                  }}
                  onDeniedReadSetChange={(s) => {
                    setDeniedReadSet(s);
                    setSavedOk(false);
                  }}
                />
              </CardSection>

              <CardSection className={assistantSettingsCardClassName} {...cardItemMotionProps}>
                <h2 className={assistantSettingsSectionTitleClassName}>Default models</h2>
                <p className={assistantSettingsSectionDescClassName}>
                  Choose the models new chats start with. You can still change models within any
                  chat from the Models button on the Assistant page.
                </p>
                <AssistantRunConfigPickerForm
                  catalog={catalog}
                  isLoading={false}
                  draft={defaultModelsDraft}
                  showCompaction={false}
                  layout="settings"
                  disabled={saving}
                  manualHelpText="New chats start with these models. You can still switch models within any chat."
                  onDraftChange={(patch) => {
                    setDefaultModelsDraft((prev) => ({ ...prev, ...patch }));
                    setSavedOk(false);
                  }}
                />
                <div className={assistantSettingsCardFooterClassName}>
                  <button
                    type="button"
                    onClick={() => void handleResetDefaultModels()}
                    disabled={!defaultModelsIsCustom || resettingDefaultModels || saving}
                    aria-label="Reset default models to Auto server default"
                    className={assistantSettingsResetButtonClassName}
                  >
                    {resettingDefaultModels ? 'Resetting…' : 'Reset to Auto (server default)'}
                  </button>
                </div>
              </CardSection>

              <CardSection className={assistantSettingsCardClassName} {...cardItemMotionProps}>
                <h2 className={assistantSettingsSectionTitleClassName}>Memory ingestion</h2>
                <p className={assistantSettingsSectionDescClassName}>
                  Short-term standout facts after replies, and thread condensation when context is
                  tight.
                </p>
                <AssistantMemoryIngestionForm
                  catalog={catalog}
                  provider={memProvider}
                  model={memModel}
                  factCriteria={memFactCriteria}
                  onProviderChange={(p) => {
                    setMemProvider(p);
                    const first = pickFirstModelForProvider(p, catalog);
                    if (first) {
                      setMemModel(first);
                    }
                    setSavedOk(false);
                  }}
                  onModelChange={(m) => {
                    setMemModel(m);
                    setSavedOk(false);
                  }}
                  onFactCriteriaChange={(criteria) => {
                    setMemFactCriteria(criteria);
                    setSavedOk(false);
                  }}
                  disabled={saving}
                />
                <div className={assistantSettingsCardFooterClassName}>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    {memIsCustom
                      ? 'You have saved a custom model. Server defaults apply when you reset (model and fact filters).'
                      : 'Using server default model from deployment config. Fact filters are saved with your settings.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleResetMemory()}
                    disabled={!memIsCustom || resetting || saving}
                    aria-label="Reset memory ingestion to server defaults"
                    className={assistantSettingsResetButtonClassName}
                  >
                    {resetting ? 'Resetting…' : 'Reset to server defaults'}
                  </button>
                </div>
              </CardSection>
            </CardStack>

            {isDirty ? (
              <AssistantSettingsDirtyBar
                saving={saving}
                onDiscard={handleDiscard}
                onSave={() => void handleSave()}
              />
            ) : null}
          </>
        )}
      </PageContainer>
    </div>
  );
}
