import { Calendar, Smile, Meh, Frown } from 'lucide-react';
import type { LogbookEntry, LogbookMood } from '@/types/growth-system';

interface LogbookEntryCardProps {
  entry: LogbookEntry;
  onClick: (entry: LogbookEntry) => void;
}

export function LogbookEntryCard({ entry, onClick }: LogbookEntryCardProps) {
  const getMoodIcon = (mood: LogbookMood | null) => {
    switch (mood) {
      case 'High':
        return <Smile className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'Steady':
        return <Meh className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'Low':
        return <Frown className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getMoodColor = (mood: LogbookMood | null) => {
    switch (mood) {
      case 'High':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500';
      case 'Steady':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
      case 'Low':
        return 'bg-red-100 dark:bg-red-900/30 border-red-500';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div
      onClick={() => onClick(entry)}
      className={`group rounded-lg border-2 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${getMoodColor(entry.mood)}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date(entry.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        {entry.mood && <div className="flex items-center gap-2">{getMoodIcon(entry.mood)}</div>}
      </div>

      {entry.title && (
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {entry.title}
        </h3>
      )}

      {entry.notes && (
        <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">{entry.notes}</p>
      )}

      {entry.energy !== null && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-300 dark:border-gray-600">
          <span className="text-sm text-gray-600 dark:text-gray-400">Energy:</span>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-6 rounded-sm ${
                  i < (entry.energy || 0) ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {entry.energy}/10
          </span>
        </div>
      )}
    </div>
  );
}
