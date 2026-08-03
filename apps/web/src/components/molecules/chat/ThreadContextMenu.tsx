import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileEdit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ThreadContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onRename?: () => void;
  onDelete?: () => void;
};

export function ThreadContextMenu({ x, y, onClose, onRename, onDelete }: ThreadContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const justOpenedRef = useRef(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      justOpenedRef.current = false;
    }, 300);

    const handleClickOutside = (event: MouseEvent) => {
      if (event.button === 2) {
        return;
      }
      if (justOpenedRef.current) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    requestAnimationFrame(() => {
      if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newX = x;
        let newY = y;

        if (x + rect.width > viewportWidth) {
          newX = Math.max(10, viewportWidth - rect.width - 10);
        }
        if (newX < 0) {
          newX = 10;
        }
        if (y + rect.height > viewportHeight) {
          newY = Math.max(10, viewportHeight - rect.height - 10);
        }
        if (newY < 0) {
          newY = 10;
        }

        setPosition({ x: newX, y: newY });
      }
    });

    const listenerTimeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('contextmenu', handleContextMenu, true);
      document.addEventListener('keydown', handleEscape);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(listenerTimeoutId);
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [x, y, onClose]);

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      role="menu"
    >
      {onRename ? (
        <button
          type="button"
          onClick={() => {
            onRename();
            onClose();
          }}
          className={cn(
            'flex w-full items-center gap-2 px-4 py-2 text-left text-sm',
            'text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
          role="menuitem"
        >
          <FileEdit size={14} />
          <span>Rename</span>
        </button>
      ) : null}
      {onDelete ? (
        <>
          {onRename ? <div className="my-1 border-t border-gray-200 dark:border-gray-700" /> : null}
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2 text-left text-sm',
              'text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
            )}
            role="menuitem"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </>
      ) : null}
    </div>
  );

  return createPortal(menuContent, document.body);
}
