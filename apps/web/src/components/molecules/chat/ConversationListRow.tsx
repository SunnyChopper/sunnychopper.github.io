import { useCallback, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { formatRelativeChatTimestamp } from '@/lib/chat/format-relative-time';
import { ThreadContextMenu } from '@/components/molecules/chat/ThreadContextMenu';
import { cn } from '@/lib/utils';

export type ConversationListRowProps = {
  title: string;
  preview?: string;
  timestamp: string;
  isActive?: boolean;
  isEditing?: boolean;
  editingTitle?: string;
  onEditingTitleChange?: (title: string) => void;
  onConfirmRename?: () => void;
  onCancelEdit?: () => void;
  isUpdating?: boolean;
  onSelect: () => void;
  onStartEdit?: () => void;
  onDelete?: () => void;
  initials?: string;
  badge?: string;
};

function threadInitials(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return 'PO';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0]![0]! + words[1]![0]!).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

type ContextMenuState = {
  x: number;
  y: number;
};

export function ConversationListRow({
  title,
  preview,
  timestamp,
  isActive,
  isEditing,
  editingTitle = '',
  onEditingTitleChange,
  onConfirmRename,
  onCancelEdit,
  isUpdating,
  onSelect,
  onStartEdit,
  onDelete,
  initials,
  badge,
}: ConversationListRowProps) {
  const avatar = initials ?? threadInitials(title);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const openContextMenuAt = useCallback(
    (clientX: number, clientY: number) => {
      if (!onStartEdit && !onDelete) {
        return;
      }
      setContextMenu({ x: clientX, y: clientY });
    },
    [onDelete, onStartEdit]
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (!onStartEdit && !onDelete) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      openContextMenuAt(event.clientX, event.clientY);
    },
    [onDelete, onStartEdit, openContextMenuAt]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!onStartEdit && !onDelete) {
        return;
      }
      if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
        event.preventDefault();
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        openContextMenuAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    },
    [onDelete, onStartEdit, openContextMenuAt]
  );

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 border-b border-gray-200/10 px-3 py-2 dark:border-gray-800">
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => onEditingTitleChange?.(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirmRename?.();
            if (e.key === 'Escape') onCancelEdit?.();
          }}
        />
        <button
          type="button"
          onClick={onConfirmRename}
          disabled={isUpdating}
          className="rounded-lg p-2 text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Save title"
        >
          {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        </button>
        <button
          type="button"
          onClick={onCancelEdit}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Cancel edit"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'relative flex cursor-pointer items-center gap-3 border-b border-gray-200/10 px-3 py-2.5 transition',
          'hover:bg-gray-100/5 dark:border-gray-800 dark:hover:bg-white/5',
          isActive && 'bg-blue-600/10 dark:bg-blue-500/10'
        )}
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
            return;
          }
          handleKeyDown(event);
        }}
        tabIndex={0}
        role="button"
        aria-label={`${title} conversation`}
      >
        {isActive ? (
          <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-[#0A84FF]" aria-hidden />
        ) : null}
        <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
            )}
            aria-hidden
          >
            {avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">
              {title}
            </p>
            <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
              {badge ? (
                <span className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-violet-100 text-violet-900 dark:bg-violet-900/45 dark:text-violet-100">
                  {badge}
                </span>
              ) : (
                <span />
              )}
              <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                {formatRelativeChatTimestamp(timestamp)}
              </span>
            </div>
            {preview ? (
              <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{preview}</p>
            ) : null}
          </div>
        </div>
      </div>
      {contextMenu ? (
        <ThreadContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={onStartEdit}
          onDelete={onDelete}
        />
      ) : null}
    </>
  );
}
