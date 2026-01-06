import { Check, Target, Flame, Calendar } from 'lucide-react';
import type { Habit } from '../../types/growth-system';
import { AreaBadge } from '../atoms/AreaBadge';
import { SUBCATEGORY_LABELS } from '../../constants/growth-system';

interface HabitCardProps {
  habit: Habit;
  streak?: number;
  todayCompleted?: boolean;
  onClick: (habit: Habit) => void;
  onQuickLog?: (habit: Habit) => void;
}

export function HabitCard({ habit, streak = 0, todayCompleted = false, onClick, onQuickLog }: HabitCardProps) {
  const getHabitTypeColor = (type: string) => {
    switch (type) {
      case 'Build':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'Maintain':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Reduce':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'Quit':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200"
    >
      <div onClick={() => onClick(habit)} className="cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${todayCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {todayCompleted && <Check className="w-5 h-5 text-white" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {habit.name}
              </h3>
            </div>
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-11">
                {habit.description}
              </p>
            )}
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-lg font-bold text-orange-500">{streak}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 ml-11">
          <AreaBadge area={habit.area} />
          {habit.subCategory && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {SUBCATEGORY_LABELS[habit.subCategory]}
            </span>
          )}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHabitTypeColor(habit.habitType)}`}>
            {habit.habitType}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {habit.frequency}
          </span>
        </div>

        {habit.trigger && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ml-11">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Trigger → Action</div>
            <p className="text-sm text-gray-900 dark:text-white">
              {habit.trigger} → {habit.action}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 ml-11">
          {habit.dailyTarget && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <span>Daily: {habit.dailyTarget}</span>
            </div>
          )}
          {habit.weeklyTarget && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Weekly: {habit.weeklyTarget}</span>
            </div>
          )}
        </div>
      </div>

      {onQuickLog && !todayCompleted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickLog(habit);
          }}
          className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Mark Complete
        </button>
      )}
    </div>
  );
}
