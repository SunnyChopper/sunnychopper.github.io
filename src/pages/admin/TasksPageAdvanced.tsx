import { useState, useEffect } from 'react';
import { Plus, Search, List, Kanban, Calendar as CalendarIcon, Network } from 'lucide-react';
import type { Task, CreateTaskInput, UpdateTaskInput, Area, Priority, TaskStatus, EntitySummary, TaskDependency } from '../../types/growth-system';
import { tasksService } from '../../services/growth-system/tasks.service';
import { projectsService } from '../../services/growth-system/projects.service';
import { goalsService } from '../../services/growth-system/goals.service';
import Button from '../../components/atoms/Button';
import { TaskListItem } from '../../components/molecules/TaskListItem';
import { TaskFilters } from '../../components/molecules/TaskFilters';
import { TaskCreateForm } from '../../components/organisms/TaskCreateForm';
import { TaskEditPanelAdvanced } from '../../components/organisms/TaskEditPanelAdvanced';
import { TaskKanbanBoard } from '../../components/organisms/TaskKanbanBoard';
import { TaskCalendarView } from '../../components/organisms/TaskCalendarView';
import DependencyGraph from '../../components/organisms/DependencyGraph';
import Dialog from '../../components/organisms/Dialog';
import { EmptyState } from '../../components/molecules/EmptyState';

type ViewMode = 'list' | 'kanban' | 'calendar' | 'graph';

