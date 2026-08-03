import { Trash2 } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/atoms/Card';
import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import { FormInput } from '@/components/atoms/FormInput';
import LinearProgressBar from '@/components/atoms/LinearProgressBar';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { FormField } from '@/components/molecules/FormField';
import { formatObservabilityUsd } from '@/lib/observability-formatters';
import { obsStatusBadgeClassName } from '@/lib/observability/observability-surfaces';
import {
  costGuardrailFeatureDisplayName,
  progressPct,
  ruleStatusLabel,
  scopeLabel,
  scopeMeta,
} from '@/lib/observability/cost-guardrail-helpers';
import type { CostGuardrailRuleStatus } from '@/types/observability';
import { cn } from '@/lib/utils';

export type CostGuardrailRuleCardProps = {
  rule: CostGuardrailRuleStatus;
  busy?: boolean;
  onRemove: () => void;
  onToggle: (field: 'enabled' | 'autoThrottle') => void;
  onLimitChange: (limitUsd: number) => void;
  onResumeFeature: (feature: string) => void;
};

function progressVariant(rule: CostGuardrailRuleStatus): 'default' | 'warning' | 'danger' {
  if (rule.exceeded) return 'danger';
  if (rule.approaching) return 'warning';
  return 'default';
}

export default function CostGuardrailRuleCard({
  rule,
  busy = false,
  onRemove,
  onToggle,
  onLimitChange,
  onResumeFeature,
}: CostGuardrailRuleCardProps) {
  const status = ruleStatusLabel(rule);
  const limitInputId = `cost-guardrail-limit-${rule.id}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {scopeLabel(rule)}
            </h3>
            <StatusBadge status={status} size="sm" className={obsStatusBadgeClassName(status)} />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{scopeMeta(rule)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Remove rule"
          disabled={busy}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardBody className="space-y-4 pt-0">
        <div>
          <div className="flex justify-between text-sm tabular-nums text-gray-700 dark:text-gray-300">
            <span>
              {formatObservabilityUsd(rule.spentUsd)} / {formatObservabilityUsd(rule.limitUsd)}
            </span>
            <span className={cn(rule.exceeded && 'font-medium text-amber-700 dark:text-amber-300')}>
              {rule.exceeded
                ? 'Exceeded'
                : `${formatObservabilityUsd(rule.remainingUsd)} remaining`}
            </span>
          </div>
          <div className="mt-2">
            <LinearProgressBar
              value={progressPct(rule)}
              max={100}
              variant={progressVariant(rule)}
              label={`${scopeLabel(rule)} spend utilization`}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,8rem)_1fr]">
          <FormField label="Limit (USD)" htmlFor={limitInputId}>
            <FormInput
              id={limitInputId}
              type="number"
              min={0.01}
              step={0.5}
              className="w-full"
              defaultValue={rule.limitUsd}
              disabled={busy}
              onBlur={(e) => onLimitChange(Number.parseFloat(e.target.value))}
            />
          </FormField>

          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <FormCheckbox
                checked={rule.enabled}
                disabled={busy}
                onChange={() => onToggle('enabled')}
              />
              Enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <FormCheckbox
                checked={rule.autoThrottle}
                disabled={busy}
                onChange={() => onToggle('autoThrottle')}
              />
              Auto-throttle non-critical features
            </label>
          </div>
        </div>
      </CardBody>

      {rule.throttledFeatures.length > 0 ? (
        <CardFooter className="flex flex-wrap gap-2">
          {rule.throttledFeatures.map((feature) => (
            <Button
              key={feature}
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => onResumeFeature(feature)}
            >
              Resume {costGuardrailFeatureDisplayName(feature)}
            </Button>
          ))}
        </CardFooter>
      ) : null}
    </Card>
  );
}
