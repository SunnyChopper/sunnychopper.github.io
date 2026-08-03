import { cn } from '@/lib/utils';
import { formatToneScorePercent, humanizeToneMetricKey } from '@/lib/personal-branding/tone-score';
import { normalizeToneMetrics } from '@/lib/personal-branding/profile-strength';

interface OutputTestToneScorecardProps {
  scores?: Record<string, number> | null;
  targets: Record<string, number | unknown>;
  overallToneMatch?: number | null;
  activeBiasKey?: string | null;
  onBiasMetric: (key: string) => void;
  disabled?: boolean;
  isScoringFailed?: boolean;
  className?: string;
}

export default function OutputTestToneScorecard({
  scores,
  targets,
  overallToneMatch,
  activeBiasKey,
  onBiasMetric,
  disabled = false,
  isScoringFailed = false,
  className,
}: OutputTestToneScorecardProps) {
  const normalizedTargets = normalizeToneMetrics(targets);
  const metricKeys = Object.keys(normalizedTargets).sort((a, b) => a.localeCompare(b));

  if (metricKeys.length === 0) {
    return (
      <p
        className={cn(
          'rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400',
          className
        )}
      >
        Add tone metrics to your profile to score preview voice alignment.
      </p>
    );
  }

  if (!scores) {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-950/50',
          className
        )}
      >
        <p className="font-medium text-gray-800 dark:text-gray-200">Tone alignment</p>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {isScoringFailed
            ? 'Could not score this preview against your tone metrics.'
            : 'Generate a preview to see tone alignment scores.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-950/50',
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium text-gray-800 dark:text-gray-200">Tone alignment</p>
        {overallToneMatch != null ? (
          <p className="text-gray-600 dark:text-gray-400">
            Overall {formatToneScorePercent(overallToneMatch)}
          </p>
        ) : null}
      </div>
      {activeBiasKey ? (
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Biased toward {humanizeToneMetricKey(activeBiasKey)}
        </p>
      ) : null}
      <ul className="mt-3 space-y-2" role="list">
        {metricKeys.map((key) => {
          const score = scores[key] ?? 0;
          const target = normalizedTargets[key] ?? 0;
          const label = humanizeToneMetricKey(key);
          return (
            <li key={key}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onBiasMetric(key)}
                aria-label={`Regenerate with more ${label}`}
                className={cn(
                  'group w-full rounded-md px-1 py-1 text-left transition-colors',
                  'hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-gray-900/60'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{label}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatToneScorePercent(score)} · target {target.toFixed(2)}
                  </span>
                </div>
                <div
                  className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
                  aria-hidden
                >
                  <span
                    className="absolute top-0 bottom-0 w-px bg-gray-400/80 dark:bg-gray-500"
                    style={{ left: `${Math.round(target * 100)}%` }}
                  />
                  <span
                    className="block h-full rounded-full bg-blue-500/80 transition-[width] group-hover:bg-blue-500"
                    style={{ width: `${Math.round(score * 100)}%` }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
