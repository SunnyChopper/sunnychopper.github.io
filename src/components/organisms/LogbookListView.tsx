import { motion, AnimatePresence } from 'framer-motion';
import type { LogbookEntry } from '@/types/growth-system';
import { LogbookEntryCard } from '@/components/molecules/LogbookEntryCard';
import { LogbookEntryCardSkeleton } from '@/components/molecules/LogbookEntryCardSkeleton';
import { LogbookCalendarView } from '@/components/organisms/LogbookCalendarView';
import { EmptyState } from '@/components/molecules/EmptyState';

type ViewMode = 'list' | 'calendar';

interface LogbookListViewProps {
  entries: LogbookEntry[];
  viewMode: ViewMode;
  searchQuery: string;
  isLoading: boolean;
  onEntryClick: (entry: LogbookEntry) => void;
  onDateClick?: (date: Date) => void;
  onCreateEntry: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, filter: 'blur(4px)' },
  show: { y: 0, opacity: 1, filter: 'blur(0px)' },
};

export function LogbookListView({
  entries,
  viewMode,
  searchQuery,
  isLoading,
  onEntryClick,
  onDateClick,
  onCreateEntry,
}: LogbookListViewProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <LogbookEntryCardSkeleton count={6} />
      </motion.div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EmptyState
          title="No entries found"
          description={
            searchQuery
              ? 'Try adjusting your search query'
              : 'Start journaling by creating your first entry'
          }
          actionLabel="Create Entry"
          onAction={onCreateEntry}
        />
      </motion.div>
    );
  }

  if (viewMode === 'calendar') {
    return (
      <LogbookCalendarView
        entries={entries}
        onEntryClick={onEntryClick}
        onDateClick={onDateClick}
      />
    );
  }

  // Mobile/Tablet: Grid layout with cards
  // Desktop: Single column list when "List" mode is selected
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6"
    >
      <AnimatePresence mode="popLayout">
        {entries.map((entry) => (
          <motion.div key={entry.id} variants={itemVariants} layout>
            <LogbookEntryCard entry={entry} onClick={onEntryClick} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
