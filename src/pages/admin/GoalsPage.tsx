import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Target,
  LayoutGrid,
  Layers,
  Calendar,
  Kanban,
  Filter,
  X,
} from 'lucide-react';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  GoalStatus,
  EntitySummary,
  FilterOptions,
  GoalProgressBreakdown,
  Task,
  Metric,
  MetricLog,
  Habit,
  Priority,
  Area,
} from '@/types/growth-system';
import { goalsService } from '@/services/growth-system/goals.service';
import { goalProgressService } from '@/services/growth-system/goal-progress.service';
import Button from '@/components/atoms/Button';
import { GoalCard } from '@/components/molecules/GoalCard';
import { QuickFilterBar } from '@/components/molecules/QuickFilterBar';
import { BulkActionsBar } from '@/components/molecules/BulkActionsBar';
import { GoalCreateForm } from '@/components/organisms/GoalCreateForm';
import { GoalEditForm } from '@/components/organisms/GoalEditForm';
import { GoalDetailView } from '@/components/organisms/GoalDetailView';
import { GoalKanbanView } from '@/components/organisms/GoalKanbanView';
import { GoalTimelineView } from '@/components/organisms/GoalTimelineView';
import { GoalHierarchicalTimeView } from '@/components/organisms/GoalHierarchicalTimeView';
import Dialog from '@/components/organisms/Dialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { CelebrationEffect } from '@/components/atoms/CelebrationEffect';
import { GOAL_STATUSES, AREAS, PRIORITIES, AREA_LABELS } from '@/constants/growth-system';
import { migrateGoals, needsMigration } from '@/utils/goal-migration';
import { getStorageAdapter } from '@/lib/storage';

const STATUSES: GoalStatus[] = [...GOAL_STATUSES];
const AREA_OPTIONS: Area[] = [...AREAS];
const PRIORITY_OPTIONS: Priority[] = [...PRIORITIES];

