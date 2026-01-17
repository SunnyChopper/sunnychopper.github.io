import { useState, useEffect } from 'react';
import { Plus, Search, Repeat, Calendar, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type {
  Habit,
  HabitLog,
  CreateHabitInput,
  UpdateHabitInput,
  CreateHabitLogInput,
  HabitType,
  Goal,
} from '../../types/growth-system';
import { habitsService } from '../../services/growth-system/habits.service';
import { goalsService } from '../../services/growth-system/goals.service';
import Button from '../../components/atoms/Button';
import { HabitCard } from '../../components/molecules/HabitCard';
import { HabitLogWidget } from '../../components/molecules/HabitLogWidget';
import { HabitCreateForm } from '../../components/organisms/HabitCreateForm';
import { HabitEditForm } from '../../components/organisms/HabitEditForm';
import Dialog from '../../components/organisms/Dialog';
import { EmptyState } from '../../components/molecules/EmptyState';
import { AIHabitAssistPanel } from '../../components/molecules/AIHabitAssistPanel';
import { llmConfig } from '../../lib/llm';
import { HabitStatsDashboard } from '../../components/molecules/HabitStatsDashboard';
import { HabitCalendarHeatmap } from '../../components/molecules/HabitCalendarHeatmap';
import { CompletionRateChart } from '../../components/molecules/CompletionRateChart';
import { HabitCalendarView } from '../../components/molecules/HabitCalendarView';
import { WeeklyMonthlyComparison } from '../../components/molecules/WeeklyMonthlyComparison';
import { HabitDetailHeader } from '../../components/molecules/HabitDetailHeader';
import { HabitDetailTabs, type HabitDetailTab } from '../../components/molecules/HabitDetailTabs';
import { FloatingLogButton } from '../../components/molecules/FloatingLogButton';
import { DateDetailModal } from '../../components/molecules/DateDetailModal';
import { LinkedGoalsDisplay } from '../../components/molecules/LinkedGoalsDisplay';
import { formatCompletionDate } from '../../utils/date-formatters';
import { getLogsForDateRange } from '../../utils/habit-analytics';

type ViewMode = 'today' | 'all';

const HABIT_TYPES: HabitType[] = ['Build', 'Maintain', 'Reduce', 'Quit'];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Map<string, HabitLog[]>>(new Map());
  const [linkedGoals, setLinkedGoals] = useState<Map<string, Goal[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [habitToLog, setHabitToLog] = useState<Habit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiMode, setAIMode] = useState<
    'design' | 'stack' | 'recovery' | 'patterns' | 'triggers' | 'alignment'
  >('design');
  const isAIConfigured = llmConfig.isConfigured();
  const [activeTab, setActiveTab] = useState<HabitDetailTab>('overview');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [activityView, setActivityView] = useState<'heatmap' | 'calendar'>('heatmap');

  const loadLinkedGoals = async (habitId: string) => {
    try {
      const storage = await import('../../lib/storage').then((m) => m.getStorageAdapter());
      const allHabitGoals = await storage.getAll<{ habitId: string; goalId: string }>('habitGoals');
      const linkedGoalIds = allHabitGoals
        .filter((hg: { habitId: string; goalId: string }) => hg.habitId === habitId)
        .map((hg: { goalId: string }) => hg.goalId);

      const allGoalsResponse = await goalsService.getAll();
      if (allGoalsResponse.success && allGoalsResponse.data) {
        const goals = allGoalsResponse.data.filter((g: Goal) => linkedGoalIds.includes(g.id));
        setLinkedGoals((prev) => new Map(prev).set(habitId, goals));
      }
    } catch (error) {
      console.error('Failed to load linked goals:', error);
    }
  };

  const loadHabits = async () => {
    setIsLoading(true);
    try {
      const response = await habitsService.getAll();
      if (response.success && response.data) {
        setHabits(response.data);
        response.data.forEach((habit) => {
          loadHabitLogs(habit.id);
          loadLinkedGoals(habit.id);
        });
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHabitLogs = async (habitId: string) => {
    try {
      const response = await habitsService.getLogsByHabit(habitId);
      if (response.success && response.data) {
        setHabitLogs((prev) => new Map(prev).set(habitId, response.data!));
      }
    } catch (error) {
      console.error('Failed to load habit logs:', error);
    }
  };

  useEffect(() => {
    loadHabits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateHabit = async (input: CreateHabitInput) => {
    setIsSubmitting(true);
    try {
      const response = await habitsService.create(input);
      if (response.success && response.data) {
        setHabits([response.data, ...habits]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateHabit = async (id: string, input: UpdateHabitInput) => {
    setIsSubmitting(true);
    try {
      const response = await habitsService.update(id, input);
      if (response.success && response.data) {
        const updatedHabits = habits.map((h) => (h.id === id ? response.data! : h));
        setHabits(updatedHabits);
        if (selectedHabit && selectedHabit.id === id) {
          setSelectedHabit(response.data);
        }
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await habitsService.delete(habitToDelete.id);
      if (response.success) {
        const updatedHabits = habits.filter((h) => h.id !== habitToDelete.id);
        setHabits(updatedHabits);
        if (selectedHabit && selectedHabit.id === habitToDelete.id) {
          setSelectedHabit(null);
        }
        setHabitToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogCompletion = async (input: CreateHabitLogInput) => {
    setIsSubmitting(true);
    try {
      const response = await habitsService.logCompletion(input);
      if (response.success && response.data) {
        loadHabitLogs(input.habitId);
        setIsLogDialogOpen(false);
        setHabitToLog(null);
      }
    } catch (error) {
      console.error('Failed to log habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHabitClick = (habit: Habit) => {
    setSelectedHabit(habit);
  };

  const handleBackToGrid = () => {
    setSelectedHabit(null);
  };

  const handleQuickLog = (habit: Habit, date?: Date) => {
    setHabitToLog(habit);
    if (date) {
      // Pre-fill the date in the log widget if provided
      setIsLogDialogOpen(true);
    } else {
      setIsLogDialogOpen(true);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDateModalOpen(true);
  };

  const handleDateModalLog = (date: Date) => {
    if (selectedHabit) {
      handleQuickLog(selectedHabit, date);
      setIsDateModalOpen(false);
    }
  };

  const getStreak = (habitId: string): number => {
    const logs = habitLogs.get(habitId) || [];
    if (logs.length === 0) return 0;

    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].completedAt);
      logDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const isTodayCompleted = (habitId: string): boolean => {
    const logs = habitLogs.get(habitId) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return logs.some((log) => {
      const logDate = new Date(log.completedAt);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  };

  const getTodayProgress = (habitId: string): number => {
    const logs = habitLogs.get(habitId) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return logs
      .filter((log) => {
        const logDate = new Date(log.completedAt);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      })
      .reduce((sum, log) => sum + (log.amount || 1), 0);
  };

  const getWeeklyProgress = (habitId: string): number => {
    const logs = habitLogs.get(habitId) || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get Monday of current week
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    // Get Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return logs
      .filter((log) => {
        const logDate = new Date(log.completedAt);
        return logDate >= monday && logDate <= sunday;
      })
      .reduce((sum, log) => sum + (log.amount || 1), 0);
  };

  const getTotalCompletions = (habitId: string): number => {
    const logs = habitLogs.get(habitId) || [];
    return logs.reduce((sum, log) => sum + (log.amount || 1), 0);
  };

  const getLastCompletedDate = (habitId: string): string | null => {
    const logs = habitLogs.get(habitId) || [];
    if (logs.length === 0) return null;
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    return sortedLogs[0].completedAt;
  };

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch =
      !searchQuery ||
      habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const groupedByType = HABIT_TYPES.reduce(
    (acc, type) => {
      acc[type] = filteredHabits.filter((h) => h.habitType === type);
      return acc;
    },
    {} as Record<HabitType, Habit[]>
  );

  if (selectedHabit) {
    const logs = habitLogs.get(selectedHabit.id) || [];
    const streak = getStreak(selectedHabit.id);
    const selectedDateLogs = selectedDate
      ? getLogsForDateRange(
          logs,
          new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
          new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            23,
            59,
            59,
            999
          )
        )
      : [];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <HabitDetailHeader
            habit={selectedHabit}
            logs={logs}
            onBack={handleBackToGrid}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setHabitToDelete(selectedHabit)}
          />

          {/* AI Assist Panel */}
          {isAIConfigured && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <button
                onClick={() => setShowAIAssist(!showAIAssist)}
                className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <Sparkles size={18} />
                <span>AI Habit Tools</span>
                {showAIAssist ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showAIAssist && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAIMode('design')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'design' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      Habit Design
                    </button>
                    <button
                      onClick={() => setAIMode('stack')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'stack' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      Habit Stacking
                    </button>
                    <button
                      onClick={() => setAIMode('recovery')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'recovery' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      Streak Recovery
                    </button>
                    <button
                      onClick={() => setAIMode('patterns')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'patterns' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      Pattern Analysis
                    </button>
                    <button
                      onClick={() => setAIMode('triggers')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'triggers' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      Trigger Optimization
                    </button>
                    <button
                      onClick={() => setAIMode('alignment')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'alignment' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      Goal Alignment
                    </button>
                  </div>

                  <AIHabitAssistPanel
                    mode={aiMode}
                    habit={selectedHabit}
                    logs={logs}
                    onClose={() => setShowAIAssist(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab Navigation */}
          <HabitDetailTabs activeTab={activeTab} onTabChange={setActiveTab}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <HabitStatsDashboard habit={selectedHabit} logs={logs} />
                <LinkedGoalsDisplay goals={linkedGoals.get(selectedHabit.id) || []} />
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Activity</h2>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setActivityView('heatmap')}
                      className={`px-3 py-1.5 text-sm rounded transition-colors ${
                        activityView === 'heatmap'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Heatmap
                    </button>
                    <button
                      onClick={() => setActivityView('calendar')}
                      className={`px-3 py-1.5 text-sm rounded transition-colors ${
                        activityView === 'calendar'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Calendar
                    </button>
                  </div>
                </div>
                {activityView === 'heatmap' ? (
                  <HabitCalendarHeatmap
                    habit={selectedHabit}
                    logs={logs}
                    months={6}
                    onDateClick={handleDateClick}
                  />
                ) : (
                  <HabitCalendarView
                    habit={selectedHabit}
                    logs={logs}
                    onDateClick={handleDateClick}
                    onQuickLog={(date) => handleDateModalLog(date)}
                  />
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <CompletionRateChart habit={selectedHabit} logs={logs} />
                <WeeklyMonthlyComparison habit={selectedHabit} logs={logs} />
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Completion History
                    </h2>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {logs.length} total • {streak} day streak
                    </div>
                  </div>

                  {logs.length === 0 ? (
                    <EmptyState
                      title="No completions yet"
                      description="Start building your streak by logging your first completion"
                      actionLabel="Log Completion"
                      onAction={() => handleQuickLog(selectedHabit)}
                    />
                  ) : (
                    <div className="space-y-2">
                      {logs.slice(0, 50).map((log) => (
                        <button
                          key={log.id}
                          onClick={() => {
                            const logDate = new Date(log.completedAt);
                            handleDateClick(logDate);
                          }}
                          className="w-full text-left flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-gray-900 dark:text-white">
                                {formatCompletionDate(log.completedAt)}
                              </span>
                              {log.amount && log.amount > 1 && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  × {log.amount}
                                </span>
                              )}
                            </div>
                            {log.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </HabitDetailTabs>

          {/* Floating Action Button */}
          <FloatingLogButton
            habit={selectedHabit}
            logs={logs}
            onLog={() => handleQuickLog(selectedHabit)}
          />

          {/* Date Detail Modal */}
          {selectedDate && (
            <DateDetailModal
              isOpen={isDateModalOpen}
              onClose={() => {
                setIsDateModalOpen(false);
                setSelectedDate(null);
              }}
              habit={selectedHabit}
              date={selectedDate}
              logs={selectedDateLogs}
              onLog={handleDateModalLog}
            />
          )}

          {/* Edit Dialog */}
          <Dialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            title="Edit Habit"
            className="max-w-2xl"
          >
            <HabitEditForm
              habit={selectedHabit}
              onSubmit={handleUpdateHabit}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isSubmitting}
            />
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Repeat className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Daily Habits
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Build consistency one day at a time
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Habit
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'today'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Habits
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading habits...</p>
            </div>
          </div>
        ) : filteredHabits.length === 0 ? (
          <EmptyState
            title="No habits found"
            description={
              searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first habit'
            }
            actionLabel="Create Habit"
            onAction={() => setIsCreateDialogOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {HABIT_TYPES.map((type) => {
              const typeHabits = groupedByType[type];
              return (
                <div key={type} className="flex flex-col">
                  <div
                    className={`mb-3 px-3 py-2 rounded-lg ${
                      type === 'Build'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : type === 'Maintain'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : type === 'Reduce'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          type === 'Build'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : type === 'Maintain'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : type === 'Reduce'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {typeHabits.length}
                      </span>
                    </h2>
                  </div>
                  <div className="space-y-3 flex-1">
                    {typeHabits.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                        No {type.toLowerCase()} habits
                      </div>
                    ) : (
                      typeHabits.map((habit) => (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          streak={getStreak(habit.id)}
                          todayCompleted={isTodayCompleted(habit.id)}
                          todayProgress={getTodayProgress(habit.id)}
                          weeklyProgress={getWeeklyProgress(habit.id)}
                          totalCompletions={getTotalCompletions(habit.id)}
                          lastCompletedDate={getLastCompletedDate(habit.id)}
                          onClick={handleHabitClick}
                          onQuickLog={handleQuickLog}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create New Habit"
        className="max-w-2xl"
      >
        <HabitCreateForm
          onSubmit={handleCreateHabit}
          onCancel={() => setIsCreateDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </Dialog>

      <Dialog
        isOpen={isLogDialogOpen}
        onClose={() => {
          setIsLogDialogOpen(false);
          setHabitToLog(null);
        }}
        title="Log Completion"
        className="max-w-lg"
      >
        {habitToLog && (
          <HabitLogWidget
            habit={habitToLog}
            onSubmit={handleLogCompletion}
            onCancel={() => {
              setIsLogDialogOpen(false);
              setHabitToLog(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </Dialog>

      <Dialog isOpen={!!habitToDelete} onClose={() => setHabitToDelete(null)} title="Delete Habit">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this habit? This action cannot be undone.
          </p>
          {habitToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold text-gray-900 dark:text-white">{habitToDelete.name}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setHabitToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteHabit}
              disabled={isSubmitting}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Habit'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
