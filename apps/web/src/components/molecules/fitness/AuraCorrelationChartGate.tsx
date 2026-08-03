import { useNavigate } from 'react-router-dom';
import { AuraScatterChart } from '@/components/molecules/AuraScatterChart';
import { EmptyState } from '@/components/molecules/EmptyState';
import { AURA_CORRELATION_UNLOCK_DAYS } from '@/lib/fitness/aura-correlation';
import { ROUTES } from '@/routes';
import type { AuraPoint, AuraXMetric } from '@/types/fitness';
import { cn } from '@/lib/utils';
import {
  fitnessSectionClassName,
  fitnessSectionCompactPaddingClassName,
} from '@/lib/fitness/fitness-surfaces';

const CHART_SHELL_CLASS = cn(fitnessSectionClassName, fitnessSectionCompactPaddingClassName);

const BOTH_SIGNALS_DESCRIPTION =
  'Need days with a recovery X metric and story-point activity in this window.';

interface AuraCorrelationChartGateProps {
  points: AuraPoint[];
  xMetric: AuraXMetric;
  className?: string;
  onLogRecovery?: () => void;
}

export function AuraCorrelationChartGate({
  points,
  xMetric,
  className,
  onLogRecovery,
}: AuraCorrelationChartGateProps) {
  const navigate = useNavigate();
  const n = points.length;
  const unlockDays = AURA_CORRELATION_UNLOCK_DAYS;

  const handleLogRecovery = onLogRecovery ?? (() => navigate(ROUTES.admin.healthFitness));

  if (n >= unlockDays) {
    return <AuraScatterChart points={points} xMetric={xMetric} className={className} />;
  }

  const progressTitle = `${n} of ${unlockDays} days with both signals`;

  return (
    <div
      className={cn(CHART_SHELL_CLASS, 'min-h-[292px]', className)}
      role="status"
      aria-label={progressTitle}
    >
      <EmptyState
        scene="auraCorrelation"
        title={progressTitle}
        description={BOTH_SIGNALS_DESCRIPTION}
        actionLabel="Log recovery"
        onAction={handleLogRecovery}
        density="compact"
      />
    </div>
  );
}