type ViewMode = 'timeHorizon' | 'area' | 'kanban' | 'timeline';
type QuickFilter =
  | 'at_risk'
  | 'due_this_week'
  | 'needs_attention'
  | 'recently_completed'
  | 'dormant';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [viewMode, setViewMode] = useState<ViewMode>('timeHorizon');
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const [goalProjects, setGoalProjects] = useState<Map<string, EntitySummary[]>>(new Map());
  const [goalTasks, setGoalTasks] = useState<Map<string, Task[]>>(new Map());
  const [goalMetrics, setGoalMetrics] = useState<Map<string, Metric[]>>(new Map());
  const [goalMetricLogs, setGoalMetricLogs] = useState<Map<string, MetricLog[]>>(new Map());
  const [goalHabits, setGoalHabits] = useState<Map<string, Habit[]>>(new Map());
  const [goalsProgress, setGoalsProgress] = useState<Map<string, GoalProgressBreakdown>>(new Map());
  const [goalsLinkedCounts, setGoalsLinkedCounts] = useState<
    Map<string, { tasks: number; metrics: number; habits: number; projects: number }>
  >(new Map());
  const [goalsHealth, setGoalsHealth] = useState<
    Map<
      string,
      {
        status: 'healthy' | 'at_risk' | 'behind' | 'dormant';
        daysRemaining: number | null;
        momentum: 'active' | 'dormant';
      }
    >
  >(new Map());

  type CelebrationType =
    | 'goal_achieved'
    | 'criteria_completed'
    | 'milestone_25'
    | 'milestone_50'
    | 'milestone_75'
    | 'streak';
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: CelebrationType;
    message?: string;
  }>({ show: false, type: 'milestone_25' });

  const loadGoalData = async (goalId: string) => {
    try {
      // Load linked entities
      const [tasksRes, metricsRes, habitsRes, projectsRes] = await Promise.all([
        goalsService.getLinkedTasks(goalId),
        goalsService.getLinkedMetrics(goalId),
        goalsService.getLinkedHabits(goalId),
        goalsService.getLinkedProjects(goalId),
      ]);

      if (tasksRes.success && tasksRes.data) {
        setGoalTasks((prev) => new Map(prev).set(goalId, tasksRes.data!));
      }

      if (habitsRes.success && habitsRes.data) {
        setGoalHabits((prev) => new Map(prev).set(goalId, habitsRes.data!));
      }

      if (metricsRes.success && metricsRes.data) {
        // Load metrics details
        const metricsDetails: Metric[] = [];
        const storage = getStorageAdapter();

        for (const metricLink of metricsRes.data) {
          const metric = await storage.getById<Metric>('metrics', metricLink.metricId);
          if (metric) {
            metricsDetails.push(metric);
            // Load logs for each metric
            const allLogs = await storage.getAll<MetricLog>('metricLogs');
            const metricLogs = allLogs
              .filter((log) => log.metricId === metricLink.metricId)
              .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
            setGoalMetricLogs((prev) => new Map(prev).set(metricLink.metricId, metricLogs));
          }
        }
        setGoalMetrics((prev) => new Map(prev).set(goalId, metricsDetails));
      }

      if (projectsRes.success && projectsRes.data) {
        // Convert to EntitySummary
        const projectEntities: EntitySummary[] = [];
        const storage = getStorageAdapter();

        for (const projectLink of projectsRes.data) {
          const project = await storage.getById<{
            id: string;
            name: string;
            area: Goal['area'];
            status: string;
          }>('projects', projectLink.projectId);
          if (project) {
            projectEntities.push({
              id: project.id,
              title: project.name,
              type: 'project',
              area: project.area,
              status: project.status,
            });
          }
        }
        setGoalProjects((prev) => new Map(prev).set(goalId, projectEntities));
      }

      // Load progress
      const progressData = await goalProgressService.computeProgress(goalId);
      setGoalsProgress((prev) => new Map(prev).set(goalId, progressData));

      // Fetch goal for health calculation
      const goalResponse = await goalsService.getById(goalId);
      if (goalResponse.success && goalResponse.data) {
        // Load health data
        const healthData = await goalProgressService.calculateHealth(
          goalResponse.data,
          progressData
        );
        setGoalsHealth((prev) => new Map(prev).set(goalId, healthData));
      }

      // Load linked counts
      const counts = await goalProgressService.getLinkedCounts(goalId);
      setGoalsLinkedCounts((prev) => new Map(prev).set(goalId, counts));
    } catch (error) {
      console.error('Failed to load goal data:', error);
    }
  };

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const response = await goalsService.getAll();
      if (response.success && response.data) {
        let loadedGoals = response.data;

        // Migrate goals if needed
        const needsMigrationCheck = loadedGoals.some(needsMigration);
        if (needsMigrationCheck) {
          loadedGoals = migrateGoals(loadedGoals);
        }

        setGoals(loadedGoals);

        // Load data for each goal
        loadedGoals.forEach((goal) => {
          loadGoalData(goal.id);
        });
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateGoal = async (input: CreateGoalInput) => {
    setIsSubmitting(true);
    try {
      const response = await goalsService.create(input);
      if (response.success && response.data) {
        setGoals([response.data, ...goals]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGoal = async (id: string, input: UpdateGoalInput) => {
    setIsSubmitting(true);
    try {
      const response = await goalsService.update(id, input);
      if (response.success && response.data) {
        const updatedGoals = goals.map((g) => (g.id === id ? response.data! : g));
        setGoals(updatedGoals);
        if (selectedGoal && selectedGoal.id === id) {
          setSelectedGoal(response.data);
        }
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await goalsService.delete(goalToDelete.id);
      if (response.success) {
        const updatedGoals = goals.filter((g) => g.id !== goalToDelete.id);
        setGoals(updatedGoals);
        if (selectedGoal && selectedGoal.id === goalToDelete.id) {
          setSelectedGoal(null);
        }
        setGoalToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleBackToGrid = () => {
    setSelectedGoal(null);
  };

  const handleToggleCriterion = async (criterionId: string, isCompleted: boolean) => {
    if (!selectedGoal) return;

    try {
      const response = await goalsService.updateCriterion(selectedGoal.id, criterionId, {
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null,
      });

      if (response.success && response.data) {
        setSelectedGoal(response.data);
        setGoals(goals.map((g) => (g.id === response.data!.id ? response.data! : g)));

        // Log activity
        await goalsService.logActivity(selectedGoal.id, {
          goalId: selectedGoal.id,
          type: 'criterion_completed',
          title: 'Success criterion completed',
          description: `Marked criterion as completed`,
          entityType: null,
          entityId: null,
        });

        // Check for celebrations
        const criteria = response.data.successCriteria;
        const allCompleted =
          Array.isArray(criteria) &&
          criteria.length > 0 &&
          criteria.every((c: unknown) =>
            typeof c === 'string' ? c.includes('✓') : (c as { isCompleted: boolean }).isCompleted
          );

        if (allCompleted) {
          setCelebration({
            show: true,
            type: 'criteria_completed',
            message: 'All Success Criteria Met!',
          });
        }

        // Reload progress
        loadGoalData(selectedGoal.id);
      }
    } catch (error) {
      console.error('Failed to toggle criterion:', error);
    }
  };

  const handleBulkStatusChange = async (status: GoalStatus) => {
    for (const goalId of selectedGoalIds) {
      await goalsService.update(goalId, { status });
    }
    setSelectedGoalIds([]);
    loadGoals();
  };

  const handleBulkPriorityChange = async (priority: Goal['priority']) => {
    for (const goalId of selectedGoalIds) {
      await goalsService.update(goalId, { priority });
    }
    setSelectedGoalIds([]);
    loadGoals();
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedGoalIds.length} goals? This cannot be undone.`)) {
      for (const goalId of selectedGoalIds) {
        await goalsService.delete(goalId);
      }
      setSelectedGoalIds([]);
      loadGoals();
    }
  };

  const handleQuickFilterToggle = (filter: QuickFilter) => {
    setQuickFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = [
    filters.area,
    filters.status,
    filters.priority,
    filters.momentum,
    filters.hasLinkedTasks,
    filters.hasLinkedMetrics,
  ].filter(Boolean).length;

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        !searchQuery ||
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesArea = !filters.area || goal.area === filters.area;
      const matchesStatus = !filters.status || goal.status === filters.status;
      const matchesPriority = !filters.priority || goal.priority === filters.priority;
      const matchesMomentum =
        !filters.momentum ||
        (filters.momentum === 'active'
          ? goalsHealth.get(goal.id)?.momentum === 'active'
          : filters.momentum === 'dormant'
            ? goalsHealth.get(goal.id)?.momentum === 'dormant'
            : true);
      const matchesHasLinkedTasks =
        !filters.hasLinkedTasks || (goalsLinkedCounts.get(goal.id)?.tasks || 0) > 0;
      const matchesHasLinkedMetrics =
        !filters.hasLinkedMetrics || (goalsLinkedCounts.get(goal.id)?.metrics || 0) > 0;

      // Quick filters
      if (quickFilters.length > 0) {
        const now = new Date();
        const matchesQuickFilters = quickFilters.every((qf) => {
          switch (qf) {
            case 'at_risk':
              return goal.status === 'AtRisk';
            case 'due_this_week': {
              if (!goal.targetDate) return false;
              const target = new Date(goal.targetDate);
              const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              return target >= now && target <= oneWeekFromNow;
            }
            case 'needs_attention': {
              const lastActivity = goal.lastActivityAt
                ? new Date(goal.lastActivityAt)
                : new Date(goal.createdAt);
              const daysSinceActivity = Math.ceil(
                (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
              );
              return daysSinceActivity > 7 && goal.status === 'Active';
            }
            case 'dormant':
              return goalsHealth.get(goal.id)?.momentum === 'dormant';
            case 'recently_completed': {
              if (!goal.completedDate) return false;
              const completed = new Date(goal.completedDate);
              const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return completed >= sevenDaysAgo;
            }
            default:
              return true;
          }
        });
        if (!matchesQuickFilters) return false;
      }

      return (
        matchesSearch &&
        matchesArea &&
        matchesStatus &&
        matchesPriority &&
        matchesMomentum &&
        matchesHasLinkedTasks &&
        matchesHasLinkedMetrics
      );
    });
  }, [goals, searchQuery, filters, quickFilters, goalsHealth, goalsLinkedCounts]);

  const groupedByArea = filteredGoals.reduce(
    (acc, goal) => {
      if (!acc[goal.area]) acc[goal.area] = [];
      acc[goal.area].push(goal);
      return acc;
    },
    {} as Record<string, Goal[]>
  );

  if (selectedGoal) {
    const tasks = goalTasks.get(selectedGoal.id) || [];
    const metrics = (goalMetrics.get(selectedGoal.id) || []).map((m) => ({
      metric: m,
      latestLog: (goalMetricLogs.get(m.id) || [])[0] || null,
      progress: 0, // Would calculate from logs
    }));
    const habits = (goalHabits.get(selectedGoal.id) || []).map((h) => ({
      habit: h,
      currentStreak: 0,
      completedToday: false,
      weeklyProgress: 0,
    }));
    const projects = goalProjects.get(selectedGoal.id) || [];

    return (
      <>
        <GoalDetailView
          goal={selectedGoal}
          tasks={tasks}
          metrics={metrics}
          habits={habits}
          projects={projects}
          onBack={handleBackToGrid}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => setGoalToDelete(selectedGoal)}
          onToggleCriterion={handleToggleCriterion}
          onUpdateCriterion={(criterionId, updates) => {
            console.log('Update criterion', criterionId, updates);
          }}
          onAddTask={() => console.log('Add task')}
          onLinkMetric={() => console.log('Link metric')}
          onLinkHabit={() => console.log('Link habit')}
          onCompleteHabit={(habitId) => console.log('Complete habit', habitId)}
          onLogMetric={(metricId) => console.log('Log metric', metricId)}
        />

        <Dialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Edit Goal"
          className="max-w-2xl"
        >
          <GoalEditForm
            goal={selectedGoal}
            onSubmit={handleUpdateGoal}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </Dialog>

        <CelebrationEffect
          show={celebration.show}
          type={celebration.type}
          message={celebration.message}
          onComplete={() => setCelebration({ show: false, type: 'milestone_25' })}
        />
      </>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals Vision Board</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your goals and success criteria
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="mb-4">
        <QuickFilterBar
          goals={goals}
          activeFilters={quickFilters}
          onFilterToggle={handleQuickFilterToggle}
          onClearFilters={() => setQuickFilters([])}
        />
      </div>

      {/* Search and View Mode Switcher */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <button
            onClick={() => setViewMode('timeHorizon')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === 'timeHorizon'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Time view"
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Time</span>
          </button>
          <button
            onClick={() => setViewMode('area')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === 'area'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Area view"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Area</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === 'kanban'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Kanban board"
          >
            <Kanban className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Board</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === 'timeline'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Timeline view"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Timeline</span>
          </button>
        </div>
      </div>

      {/* Inline Collapsible Filters */}
      {showFilters && (
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Area
              </label>
              <select
                value={filters.area || ''}
                onChange={(e) =>
                  setFilters({ ...filters, area: (e.target.value as Area) || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Areas</option>
                {AREA_OPTIONS.map((area) => (
                  <option key={area} value={area}>
                    {AREA_LABELS[area]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) =>
                  setFilters({ ...filters, priority: (e.target.value as Priority) || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activity Level
              </label>
              <select
                value={filters.momentum || ''}
                onChange={(e) => setFilters({ ...filters, momentum: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="dormant">Dormant</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Has Linked...
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!filters.hasLinkedTasks}
                    onChange={(e) =>
                      setFilters({ ...filters, hasLinkedTasks: e.target.checked || undefined })
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tasks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!filters.hasLinkedMetrics}
                    onChange={(e) =>
                      setFilters({ ...filters, hasLinkedMetrics: e.target.checked || undefined })
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Metrics</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading goals...</p>
          </div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found"
          description={
            searchQuery ||
            filters.area ||
            filters.status ||
            filters.priority ||
            quickFilters.length > 0
              ? 'Try adjusting your filters or search query'
              : 'Get started by creating your first goal'
          }
          actionLabel="Create Goal"
          onAction={() => setIsCreateDialogOpen(true)}
          variant={goals.length === 0 ? 'onboarding' : 'default'}
          onboardingSteps={
            goals.length === 0
              ? [
                  'Start with a yearly goal that represents your big vision',
                  'Break it down into quarterly and monthly milestones',
                  'Define 3-5 success criteria to measure achievement',
                  'Link tasks, metrics, and habits to track progress',
                ]
              : []
          }
          proTips={
            goals.length === 0
              ? [
                  'Use SMART criteria: Specific, Measurable, Achievable, Relevant, Time-bound',
                  'Start with 1-3 goals per area to avoid overwhelm',
                  'Review your goals weekly to stay on track',
                ]
              : []
          }
        />
      ) : viewMode === 'kanban' ? (
        <GoalKanbanView
          goals={filteredGoals}
          goalsProgress={goalsProgress}
          goalsLinkedCounts={goalsLinkedCounts}
          goalsHealth={goalsHealth}
          onGoalClick={handleGoalClick}
          onGoalUpdate={async (goalId, updates) => {
            await handleUpdateGoal(goalId, updates as UpdateGoalInput);
            await loadGoals(); // Reload to reflect changes
          }}
          onCreateGoal={(status) => {
            // TODO: Set initial status for new goal
            console.log('Create goal with status:', status);
            setIsCreateDialogOpen(true);
          }}
        />
      ) : viewMode === 'timeline' ? (
        <GoalTimelineView goals={filteredGoals} onGoalClick={handleGoalClick} />
      ) : viewMode === 'timeHorizon' ? (
        <GoalHierarchicalTimeView
          goals={filteredGoals}
          goalsProgress={goalsProgress}
          goalsLinkedCounts={goalsLinkedCounts}
          goalsHealth={goalsHealth}
          onGoalClick={handleGoalClick}
          onCreateSubgoal={(parentGoal) => {
            // TODO: Implement create subgoal with parentGoalId set
            console.log('Create subgoal for:', parentGoal.title);
            setIsCreateDialogOpen(true);
          }}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByArea).map(([area, areaGoals]) => (
            <div key={area}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AreaBadge area={area as Goal['area']} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({areaGoals.length} {areaGoals.length === 1 ? 'goal' : 'goals'})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {areaGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onClick={handleGoalClick}
                    progress={goalsProgress.get(goal.id)}
                    linkedCounts={goalsLinkedCounts.get(goal.id)}
                    healthStatus={goalsHealth.get(goal.id)?.status}
                    daysRemaining={goalsHealth.get(goal.id)?.daysRemaining}
                    momentum={goalsHealth.get(goal.id)?.momentum}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedGoalIds.length}
        onStatusChange={handleBulkStatusChange}
        onPriorityChange={handleBulkPriorityChange}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedGoalIds([])}
      />

      {/* Celebration Effect */}
      <CelebrationEffect
        show={celebration.show}
        type={celebration.type}
        message={celebration.message}
        onComplete={() => setCelebration({ show: false, type: 'milestone_25' })}
      />

      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create New Goal"
        className="max-w-2xl"
      >
        <GoalCreateForm
          onSubmit={handleCreateGoal}
          onCancel={() => setIsCreateDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </Dialog>

      <Dialog isOpen={!!goalToDelete} onClose={() => setGoalToDelete(null)} title="Delete Goal">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this goal? This action cannot be undone.
          </p>
          {goalToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold text-gray-900 dark:text-white">{goalToDelete.title}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setGoalToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteGoal}
              disabled={isSubmitting}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Goal'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
