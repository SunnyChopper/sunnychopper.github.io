import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';
import CollapsibleSection from '@/components/molecules/CollapsibleSection';
import { EmptyState } from '@/components/molecules/EmptyState';
import CostGuardrailAlert from '@/components/molecules/observability/CostGuardrailAlert';
import CostGuardrailRuleCard from '@/components/molecules/observability/CostGuardrailRuleCard';
import CostGuardrailsKpiStrip from '@/components/molecules/observability/CostGuardrailsKpiStrip';
import CostThrottleFeatureRow from '@/components/molecules/observability/CostThrottleFeatureRow';
import {
  collectThrottledFeatures,
  deriveCostGuardrailKpis,
  isFeatureManuallyPaused,
  isFeaturePaused,
  toRuleInput,
} from '@/lib/observability/cost-guardrail-helpers';
import {
  costGuardrailsFeatureListClassName,
  costGuardrailsKpiCardClassName,
  costGuardrailsKpiGridClassName,
  costGuardrailsLoadingPanelClassName,
  costGuardrailsRuleListClassName,
  costGuardrailsSectionClassName,
  costGuardrailsSectionDescriptionClassName,
  costGuardrailsSectionTitleClassName,
  costGuardrailsSubsectionTitleClassName,
} from '@/lib/observability/cost-guardrail-surfaces';
import { obsPanelPaddedClassName } from '@/lib/observability/observability-surfaces';
import { queryKeys } from '@/lib/react-query/query-keys';
import { observabilityService } from '@/services/observability.service';
import type { CostGuardrailRuleInput, CostGuardrailRuleStatus } from '@/types/observability';

function CostGuardrailsLoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading cost guardrails">
      <div className={costGuardrailsKpiGridClassName}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={costGuardrailsKpiCardClassName}>
            <Skeleton className="h-3 w-20" variant="text" />
            <Skeleton className="mt-2 h-8 w-12" variant="rectangular" />
          </div>
        ))}
      </div>
      <div className={costGuardrailsRuleListClassName}>
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className={costGuardrailsLoadingPanelClassName}>
            <Skeleton className="h-4 w-40" variant="text" />
            <Skeleton className="mt-3 h-2 w-full" variant="rectangular" />
            <Skeleton className="mt-4 h-8 w-32" variant="rectangular" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CostGuardrailsPanel() {
  const queryClient = useQueryClient();
  const statusQ = useQuery({
    queryKey: queryKeys.observability.costGuardrails(),
    queryFn: () => observabilityService.getCostGuardrails(),
  });

  const saveMut = useMutation({
    mutationFn: (rules: CostGuardrailRuleInput[]) =>
      observabilityService.putCostGuardrails({ rules }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.observability.costGuardrails(), data);
    },
  });

  const seedMut = useMutation({
    mutationFn: () => observabilityService.putCostGuardrails({ rules: [], seedDefault: true }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.observability.costGuardrails(), data);
    },
  });

  const resumeMut = useMutation({
    mutationFn: (feature: string) => observabilityService.resumeCostGuardrailFeature(feature),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.observability.costGuardrails(), data);
    },
  });

  const pauseMut = useMutation({
    mutationFn: (feature: string) => observabilityService.pauseCostGuardrailFeature(feature),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.observability.costGuardrails(), data);
    },
  });

  const rules = statusQ.data?.rules ?? [];
  const throttledFeatures = useMemo(() => collectThrottledFeatures(statusQ.data), [statusQ.data]);
  const kpiCounts = useMemo(() => deriveCostGuardrailKpis(statusQ.data), [statusQ.data]);
  const allowlist = statusQ.data?.throttleAllowlist ?? [];

  const updateRules = (next: Array<CostGuardrailRuleInput | CostGuardrailRuleStatus>) => {
    saveMut.mutate(next.map(toRuleInput));
  };

  const toggleRule = (rule: CostGuardrailRuleStatus, field: 'enabled' | 'autoThrottle') => {
    updateRules(
      rules.map((r) =>
        r.id === rule.id
          ? {
              ...r,
              [field]: !r[field],
            }
          : r
      )
    );
  };

  const updateLimit = (rule: CostGuardrailRuleStatus, limitUsd: number) => {
    if (!Number.isFinite(limitUsd) || limitUsd <= 0) return;
    updateRules(rules.map((r) => (r.id === rule.id ? { ...r, limitUsd } : r)));
  };

  const removeRule = (ruleId: string) => {
    updateRules(rules.filter((r) => r.id !== ruleId));
  };

  const addCustomRule = () => {
    const id = crypto.randomUUID();
    updateRules([
      ...rules,
      {
        id,
        enabled: true,
        scopeType: 'module',
        module: 'personal_branding',
        feature: null,
        period: 'daily',
        limitUsd: 5,
        autoThrottle: false,
      },
    ]);
  };

  const busy = saveMut.isPending || seedMut.isPending || resumeMut.isPending || pauseMut.isPending;
  const showKpis = !statusQ.isLoading && (rules.length > 0 || throttledFeatures.length > 0);

  return (
    <section className={costGuardrailsSectionClassName} aria-labelledby="cost-guardrails-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="cost-guardrails-heading" className={costGuardrailsSectionTitleClassName}>
            Cost guardrails
          </h2>
          <p className={costGuardrailsSectionDescriptionClassName}>
            Soft daily or weekly USD budgets per module or feature. When exceeded, a banner appears
            and non-critical Personal Branding jobs can auto-pause until the period resets or you
            resume.
          </p>
        </div>
        {rules.length > 0 ? (
          <Button type="button" variant="secondary" disabled={busy} onClick={addCustomRule}>
            <Plus className="h-4 w-4" />
            Add module rule
          </Button>
        ) : null}
      </div>

      {showKpis ? <CostGuardrailsKpiStrip counts={kpiCounts} /> : null}

      {statusQ.data?.banner.active ? (
        <CostGuardrailAlert messages={statusQ.data.banner.messages} />
      ) : null}

      {statusQ.isLoading ? <CostGuardrailsLoadingSkeleton /> : null}

      {statusQ.isError ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {(statusQ.error as Error).message || 'Failed to load cost guardrails'}
        </p>
      ) : null}

      {!statusQ.isLoading && !statusQ.isError ? (
        rules.length > 0 ? (
          <ul className={costGuardrailsRuleListClassName}>
            {rules.map((rule) => (
              <li key={rule.id}>
                <CostGuardrailRuleCard
                  rule={rule}
                  busy={busy}
                  onRemove={() => removeRule(rule.id)}
                  onToggle={(field) => toggleRule(rule, field)}
                  onLimitChange={(limitUsd) => updateLimit(rule, limitUsd)}
                  onResumeFeature={(feature) => resumeMut.mutate(feature)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Shield}
            title="No guardrail rules yet"
            description="Add the Personal Branding daily budget preset to start tracking spend and auto-throttling background jobs."
            actionLabel="Add Personal Branding daily budget"
            onAction={() => seedMut.mutate()}
            className={obsPanelPaddedClassName}
          />
        )
      ) : null}

      {throttledFeatures.length > 0 ? (
        <div className={obsPanelPaddedClassName}>
          <h3 className={costGuardrailsSubsectionTitleClassName}>Paused / throttled features</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Features currently paused by guardrails or manual override.
          </p>
          <div className={costGuardrailsFeatureListClassName}>
            {throttledFeatures.map((feature) => (
              <CostThrottleFeatureRow
                key={feature}
                feature={feature}
                paused
                manual={isFeatureManuallyPaused(feature, statusQ.data)}
                disabled={busy}
                onResume={() => resumeMut.mutate(feature)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {allowlist.length > 0 ? (
        <CollapsibleSection
          title="Auto-throttle allowlist"
          defaultOpen={false}
          summary={`${allowlist.length} features`}
        >
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Non-critical Personal Branding background jobs that may be paused when a budget is
            exceeded with auto-throttle enabled.
          </p>
          <div className={costGuardrailsFeatureListClassName}>
            {allowlist.map((feature) => {
              const paused = isFeaturePaused(feature, statusQ.data, throttledFeatures);
              return (
                <CostThrottleFeatureRow
                  key={feature}
                  feature={feature}
                  paused={paused}
                  manual={isFeatureManuallyPaused(feature, statusQ.data)}
                  disabled={busy}
                  onPause={() => pauseMut.mutate(feature)}
                  onResume={() => resumeMut.mutate(feature)}
                />
              );
            })}
          </div>
        </CollapsibleSection>
      ) : null}
    </section>
  );
}
