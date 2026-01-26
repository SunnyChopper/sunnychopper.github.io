import { Plus, BookOpen } from 'lucide-react';
import Button from '@/components/atoms/Button';

interface LogbookHeaderProps {
  onNewEntry: () => void;
}

export function LogbookHeader({ onNewEntry }: LogbookHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Daily Logbook
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Reflect on your journey</p>
      </div>
      <Button variant="primary" onClick={onNewEntry}>
        <Plus className="w-5 h-5 mr-2" />
        New Entry
      </Button>
    </div>
  );
}
