import { useEffect, useMemo, useRef, useState } from 'react';
import { Gift, Plus, Pencil, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/templates/PageContainer';
import { FitnessModulePageHeader } from '@/components/molecules/fitness/FitnessModulePageHeader';
import { EmptyState } from '@/components/molecules/EmptyState';
import Dialog from '@/components/molecules/Dialog';
import Button from '@/components/atoms/Button';
import { FormField } from '@/components/molecules/FormField';
import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import { FormInput } from '@/components/atoms/FormInput';
import { Select } from '@/components/atoms/Select';
import { PointsEarnBurst } from '@/components/molecules/PointsEarnBurst';
import { useWallet } from '@/contexts/Wallet';
import { addCalendarDays, localCalendarDate } from '@/lib/date/local-calendar';
import { focusFirstIncompleteControl } from '@/lib/forms/focusFirstIncompleteControl';
import { formatRewardRulePreview, hasAdvancedRuleValues } from '@/lib/fitness/reward-rule-preview';
import {
  useFitnessRewardRules,
  useFitnessRewardClaims,
  useCreateRewardRuleMutation,
  useUpdateRewardRuleMutation,
  useDeleteRewardRuleMutation,
  useClaimRewardRuleMutation,
  useFitnessExercises,
} from '@/hooks/useFitness';
import type {
  CreateFitnessRewardRuleInput,
  FitnessRewardAutoMetric,
  FitnessRewardCategory,
  FitnessRewardRule,
  FitnessRewardTriggerType,
  UpdateFitnessRewardRuleInput,
} from '@/types/fitness';
import { cn } from '@/lib/utils';
import {
  fitnessSectionClassName,
  fitnessSectionPaddingClassName,
} from '@/lib/fitness/fitness-surfaces';

const selectClassName = 'w-full';

const CATEGORIES: FitnessRewardCategory[] = [
  'hydration',
  'nutrition',
  'workout',
  'recovery',
  'benchmark',
  'custom',
];

const AUTO_METRICS: FitnessRewardAutoMetric[] = [
  'workout_set_pr',
  'recovery_logged',
  'session_completed',
];

type RuleFormState = {
  name: string;
  description: string;
  category: FitnessRewardCategory;
  points: number;
  target: string;
  triggerType: FitnessRewardTriggerType;
  autoMetric: FitnessRewardAutoMetric | '';
  exerciseId: string;
  cooldownHours: string;
  maxClaimsPerDay: string;
  isActive: boolean;
};

const emptyForm = (): RuleFormState => ({
  name: '',
  description: '',
  category: 'custom',
  points: 10,
  target: '',
  triggerType: 'manual',
  autoMetric: '',
  exerciseId: '',
  cooldownHours: '',
  maxClaimsPerDay: '',
  isActive: true,
});

function formFromRule(rule: FitnessRewardRule): RuleFormState {
  return {
    name: rule.name,
    description: rule.description ?? '',
    category: rule.category,
    points: rule.points,
    target: rule.target ?? '',
    triggerType: rule.triggerType,
    autoMetric: rule.autoMetric ?? '',
    exerciseId: rule.exerciseId ?? '',
    cooldownHours: rule.cooldownHours != null ? String(rule.cooldownHours) : '',
    maxClaimsPerDay: rule.maxClaimsPerDay != null ? String(rule.maxClaimsPerDay) : '',
    isActive: rule.isActive,
  };
}

function buildPayload(form: RuleFormState): CreateFitnessRewardRuleInput {
  const body: CreateFitnessRewardRuleInput = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    category: form.category,
    points: form.points,
    target: form.target.trim() || undefined,
    triggerType: form.triggerType,
    isActive: form.isActive,
  };
  if (form.triggerType === 'auto') {
    body.autoMetric = form.autoMetric || undefined;
    if (form.autoMetric === 'workout_set_pr') {
      body.exerciseId = form.exerciseId || undefined;
    }
  }
  const ch = form.cooldownHours.trim();
  if (ch) body.cooldownHours = Number(ch);
  const md = form.maxClaimsPerDay.trim();
  if (md) body.maxClaimsPerDay = Number(md);
  return body;
}

