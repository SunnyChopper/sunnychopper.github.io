import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Button from '@/components/atoms/Button';
import { RecoveryScoreRing } from '@/components/atoms/RecoveryScoreRing';
import { DailyRecoveryDialog } from '@/components/organisms/fitness/DailyRecoveryDialog';
import {
  useFitnessRecoveryRange,
  useSetSleepDebtPreferencesMutation,
  useSleepDebt,
  useSleepDebtPreferences,
} from '@/hooks/useFitness';
import { localCalendarDate } from '@/lib/date/local-calendar';
import { computeRecoveryScore } from '@/lib/fitness/compute-recovery-score';
import { sleepDebtStatusLine } from '@/lib/fitness/format-sleep-debt';
import { recoveryCapacityStatus } from '@/lib/fitness/recovery-capacity-status';
import { fitnessCapacityZoneClassName } from '@/lib/fitness/fitness-surfaces';
import { cn } from '@/lib/utils';
import type { DailyRecovery } from '@/types/fitness';

function recoveryRowHasPersistedScore(row: DailyRecovery | undefined): boolean {
  if (!row) return false;
  return row.recoveryScore != null && Number.isFinite(row.recoveryScore);
}

function resolveDisplayScore(row: DailyRecovery | undefined): number | null {
  if (recoveryRowHasPersistedScore(row)) {
    return row!.recoveryScore;
  }
  if (!row) return null;
  return computeRecoveryScore({
    sleepHours: row.sleepHours,
    sleepQuality: row.sleepQuality,
    energyLevel: row.energyLevel,
    sorenessLevel: row.sorenessLevel,
  });
}

function hasLoggedRecovery(row: DailyRecovery | undefined): boolean {
  if (!row) return false;
  if (row.isPersisted) return true;
  return resolveDisplayScore(row) != null;
}

export function CapacityRecoveryHero() {
  const today = localCalendarDate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState('8');

  const { data: recoveryRes, isLoading } = useFitnessRecoveryRange(today, today);
  const { data: sleepDebtRes, isLoading: sleepDebtLoading } = useSleepDebt(today);
  const { data: sleepPrefs } = useSleepDebtPreferences();
  const setTargetMutation = useSetSleepDebtPreferencesMutation();

  const existing =
    recoveryRes?.success && recoveryRes.data ? recoveryRes.data.data?.[0] : undefined;
  const displayScore = useMemo(() => resolveDisplayScore(existing), [existing]);
  const status = recoveryCapacityStatus(displayScore);
  const logged = hasLoggedRecovery(existing);

  const sleepDebt = sleepDebtRes?.success ? sleepDebtRes.data : undefined;
  const targetHours = sleepPrefs?.targetHours ?? sleepDebt?.targetHours ?? 8;

  const ctaLabel = logged ? 'Update recovery' : 'Log recovery';

  const saveTarget = () => {
    const parsed = Number(targetDraft);
    if (!Number.isFinite(parsed) || parsed < 4 || parsed > 12) {
      return;
    }
    setTargetMutation.mutate(parsed, {
      onSuccess: () => setEditingTarget(false),
    });
  };

  return (
    <>
      <section
        className={cn(
          fitnessCapacityZoneClassName,
          'flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left'
        )}
        aria-label="Today's recovery capacity"
        data-testid="capacity-recovery-hero"
      >
        <div className="relative h-[88px] w-[88px] shrink-0">
          <AnimatePresence initial={false}>
            {displayScore != null ? (
              <RecoveryScoreRing key="hero-score" score={displayScore} size="hero" />
            ) : (
              <div
                key="hero-empty"
                className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-dashed border-gray-200 dark:border-gray-600"
                aria-hidden
              >
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">—</span>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Recovery
            </p>
            {isLoading ? (
              <p className="mt-1 text-base text-gray-600 dark:text-gray-300">Loading…</p>
            ) : (
              <p
                className="mt-1 text-lg font-semibold text-gray-900 dark:text-white"
                data-testid="capacity-recovery-status"
              >
                {status.sentence}
              </p>
            )}
            {!sleepDebtLoading && sleepDebt && (
              <p
                className="mt-1 text-sm text-gray-600 dark:text-gray-300"
                data-testid="capacity-sleep-debt"
              >
                {sleepDebtStatusLine(sleepDebt.loggedDays, sleepDebt.debtHours)}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {editingTarget ? (
                <>
                  <label className="sr-only" htmlFor="sleep-target-hours">
                    Sleep target hours
                  </label>
                  <input
                    id="sleep-target-hours"
                    type="number"
                    min={4}
                    max={12}
                    step={0.5}
                    value={targetDraft}
                    onChange={(e) => setTargetDraft(e.target.value)}
                    className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
                    data-testid="sleep-target-input"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">h target</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={saveTarget}
                    disabled={setTargetMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTarget(false);
                      setTargetDraft(String(targetHours));
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <button
                  type="button"
                  className="text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => {
                    setTargetDraft(String(targetHours));
                    setEditingTarget(true);
                  }}
                  data-testid="sleep-target-trigger"
                >
                  Target {targetHours}h
                </button>
              )}
            </div>
          </div>
          <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
            {ctaLabel}
          </Button>
        </div>
      </section>

      <DailyRecoveryDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
