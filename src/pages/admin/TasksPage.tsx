import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  List,
  Kanban,
  Calendar as CalendarIcon,
  Network,
  Filter,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  Area,
  Priority,
  TaskStatus,
  EntitySummary,
  TaskDependency,
} from '@/types/growth-system';
import {
  useTasks,
  useProjects,
  useGoals,
  useTaskDependencies,
} from '@/hooks/useGrowthSystem';
import { useGrowthSystemDashboard } from '@/hooks/useGrowthSystemDashboard';
import { tasksService } from '@/services/growth-system/tasks.service';
import Button from '@/components/atoms/Button';
import { TaskListItem } from '@/components/molecules/TaskListItem';
import { TaskCreateForm } from '@/components/organisms/TaskCreateForm';
import { TaskEditPanel } from '@/components/organisms/TaskEditPanel';
import { TaskKanbanBoard } from '@/components/organisms/TaskKanbanBoard';
import { TaskCalendarView } from '@/components/organisms/TaskCalendarView';
import DependencyGraph from '@/components/organisms/DependencyGraph';
import { TaskDetailDialog } from '@/components/organisms/TaskDetailDialog';
import Dialog from '@/components/molecules/Dialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { AISuggestionBanner } from '@/components/molecules/AISuggestionBanner';
import { useToast } from '@/hooks/use-toast';
import {
  AREAS,
  PRIORITIES,
  TASK_STATUSES,
  AREA_LABELS,
  TASK_STATUS_LABELS,
} from '@/constants/growth-system';

type ViewMode = 'list' | 'kanban' | 'calendar' | 'graph';

const AREA_OPTIONS: Area[] = [...AREAS];
const STATUS_OPTIONS: TaskStatus[] = [...TASK_STATUSES];
const PRIORITY_OPTIONS: Priority[] = [...PRIORITIES];