export default function HealthFitnessRewardsPage() {
  const end = localCalendarDate();
  const start = addCalendarDays(end, -14);

  const { data: rulesRes, isLoading } = useFitnessRewardRules(1, 100);
  const { data: claimsRes } = useFitnessRewardClaims({
    startDate: start,
    endDate: end,
    pageSize: 30,
  });
  const { data: exRes } = useFitnessExercises(1, 100);

  const rules = rulesRes?.success ? (rulesRes.data?.data ?? []) : [];
  const claims = claimsRes?.success ? (claimsRes.data?.data ?? []) : [];
  const exercises = exRes?.success ? (exRes.data?.data ?? []) : [];

  const createRule = useCreateRewardRuleMutation();
  const updateRule = useUpdateRewardRuleMutation();
  const deleteRule = useDeleteRewardRuleMutation();
  const claimRule = useClaimRewardRuleMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleFormState>(emptyForm);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [lastBalance, setLastBalance] = useState<number | null>(null);
  const [claimPulseId, setClaimPulseId] = useState(0);
  const [lastClaimedRuleId, setLastClaimedRuleId] = useState<string | null>(null);
  const [lastClaimedPoints, setLastClaimedPoints] = useState(0);
  const [claimStatusMessage, setClaimStatusMessage] = useState<string | null>(null);

  const { triggerEarnPulse } = useWallet();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const autoMetricRef = useRef<HTMLSelectElement>(null);
  const exerciseRef = useRef<HTMLSelectElement>(null);
  const quickClaimSectionRef = useRef<HTMLElement>(null);

  const rulePreview = useMemo(() => formatRewardRulePreview(form), [form]);

  const focusRewardDialogFields = () => {
    const targets: Parameters<typeof focusFirstIncompleteControl>[0] = [
      {
        id: 'name',
        isComplete: () => form.name.trim() !== '',
        focus: () => nameInputRef.current?.focus(),
      },
    ];

    if (showAdvanced && form.triggerType === 'auto') {
      targets.push({
        id: 'autoMetric',
        isComplete: () => form.autoMetric !== '',
        focus: () => autoMetricRef.current?.focus(),
      });

      if (form.autoMetric === 'workout_set_pr') {
        targets.push({
          id: 'exerciseId',
          isComplete: () => form.exerciseId !== '',
          focus: () => exerciseRef.current?.focus(),
        });
      }
    }

    focusFirstIncompleteControl(targets);
  };

  useEffect(() => {
    if (!dialogOpen) return;
    focusRewardDialogFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dialog open + form snapshot
  }, [dialogOpen, showAdvanced, form.triggerType, form.autoMetric]);

  const manualRules = useMemo(
    () => rules.filter((r) => r.triggerType === 'manual' && r.isActive),
    [rules]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowAdvanced(false);
    setDialogOpen(true);
  };

  const openEdit = (rule: FitnessRewardRule) => {
    const nextForm = formFromRule(rule);
    setEditingId(rule.id);
    setForm(nextForm);
    setShowAdvanced(hasAdvancedRuleValues(nextForm));
    setDialogOpen(true);
  };

  const focusQuickClaim = () => {
    quickClaimSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const firstClaimButton =
      quickClaimSectionRef.current?.querySelector<HTMLButtonElement>('button[type="button"]');
    firstClaimButton?.focus();
  };

  const saveRule = async () => {
    const payload = buildPayload(form);
    if (editingId) {
      await updateRule.mutateAsync({
        id: editingId,
        body: payload as UpdateFitnessRewardRuleInput,
      });
    } else {
      await createRule.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleClaim = async (ruleId: string) => {
    setClaimError(null);
    setClaimStatusMessage(null);
    try {
      const res = await claimRule.mutateAsync(ruleId);
      if (res.success && res.data) {
        const points = res.data.claim.points;
        setLastBalance(res.data.walletBalance);
        setLastClaimedRuleId(ruleId);
        setLastClaimedPoints(points);
        setClaimPulseId((id) => id + 1);
        triggerEarnPulse(points);
        setClaimStatusMessage(`Claimed +${points} points`);
      }
    } catch (e) {
      setClaimError(e instanceof Error ? e.message : 'Claim failed');
    }
  };

  return (
    <PageContainer className="space-y-8">
      <FitnessModulePageHeader
        icon={Gift}
        title="Rewards"
        purpose="Configure earn rules and claim points into your global wallet."
        accent="blue"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New rule
          </Button>
        }
      />

      {(lastBalance != null || claimError || claimStatusMessage) && (
        <div>
          {lastBalance != null && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Wallet balance:{' '}
              <PointsEarnBurst pulseKey={claimPulseId} delta={lastClaimedPoints}>
                <span>{lastBalance} pts</span>
              </PointsEarnBurst>
            </p>
          )}
          <p className="sr-only" aria-live="polite">
            {claimStatusMessage}
          </p>
          {claimError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{claimError}</p>
          )}
        </div>
      )}

      <section
        ref={quickClaimSectionRef}
        id="rewards-quick-claim"
        className={cn(fitnessSectionClassName, fitnessSectionPaddingClassName)}
      >
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Quick claim</h2>
        {manualRules.length === 0 ? (
          <EmptyState
            scene="rewardsQuickClaim"
            title="No manual claims ready"
            description="Create or activate a manual rule to claim points here."
            actionLabel="New rule"
            onAction={openCreate}
            density="compact"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {manualRules.map((r) => (
              <button
                key={r.id}
                type="button"
                disabled={claimRule.isPending}
                onClick={() => handleClaim(r.id)}
                aria-label={`${r.name} (+${r.points})`}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
              >
                {r.name} (
                {lastClaimedRuleId === r.id && claimPulseId > 0 ? (
                  <PointsEarnBurst pulseKey={claimPulseId} delta={lastClaimedPoints}>
                    <span>+{r.points}</span>
                  </PointsEarnBurst>
                ) : (
                  `+${r.points}`
                )}
                )
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={cn(fitnessSectionClassName, fitnessSectionPaddingClassName)}>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Rules</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : rules.length === 0 ? (
          <EmptyState
            scene="rewardsRules"
            title="Create a rule to start earning"
            description="Points rules feed your wallet — add one to begin."
            actionLabel="New rule"
            onAction={openCreate}
            density="compact"
          />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {rules.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {r.name}{' '}
                    <span className="text-sm font-normal text-gray-500">
                      +{r.points} · {r.category} · {r.triggerType}
                      {r.autoMetric ? ` (${r.autoMetric})` : ''}
                    </span>
                  </p>
                  {r.target && <p className="text-xs text-gray-500">Target: {r.target}</p>}
                  {!r.isActive && <span className="text-xs text-amber-600">Inactive</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Edit rule"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRule.mutate(r.id)}
                    className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    aria-label="Delete rule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={cn(fitnessSectionClassName, fitnessSectionPaddingClassName)}>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Recent claims (14d)
        </h2>
        {claims.length === 0 ? (
          <EmptyState
            scene="rewardsClaims"
            title="No claims in the last 14 days"
            description="Claim or auto-earn points and they will show up here."
            actionLabel={manualRules.length > 0 ? 'Claim points' : 'New rule'}
            onAction={manualRules.length > 0 ? focusQuickClaim : openCreate}
            density="compact"
          />
        ) : (
          <ul className="space-y-2 text-sm">
            {claims.map((c) => (
              <li key={c.id} className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>
                  {c.ruleName} <span className="text-gray-400">({c.source})</span>
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +{c.points}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? 'Edit rule' : 'New rule'}
        size="md"
        trapFocus
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!form.name.trim() || createRule.isPending || updateRule.isPending}
              onClick={saveRule}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <FormField label="Name" htmlFor="reward-rule-name" required>
            <FormInput
              ref={nameInputRef}
              id="reward-rule-name"
              className="w-full"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <FormField label="Points" htmlFor="reward-rule-points">
            <FormInput
              id="reward-rule-points"
              type="number"
              min={1}
              className="w-full"
              value={form.points}
              onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) || 0 }))}
            />
          </FormField>
          <FormField label="Category" htmlFor="reward-rule-category">
            <Select
              id="reward-rule-category"
              className={selectClassName}
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as FitnessRewardCategory,
                }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>
          <button
            type="button"
            onClick={() => setShowAdvanced((open) => !open)}
            aria-expanded={showAdvanced}
            aria-controls="reward-rule-advanced-fields"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
          {showAdvanced && (
            <div id="reward-rule-advanced-fields" className="space-y-3">
              <FormField label="Target (optional)" htmlFor="reward-rule-target">
                <FormInput
                  id="reward-rule-target"
                  className="w-full"
                  placeholder="e.g. 12oz water"
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                />
              </FormField>
              <FormField label="Trigger" htmlFor="reward-rule-trigger">
                <Select
                  id="reward-rule-trigger"
                  className={selectClassName}
                  value={form.triggerType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      triggerType: e.target.value as FitnessRewardTriggerType,
                    }))
                  }
                >
                  <option value="manual">Manual claim</option>
                  <option value="auto">Auto-detect</option>
                </Select>
              </FormField>
              {form.triggerType === 'auto' && (
                <>
                  <FormField label="Auto metric" htmlFor="reward-rule-auto-metric">
                    <Select
                      ref={autoMetricRef}
                      id="reward-rule-auto-metric"
                      className={selectClassName}
                      value={form.autoMetric}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          autoMetric: e.target.value as FitnessRewardAutoMetric,
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      {AUTO_METRICS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  {form.autoMetric === 'workout_set_pr' && (
                    <FormField label="Exercise" htmlFor="reward-rule-exercise">
                      <Select
                        ref={exerciseRef}
                        id="reward-rule-exercise"
                        className={selectClassName}
                        value={form.exerciseId}
                        onChange={(e) => setForm((f) => ({ ...f, exerciseId: e.target.value }))}
                      >
                        <option value="">Select exercise…</option>
                        {exercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  )}
                </>
              )}
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Cooldown (hours)" htmlFor="reward-rule-cooldown">
                  <FormInput
                    id="reward-rule-cooldown"
                    type="number"
                    min={0}
                    className="w-full"
                    value={form.cooldownHours}
                    onChange={(e) => setForm((f) => ({ ...f, cooldownHours: e.target.value }))}
                  />
                </FormField>
                <FormField label="Max / day" htmlFor="reward-rule-max-per-day">
                  <FormInput
                    id="reward-rule-max-per-day"
                    type="number"
                    min={1}
                    className="w-full"
                    value={form.maxClaimsPerDay}
                    onChange={(e) => setForm((f) => ({ ...f, maxClaimsPerDay: e.target.value }))}
                  />
                </FormField>
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <FormCheckbox
              id="reward-rule-active"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <p
            className="mt-1 border-t border-gray-200 pt-3 text-sm italic text-gray-500 dark:border-gray-700 dark:text-gray-400"
            aria-live="polite"
          >
            {rulePreview}
          </p>
        </div>
      </Dialog>
    </PageContainer>
  );
}
