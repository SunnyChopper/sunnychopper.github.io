import { describe, expect, it } from 'vitest';
import {
  clearLibrarySelection,
  isRefSelected,
  toggleLibrarySelection,
  type LibrarySelectableRef,
} from './library-selection';

const order: LibrarySelectableRef[] = [
  { kind: 'course', id: 'c1' },
  { kind: 'flashcard_deck', id: 'd1' },
  { kind: 'note', id: 'n1' },
  { kind: 'note', id: 'n2' },
  { kind: 'document', id: 'doc1' },
];

describe('library-selection', () => {
  it('toggles a single ref', () => {
    const ref = { kind: 'note' as const, id: 'n1' };
    const on = toggleLibrarySelection([], ref, order);
    expect(isRefSelected(on.selected, ref)).toBe(true);
    const off = toggleLibrarySelection(on.selected, ref, order, { anchorIndex: on.anchorIndex });
    expect(off.selected).toHaveLength(0);
  });

  it('shift-click selects inclusive range from anchor', () => {
    const result = toggleLibrarySelection([], { kind: 'note', id: 'n2' }, order, {
      shiftKey: true,
      anchorIndex: 1,
    });
    expect(result.selected).toEqual([
      { kind: 'flashcard_deck', id: 'd1' },
      { kind: 'note', id: 'n1' },
      { kind: 'note', id: 'n2' },
    ]);
  });

  it('clearLibrarySelection returns empty array', () => {
    expect(clearLibrarySelection()).toEqual([]);
  });
});
