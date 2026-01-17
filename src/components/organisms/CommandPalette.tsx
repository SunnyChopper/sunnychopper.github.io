import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  CheckSquare,
  Target,
  FolderKanban,
  TrendingUp,
  Repeat,
  BookOpen,
  Calendar,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useTasks,
  useGoals,
  useProjects,
  useMetrics,
  useHabits,
  useLogbook,
} from '@/hooks/useGrowthSystem';
import type { Goal, Metric, LogbookEntry } from '@/types/growth-system';
import { ROUTES } from '@/routes';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'navigation' | 'entity' | 'action';
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { projects } = useProjects();
  const { metrics } = useMetrics();
  const { habits } = useHabits();
  const { entries } = useLogbook();

  const allCommands = useMemo((): CommandItem[] => {
    const commands: CommandItem[] = [
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        subtitle: 'View overview and insights',
        icon: <Command size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.dashboard),
        keywords: ['dashboard', 'home', 'overview'],
      },
      {
        id: 'nav-tasks',
        title: 'Tasks',
        subtitle: 'Manage your tasks',
        icon: <CheckSquare size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.tasks),
        keywords: ['tasks', 'todos', 'work'],
      },
      {
        id: 'nav-goals',
        title: 'Goals',
        subtitle: 'Track your goals',
        icon: <Target size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.goals),
        keywords: ['goals', 'objectives', 'targets'],
      },
      {
        id: 'nav-projects',
        title: 'Projects',
        subtitle: 'Manage projects',
        icon: <FolderKanban size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.projects),
        keywords: ['projects', 'work'],
      },
      {
        id: 'nav-metrics',
        title: 'Metrics',
        subtitle: 'Track metrics',
        icon: <TrendingUp size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.metrics),
        keywords: ['metrics', 'tracking', 'kpi', 'data'],
      },
      {
        id: 'nav-habits',
        title: 'Habits',
        subtitle: 'Build habits',
        icon: <Repeat size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.habits),
        keywords: ['habits', 'routine', 'streak'],
      },
      {
        id: 'nav-logbook',
        title: 'Logbook',
        subtitle: 'Daily journal',
        icon: <BookOpen size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.logbook),
        keywords: ['logbook', 'journal', 'diary', 'reflect'],
      },
      {
        id: 'nav-weekly-review',
        title: 'Weekly Review',
        subtitle: 'Review and plan',
        icon: <Calendar size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.weeklyReview),
        keywords: ['weekly', 'review', 'planning', 'reflection'],
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        subtitle: 'Configure AI and preferences',
        icon: <Settings size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.settings),
        keywords: ['settings', 'config', 'ai', 'preferences'],
      },
      {
        id: 'nav-assistant',
        title: 'AI Assistant',
        subtitle: 'Chat with AI',
        icon: <Sparkles size={18} />,
        type: 'navigation',
        action: () => navigate(ROUTES.admin.assistant),
        keywords: ['ai', 'assistant', 'chat', 'help'],
      },
    ];

    tasks.forEach((task) => {
      commands.push({
        id: `task-${task.id}`,
        title: task.title,
        subtitle: `Task • ${task.status} • ${task.priority}`,
        icon: <CheckSquare size={18} />,
        type: 'entity',
        action: () => {
          navigate(ROUTES.admin.tasks);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('selectTask', { detail: task.id }));
          }, 100);
        },
        keywords: [task.title.toLowerCase(), task.area.toLowerCase(), task.status.toLowerCase()],
      });
    });

    goals.forEach((goal: Goal) => {
      commands.push({
        id: `goal-${goal.id}`,
        title: goal.title,
        subtitle: `Goal • ${goal.timeHorizon} • ${goal.status}`,
        icon: <Target size={18} />,
        type: 'entity',
        action: () => {
          navigate(ROUTES.admin.goals);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('selectGoal', { detail: goal.id }));
          }, 100);
        },
        keywords: [
          goal.title.toLowerCase(),
          goal.area.toLowerCase(),
          goal.timeHorizon.toLowerCase(),
        ],
      });
    });

    projects.forEach((project) => {
      commands.push({
        id: `project-${project.id}`,
        title: project.name,
        subtitle: `Project • ${project.status}`,
        icon: <FolderKanban size={18} />,
        type: 'entity',
        action: () => {
          navigate(ROUTES.admin.projects);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('selectProject', { detail: project.id }));
          }, 100);
        },
        keywords: [
          project.name.toLowerCase(),
          project.area.toLowerCase(),
          project.status.toLowerCase(),
        ],
      });
    });

    metrics.forEach((metric: Metric) => {
      commands.push({
        id: `metric-${metric.id}`,
        title: metric.name,
        subtitle: `Metric • ${metric.unit}`,
        icon: <TrendingUp size={18} />,
        type: 'entity',
        action: () => {
          navigate(ROUTES.admin.metrics);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('selectMetric', { detail: metric.id }));
          }, 100);
        },
        keywords: [metric.name.toLowerCase(), metric.area.toLowerCase()],
      });
    });

    habits.forEach((habit) => {
      commands.push({
        id: `habit-${habit.id}`,
        title: habit.name,
        subtitle: `Habit • ${habit.habitType} • ${habit.frequency}`,
        icon: <Repeat size={18} />,
        type: 'entity',
        action: () => {
          navigate(ROUTES.admin.habits);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('selectHabit', { detail: habit.id }));
          }, 100);
        },
        keywords: [habit.name.toLowerCase(), habit.habitType.toLowerCase()],
      });
    });

    entries.forEach((entry: LogbookEntry) => {
      commands.push({
        id: `entry-${entry.id}`,
        title: entry.title || 'Untitled Entry',
        subtitle: `Logbook • ${new Date(entry.date).toLocaleDateString()}`,
        icon: <BookOpen size={18} />,
        type: 'entity',
        action: () => {
          navigate(ROUTES.admin.logbook);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('selectEntry', { detail: entry.id }));
          }, 100);
        },
        keywords: [(entry.title || '').toLowerCase(), entry.date],
      });
    });

    return commands;
  }, [tasks, goals, projects, metrics, habits, entries, navigate]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return allCommands.filter((cmd) => cmd.type === 'navigation');
    }

    const searchTerms = query
      .toLowerCase()
      .split(' ')
      .filter((t) => t.length > 0);

    return allCommands.filter((cmd) => {
      const searchString = `${cmd.title} ${cmd.subtitle} ${cmd.keywords.join(' ')}`.toLowerCase();
      return searchTerms.every((term) => searchString.includes(term));
    });
  }, [query, allCommands]);

  useEffect(() => {
    // Reset selection when query changes
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        handleClose();
      }
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close command palette"
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for tasks, goals, projects, or navigate..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
          />
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length > 0 ? (
            <div className="py-2">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    handleClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                    idx === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 ${
                      idx === selectedIndex
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {cmd.title}
                    </div>
                    {cmd.subtitle && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {cmd.subtitle}
                      </div>
                    )}
                  </div>
                  {idx === selectedIndex && (
                    <div className="flex-shrink-0 text-xs text-gray-400">↵</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No results found</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                Esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
