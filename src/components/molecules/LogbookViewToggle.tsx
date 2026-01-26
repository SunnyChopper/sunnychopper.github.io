type ViewMode = 'list' | 'calendar';

interface LogbookViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function LogbookViewToggle({ viewMode, onViewModeChange }: LogbookViewToggleProps) {
  return (
    <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
      <button
        onClick={() => onViewModeChange('list')}
        className={`px-4 py-2 rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        aria-label="List view"
      >
        List
      </button>
      <button
        onClick={() => onViewModeChange('calendar')}
        className={`px-4 py-2 rounded-md transition-colors ${
          viewMode === 'calendar'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        aria-label="Calendar view"
      >
        Calendar
      </button>
    </div>
  );
}
