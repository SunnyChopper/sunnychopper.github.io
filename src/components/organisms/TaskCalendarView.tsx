import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task } from '../../types/growth-system';
import { PriorityIndicator } from '../atoms/PriorityIndicator';
import { AreaBadge } from '../atoms/AreaBadge';
import Button from '../atoms/Button';

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskCalendarView({ tasks, onTaskClick }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { year, month, daysInMonth, startingDayOfWeek };
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = task.dueDate.split('T')[0];
      return taskDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { year, month, daysInMonth, startingDayOfWeek } = getMonthData();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-sm text-gray-700 dark:text-gray-300 py-2"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-[120px]" />;
          }

          const date = new Date(year, month, day);
          const isToday =
            isCurrentMonth && day === today.getDate();
          const dateTasks = getTasksForDate(date);

          return (
            <div
              key={day}
              className={`min-h-[120px] border border-gray-200 dark:border-gray-700 rounded-lg p-2 ${
                isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''
              }`}
            >
              <div className={`text-sm font-semibold mb-2 ${
                isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {day}
              </div>

              <div className="space-y-1">
                {dateTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full text-left p-1.5 rounded text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <PriorityIndicator priority={task.priority} size="sm" />
                      <span className="truncate text-gray-900 dark:text-white font-medium">
                        {task.title}
                      </span>
                    </div>
                    <AreaBadge area={task.area} size="sm" />
                  </button>
                ))}

                {dateTasks.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 pl-1.5">
                    +{dateTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {tasks.filter(t => t.dueDate).length} tasks with due dates
      </div>
    </div>
  );
}
