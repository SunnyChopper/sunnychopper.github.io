import { ROUTES } from '@/routes';
import { spacedRepetitionService } from '@/services/knowledge-vault/spaced-repetition.service';

/** Matches study-session due queue (`nextReviewDate <= now`). */
export function isFlashcardDueForReview(nextReviewDate: string): boolean {
  if (!nextReviewDate) return true;
  return spacedRepetitionService.isDueForReview(nextReviewDate);
}

export function shouldShowDeckOverduePill(cardsDue: number): boolean {
  return cardsDue > 0;
}

export function formatOverdueCountLabel(count: number): string {
  return count === 1 ? '1 overdue' : `${count} overdue`;
}

export const flashcardOverduePillClassName =
  'inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';

export function buildStudySessionDeckUrl(deckId: string): string {
  const params = new URLSearchParams({
    deckId,
    startReview: '1',
  });
  return `${ROUTES.admin.knowledgeVaultFeynmanStudy}?${params.toString()}`;
}

export function buildFlashcardsHubDeckUrl(deckId: string): string {
  const params = new URLSearchParams({ deckId });
  return `${ROUTES.admin.knowledgeVaultFlashcards}?${params.toString()}`;
}