export default function TasksPageAdvanced() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | undefined>();
  const [selectedPriority, setSelectedPriority] = useState<Priority | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus | undefined>();
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [allProjects, setAllProjects] = useState<EntitySummary[]>([]);
  const [allGoals, setAllGoals] = useState<EntitySummary[]>([]);
  const [taskDependencies, setTaskDependencies] = useState<Map<string, string[]>>(new Map());
  const [taskBlockedBy, setTaskBlockedBy] = useState<Map<string, string[]>>(new Map());
  const [taskProjects] = useState<Map<string, string[]>>(new Map());
  const [taskGoals] = useState<Map<string, string[]>>(new Map());
  const [allDependencies, setAllDependencies] = useState<TaskDependency[]>([]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await tasksService.getAll({
        search: searchQuery || undefined,
        area: selectedArea,
        status: selectedStatus,
        priority: selectedPriority,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setTasks(response.data);
      setFilteredTasks(response.data);
      await loadRelationships(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelationships = async (taskList: Task[]) => {
    const depMap = new Map<string, string[]>();
    const blockedMap = new Map<string, string[]>();
    const deps: TaskDependency[] = [];

    await Promise.all(
      taskList.map(async (task) => {
        const depsResponse = await tasksService.getDependencies(task.id);
        if (depsResponse.success && depsResponse.data) {
          deps.push(...depsResponse.data);
          const depIds = depsResponse.data.map(d => d.dependsOnTaskId);
          depMap.set(task.id, depIds);

          depIds.forEach(depId => {
            const current = blockedMap.get(depId) || [];
            blockedMap.set(depId, [...current, task.id]);
          });
        }
      })
    );

    setTaskDependencies(depMap);
    setTaskBlockedBy(blockedMap);
    setAllDependencies(deps);
  };

  const loadProjects = async () => {
    try {
      const response = await projectsService.getAll();
      if (response.success && response.data) {
        const projectEntities: EntitySummary[] = response.data.map(p => ({
          id: p.id,
          title: p.name,
          type: 'project',
          area: p.area,
          status: p.status,
        }));
        setAllProjects(projectEntities);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await goalsService.getAll();
      if (response.success && response.data) {
        const goalEntities: EntitySummary[] = response.data.map(g => ({
          id: g.id,
          title: g.title,
          type: 'goal',
          area: g.area,
          status: g.status,
        }));
        setAllGoals(goalEntities);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadGoals();
  }, [searchQuery, selectedArea, selectedStatus, selectedPriority]);

  const handleCreateTask = async (input: CreateTaskInput) => {
    setIsSubmitting(true);
    try {
      const taskInput = createStatus ? { ...input, status: createStatus } : input;
      const response = await tasksService.create(taskInput);
      if (response.success && response.data) {
        setTasks([response.data, ...tasks]);
        setFilteredTasks([response.data, ...filteredTasks]);
        setIsCreateDialogOpen(false);
        setCreateStatus(undefined);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (id: string, input: UpdateTaskInput) => {
    setIsSubmitting(true);
    try {
      const response = await tasksService.update(id, input);
      if (response.success && response.data) {
        const updatedTasks = tasks.map((t) => (t.id === id ? response.data! : t));
        setTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
        setIsEditPanelOpen(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await tasksService.delete(taskToDelete.id);
      if (response.success) {
        const updatedTasks = tasks.filter((t) => t.id !== taskToDelete.id);
        setTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
        setTaskToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditPanelOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedArea(undefined);
    setSelectedStatus(undefined);
    setSelectedPriority(undefined);
  };

  const handleDependencyAdd = async (taskId: string, dependsOnId: string) => {
    try {
      await tasksService.addDependency(taskId, dependsOnId);
      await loadRelationships(tasks);
    } catch (error) {
      console.error('Failed to add dependency:', error);
    }
  };

  const handleDependencyRemove = async (taskId: string, dependsOnId: string) => {
    try {
      await tasksService.removeDependency(taskId, dependsOnId);
      await loadRelationships(tasks);
    } catch (error) {
      console.error('Failed to remove dependency:', error);
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
    return tasks.filter(t => depIds.includes(t.id));
  };

  const getTaskBlockedBy = (taskId: string): Task[] => {
    const blockedIds = taskBlockedBy.get(taskId) || [];
    return tasks.filter(t => blockedIds.includes(t.id));
  };

  const getLinkedProjects = (taskId: string): EntitySummary[] => {
    const projIds = taskProjects.get(taskId) || [];
    return allProjects.filter(p => projIds.includes(p.id));
  };

  const getLinkedGoals = (taskId: string): EntitySummary[] => {
    const goalIds = taskGoals.get(taskId) || [];
    return allGoals.filter(g => goalIds.includes(g.id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
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

        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Kanban className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'graph'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Network className="w-5 h-5" />
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <TaskFilters
                selectedArea={selectedArea}
                selectedStatus={selectedStatus}
                selectedPriority={selectedPriority}
                onAreaChange={setSelectedArea}
                onStatusChange={setSelectedStatus}
                onPriorityChange={setSelectedPriority}
                onClearAll={handleClearFilters}
              />
            </div>

            <div className="lg:col-span-3">
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
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                  </div>
                  {filteredTasks.map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      dependencyCount={taskDependencies.get(task.id)?.length || 0}
                      blockedByCount={taskBlockedBy.get(task.id)?.length || 0}
                      projectCount={taskProjects.get(task.id)?.length || 0}
                      goalCount={taskGoals.get(task.id)?.length || 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'kanban' && (
          <TaskKanbanBoard
            tasks={filteredTasks}
            onTaskUpdate={handleUpdateTask}
            onTaskEdit={handleEditTask}
            onTaskCreate={(status) => {
              setCreateStatus(status);
              setIsCreateDialogOpen(true);
            }}
          />
        )}

        {viewMode === 'calendar' && (
          <TaskCalendarView
            tasks={filteredTasks}
            onTaskClick={handleEditTask}
          />
        )}

        {viewMode === 'graph' && (
          <DependencyGraph
            tasks={filteredTasks}
            dependencies={allDependencies}
            onTaskClick={(taskId) => {
              const task = filteredTasks.find(t => t.id === taskId);
              if (task) handleEditTask(task);
            }}
          />
        )}
      </div>

      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setCreateStatus(undefined);
        }}
        title="Create New Task"
        className="max-w-2xl"
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
        <TaskEditPanelAdvanced
          task={selectedTask}
          isOpen={isEditPanelOpen}
          onClose={() => {
            setIsEditPanelOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleUpdateTask}
          isLoading={isSubmitting}
          dependencies={getTaskDependencies(selectedTask.id)}
          blockedBy={getTaskBlockedBy(selectedTask.id)}
          linkedProjects={getLinkedProjects(selectedTask.id)}
          linkedGoals={getLinkedGoals(selectedTask.id)}
          availableTasks={tasks}
          availableProjects={allProjects}
          availableGoals={allGoals}
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
        onClose={() => setTaskToDelete(null)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          {taskToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                {taskToDelete.title}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setTaskToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Task'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
