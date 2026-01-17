import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Habit, HabitLog } from '../../types/growth-system';
import { getLastCompletedDateFromLogs } from '../../utils/date-formatters';

interface FloatingLogButtonProps {
  habit: Habit;
  logs: HabitLog[];
  onLog: () => void;
}

export function FloatingLogButton({ habit: _habit, logs, onLog }: FloatingLogButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Calculate if today is completed based on logs
  const isTodayCompleted = (() => {
    const lastCompletedDate = getLastCompletedDateFromLogs(logs);
    if (lastCompletedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(lastCompletedDate);
      lastDate.setHours(0, 0, 0, 0);
      return today.getTime() === lastDate.getTime();
    }
    return false;
  })();

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Keyboard shortcut: 'L' to log
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          const target = e.target as HTMLElement;
          // Only trigger if not typing in an input
          if (
            target.tagName !== 'INPUT' &&
            target.tagName !== 'TEXTAREA' &&
            !target.isContentEditable
          ) {
            if (!isTodayCompleted) {
              onLog();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onLog, isTodayCompleted]);

  if (isTodayCompleted) {
    return null;
  }

  return (
    <button
      onClick={onLog}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      aria-label="Log completion"
      title="Log Completion (Press L)"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