export default function TasksPage() {
  const { showToast, ToastContainer } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | undefined>();
  const [selectedPriority, setSelectedPriority] = useState<Priority | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showFilters, setShowFilters] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus | undefined>();
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Use dashboard hook for initial data loading (single API call)
  const { tasks: dashboardTasks, projects: dashboardProjects, goals: dashboardGoals, isLoading: dashboardLoading } =
    useGrowthSystemDashboard();

  // Use individual hooks for mutations (they read from cache populated by dashboard hook)
  const { createTask, updateTask, deleteTask } = useTasks();
  const { projects: _projects } = useProjects();
  const { goals: _goals } = useGoals();

  // Use dashboard data for initial render (individual hooks will read from cache if dashboard loaded)
  const tasks = useMemo(
    () => (dashboardTasks.length > 0 ? dashboardTasks : []),
    [dashboardTasks]
  );
  const projects = useMemo(
    () => (dashboardProjects.length > 0 ? dashboardProjects : _projects),
    [dashboardProjects, _projects]
  );
  const goals = useMemo(
    () => (dashboardGoals.length > 0 ? dashboardGoals : _goals),
    [dashboardGoals, _goals]
  );
  const tasksLoading = dashboardLoading;

  // Convert projects and goals to EntitySummary format
  const allProjects = useMemo<EntitySummary[]>(
    () =>
      projects.map((p) => ({
        id: p.id,
        title: p.name,
        type: 'project' as const,
        area: p.area,
        status: p.status,
      })),
    [projects]
  );

  const allGoals = useMemo<EntitySummary[]>(
    () =>
      goals.map((g) => ({
        id: g.id,
        title: g.title,
        type: 'goal' as const,
        area: g.area,
        status: g.status,
      })),
    [goals]
  );

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      return (
        (!searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedArea || task.area === selectedArea) &&
        (!selectedStatus || task.status === selectedStatus) &&
        (!selectedPriority || task.priority === selectedPriority)
      );
    });
  }, [tasks, searchQuery, selectedArea, selectedStatus, selectedPriority]);

  // Load dependencies for all tasks using batched hook
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const {
    dependencyMap,
    allDependencies: rawDependencies,
    isLoading: dependenciesLoading,
  } = useTaskDependencies(taskIds);

  // Convert raw dependencies to TaskDependency format
  const allDependencies = useMemo<TaskDependency[]>(() => {
    return rawDependencies as TaskDependency[];
  }, [rawDependencies]);

  // Compute dependency and blocked-by maps
  const { taskDependencies, taskBlockedBy } = useMemo(() => {
    const depMap = new Map<string, string[]>();
    const blockedMap = new Map<string, string[]>();
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    dependencyMap.forEach((deps, taskId) => {
      const depIds = deps.map((d: { dependsOnTaskId: string }) => d.dependsOnTaskId);
      depMap.set(taskId, depIds);

      const incompleteDeps = depIds.filter((depId: string) => {
        const depTask = taskMap.get(depId);
        return depTask && depTask.status !== 'Done';
      });

      incompleteDeps.forEach((depId: string) => {
        const current = blockedMap.get(taskId) || [];
        blockedMap.set(taskId, [...current, depId]);
      });
    });

    return { taskDependencies: depMap, taskBlockedBy: blockedMap };
  }, [dependencyMap, tasks]);

  const isLoading = tasksLoading || dependenciesLoading;

  const handleCreateTask = async (input: CreateTaskInput) => {
    setIsSubmitting(true);
    try {
      if (createStatus) {
        input.status = createStatus;
      }
      await createTask(input);
      setIsCreateDialogOpen(false);
      setCreateStatus(undefined);
      showToast({
        type: 'success',
        title: 'Task created',
        message: `"${input.title}" has been created successfully.`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create task. Please try again.';
      showToast({
        type: 'error',
        title: 'Failed to create task',
        message: errorMessage,
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskId: string, input: UpdateTaskInput): Promise<void> => {
    setIsSubmitting(true);
    try {
      await updateTask({ id: taskId, input });
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error; // Re-throw so TaskEditPanel can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteTask(taskToDelete.id);

      // Success: show toast and close dialog
      showToast({
        type: 'success',
        title: 'Task deleted',
        message: `"${taskToDelete.title}" has been deleted successfully.`,
      });

      setTaskToDelete(null);
      setIsEditPanelOpen(false);
    } catch (error) {
      // Error: show error message and keep dialog open
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete task. Please try again.';
      setDeleteError(errorMessage);
      showToast({
        type: 'error',
        title: 'Failed to delete task',
        message: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditPanelOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setTaskToView(task);
    setIsDetailDialogOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedArea(undefined);
    setSelectedStatus(undefined);
    setSelectedPriority(undefined);
  };

  const handleDependencyAdd = async (taskId: string, dependsOnId: string) => {
    try {
      await tasksService.addDependency(taskId, dependsOnId);
      // React Query will refetch dependencies automatically on next render
      // or we could invalidate the query here if needed
    } catch (error) {
      console.error('Failed to add dependency:', error);
      showToast({
        type: 'error',
        title: 'Failed to add dependency',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const handleDependencyRemove = async (taskId: string, dependsOnId: string) => {
    try {
      await tasksService.removeDependency(taskId, dependsOnId);
      // React Query will refetch dependencies automatically on next render
      // or we could invalidate the query here if needed
    } catch (error) {
      console.error('Failed to remove dependency:', error);
      showToast({
        type: 'error',
        title: 'Failed to remove dependency',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const handleProjectLink = async (taskId: string, projectId: string) => {
    try {
      await tasksService.linkToProject(taskId, projectId);
    } catch (error) {
      console.error('Failed to link project:', error);
    }
  };

  const handleProjectUnlink = async (taskId: string, projectId: string) => {
    try {
      await tasksService.unlinkFromProject(taskId, projectId);
    } catch (error) {
      console.error('Failed to unlink project:', error);
    }
  };

  const handleGoalLink = async (taskId: string, goalId: string) => {
    try {
      await tasksService.linkToGoal(taskId, goalId);
    } catch (error) {
      console.error('Failed to link goal:', error);
    }
  };

  const handleGoalUnlink = async (taskId: string, goalId: string) => {
    try {
      await tasksService.unlinkFromGoal(taskId, goalId);
    } catch (error) {
      console.error('Failed to unlink goal:', error);
    }
  };

  const getTaskDependencies = (taskId: string): Task[] => {
    const depIds = taskDependencies.get(taskId) || [];
    return tasks.filter((t) => depIds.includes(t.id));
  };

  const getTaskBlockedBy = (taskId: string): Task[] => {
    const blockedIds = taskBlockedBy.get(taskId) || [];
    return tasks.filter((t) => blockedIds.includes(t.id));
  };

  const getLinkedProjects = (_taskId: string): EntitySummary[] => {
    // TODO: Fetch linked projects from API if needed
    // For now, return empty array as task-project linking wasn't fully implemented
    return [];
  };

  const getLinkedGoals = (_taskId: string): EntitySummary[] => {
    // TODO: Fetch linked goals from API if needed
    // For now, return empty array as task-goal linking wasn't fully implemented
    return [];
  };

  const activeFilterCount = [selectedArea, selectedStatus, selectedPriority].filter(Boolean).length;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and track progress
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Task
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {viewMode === 'list' && (
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
        )}

        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">List</span>
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
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === 'calendar'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Calendar view"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === 'graph'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Dependency graph"
          >
            <Network className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Graph</span>
          </button>
        </div>
      </div>

      {viewMode === 'list' && showFilters && (
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
                value={selectedArea || ''}
                onChange={(e) => setSelectedArea((e.target.value as Area) || undefined)}
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
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus((e.target.value as TaskStatus) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={selectedPriority || ''}
                onChange={(e) => setSelectedPriority((e.target.value as Priority) || undefined)}
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
          </div>
        </div>
      )}

      <AISuggestionBanner entityType="task" />

      {viewMode === 'list' && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description={
                searchQuery || selectedArea || selectedStatus || selectedPriority
                  ? 'Try adjusting your filters or search query'
                  : 'Get started by creating your first task'
              }
              actionLabel="Create Task"
              onAction={() => setIsCreateDialogOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </div>
              {filteredTasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onClick={handleViewTask}
                  dependencyCount={taskDependencies.get(task.id)?.length || 0}
                  blockedByCount={taskBlockedBy.get(task.id)?.length || 0}
                  blockedByTasks={getTaskBlockedBy(task.id)}
                  projectCount={0}
                  goalCount={0}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="-mx-12 -mb-12 -mt-4">
          <TaskKanbanBoard
            tasks={filteredTasks}
            onTaskUpdate={handleUpdateTask}
            onTaskEdit={handleEditTask}
            onTaskClick={handleViewTask}
            onTaskCreate={(status) => {
              setCreateStatus(status);
              setIsCreateDialogOpen(true);
            }}
          />
        </div>
      )}

      {viewMode === 'calendar' && (
        <TaskCalendarView tasks={filteredTasks} onTaskClick={handleEditTask} />
      )}

      {viewMode === 'graph' && (
        <DependencyGraph
          tasks={filteredTasks}
          dependencies={allDependencies}
          onTaskClick={(taskId) => {
            const task = filteredTasks.find((t) => t.id === taskId);
            if (task) handleEditTask(task);
          }}
        />
      )}

      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setCreateStatus(undefined);
        }}
        title="Create New Task"
      >
        <TaskCreateForm
          onSubmit={handleCreateTask}
          onCancel={() => {
            setIsCreateDialogOpen(false);
            setCreateStatus(undefined);
          }}
          isLoading={isSubmitting}
        />
      </Dialog>

      {selectedTask && (
        <TaskEditPanel
          task={selectedTask}
          isOpen={isEditPanelOpen}
          onClose={() => {
            setIsEditPanelOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleUpdateTask}
          isLoading={isSubmitting}
          availableTasks={tasks}
          availableProjects={allProjects}
          availableGoals={allGoals}
          dependencies={getTaskDependencies(selectedTask.id)}
          blockedBy={getTaskBlockedBy(selectedTask.id)}
          linkedProjects={getLinkedProjects(selectedTask.id)}
          linkedGoals={getLinkedGoals(selectedTask.id)}
          onDependencyAdd={handleDependencyAdd}
          onDependencyRemove={handleDependencyRemove}
          onProjectLink={handleProjectLink}
          onProjectUnlink={handleProjectUnlink}
          onGoalLink={handleGoalLink}
          onGoalUnlink={handleGoalUnlink}
        />
      )}

      <Dialog
        isOpen={!!taskToDelete}
        onClose={() => !isDeleting && setTaskToDelete(null)}
        title="Delete Task"
      >
        <div className="space-y-4 relative">
          {/* Loading Overlay */}
          {isDeleting && (
            <div
              className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deleting task...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {deleteError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">Error</p>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">{deleteError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteError(null)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          )}

          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
          </p>
          <div
            className={`flex justify-end gap-3 ${isDeleting ? 'pointer-events-none opacity-60' : ''}`}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setTaskToDelete(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Dialog>

      <ToastContainer />

      <TaskDetailDialog
        task={taskToView}
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setTaskToView(null);
        }}
        onEdit={handleEditTask}
      />
    </div>
  );
}
