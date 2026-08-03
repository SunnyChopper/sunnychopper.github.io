import type { TagSuggestionsOutput } from '@/lib/llm/schemas/note-ai-schemas';

export type SuggestedTagRow = TagSuggestionsOutput['suggestedTags'][number];

/** Client-side threshold for bulk "Apply all high-confidence". */
export const NOTE_SUGGEST_TAGS_HIGH_CONFIDENCE = 0.7;

export function normalizeSuggestedTagLabel(tag: string): string {
  return tag.trim().toLowerCase();
}

export function relevanceToPercent(relevance: number): number {
  return Math.round(Math.min(Math.max(relevance, 0), 1) * 100);
}

export function isHighConfidenceTag(
  item: SuggestedTagRow,
  threshold = NOTE_SUGGEST_TAGS_HIGH_CONFIDENCE
): boolean {
  return item.relevance >= threshold;
}

export function filterNovelSuggestedTags(
  suggested: SuggestedTagRow[],
  existingTags: string[]
): SuggestedTagRow[] {
  const existing = new Set(existingTags.map(normalizeSuggestedTagLabel));
  const seen = new Set<string>();

  return suggested
    .map((item) => ({
      ...item,
      tag: normalizeSuggestedTagLabel(item.tag),
    }))
    .filter((item) => {
      if (!item.tag || existing.has(item.tag) || seen.has(item.tag)) {
        return false;
      }
      seen.add(item.tag);
      return true;
    });
}

export function selectHighConfidenceTags(
  items: SuggestedTagRow[],
  threshold = NOTE_SUGGEST_TAGS_HIGH_CONFIDENCE
): SuggestedTagRow[] {
  return items.filter((item) => isHighConfidenceTag(item, threshold));
}

export function mergeTags(existing: string[], toAdd: string[]): string[] {
  const merged = [...existing];
  const existingSet = new Set(existing.map(normalizeSuggestedTagLabel));

  for (const tag of toAdd) {
    const normalized = normalizeSuggestedTagLabel(tag);
    if (!normalized || existingSet.has(normalized)) {
      continue;
    }
    existingSet.add(normalized);
    merged.push(normalized);
  }

  return merged;
}

export function countHighConfidenceNovelTags(
  suggestions: SuggestedTagRow[],
  appliedTags: string[],
  threshold = NOTE_SUGGEST_TAGS_HIGH_CONFIDENCE
): number {
  const applied = new Set(appliedTags.map(normalizeSuggestedTagLabel));
  return selectHighConfidenceTags(suggestions, threshold).filter((item) => !applied.has(item.tag))
    .length;
}
