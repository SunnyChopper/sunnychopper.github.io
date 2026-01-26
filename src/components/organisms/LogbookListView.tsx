import type { LogbookEntry } from '@/types/growth-system';
import { LogbookEntryCard } from '@/components/molecules/LogbookEntryCard';
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading entries...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {entries.map((entry) => (
        <LogbookEntryCard key={entry.id} entry={entry} onClick={onEntryClick} />
      ))}
    </div>
  );
}
