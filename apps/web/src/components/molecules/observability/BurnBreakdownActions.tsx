import { useId, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CirclePause, DollarSign, Play } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import { FormInput } from '@/components/atoms/FormInput';
import { Select } from '@/components/atoms/Select';
import Dialog from '@/components/molecules/Dialog';
import { FormField } from '@/components/molecules/FormField';
import { queryKeys } from '@/lib/react-query/query-keys';
import { observabilityService } from '@/services/observability.service';
import type {
  CostGuardrailPeriod,
  CostGuardrailRuleInput,
  CostGuardrailRuleStatus,
  CostGuardrailStatus,
} from '@/types/observability';
import { upsertCostGuardrailRule } from '@/lib/observability/cost-guardrail-helpers';

type BurnBreakdownActionsProps = {
  rowKey: string;
  groupBy: 'module' | 'model' | 'provider' | 'feature';
  guardrails?: CostGuardrailStatus;
};

function findMatchingBudgetRule(
  rules: CostGuardrailRuleStatus[],
  showModuleBudget: boolean,
  featureKey: string | null
): CostGuardrailRuleStatus | undefined {
  return rules.find((rule) =>
    showModuleBudget
      ? rule.scopeType === 'module' && rule.module === 'personal_branding'
      : rule.scopeType === 'feature' &&
        rule.module === 'personal_branding' &&
        rule.feature === featureKey
  );
}

export default function BurnBreakdownActions({
  rowKey,
  groupBy,
  guardrails,
}: BurnBreakdownActionsProps) {
  const queryClient = useQueryClient();
  const limitId = useId();
  const periodId = useId();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [limitUsd, setLimitUsd] = useState(5);
  const [period, setPeriod] = useState<CostGuardrailPeriod>('daily');
  const [autoThrottle, setAutoThrottle] = useState(true);
  const [limitTouched, setLimitTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const allowlist = guardrails?.throttleAllowlist ?? [];
  const featureKey = groupBy === 'feature' ? rowKey : null;
  const isAllowlistedFeature = Boolean(featureKey && allowlist.includes(featureKey));
  const showModuleBudget = groupBy === 'module' && rowKey === 'personal_branding';
  const showActions = isAllowlistedFeature || showModuleBudget;

  const isManuallyPaused =
    featureKey != null && guardrails?.overrides?.[featureKey]?.manualPaused === true;
  const isThrottled =
    featureKey != null &&
    (guardrails?.rules ?? []).some((rule) => rule.throttledFeatures.includes(featureKey));
  const isPaused = isManuallyPaused || isThrottled;

  const saveMut = useMutation({
    mutationFn: (rules: CostGuardrailRuleInput[]) =>
      observabilityService.putCostGuardrails({ rules }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.observability.costGuardrails(), data);
      setBudgetOpen(false);
      setLimitTouched(false);
      setSubmitAttempted(false);
    },
  });

  const overrideMut = useMutation({
    mutationFn: (payload: { feature: string; action: 'pause' | 'resume' }) =>
      observabilityService.postCostGuardrailOverride(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.observability.costGuardrails(), data);
    },
  });

  const busy = saveMut.isPending || overrideMut.isPending;
  const limitError =
    (limitTouched || submitAttempted) && limitUsd <= 0 ? 'Enter a limit greater than 0' : null;

  const closeBudgetDialog = () => {
    setBudgetOpen(false);
    setLimitTouched(false);
    setSubmitAttempted(false);
    saveMut.reset();
  };

  if (!showActions) {
    return null;
  }

  const openBudgetDialog = () => {
    const matching = findMatchingBudgetRule(guardrails?.rules ?? [], showModuleBudget, featureKey);
    setLimitUsd(matching?.limitUsd ?? 5);
    setPeriod(matching?.period ?? 'daily');
    setAutoThrottle(matching?.autoThrottle ?? true);
    setLimitTouched(false);
    setSubmitAttempted(false);
    saveMut.reset();
    setBudgetOpen(true);
  };

  const handleSetBudget = () => {
    if (limitUsd <= 0) {
      setSubmitAttempted(true);
      return;
    }

    const existing = (guardrails?.rules ?? []).map((r) => ({
      id: r.id,
      enabled: r.enabled,
      scopeType: r.scopeType,
      module: r.module,
      feature: r.feature ?? null,
      period: r.period,
      limitUsd: r.limitUsd,
      autoThrottle: r.autoThrottle,
    }));

    const nextRule: CostGuardrailRuleInput = showModuleBudget
      ? {
          enabled: true,
          scopeType: 'module',
          module: 'personal_branding',
          feature: null,
          period,
          limitUsd,
          autoThrottle,
        }
      : {
          enabled: true,
          scopeType: 'feature',
          module: 'personal_branding',
          feature: featureKey,
          period,
          limitUsd,
          autoThrottle,
        };

    saveMut.mutate(upsertCostGuardrailRule(existing, nextRule));
  };

  const budgetHelperCopy = showModuleBudget
    ? 'Soft USD budget for Personal Branding — auto-throttle only pauses non-critical features when exceeded.'
    : 'Soft USD budget for this feature — auto-throttle only pauses it when exceeded.';

  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="gap-1 px-2 text-xs text-gray-600 dark:text-gray-400"
        disabled={busy}
        onClick={openBudgetDialog}
      >
        <DollarSign className="h-3.5 w-3.5" aria-hidden />
        Set budget alert
      </Button>

      {isAllowlistedFeature && featureKey ? (
        isPaused ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1 px-2 text-xs text-amber-700 dark:text-amber-400"
            disabled={busy}
            onClick={() => overrideMut.mutate({ feature: featureKey, action: 'resume' })}
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            Resume
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1 px-2 text-xs text-gray-600 dark:text-gray-400"
            disabled={busy}
            onClick={() => overrideMut.mutate({ feature: featureKey, action: 'pause' })}
          >
            <CirclePause className="h-3.5 w-3.5" aria-hidden />
            Pause feature
          </Button>
        )
      ) : null}

      <Dialog
        isOpen={budgetOpen}
        onClose={closeBudgetDialog}
        title={showModuleBudget ? 'Set module budget alert' : 'Set feature budget alert'}
        size="sm"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (busy) {
              return;
            }
            if (limitUsd <= 0) {
              setSubmitAttempted(true);
              return;
            }
            handleSetBudget();
          }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">{budgetHelperCopy}</p>

          <FormField label="Limit (USD)" htmlFor={limitId} error={limitError}>
            <FormInput
              id={limitId}
              type="number"
              min={0.01}
              step={0.5}
              className="w-full"
              value={limitUsd}
              disabled={busy}
              autoFocus
              onChange={(e) => {
                setLimitTouched(true);
                setLimitUsd(Number.parseFloat(e.target.value) || 0);
              }}
              onBlur={() => setLimitTouched(true)}
            />
          </FormField>

          <FormField label="Period" htmlFor={periodId}>
            <Select
              id={periodId}
              className="w-full"
              value={period}
              disabled={busy}
              onChange={(e) => setPeriod(e.target.value as CostGuardrailPeriod)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
          </FormField>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FormCheckbox
              checked={autoThrottle}
              disabled={busy}
              onChange={(e) => setAutoThrottle(e.target.checked)}
            />
            Auto-throttle when exceeded
          </label>

          {saveMut.isError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              Could not save budget alert. Try again.
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={closeBudgetDialog}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={busy || limitUsd <= 0}>
              {busy ? 'Saving…' : 'Save alert'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
