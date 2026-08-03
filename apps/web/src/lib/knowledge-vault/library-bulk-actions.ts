import type { Area } from '@/types/growth-system';
import type { FlashcardDeck, PracticeArtifactStatus, VaultItem } from '@/types/knowledge-vault';
import type { LibrarySelectableRef } from './library-selection';

export interface BulkActionFailure {
  ref: LibrarySelectableRef;
  error: string;
}

export interface BulkActionOutcome {
  succeeded: LibrarySelectableRef[];
  failed: BulkActionFailure[];
  skipped: LibrarySelectableRef[];
}

export interface LibraryBulkContext {
  vaultItems: VaultItem[];
  flashcardDecks: FlashcardDeck[];
}

export interface LibraryBulkMutations {
  updateNote: (id: string, input: { tags?: string[]; area?: Area }) => Promise<unknown>;
  updateDocument: (id: string, input: { tags?: string[]; area?: Area }) => Promise<unknown>;
  updateFlashcardDeck: (
    id: string,
    input: { tags?: string[]; area?: Area; status?: 'active' | 'archived' }
  ) => Promise<unknown>;
  updateCourse: (id: string, input: { status?: string }) => Promise<unknown>;
  updatePracticeSet: (
    id: string,
    input: { tags?: string[]; area?: Area; status?: PracticeArtifactStatus }
  ) => Promise<unknown>;
  updateQuiz: (
    id: string,
    input: { tags?: string[]; area?: Area; status?: PracticeArtifactStatus }
  ) => Promise<unknown>;
  updateHomework: (
    id: string,
    input: { tags?: string[]; area?: Area; status?: PracticeArtifactStatus }
  ) => Promise<unknown>;
  deleteVaultItem: (id: string) => Promise<unknown>;
}

export function canBulkAddTags(ref: LibrarySelectableRef): boolean {
  return (
    ref.kind === 'note' ||
    ref.kind === 'document' ||
    ref.kind === 'flashcard_deck' ||
    ref.kind === 'homework_assignment' ||
    ref.kind === 'practice_question_set' ||
    ref.kind === 'quiz'
  );
}

export function canBulkChangeArea(ref: LibrarySelectableRef): boolean {
  return canBulkAddTags(ref);
}

export function canBulkArchive(ref: LibrarySelectableRef): boolean {
  return ref.kind !== 'course_lesson';
}

function mergeTags(existing: string[], toAdd: string[]): string[] {
  const normalized = new Set(existing.map((t) => t.trim().toLowerCase()).filter(Boolean));
  for (const tag of toAdd) {
    const t = tag.trim().toLowerCase();
    if (t) normalized.add(t);
  }
  return Array.from(normalized);
}

function getVaultItem(ctx: LibraryBulkContext, id: string): VaultItem | undefined {
  return ctx.vaultItems.find((item) => item.id === id);
}

function getDeck(ctx: LibraryBulkContext, id: string): FlashcardDeck | undefined {
  return ctx.flashcardDecks.find((deck) => deck.id === id);
}

async function runBulk(
  refs: LibrarySelectableRef[],
  predicate: (ref: LibrarySelectableRef) => boolean,
  action: (ref: LibrarySelectableRef) => Promise<void>
): Promise<BulkActionOutcome> {
  const outcomes = await Promise.all(
    refs.map(async (ref) => {
      if (!predicate(ref)) {
        return { type: 'skipped' as const, ref };
      }
      try {
        await action(ref);
        return { type: 'succeeded' as const, ref };
      } catch (err) {
        return {
          type: 'failed' as const,
          ref,
          error: err instanceof Error ? err.message : 'Request failed',
        };
      }
    })
  );

  return {
    succeeded: outcomes.filter((o) => o.type === 'succeeded').map((o) => o.ref),
    failed: outcomes
      .filter((o) => o.type === 'failed')
      .map((o) => ({ ref: o.ref, error: o.error })),
    skipped: outcomes.filter((o) => o.type === 'skipped').map((o) => o.ref),
  };
}

