import { useState, useEffect } from 'react';
import { X, Link2, GitBranch, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task, UpdateTaskInput, Area, SubCategory, Priority, TaskStatus, EntitySummary, CreateTaskInput } from '../../types/growth-system';
import Button from '../atoms/Button';
import { EntityLinkChip } from '../atoms/EntityLinkChip';
import { DependencyBadge } from '../atoms/DependencyBadge';
import { RelationshipPicker } from './RelationshipPicker';
import { AITaskAssistPanel } from '../molecules/AITaskAssistPanel';
import { llmConfig } from '../../lib/llm';
import { AREAS, PRIORITIES, SUBCATEGORIES_BY_AREA, TASK_STATUSES, AREA_LABELS, TASK_STATUS_LABELS } from '../../constants/growth-system';

interface TaskEditPanelAdvancedProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, input: UpdateTaskInput) => void;
  isLoading?: boolean;
  dependencies: Task[];
  blockedBy: Task[];
  linkedProjects: EntitySummary[];
  linkedGoals: EntitySummary[];
  availableTasks: Task[];
  availableProjects: EntitySummary[];
  availableGoals: EntitySummary[];
  onDependencyAdd: (taskId: string, dependsOnId: string) => void;
  onDependencyRemove: (taskId: string, dependsOnId: string) => void;
  onProjectLink: (taskId: string, projectId: string) => void;
  onProjectUnlink: (taskId: string, projectId: string) => void;
  onGoalLink: (taskId: string, goalId: string) => void;
  onGoalUnlink: (taskId: string, goalId: string) => void;
  onCreateSubtasks?: (subtasks: CreateTaskInput[]) => void;
}

