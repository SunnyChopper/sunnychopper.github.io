import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { WeeklyReviewProjectRiskAssessment } from '@/types/growth-system';
import { cn } from '@/lib/utils';

const RISK_LEVEL_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

function riskLevelBadgeClass(level: string): string {
  switch (level) {
    case 'critical':
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    case 'moderate':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
  }
}

function sortAssessments(
  rows: WeeklyReviewProjectRiskAssessment[]
): WeeklyReviewProjectRiskAssessment[] {
  return [...rows].sort((a, b) => {
    const aLevel = a.assessment?.overallRiskLevel ?? 'low';
    const bLevel = b.assessment?.overallRiskLevel ?? 'low';
    const levelCmp = (RISK_LEVEL_ORDER[aLevel] ?? 99) - (RISK_LEVEL_ORDER[bLevel] ?? 99);
    if (levelCmp !== 0) return levelCmp;
    return a.projectName.localeCompare(b.projectName);
  });
}

interface WeeklyReviewProjectRisksProps {
  assessments?: WeeklyReviewProjectRiskAssessment[];
  muted?: boolean;
}

export function WeeklyReviewProjectRisks({
  assessments = [],
  muted = false,
}: WeeklyReviewProjectRisksProps) {
  const sorted = sortAssessments(assessments);

  if (!sorted.length) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No pinned projects — pin one from Risk Assessment to include here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((row) => (
        <article
          key={row.projectId}
          className={cn(
            'rounded-lg border p-4',
            muted
              ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white">{row.projectName}</h4>
              {row.status === 'ok' && row.assessment && (
                <span
                  className={cn(
                    'mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                    riskLevelBadgeClass(row.assessment.overallRiskLevel)
                  )}
                >
                  {row.assessment.overallRiskLevel} risk
                </span>
              )}
              {row.status === 'skipped' && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Skipped — add tasks before weekly assessment can run.
                </p>
              )}
              {row.status === 'failed' && (
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  Assessment failed{row.errorMessage ? `: ${row.errorMessage}` : '.'}
                </p>
              )}
            </div>
            <Link
              to={`/admin/projects?projectId=${encodeURIComponent(row.projectId)}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open project
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {row.status === 'ok' && row.assessment && (
            <div className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>{row.assessment.topPriorityRisk}</p>
              {row.assessment.risks.length > 0 && (
                <ul className="space-y-2">
                  {row.assessment.risks.slice(0, 3).map((risk) => (
                    <li
                      key={`${row.projectId}-${risk.riskTitle}`}
                      className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-900/40"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{risk.riskTitle}</p>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">{risk.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export function WeeklyReviewProjectRisksSection({
  assessments,
  muted = false,
}: WeeklyReviewProjectRisksProps) {
  return (
    <>
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        Project risks
      </h3>
      <WeeklyReviewProjectRisks assessments={assessments} muted={muted} />
    </>
  );
}
