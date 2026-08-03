import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/templates/PageContainer';
import { FitnessModulePageHeader } from '@/components/molecules/fitness/FitnessModulePageHeader';
import { AuraCorrelationChartGate } from '@/components/molecules/fitness/AuraCorrelationChartGate';
import {
  AuraChartToolbar,
  type AuraRangePreset,
} from '@/components/molecules/fitness/AuraChartToolbar';
import { useAuraSeries } from '@/hooks/useFitness';
import type { AuraXMetric } from '@/types/fitness';
import { localCalendarDate, addCalendarDays } from '@/lib/date/local-calendar';

function rangeForPreset(preset: AuraRangePreset): { start: string; end: string } {
  const end = localCalendarDate();
  if (preset === 'all') {
    return { start: addCalendarDays(end, -730), end };
  }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  return { start: addCalendarDays(end, -days), end };
}

export default function HealthFitnessAuraPage() {
  const [preset, setPreset] = useState<AuraRangePreset>('30d');
  const [xMetric, setXMetric] = useState<AuraXMetric>('sleepHours');

  const { start, end } = useMemo(() => rangeForPreset(preset), [preset]);
  const { data, isLoading } = useAuraSeries(start, end, xMetric);

  const series = data?.success ? data.data : null;
  const r = series?.correlationCoefficient;

  return (
    <PageContainer className="space-y-8">
      <FitnessModulePageHeader
        icon={Sparkles}
        title="Aura"
        purpose="See how daily recovery correlates with completed story points."
        accent="cyan"
      />

      <AuraChartToolbar
        preset={preset}
        onPresetChange={setPreset}
        xMetric={xMetric}
        onXMetricChange={setXMetric}
      />

      {isLoading && <p className="text-sm text-gray-500">Loading series…</p>}

      {series && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pearson{' '}
            <span className="font-mono font-medium text-gray-900 dark:text-white">
              {r != null ? r.toFixed(3) : 'n/a'}
            </span>{' '}
            over days with both recovery metric and completed points ({series.points.length}{' '}
            points).
          </p>
          <AuraCorrelationChartGate points={series.points} xMetric={xMetric} />
        </>
      )}
    </PageContainer>
  );
}
