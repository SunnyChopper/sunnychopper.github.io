import { BookOpen, Calendar, Layers, Target } from 'lucide-react';
import Button from '@/components/atoms/Button';
import {
  flashcardOverduePillClassName,
  formatOverdueCountLabel,
  shouldShowDeckOverduePill,
} from '@/lib/knowledge-vault/flashcard-deck-overdue';
import {
  vaultItemCardAccentBarClassName,
  vaultItemCardSelectCheckboxClassName,
  vaultItemCardShellClassName,
} from '@/lib/knowledge-vault/vault-item-card-surfaces';
import type { LibrarySelectableRef } from '@/lib/knowledge-vault/library-selection';
import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import type { FlashcardDeck } from '@/types/knowledge-vault';

interface FlashcardDeckCardProps {
  deck: FlashcardDeck;
  onClick?: () => void;
  onStartReview?: () => void;
  isSelected?: boolean;
  selectionActive?: boolean;
  onToggleSelect?: (ref: LibrarySelectableRef, event?: React.MouseEvent) => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FlashcardDeckCard({
  deck,
  onClick,
  onStartReview,
  isSelected = false,
  selectionActive = false,
  onToggleSelect,
}: FlashcardDeckCardProps) {
  const showOverdue = shouldShowDeckOverduePill(deck.cardsDue);
  const interactive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Open flashcard deck: ${deck.name}` : undefined}
      className={vaultItemCardShellClassName({ interactive, multiSelected: isSelected })}
    >
      <span
        aria-hidden
        className={vaultItemCardAccentBarClassName({ multiSelected: isSelected })}
      />
      {onToggleSelect ? (
        <div
          data-vault-select
          className={vaultItemCardSelectCheckboxClassName({ isSelected, selectionActive })}
        >
          <FormCheckbox
            checked={isSelected}
            onChange={() => onToggleSelect({ kind: 'flashcard_deck', id: deck.id })}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select deck ${deck.name}`}
          />
        </div>
      ) : null}
      <div className="flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Layers size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{deck.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Flashcard deck</p>
          </div>
        </div>

        {showOverdue && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={flashcardOverduePillClassName}>
              {formatOverdueCountLabel(deck.cardsDue)}
            </span>
            {onStartReview && (
              <Button
                type="button"
                variant="success"
                size="sm"
                className="rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartReview();
                }}
                aria-label={`Start review for ${deck.name}`}
              >
                Start review
              </Button>
            )}
          </div>
        )}

        {deck.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 whitespace-pre-wrap">
            {deck.description}
          </p>
        )}

        {deck.topic && (
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-3 truncate">
            Topic: {deck.topic}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <BookOpen size={14} className="flex-shrink-0" />
            <span>
              {deck.totalCards} card{deck.totalCards !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Target size={14} className="flex-shrink-0 text-orange-500" />
            <span>{deck.cardsDue} due</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium text-green-600 dark:text-green-400">{deck.cardsNew}</span>
            <span>new</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {deck.cardsMastered}
            </span>
            <span>mastered</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          Updated {formatDate(deck.updatedAt)}
        </span>
        {deck.lastStudiedAt && (
          <span className="truncate ml-2">Studied {formatDate(deck.lastStudiedAt)}</span>
        )}
      </div>
    </div>
  );
}
