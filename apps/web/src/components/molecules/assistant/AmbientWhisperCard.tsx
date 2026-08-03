import { Sparkles, X } from 'lucide-react';

import { cardSurfaceClassName } from '@/components/atoms/Card';
import type { AmbientWhisperAction, AmbientWhisperItem } from '@/types/chatbot';
import { cn } from '@/lib/utils';

const TONE_CLASS = {
  info: 'border-blue-200/80 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/30',
  nudge: 'border-amber-200/80 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/30',
  alert: 'border-rose-200/80 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/30',
} as const;

export interface AmbientWhisperCardProps {
  item: AmbientWhisperItem;
  onAsk: (item: AmbientWhisperItem) => void;
  onOpen: (href: string) => void;
  onAction: (item: AmbientWhisperItem, action: AmbientWhisperAction) => void;
  onDismiss: (item: AmbientWhisperItem) => void;
  isBusy?: boolean;
}

export function AmbientWhisperCard({
  item,
  onAsk,
  onOpen,
  onAction,
  onDismiss,
  isBusy = false,
}: AmbientWhisperCardProps) {
  const primaryActions = item.actions.filter((a) => a.id !== 'dismiss' && a.id !== 'openEntity');
  const openAction = item.actions.find((a) => a.id === 'openEntity');

  return (
    <article
      className={cn(cardSurfaceClassName, 'relative border p-3 space-y-2', TONE_CLASS[item.tone])}
    >
      <div className="flex items-start gap-2">
        <Sparkles
          className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300"
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
              {item.title}
            </h4>
            {item.dismissible ? (
              <button
                type="button"
                onClick={() => onDismiss(item)}
                disabled={isBusy}
                className="shrink-0 rounded p-1 text-gray-500 hover:bg-black/5 hover:text-gray-800 dark:hover:bg-white/10 dark:hover:text-gray-100"
                aria-label="Dismiss whisper"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {item.body ? (
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{item.body}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => onAsk(item)}
          disabled={isBusy}
          className="min-h-[32px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Ask
        </button>
        <button
          type="button"
          onClick={() => onOpen(item.href)}
          disabled={isBusy}
          className="min-h-[32px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          {openAction?.label ?? 'Open'}
        </button>
        {primaryActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(item, action)}
            disabled={isBusy}
            className={cn(
              'min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition',
              action.style === 'primary'
                ? 'bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-500'
                : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );
}