export function TaskEditPanelAdvanced({
  task,
  isOpen,
  onClose,
  onSave,
  isLoading,
  dependencies,
  blockedBy,
  linkedProjects,
  linkedGoals,
  availableTasks,
  availableProjects,
  availableGoals,
  onDependencyAdd,
  onDependencyRemove,
  onProjectLink,
  onProjectUnlink,
  onGoalLink,
  onGoalUnlink,
  onCreateSubtasks,
}: TaskEditPanelAdvancedProps) {
  const [formData, setFormData] = useState<UpdateTaskInput>({
    title: task.title,
    description: task.description || '',
    extendedDescription: task.extendedDescription || '',
    area: task.area,
    subCategory: task.subCategory || undefined,
    priority: task.priority,
    status: task.status,
    size: task.size || undefined,
    dueDate: task.dueDate || '',
    scheduledDate: task.scheduledDate || '',
    notes: task.notes || '',
  });

  const [isDependencyPickerOpen, setIsDependencyPickerOpen] = useState(false);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiMode, setAIMode] = useState<'breakdown' | 'priority' | 'estimate' | 'dependencies'>('breakdown');
  const isAIConfigured = llmConfig.isConfigured();

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || '',
      extendedDescription: task.extendedDescription || '',
      area: task.area,
      subCategory: task.subCategory || undefined,
      priority: task.priority,
      status: task.status,
      size: task.size || undefined,
      dueDate: task.dueDate || '',
      scheduledDate: task.scheduledDate || '',
      notes: task.notes || '',
    });
    setSelectedDependencies(dependencies.map(d => d.id));
    setSelectedProjects(linkedProjects.map(p => p.id));
    setSelectedGoals(linkedGoals.map(g => g.id));
  }, [task, dependencies, linkedProjects, linkedGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: UpdateTaskInput = {
      ...formData,
      description: formData.description || undefined,
      extendedDescription: formData.extendedDescription || undefined,
      notes: formData.notes || undefined,
      dueDate: formData.dueDate || undefined,
      scheduledDate: formData.scheduledDate || undefined,
      size: formData.size || undefined,
    };
    onSave(task.id, input);
  };

  const handleDependencySave = () => {
    const currentIds = new Set(dependencies.map(d => d.id));
    const newIds = new Set(selectedDependencies);

    currentIds.forEach(id => {
      if (!newIds.has(id)) {
        onDependencyRemove(task.id, id);
      }
    });

    newIds.forEach(id => {
      if (!currentIds.has(id)) {
        onDependencyAdd(task.id, id);
      }
    });
  };

  const handleProjectSave = () => {
    const currentIds = new Set(linkedProjects.map(p => p.id));
    const newIds = new Set(selectedProjects);

    currentIds.forEach(id => {
      if (!newIds.has(id)) {
        onProjectUnlink(task.id, id);
      }
    });

    newIds.forEach(id => {
      if (!currentIds.has(id)) {
        onProjectLink(task.id, id);
      }
    });
  };

  const handleGoalSave = () => {
    const currentIds = new Set(linkedGoals.map(g => g.id));
    const newIds = new Set(selectedGoals);

    currentIds.forEach(id => {
      if (!newIds.has(id)) {
        onGoalUnlink(task.id, id);
      }
    });

    newIds.forEach(id => {
      if (!currentIds.has(id)) {
        onGoalLink(task.id, id);
      }
    });
  };

  const handleApplyPriority = (priority: string) => {
    setFormData({ ...formData, priority: priority as Priority });
  };

  const handleApplyEffort = (size: number) => {
    setFormData({ ...formData, size });
  };

  const handleApplyBreakdown = (subtasks: CreateTaskInput[]) => {
    onCreateSubtasks?.(subtasks);
  };

  const handleApplyDependencies = (taskIds: string[]) => {
    taskIds.forEach(id => {
      if (!selectedDependencies.includes(id)) {
        onDependencyAdd(task.id, id);
      }
    });
    setSelectedDependencies([...new Set([...selectedDependencies, ...taskIds])]);
  };

  const availableSubCategories = SUBCATEGORIES_BY_AREA[formData.area || task.area];

  const taskEntities: EntitySummary[] = availableTasks
    .filter(t => t.id !== task.id)
    .map(t => ({
      id: t.id,
      title: t.title,
      type: 'task',
      area: t.area,
      status: t.status,
    }));

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area *
              </label>
              <select
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value as Area, subCategory: undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {AREA_LABELS[area]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sub-Category
              </label>
              <select
                value={formData.subCategory || ''}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value as SubCategory || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {availableSubCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Size (Story Points)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.size || ''}
                onChange={(e) => setFormData({ ...formData, size: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isAIConfigured && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={() => setShowAIAssist(!showAIAssist)}
                className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <Sparkles size={18} />
                <span>AI Tools</span>
                {showAIAssist ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showAIAssist && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAIMode('breakdown')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${
                        aiMode === 'breakdown'
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Break Down
                    </button>
                    <button
                      type="button"
                      onClick={() => setAIMode('priority')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${
                        aiMode === 'priority'
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Priority Advisor
                    </button>
                    <button
                      type="button"
                      onClick={() => setAIMode('estimate')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${
                        aiMode === 'estimate'
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Estimate Effort
                    </button>
                    <button
                      type="button"
                      onClick={() => setAIMode('dependencies')}
                      className={`px-3 py-1.5 text-sm rounded-full transition ${
                        aiMode === 'dependencies'
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Find Dependencies
                    </button>
                  </div>

                  <AITaskAssistPanel
                    mode={aiMode}
                    onClose={() => setShowAIAssist(false)}
                    onApplyPriority={handleApplyPriority}
                    onApplyEffort={handleApplyEffort}
                    onApplyBreakdown={handleApplyBreakdown}
                    onApplyDependencies={handleApplyDependencies}
                    currentTask={task}
                    allTasks={availableTasks}
                  />
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Dependencies
            </h3>

            <div className="space-y-3">
              {blockedBy.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blocked By ({blockedBy.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blockedBy.map((dep) => (
                      <DependencyBadge key={dep.id} type="blocked" count={1} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                  <span>Depends On ({dependencies.length})</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDependencyPickerOpen(true)}
                  >
                    Manage Dependencies
                  </Button>
                </div>
                {dependencies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dependencies.map((dep) => (
                      <EntityLinkChip
                        key={dep.id}
                        id={dep.id}
                        label={dep.title}
                        type="task"
                        area={dep.area}
                        size="sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Relationships
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                  <span>Projects ({linkedProjects.length})</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsProjectPickerOpen(true)}
                  >
                    Link Projects
                  </Button>
                </div>
                {linkedProjects.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {linkedProjects.map((project) => (
                      <EntityLinkChip
                        key={project.id}
                        id={project.id}
                        label={project.title}
                        type="project"
                        area={project.area}
                        size="sm"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                  <span>Goals ({linkedGoals.length})</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsGoalPickerOpen(true)}
                  >
                    Link Goals
                  </Button>
                </div>
                {linkedGoals.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {linkedGoals.map((goal) => (
                      <EntityLinkChip
                        key={goal.id}
                        id={goal.id}
                        label={goal.title}
                        type="goal"
                        area={goal.area}
                        size="sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      <RelationshipPicker
        isOpen={isDependencyPickerOpen}
        onClose={() => setIsDependencyPickerOpen(false)}
        title="Manage Dependencies"
        entities={taskEntities}
        selectedIds={selectedDependencies}
        onSelectionChange={setSelectedDependencies}
        onSave={handleDependencySave}
        entityType="task"
      />

      <RelationshipPicker
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        title="Link to Projects"
        entities={availableProjects}
        selectedIds={selectedProjects}
        onSelectionChange={setSelectedProjects}
        onSave={handleProjectSave}
        entityType="project"
      />

      <RelationshipPicker
        isOpen={isGoalPickerOpen}
        onClose={() => setIsGoalPickerOpen(false)}
        title="Link to Goals"
        entities={availableGoals}
        selectedIds={selectedGoals}
        onSelectionChange={setSelectedGoals}
        onSave={handleGoalSave}
        entityType="goal"
      />
    </>
  );
}
