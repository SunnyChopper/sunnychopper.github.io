import Button from '@/components/atoms/Button';
import type { ConsistencyIssue } from '@/lib/personal-branding/platform-rule-tone-consistency';

interface PlatformRuleConsistencyPanelProps {
  issues: ConsistencyIssue[] | null;
  isStale: boolean;
  onAccept: () => void;
  onAdjustRequirements: () => void;
}

export default function PlatformRuleConsistencyPanel({
  issues,
  isStale,
  onAccept,
  onAdjustRequirements,
}: PlatformRuleConsistencyPanelProps) {
  if (issues === null) {
    return null;
  }

  const hasWarnings = issues.some((issue) => issue.severity === 'warning');

  return (
    <div
      className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Consistency check</h3>
        {isStale ? (
          <span className="text-xs text-amber-700 dark:text-amber-300">
            Draft changed — run check again
          </span>
        ) : null}
      </div>

      {issues.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No tone / policy conflicts detected for mapped profiles.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {issues.map((issue) => (
            <li
              key={issue.id}
              className={
                issue.severity === 'warning'
                  ? 'text-amber-800 dark:text-amber-200'
                  : 'text-gray-600 dark:text-gray-400'
              }
            >
              {issue.message}
            </li>
          ))}
        </ul>
      )}

      {hasWarnings ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          These are advisory warnings. You can save the rule as-is or adjust requirements or Core
          Profile tone metrics.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {issues.length > 0 ? (
          <>
            <Button type="button" size="sm" variant="secondary" onClick={onAccept}>
              Accept warnings
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={onAdjustRequirements}>
              Adjust requirements
            </Button>
          </>
        ) : (
          <Button type="button" size="sm" variant="secondary" onClick={onAccept}>
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}
