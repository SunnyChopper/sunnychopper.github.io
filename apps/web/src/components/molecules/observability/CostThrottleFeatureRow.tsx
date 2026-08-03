import { CirclePause, Play } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { costGuardrailFeatureDisplayName } from '@/lib/observability/cost-guardrail-helpers';
import { costGuardrailsFeatureRowClassName } from '@/lib/observability/cost-guardrail-surfaces';
import { cn } from '@/lib/utils';

export type CostThrottleFeatureRowProps = {
  feature: string;
  paused: boolean;
  manual?: boolean;
  disabled?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
};

export default function CostThrottleFeatureRow({
  feature,
  paused,
  manual = false,
  disabled = false,
  onPause,
  onResume,
  className,
}: CostThrottleFeatureRowProps) {
  const displayName = costGuardrailFeatureDisplayName(feature);

  return (
    <div className={cn(costGuardrailsFeatureRowClassName, className)}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-white">{displayName}</p>
          {paused ? <StatusBadge status={manual ? 'Paused' : 'Throttling'} size="sm" /> : null}
        </div>
        <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">{feature}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {paused ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={onResume}
          >
            <Play className="h-3.5 w-3.5" />
            Resume
          </Button>
        ) : (
          <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={onPause}>
            <CirclePause className="h-3.5 w-3.5" />
            Pause
          </Button>
        )}
      </div>
    </div>
  );
}
