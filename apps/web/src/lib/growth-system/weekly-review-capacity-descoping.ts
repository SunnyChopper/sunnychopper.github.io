import type {
  WeeklyReviewAcceptedTask,
  WeeklyReviewCapacityAdvisory,
  WeeklyReviewCapacityDeScopeCandidate,
  WeeklyReviewDeScopeDecision,
  WeeklyReviewTechDebtDecision,
} from '@/types/growth-system';

export interface LivePlannedInput {
  advisory: WeeklyReviewCapacityAdvisory;
  acceptedSuggestions: WeeklyReviewAcceptedTask[];
  deScopeDecisions: WeeklyReviewDeScopeDecision[];
  techDebtDecisions: WeeklyReviewTechDebtDecision[];
}

function candidateSizeMap(candidates: WeeklyReviewCapacityDeScopeCandidate[]): Map<string, number> {
  return new Map(candidates.map((c) => [c.taskId, c.size ?? 0]));
}

export function computeLivePlannedStoryPoints(input: LivePlannedInput): number {
  const sizes = candidateSizeMap(input.advisory.candidates);
  const accepted = input.acceptedSuggestions.reduce((sum, t) => sum + (t.size ?? 0), 0);
  const deScoped = input.deScopeDecisions.reduce((sum, d) => sum + (sizes.get(d.taskId) ?? 0), 0);
  const purged = input.techDebtDecisions
    .filter((d) => d.action === 'purge')
    .reduce((sum, d) => sum + (sizes.get(d.taskId) ?? 0), 0);
  return Math.max(0, input.advisory.scheduledStoryPoints + accepted - deScoped - purged);
}

export function isCapacityOverloaded(planned: number, softCapacity: number): boolean {
  return planned > softCapacity;
}

export function pickVisibleDeScopeCandidates(
  advisory: WeeklyReviewCapacityAdvisory,
  deScopeDecisions: WeeklyReviewDeScopeDecision[],
  techDebtDecisions: WeeklyReviewTechDebtDecision[],
  maxVisible = 2
): WeeklyReviewCapacityDeScopeCandidate[] {
  const excluded = new Set<string>([
    ...deScopeDecisions.map((d) => d.taskId),
    ...techDebtDecisions.filter((d) => d.action === 'purge').map((d) => d.taskId),
  ]);
  return advisory.candidates.filter((c) => !excluded.has(c.taskId)).slice(0, maxVisible);
}

export function capacityAdvisoryReasonLine(advisory: WeeklyReviewCapacityAdvisory): string {
  const trailing = Math.round(advisory.trailingWeeklyAverageStoryPoints);
  if (advisory.recoveryMultiplier < 1) {
    return `Based on ~${trailing} pts/week velocity with recovery tightened this week.`;
  }
  if (advisory.marginBuffer > 0) {
    const pct = Math.round(advisory.marginBuffer * 100);
    return `Based on ~${trailing} pts/week velocity with a ${pct}% safety buffer.`;
  }
  return `Based on ~${trailing} pts/week recent velocity.`;
}
