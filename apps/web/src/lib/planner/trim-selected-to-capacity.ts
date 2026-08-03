import type { PlanDaySuggestion } from '@/types/planner';

const CAPACITY_EPSILON = 1e-6;

export interface TrimSelectedToCapacityInput {
  selectedIds: Iterable<string>;
  suggestions: PlanDaySuggestion[];
  capacityPoints: number;
}

export interface TrimSelectedToCapacityResult {
  selectedIds: Set<string>;
  removedIds: string[];
}

/** Parse P1/P2/P3… to numeric rank; unknown priorities sort after known ranks. */
export function parsePriorityRank(priority: string): number {
  const match = /^P(\d+)$/i.exec(priority.trim());
  if (match) return Number(match[1]);
  return Number.MAX_SAFE_INTEGER;
}

function sumSelectedPoints(selected: Set<string>, byId: Map<string, PlanDaySuggestion>): number {
  let sum = 0;
  for (const id of selected) {
    sum += byId.get(id)?.storyPoints ?? 0;
  }
  return sum;
}

/** Positive when `a` should be removed before `b` (worse priority for keeping). */
export function compareForCapacityRemoval(a: PlanDaySuggestion, b: PlanDaySuggestion): number {
  const rankDiff = parsePriorityRank(a.priority) - parsePriorityRank(b.priority);
  if (rankDiff !== 0) return rankDiff;

  const scoreDiff = b.score - a.score;
  if (scoreDiff !== 0) return scoreDiff;

  const pointsDiff = a.storyPoints - b.storyPoints;
  if (pointsDiff !== 0) return pointsDiff;

  return a.taskId.localeCompare(b.taskId);
}

function pickRemovalCandidate(
  selected: Set<string>,
  byId: Map<string, PlanDaySuggestion>
): string | null {
  let worst: PlanDaySuggestion | null = null;
  for (const id of selected) {
    const suggestion = byId.get(id);
    if (!suggestion) continue;
    if (!worst || compareForCapacityRemoval(suggestion, worst) > 0) {
      worst = suggestion;
    }
  }
  return worst?.taskId ?? null;
}

/**
 * Deselect lowest-priority selected tasks until total story points fit capacity.
 * Pure client-side; does not mutate server state.
 */
export function trimSelectedToCapacity({
  selectedIds,
  suggestions,
  capacityPoints,
}: TrimSelectedToCapacityInput): TrimSelectedToCapacityResult {
  const byId = new Map(suggestions.map((s) => [s.taskId, s]));
  const next = new Set(selectedIds);
  const removedIds: string[] = [];

  while (next.size > 0 && sumSelectedPoints(next, byId) > capacityPoints + CAPACITY_EPSILON) {
    const removeId = pickRemovalCandidate(next, byId);
    if (!removeId) break;
    next.delete(removeId);
    removedIds.push(removeId);
  }

  return { selectedIds: next, removedIds };
}

export function formatCapacityExcessPoints(selectedPoints: number, capacityPoints: number): string {
  const excess = Math.max(0, selectedPoints - capacityPoints);
  return `${excess.toFixed(1)} pts over capacity`;
}
