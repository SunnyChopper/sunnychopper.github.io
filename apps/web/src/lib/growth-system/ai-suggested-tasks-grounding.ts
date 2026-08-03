import type {
  SuccessCriterion,
  WeeklyReviewSuggestedTask,
  WeeklyReviewVelocityWeek,
} from '@/types/growth-system';

export type GoalGroundingLookup = {
  title: string;
  successCriteria?: SuccessCriterion[];
};

/** Primary linked goal for a suggestion (first id wins). */
export function primaryGoalId(task: Pick<WeeklyReviewSuggestedTask, 'goalIds'>): string | null {
  const id = task.goalIds?.[0];
  return id && id.trim() ? id : null;
}

/** Shared primary goal id when every suggestion has the same non-null primary; else null. */
export function unanimousGoalId(
  suggestions: Pick<WeeklyReviewSuggestedTask, 'goalIds'>[]
): string | null {
  if (suggestions.length === 0) return null;
  const first = primaryGoalId(suggestions[0]!);
  if (!first) return null;
  return suggestions.every((s) => primaryGoalId(s) === first) ? first : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remove redundant goal-name boilerplate from rationale when all suggestions share one goal.
 * Keeps any remaining unique sentence(s); returns empty string when nothing unique remains.
 */
export function stripSharedGoalRationale(rationale: string, goalTitle: string): string {
  let text = rationale.trim();
  if (!text || !goalTitle.trim()) return text;

  const escapedTitle = escapeRegExp(goalTitle.trim());

  const patterns: RegExp[] = [
    new RegExp(
      `^this task is related to the goal ['"]${escapedTitle}['"] and is a high-priority task\\.?\\s*`,
      'i'
    ),
    new RegExp(`^this task is related to the goal ['"]${escapedTitle}['"]\\.?\\s*`, 'i'),
    new RegExp(`^related to the goal ['"]${escapedTitle}['"]\\.?\\s*`, 'i'),
    new RegExp(`^tied to the goal ['"]${escapedTitle}['"]\\.?\\s*`, 'i'),
    new RegExp(`^supports the goal ['"]${escapedTitle}['"]\\.?\\s*`, 'i'),
    new RegExp(`^for the goal ['"]${escapedTitle}['"]\\.?\\s*`, 'i'),
    new RegExp(`^this is a high-priority task\\.?\\s*`, 'i'),
    new RegExp(`['"]${escapedTitle}['"]`, 'gi'),
  ];

  for (const pattern of patterns) {
    text = text.replace(pattern, '').trim();
  }

  text = text
    .replace(/\s{2,}/g, ' ')
    .replace(/^[.,;:\s]+/, '')
    .trim();
  return text;
}

/** Short velocity line from trend + recent completed story points. */
export function formatVelocityGrounding(
  trend: string | undefined,
  velocityData: WeeklyReviewVelocityWeek[] | undefined
): string | null {
  const normalizedTrend = trend?.trim().toLowerCase();
  const recent = (velocityData ?? []).slice(-2);
  const points = recent.map((w) => w.storyPointsCompleted);
  const hasPoints = points.some((p) => p > 0);

  if (!normalizedTrend && !hasPoints) return null;

  const trendLabel =
    normalizedTrend === 'accelerating'
      ? 'Velocity is accelerating'
      : normalizedTrend === 'decelerating'
        ? 'Velocity is decelerating'
        : normalizedTrend === 'stable'
          ? 'Velocity is stable'
          : normalizedTrend
            ? `Velocity trend: ${trend}`
            : null;

  if (!hasPoints) return trendLabel;

  const pointParts = recent.map((w) => `${w.storyPointsCompleted} pts`);
  const pointsLine =
    recent.length === 1 ? `Last week: ${pointParts[0]}` : `Recent weeks: ${pointParts.join(', ')}`;

  if (trendLabel) return `${trendLabel}. ${pointsLine}.`;
  return `${pointsLine}.`;
}

/** Up to two incomplete success-criteria descriptions. */
export function formatCriteriaGrounding(
  successCriteria: SuccessCriterion[] | undefined
): string | null {
  const incomplete = (successCriteria ?? []).filter((c) => !c.isCompleted && c.description?.trim());
  if (incomplete.length === 0) return null;

  const descriptions = incomplete.slice(0, 2).map((c) => c.description.trim());
  if (descriptions.length === 1) {
    return `Open criterion: ${descriptions[0]}`;
  }
  return `Open criteria: ${descriptions.join('; ')}`;
}

export type BuildWhyThisTextInput = {
  goalTitle?: string | null;
  criteria?: SuccessCriterion[];
  velocityTrend?: string;
  velocityData?: WeeklyReviewVelocityWeek[];
  rationale?: string;
  unanimousGoalTitle?: string | null;
};

/** Compose tooltip copy: criteria first, then velocity, then trimmed rationale, then fallback. */
export function buildWhyThisText(input: BuildWhyThisTextInput): string {
  const criteriaLine = formatCriteriaGrounding(input.criteria);
  const velocityLine = formatVelocityGrounding(input.velocityTrend, input.velocityData);

  const parts: string[] = [];
  if (criteriaLine) parts.push(criteriaLine);
  if (velocityLine) parts.push(velocityLine);

  if (parts.length === 0 && input.rationale?.trim()) {
    const stripped = input.unanimousGoalTitle
      ? stripSharedGoalRationale(input.rationale, input.unanimousGoalTitle)
      : input.rationale.trim();
    if (stripped) parts.push(stripped);
  }

  if (parts.length === 0) {
    if (input.goalTitle?.trim()) {
      return `Linked to "${input.goalTitle}" for this week's sprint planning.`;
    }
    return "Suggested for this week's sprint planning.";
  }

  return parts.join(' ');
}