export async function bulkAddTags(
  refs: LibrarySelectableRef[],
  tagsToAdd: string[],
  ctx: LibraryBulkContext,
  mutations: LibraryBulkMutations
): Promise<BulkActionOutcome> {
  return runBulk(refs, canBulkAddTags, async (ref) => {
    if (ref.kind === 'note' || ref.kind === 'document') {
      const item = getVaultItem(ctx, ref.id);
      if (!item) throw new Error('Item not found');
      const tags = mergeTags(item.tags, tagsToAdd);
      if (ref.kind === 'note') {
        await mutations.updateNote(ref.id, { tags });
      } else {
        await mutations.updateDocument(ref.id, { tags });
      }
      return;
    }
    if (ref.kind === 'flashcard_deck') {
      const deck = getDeck(ctx, ref.id);
      if (!deck) throw new Error('Deck not found');
      await mutations.updateFlashcardDeck(ref.id, {
        tags: mergeTags(deck.tags ?? [], tagsToAdd),
      });
      return;
    }
    if (ref.kind === 'practice_question_set') {
      const item = getVaultItem(ctx, ref.id);
      if (!item) throw new Error('Item not found');
      await mutations.updatePracticeSet(ref.id, { tags: mergeTags(item.tags, tagsToAdd) });
      return;
    }
    if (ref.kind === 'quiz') {
      const item = getVaultItem(ctx, ref.id);
      if (!item) throw new Error('Item not found');
      await mutations.updateQuiz(ref.id, { tags: mergeTags(item.tags, tagsToAdd) });
      return;
    }
    if (ref.kind === 'homework_assignment') {
      const item = getVaultItem(ctx, ref.id);
      if (!item) throw new Error('Item not found');
      await mutations.updateHomework(ref.id, { tags: mergeTags(item.tags, tagsToAdd) });
    }
  });
}

export async function bulkChangeArea(
  refs: LibrarySelectableRef[],
  area: Area,
  _ctx: LibraryBulkContext,
  mutations: LibraryBulkMutations
): Promise<BulkActionOutcome> {
  return runBulk(refs, canBulkChangeArea, async (ref) => {
    if (ref.kind === 'note') {
      await mutations.updateNote(ref.id, { area });
      return;
    }
    if (ref.kind === 'document') {
      await mutations.updateDocument(ref.id, { area });
      return;
    }
    if (ref.kind === 'flashcard_deck') {
      await mutations.updateFlashcardDeck(ref.id, { area });
      return;
    }
    if (ref.kind === 'practice_question_set') {
      await mutations.updatePracticeSet(ref.id, { area });
      return;
    }
    if (ref.kind === 'quiz') {
      await mutations.updateQuiz(ref.id, { area });
      return;
    }
    if (ref.kind === 'homework_assignment') {
      await mutations.updateHomework(ref.id, { area });
    }
  });
}

export async function bulkSoftArchive(
  refs: LibrarySelectableRef[],
  mutations: LibraryBulkMutations
): Promise<BulkActionOutcome> {
  return runBulk(refs, canBulkArchive, async (ref) => {
    if (ref.kind === 'note' || ref.kind === 'document') {
      await mutations.deleteVaultItem(ref.id);
      return;
    }
    if (ref.kind === 'flashcard_deck') {
      await mutations.updateFlashcardDeck(ref.id, { status: 'archived' });
      return;
    }
    if (ref.kind === 'course') {
      await mutations.updateCourse(ref.id, { status: 'Archived' });
      return;
    }
    if (ref.kind === 'practice_question_set') {
      await mutations.updatePracticeSet(ref.id, { status: 'archived' });
      return;
    }
    if (ref.kind === 'quiz') {
      await mutations.updateQuiz(ref.id, { status: 'archived' });
      return;
    }
    if (ref.kind === 'homework_assignment') {
      await mutations.updateHomework(ref.id, { status: 'archived' });
    }
  });
}

export function summarizeBulkOutcome(outcome: BulkActionOutcome): string {
  const parts: string[] = [];
  if (outcome.succeeded.length) parts.push(`${outcome.succeeded.length} updated`);
  if (outcome.skipped.length) parts.push(`${outcome.skipped.length} skipped`);
  if (outcome.failed.length) parts.push(`${outcome.failed.length} failed`);
  return parts.join(', ') || 'No changes';
}
