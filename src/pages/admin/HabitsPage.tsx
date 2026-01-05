import { useState, useEffect } from 'react';
import { Plus, Search, ArrowLeft, Edit2, Trash2, Repeat, Calendar, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Habit, HabitLog, CreateHabitInput, UpdateHabitInput, CreateHabitLogInput, HabitType } from '../../types/growth-system';
import { habitsService } from '../../services/growth-system/habits.service';
import Button from '../../components/atoms/Button';
import { HabitCard } from '../../components/molecules/HabitCard';
import { HabitLogWidget } from '../../components/molecules/HabitLogWidget';
import { HabitCreateForm } from '../../components/organisms/HabitCreateForm';
import { HabitEditForm } from '../../components/organisms/HabitEditForm';
import Dialog from '../../components/organisms/Dialog';
import { EmptyState } from '../../components/molecules/EmptyState';
import { AreaBadge } from '../../components/atoms/AreaBadge';
import { AIHabitAssistPanel } from '../../components/molecules/AIHabitAssistPanel';
import { llmConfig } from '../../lib/llm';

type ViewMode = 'today' | 'all';

const HABIT_TYPES: HabitType[] = ['Build', 'Maintain', 'Reduce', 'Quit'];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Map<string, HabitLog[]>>(new Map());
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
  const [aiMode, setAIMode] = useState<'design' | 'stack' | 'recovery' | 'patterns' | 'triggers' | 'alignment'>('design');
  const isAIConfigured = llmConfig.isConfigured();

  const loadHabits = async () => {
    setIsLoading(true);
    try {
      const response = await habitsService.getAll();
      if (response.success && response.data) {
        setHabits(response.data);
        response.data.forEach(habit => {
          loadHabitLogs(habit.id);
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
        setHabitLogs(prev => new Map(prev).set(habitId, response.data!));
      }
    } catch (error) {
      console.error('Failed to load habit logs:', error);
    }
  };

  useEffect(() => {
    loadHabits();
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

  const handleQuickLog = (habit: Habit) => {
    setHabitToLog(habit);
    setIsLogDialogOpen(true);
  };

  const getStreak = (habitId: string): number => {
    const logs = habitLogs.get(habitId) || [];
    if (logs.length === 0) return 0;

    const sortedLogs = [...logs].sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
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

    return logs.some(log => {
      const logDate = new Date(log.completedAt);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  };

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = !searchQuery || habit.name.toLowerCase().includes(searchQuery.toLowerCase()) || (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const groupedByType = HABIT_TYPES.reduce((acc, type) => {
    acc[type] = filteredHabits.filter(h => h.habitType === type);
    return acc;
  }, {} as Record<HabitType, Habit[]>);

  if (selectedHabit) {
    const logs = habitLogs.get(selectedHabit.id) || [];
    const streak = getStreak(selectedHabit.id);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBackToGrid}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Habits
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedHabit.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <AreaBadge area={selectedHabit.area} />
                  {selectedHabit.subCategory && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedHabit.subCategory}
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedHabit.habitType === 'Build' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    selectedHabit.habitType === 'Maintain' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    selectedHabit.habitType === 'Reduce' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {selectedHabit.habitType}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedHabit.frequency}
                  </span>
                </div>
                {selectedHabit.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedHabit.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHabitToDelete(selectedHabit)}
                  className="hover:!bg-red-50 hover:!text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            {selectedHabit.intent && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Intent</div>
                <p className="text-gray-900 dark:text-white">{selectedHabit.intent}</p>
              </div>
            )}

            {selectedHabit.trigger && selectedHabit.action && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Habit Loop</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Trigger</div>
                    <div className="text-sm text-gray-900 dark:text-white">{selectedHabit.trigger}</div>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Action</div>
                    <div className="text-sm text-gray-900 dark:text-white">{selectedHabit.action}</div>
                  </div>
                  {selectedHabit.reward && (
                    <>
                      <div className="text-gray-400">→</div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Reward</div>
                        <div className="text-sm text-gray-900 dark:text-white">{selectedHabit.reward}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {selectedHabit.frictionDown && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Make it Easier</div>
                <p className="text-gray-900 dark:text-white">{selectedHabit.frictionDown}</p>
              </div>
            )}

            {isAIConfigured && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
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
                      <button onClick={() => setAIMode('design')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'design' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Habit Design
                      </button>
                      <button onClick={() => setAIMode('stack')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'stack' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Habit Stacking
                      </button>
                      <button onClick={() => setAIMode('recovery')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'recovery' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Streak Recovery
                      </button>
                      <button onClick={() => setAIMode('patterns')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'patterns' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Pattern Analysis
                      </button>
                      <button onClick={() => setAIMode('triggers')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'triggers' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Trigger Optimization
                      </button>
                      <button onClick={() => setAIMode('alignment')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'alignment' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
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
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Completion History ({logs.length} total, {streak} day streak)
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleQuickLog(selectedHabit)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Log Completion
              </Button>
            </div>

            {logs.length === 0 ? (
              <EmptyState
                title="No completions yet"
                description="Start building your streak by logging your first completion"
                actionLabel="Log Completion"
                onAction={() => handleQuickLog(selectedHabit)}
              />
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(log.completedAt).toLocaleDateString()}
                        </span>
                        {log.amount && log.amount > 1 && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            × {log.amount}
                          </span>
                        )}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
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

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            description={searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first habit'}
            actionLabel="Create Habit"
            onAction={() => setIsCreateDialogOpen(true)}
          />
        ) : (
          <div className="space-y-8">
            {HABIT_TYPES.map(type => {
              const typeHabits = groupedByType[type];
              if (typeHabits.length === 0) return null;
              return (
                <div key={type}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      type === 'Build' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      type === 'Maintain' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      type === 'Reduce' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {type}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({typeHabits.length} {typeHabits.length === 1 ? 'habit' : 'habits'})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {typeHabits.map(habit => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        streak={getStreak(habit.id)}
                        todayCompleted={isTodayCompleted(habit.id)}
                        onClick={handleHabitClick}
                        onQuickLog={handleQuickLog}
                      />
                    ))}
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

      <Dialog
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        title="Delete Habit"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this habit? This action cannot be undone.
          </p>
          {habitToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                {habitToDelete.name}
              </p>
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
