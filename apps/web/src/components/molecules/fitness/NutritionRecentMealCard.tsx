import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { formatRelativeChatTimestamp } from '@/lib/chat/format-relative-time';
import {
  clampSwipeOffset,
  formatNutritionRecentMacros,
  NUTRITION_RECENT_SWIPE_COMMIT_PX,
  shouldCommitSwipeDelete,
} from '@/lib/fitness/nutrition-recent-undo';
import { fitnessInteractiveRowClassName } from '@/lib/fitness/fitness-surfaces';
import { cn } from '@/lib/utils';
import type { NutritionEntry } from '@/types/fitness';

export interface NutritionRecentMealCardProps {
  entry: NutritionEntry;
  onRequestDelete: (entry: NutritionEntry) => void;
  className?: string;
}

export function NutritionRecentMealCard({
  entry,
  onRequestDelete,
  className,
}: NutritionRecentMealCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const swipeStartXRef = useRef<number | null>(null);
  const [offsetPx, setOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const mealLabel = entry.foodName || 'Meal';
  const relativeLoggedAt = formatRelativeChatTimestamp(entry.loggedAt);

  const resetSwipe = () => {
    swipeStartXRef.current = null;
    setOffsetPx(0);
    setIsDragging(false);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeStartXRef.current = event.clientX;
    setIsDragging(true);
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (swipeStartXRef.current == null) return;
    const delta = event.clientX - swipeStartXRef.current;
    setOffsetPx(clampSwipeOffset(delta));
  };

  const releasePointerCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (typeof event.currentTarget.releasePointerCapture === 'function') {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (swipeStartXRef.current == null) return;
    if (
      typeof event.currentTarget.hasPointerCapture === 'function' &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      releasePointerCapture(event);
    }
    if (shouldCommitSwipeDelete(offsetPx)) {
      resetSwipe();
      onRequestDelete(entry);
      return;
    }
    resetSwipe();
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      typeof event.currentTarget.hasPointerCapture === 'function' &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      releasePointerCapture(event);
    }
    resetSwipe();
  };

  const revealProgress = Math.min(1, Math.abs(offsetPx) / NUTRITION_RECENT_SWIPE_COMMIT_PX);

  return (
    <li className={cn('list-none', className)} data-testid="nutrition-recent-meal-card">
      <div className="relative overflow-hidden rounded-lg">
        <div
          className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500/90 text-white transition-opacity dark:bg-red-600/90"
          style={{ opacity: revealProgress }}
          aria-hidden="true"
        >
          <Trash2 className="h-4 w-4" />
        </div>
        <div
          ref={cardRef}
          className={cn(
            fitnessInteractiveRowClassName,
            'group relative flex touch-pan-y items-center gap-3 text-sm transition-transform',
            isDragging && 'transition-none'
          )}
          style={{ transform: `translateX(${offsetPx}px)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-label={`${mealLabel}, ${entry.mealType}, ${relativeLoggedAt}`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-medium text-gray-900 dark:text-gray-100">{mealLabel}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">· {entry.mealType}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                {formatNutritionRecentMacros(entry)}
              </span>
              <time
                className="text-xs text-gray-400 dark:text-gray-500"
                dateTime={entry.loggedAt}
                title={entry.loggedAt}
              >
                {relativeLoggedAt}
              </time>
            </div>
          </div>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onRequestDelete(entry)}
            className="rounded-md p-1.5 text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group-hover:opacity-100 dark:hover:bg-gray-700/60 dark:hover:text-red-400"
            aria-label={`Remove ${mealLabel}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
