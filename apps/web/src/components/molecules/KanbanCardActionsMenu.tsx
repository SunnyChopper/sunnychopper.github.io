import { useEffect, useRef, useState } from 'react';
import { MessageSquare, MoreVertical, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KanbanCardActionsMenuProps {
  taskTitle: string;
  onEdit: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onExplain?: () => void;
  trashMode?: boolean;
  className?: string;
}

export function KanbanCardActionsMenu({
  taskTitle,
  onEdit,
  onDelete,
  onRestore,
  onExplain,
  trashMode = false,
  className,
}: KanbanCardActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div
      ref={menuRef}
      className={cn(
        'relative shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
        className
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Actions for task: ${taskTitle}`}
        title="Task actions"
      >
        <MoreVertical className="h-3.5 w-3.5" aria-hidden />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-[168px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          {onExplain ? (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(onExplain);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Explain</span>
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              handleItemClick(onEdit);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Edit</span>
          </button>
          {trashMode && onRestore ? (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(onRestore);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Restore</span>
            </button>
          ) : null}
          {!trashMode && onDelete ? (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(onDelete);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Delete</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
