export type LibrarySelectableKind =
  | 'course'
  | 'flashcard_deck'
  | 'note'
  | 'document'
  | 'course_lesson'
  | 'practice_question_set'
  | 'quiz'
  | 'homework_assignment';

export interface LibrarySelectableRef {
  kind: LibrarySelectableKind;
  id: string;
}

export function refKey(ref: LibrarySelectableRef): string {
  return `${ref.kind}:${ref.id}`;
}

export function isRefSelected(
  selected: LibrarySelectableRef[],
  ref: LibrarySelectableRef
): boolean {
  return selected.some((s) => s.kind === ref.kind && s.id === ref.id);
}

export function findRefIndex(
  visibleOrder: LibrarySelectableRef[],
  ref: LibrarySelectableRef
): number {
  return visibleOrder.findIndex((v) => v.kind === ref.kind && v.id === ref.id);
}

export interface SelectionToggleResult {
  selected: LibrarySelectableRef[];
  anchorIndex: number | null;
}

export function toggleLibrarySelection(
  selected: LibrarySelectableRef[],
  ref: LibrarySelectableRef,
  visibleOrder: LibrarySelectableRef[],
  options: { shiftKey?: boolean; anchorIndex?: number | null } = {}
): SelectionToggleResult {
  const currentIndex = findRefIndex(visibleOrder, ref);
  const anchorIndex = options.anchorIndex ?? null;

  if (options.shiftKey && anchorIndex !== null && currentIndex >= 0) {
    const start = Math.min(anchorIndex, currentIndex);
    const end = Math.max(anchorIndex, currentIndex);
    const range = visibleOrder.slice(start, end + 1);
    const merged = [...selected];
    for (const entry of range) {
      if (!isRefSelected(merged, entry)) {
        merged.push(entry);
      }
    }
    return { selected: merged, anchorIndex };
  }

  if (isRefSelected(selected, ref)) {
    return {
      selected: selected.filter((s) => !(s.kind === ref.kind && s.id === ref.id)),
      anchorIndex: currentIndex >= 0 ? currentIndex : anchorIndex,
    };
  }

  return {
    selected: [...selected, ref],
    anchorIndex: currentIndex >= 0 ? currentIndex : anchorIndex,
  };
}

export function clearLibrarySelection(): LibrarySelectableRef[] {
  return [];
}
