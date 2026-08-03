import { Trash2, RefreshCw, CalendarClock } from 'lucide-react';
import type {
  WeeklyReviewQuarantineCandidate,
  WeeklyReviewQuarantineDecision,
} from '@/types/growth-system';
import { cn } from '@/lib/utils';

interface QuarantineZoneProps {
  candidates: WeeklyReviewQuarantineCandidate[];
  decisions: WeeklyReviewQuarantineDecision[];
  onChange: (decisions: WeeklyReviewQuarantineDecision[]) => void;
  /** When true, decisions are shown but cannot be changed (archived / completed week). */
  readOnly?: boolean;
}

const actionChipBase =
  'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors';

const secondaryOutlineChip =
  'border border-slate-400/70 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-500/60 dark:text-slate-300 dark:hover:bg-slate-800/60';

function reviveChipClass(
  action: WeeklyReviewQuarantineDecision['action'] | undefined,
  readOnly: boolean
): string {
  const isPrimary = !action || action === 'revive';
  return cn(
    actionChipBase,
    readOnly && 'cursor-not-allowed opacity-60',
    isPrimary
      ? cn(
          'bg-emerald-600 text-white hover:bg-emerald-700',
          action === 'revive' && 'ring-2 ring-emerald-400/40'
        )
      : secondaryOutlineChip
  );
}

function scheduleChipClass(
  action: WeeklyReviewQuarantineDecision['action'] | undefined,
  readOnly: boolean
): string {
  return cn(
    actionChipBase,
    readOnly && 'cursor-not-allowed opacity-60',
    action === 'schedule' ? 'bg-blue-600 text-white hover:bg-blue-700' : secondaryOutlineChip
  );
}

function deleteChipClass(
  action: WeeklyReviewQuarantineDecision['action'] | undefined,
  readOnly: boolean
): string {
  return cn(
    actionChipBase,
    readOnly && 'cursor-not-allowed opacity-60',
    action === 'delete' ? 'bg-red-600 text-white hover:bg-red-700' : secondaryOutlineChip
  );
}

export function QuarantineZone({
  candidates,
  decisions,
  onChange,
  readOnly = false,
}: QuarantineZoneProps) {
  const setAction = (
    c: WeeklyReviewQuarantineCandidate,
    action: WeeklyReviewQuarantineDecision['action']
  ) => {
    if (readOnly) return;
    const rest = decisions.filter(
      (d) => !(d.entityType === c.entityType && d.entityId === c.entityId)
    );
    onChange([...rest, { entityType: c.entityType, entityId: c.entityId, action }]);
  };

  const decisionFor = (c: WeeklyReviewQuarantineCandidate) =>
    decisions.find((d) => d.entityType === c.entityType && d.entityId === c.entityId);

  if (!candidates.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No quarantine candidates — slate is clear.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.map((c) => {
        const d = decisionFor(c);
        return (
          <div
            key={`${c.entityType}-${c.entityId}`}
            className="rounded-lg border border-amber-300/80 border-l-4 border-l-amber-500 bg-amber-50/90 p-4 dark:border-amber-700/60 dark:border-l-amber-400 dark:bg-amber-950/45"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-slate-100">{c.name}</p>
                <p className="text-xs uppercase tracking-wide text-amber-800/80 dark:text-amber-200/80">
                  {c.entityType}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">{c.reason}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => setAction(c, 'revive')}
                  className={reviveChipClass(d?.action, readOnly)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Revive
                </button>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => setAction(c, 'schedule')}
                  className={scheduleChipClass(d?.action, readOnly)}
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  Reschedule
                </button>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => setAction(c, 'delete')}
                  className={deleteChipClass(d?.action, readOnly)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
            {d?.action === 'schedule' && (
              <input
                type="text"
                readOnly={readOnly}
                disabled={readOnly}
                placeholder="When / how will you revisit this?"
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-slate-500 read-only:opacity-80 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                value={d.rescheduleNote ?? ''}
                onChange={(e) => {
                  if (readOnly) return;
                  const rest = decisions.filter(
                    (x) => !(x.entityType === c.entityType && x.entityId === c.entityId)
                  );
                  onChange([
                    ...rest,
                    {
                      entityType: c.entityType,
                      entityId: c.entityId,
                      action: 'schedule',
                      rescheduleNote: e.target.value,
                    },
                  ]);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
