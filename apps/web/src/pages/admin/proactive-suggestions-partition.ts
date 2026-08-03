import type { ProactiveSuggestion } from '@/types/api-contracts';

function byUpdatedDesc(a: ProactiveSuggestion, b: ProactiveSuggestion): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

/** Coach informational rows must not appear in the scheduled-automation suggestions inbox. */
export function isCoachAvoidanceSuggestion(suggestion: ProactiveSuggestion): boolean {
  if (suggestion.contextKind === 'coachAvoidance') {
    return true;
  }
  const title = String(suggestion.proposedPayload?.title ?? '');
  if (/strict coach:\s*stop avoiding/i.test(title)) {
    return true;
  }
  if (/accountability check:/i.test(title)) {
    return true;
  }
  return false;
}

function withoutCoachAvoidance(suggestions: ProactiveSuggestion[]): ProactiveSuggestion[] {
  return suggestions.filter((s) => !isCoachAvoidanceSuggestion(s));
}

export function partitionProactiveSuggestions(all: ProactiveSuggestion[]): {
  pending: ProactiveSuggestion[];
  accepted: ProactiveSuggestion[];
  rejected: ProactiveSuggestion[];
} {
  const visible = withoutCoachAvoidance(all);
  const accepted = visible.filter((s) => s.status === 'approved').sort(byUpdatedDesc);
  const rejected = visible.filter((s) => s.status === 'rejected').sort(byUpdatedDesc);
  const pending = visible.filter((s) => s.status !== 'approved' && s.status !== 'rejected');
  return { pending, accepted, rejected };
}
