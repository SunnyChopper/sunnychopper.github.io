import {
  getFlashcardSideCharTone,
  isFlashcardSideOverHardLimit,
} from '@/lib/knowledge-vault/flashcard-deck-save';
import { cn } from '@/lib/utils';

interface FlashcardSideCharCounterProps {
  value: string;
  id?: string;
}

export function FlashcardSideCharCounter({ value, id }: FlashcardSideCharCounterProps) {
  const length = value.length;
  const tone = getFlashcardSideCharTone(length);
  const overHardLimit = isFlashcardSideOverHardLimit(value);

  return (
    <div
      id={id}
      className={cn(
        'mt-1 flex items-center justify-end gap-2 text-xs',
        tone === 'default' && 'text-gray-500 dark:text-gray-400',
        tone === 'amber' && 'text-amber-600 dark:text-amber-400',
        tone === 'red' && 'text-red-600 dark:text-red-400'
      )}
    >
      {overHardLimit && <span>Shorten this side</span>}
      <span aria-live="polite">{length}</span>
    </div>
  );
}
