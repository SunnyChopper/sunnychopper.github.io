export type BrainstormPhase = 'Collecting' | 'Analyzing' | 'Drafting';

export type BrainstormProgressState = {
  phaseLabel: BrainstormPhase;
  progressValue: number;
  statusText: string;
  isActive: boolean;
};

const PHASE_COLLECTING_MS = 12_000;
const PHASE_ANALYZING_MS = 30_000;
const PROGRESS_TARGET_MS = 45_000;
const PROGRESS_CAP = 90;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function resolvePhase(elapsedMs: number): BrainstormPhase {
  if (elapsedMs < PHASE_COLLECTING_MS) return 'Collecting';
  if (elapsedMs < PHASE_ANALYZING_MS) return 'Analyzing';
  return 'Drafting';
}

function phaseStatusText(phase: BrainstormPhase): string {
  switch (phase) {
    case 'Collecting':
      return 'Reading your workspace…';
    case 'Analyzing':
      return 'Finding automation opportunities…';
    case 'Drafting':
      return 'Drafting suggestions…';
  }
}

/** Staged brainstorm UX progress from elapsed wall time while the mutation is pending. */
export function resolveBrainstormProgress(
  elapsedMs: number,
  pending: boolean
): BrainstormProgressState {
  if (!pending) {
    return {
      phaseLabel: 'Drafting',
      progressValue: 100,
      statusText: '',
      isActive: false,
    };
  }

  const safeElapsed = Math.max(0, elapsedMs);
  const phaseLabel = resolvePhase(safeElapsed);
  const t = Math.min(safeElapsed / PROGRESS_TARGET_MS, 1);
  const progressValue = Math.round(easeOutCubic(t) * PROGRESS_CAP);

  return {
    phaseLabel,
    progressValue,
    statusText: phaseStatusText(phaseLabel),
    isActive: true,
  };
}
