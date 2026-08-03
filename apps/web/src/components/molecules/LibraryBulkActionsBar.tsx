import { Archive, Tag, MapPin, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/atoms/Button';

interface LibraryBulkActionsBarProps {
  selectedCount: number;
  onAddTags?: () => void;
  onChangeArea?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onClearSelection?: () => void;
}

export function LibraryBulkActionsBar({
  selectedCount,
  onAddTags,
  onChangeArea,
  onArchive,
  onDelete,
  onClearSelection,
}: LibraryBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 dark:bg-blue-900/30">
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedCount} selected
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

          <div className="flex items-center gap-2">
            {onAddTags && (
              <Button variant="secondary" size="sm" onClick={onAddTags}>
                <Tag className="mr-1 h-4 w-4" />
                Add tags
              </Button>
            )}
            {onChangeArea && (
              <Button variant="secondary" size="sm" onClick={onChangeArea}>
                <MapPin className="mr-1 h-4 w-4" />
                Change area
              </Button>
            )}
            {onArchive && (
              <Button variant="secondary" size="sm" onClick={onArchive}>
                <Archive className="mr-1 h-4 w-4" />
                Archive
              </Button>
            )}
            {onDelete && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDelete}
                className="hover:!bg-red-50 hover:!text-red-600"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
