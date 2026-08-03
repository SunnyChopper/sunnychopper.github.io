import { describe, expect, it, vi } from 'vitest';
import {
  bulkAddTags,
  bulkSoftArchive,
  canBulkAddTags,
  canBulkArchive,
  summarizeBulkOutcome,
  type LibraryBulkMutations,
} from './library-bulk-actions';
import type { LibrarySelectableRef } from './library-selection';

const noteRef: LibrarySelectableRef = { kind: 'note', id: 'n1' };
const lessonRef: LibrarySelectableRef = { kind: 'course_lesson', id: 'l1' };

describe('library-bulk-actions', () => {
  it('canBulkAddTags excludes courses and orphan lessons', () => {
    expect(canBulkAddTags(noteRef)).toBe(true);
    expect(canBulkAddTags({ kind: 'course', id: 'c1' })).toBe(false);
    expect(canBulkAddTags(lessonRef)).toBe(false);
  });

  it('canBulkArchive skips orphan lessons', () => {
    expect(canBulkArchive(lessonRef)).toBe(false);
    expect(canBulkArchive(noteRef)).toBe(true);
  });

  it('bulkAddTags merges tags for notes', async () => {
    const updateNote = vi.fn().mockResolvedValue({});
    const mutations: LibraryBulkMutations = {
      updateNote,
      updateDocument: vi.fn(),
      updateFlashcardDeck: vi.fn(),
      updateCourse: vi.fn(),
      updatePracticeSet: vi.fn(),
      updateQuiz: vi.fn(),
      updateHomework: vi.fn(),
      deleteVaultItem: vi.fn(),
    };
    const outcome = await bulkAddTags(
      [noteRef, lessonRef],
      ['Math'],
      {
        vaultItems: [
          {
            id: 'n1',
            type: 'note',
            title: 'T',
            tags: ['existing'],
            area: 'Operations',
            status: 'active',
            userId: 'u',
            createdAt: '',
            updatedAt: '',
            searchableText: '',
            content: '',
          } as import('@/types/knowledge-vault').Note,
        ],
        flashcardDecks: [],
      },
      mutations
    );
    expect(updateNote).toHaveBeenCalledWith('n1', { tags: ['existing', 'math'] });
    expect(outcome.skipped).toEqual([lessonRef]);
    expect(outcome.succeeded).toEqual([noteRef]);
  });

  it('bulkSoftArchive calls deleteVaultItem for notes', async () => {
    const deleteVaultItem = vi.fn().mockResolvedValue({});
    const outcome = await bulkSoftArchive([noteRef], {
      updateNote: vi.fn(),
      updateDocument: vi.fn(),
      updateFlashcardDeck: vi.fn(),
      updateCourse: vi.fn(),
      updatePracticeSet: vi.fn(),
      updateQuiz: vi.fn(),
      updateHomework: vi.fn(),
      deleteVaultItem,
    });
    expect(deleteVaultItem).toHaveBeenCalledWith('n1');
    expect(outcome.succeeded).toEqual([noteRef]);
  });

  it('summarizeBulkOutcome formats counts', () => {
    expect(
      summarizeBulkOutcome({
        succeeded: [noteRef],
        failed: [],
        skipped: [lessonRef],
      })
    ).toBe('1 updated, 1 skipped');
  });
});
