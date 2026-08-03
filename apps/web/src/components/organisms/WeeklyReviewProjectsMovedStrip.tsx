import { ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { WeeklyReviewProjectMoved } from '@/types/growth-system';
import { portfolioHealthStripClassName } from '@/lib/projects/portfolio-health-surfaces';
import { cn } from '@/lib/utils';

function formatSignedDelta(value: number, suffix = ''): string {
  const rounded = Math.round(value * 10) / 10;
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded}${suffix}`;
}

function DeltaPill({
  label,
  value,
  suffix = '',
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const positive = value > 0;
  const negative = value < 0;
  const Icon = positive ? TrendingUp : negative ? TrendingDown : null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums',
        positive && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
        negative && 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
        !positive && !negative && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      )}
    >
      {Icon ? <Icon className="h-3 w-3" aria-hidden /> : null}
      <span className="text-[10px] uppercase tracking-wide opacity-80">{label}</span>
      <span>{formatSignedDelta(value, suffix)}</span>
    </span>
  );
}

export interface WeeklyReviewProjectsMovedStripProps {
  projects?: WeeklyReviewProjectMoved[];
  muted?: boolean;
  className?: string;
}

export function WeeklyReviewProjectsMovedStrip({
  projects = [],
  muted = false,
  className,
}: WeeklyReviewProjectsMovedStripProps) {
  if (!projects.length) {
    return null;
  }

  return (
    <section className={cn('space-y-3', className)} aria-label="Projects that moved this week">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Projects that moved</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Largest health & completion shifts
        </span>
      </div>
      <div
        className={cn(
          portfolioHealthStripClassName,
          muted && 'opacity-80',
          'flex flex-wrap items-stretch gap-3'
        )}
      >
        {projects.map((project) => (
          <Link
            key={project.projectId}
            to={`/admin/projects?projectId=${encodeURIComponent(project.projectId)}`}
            className={cn(
              'flex min-w-[12rem] flex-1 flex-col gap-2 rounded-lg border px-3 py-2 transition-colors',
              'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50',
              'dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {project.projectName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {project.tasksCompletedInWeek} task
                  {project.tasksCompletedInWeek === 1 ? '' : 's'} done
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <DeltaPill label="Health" value={project.healthScoreDelta} />
              <DeltaPill label="Done" value={project.completionPercentageDelta} suffix="%" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
