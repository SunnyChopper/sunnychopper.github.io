import { Sparkles } from 'lucide-react';
import type { LeverageRoiEnergyPatternInsight } from '@/types/growth-system';
import { cn } from '@/lib/utils';

interface EnergyPatternInsightCalloutProps {
  insight: LeverageRoiEnergyPatternInsight | null | undefined;
  className?: string;
}

function formatEnergyPatternInsight(insight: LeverageRoiEnergyPatternInsight): string {
  const weeks = Math.round(insight.lookbackDays / 7);
  const weekLabel = weeks === 1 ? 'week' : 'weeks';
  return `Your high-leverage work tends to be ${insight.dominantEnergyLevel} energy — ${insight.dominantCount} of ${insight.taggedHighLeverageCount} tagged high-leverage completions over the last ${weeks} ${weekLabel}.`;
}

export function EnergyPatternInsightCallout({
  insight,
  className,
}: EnergyPatternInsightCalloutProps) {
  if (!insight) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-violet-200/80 bg-violet-50/70 px-3 py-2.5 text-sm text-violet-950 dark:border-violet-800/50 dark:bg-violet-950/25 dark:text-violet-100',
        className
      )}
      role="status"
      data-testid="energy-pattern-insight-callout"
    >
      <p className="flex items-start gap-2">
        <Sparkles
          className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300"
          aria-hidden
        />
        <span>{formatEnergyPatternInsight(insight)}</span>
      </p>
    </div>
  );
}
