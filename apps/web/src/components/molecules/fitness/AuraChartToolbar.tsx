import { Select } from '@/components/atoms/Select';
import { cn } from '@/lib/utils';
import type { AuraXMetric } from '@/types/fitness';

export type AuraRangePreset = '7d' | '30d' | '90d' | 'all';

const RANGE_PRESETS: AuraRangePreset[] = ['7d', '30d', '90d', 'all'];

const X_OPTIONS: { value: AuraXMetric; label: string }[] = [
  { value: 'sleepHours', label: 'Sleep hours' },
  { value: 'sleepQuality', label: 'Sleep quality' },
  { value: 'energyLevel', label: 'Energy' },
  { value: 'recoveryScore', label: 'Recovery score' },
  { value: 'sleepDebt', label: 'Sleep debt (7d)' },
];

export interface AuraChartToolbarProps {
  preset: AuraRangePreset;
  onPresetChange: (preset: AuraRangePreset) => void;
  xMetric: AuraXMetric;
  onXMetricChange: (metric: AuraXMetric) => void;
  className?: string;
}

export function AuraChartToolbar({
  preset,
  onPresetChange,
  xMetric,
  onXMetricChange,
  className,
}: AuraChartToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Aura chart range and X axis"
      className={cn(
        'sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white/90 p-2.5 backdrop-blur sm:gap-3 sm:p-3',
        'dark:border-gray-800 dark:bg-gray-900/90',
        'lg:top-4',
        className
      )}
    >
      <span className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">Range</span>
      {RANGE_PRESETS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPresetChange(p)}
          aria-pressed={preset === p}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs sm:text-sm',
            preset === p
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
          )}
        >
          {p === 'all' ? '2y' : p}
        </button>
      ))}

      <div className="flex items-center gap-2 sm:ml-1">
        <label
          htmlFor="aura-x-metric"
          className="shrink-0 text-xs text-gray-600 dark:text-gray-300 sm:text-sm"
        >
          X axis
        </label>
        <div className="w-44 max-w-full shrink-0">
          <Select
            id="aura-x-metric"
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
            value={xMetric}
            onChange={(e) => onXMetricChange(e.target.value as AuraXMetric)}
          >
            {X_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">vs story points</span>
      </div>
    </div>
  );
}
