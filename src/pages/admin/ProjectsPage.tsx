import { useState, useEffect } from 'react';
import { Plus, Search, ArrowLeft, Edit2, Trash2, Target, CheckSquare, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectStatus, Task, EntitySummary, FilterOptions } from '../../types/growth-system';
import { projectsService } from '../../services/growth-system/projects.service';
import { tasksService } from '../../services/growth-system/tasks.service';
import { goalsService } from '../../services/growth-system/goals.service';
import Button from '../../components/atoms/Button';
import { ProjectCard } from '../../components/molecules/ProjectCard';
import { FilterPanel } from '../../components/molecules/FilterPanel';
import { ProjectCreateForm } from '../../components/organisms/ProjectCreateForm';
import { ProjectEditForm } from '../../components/organisms/ProjectEditForm';
import Dialog from '../../components/organisms/Dialog';
import { EmptyState } from '../../components/molecules/EmptyState';
import { AreaBadge } from '../../components/atoms/AreaBadge';
import { StatusBadge } from '../../components/atoms/StatusBadge';
import { PriorityIndicator } from '../../components/atoms/PriorityIndicator';
import { ProgressRing } from '../../components/atoms/ProgressRing';
import { SUBCATEGORY_LABELS } from '../../constants/growth-system';
import { TaskListItem } from '../../components/molecules/TaskListItem';
import { EntityLinkChip } from '../../components/atoms/EntityLinkChip';
import { RelationshipPicker } from '../../components/organisms/RelationshipPicker';
import { AIProjectAssistPanel } from '../../components/molecules/AIProjectAssistPanel';
import { AISuggestionBanner } from '../../components/molecules/AISuggestionBanner';
import { llmConfig } from '../../lib/llm';
import { PROJECT_STATUSES } from '../../constants/growth-system';

const STATUSES: ProjectStatus[] = [...PROJECT_STATUSES];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [projectTasks, setProjectTasks] = useState<Map<string, Task[]>>(new Map());
  const [projectGoals] = useState<Map<string, EntitySummary[]>>(new Map());
  const [allGoals, setAllGoals] = useState<EntitySummary[]>([]);
  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState(false);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiMode, setAIMode] = useState<'health' | 'generate' | 'risks'>('health');
  const isAIConfigured = llmConfig.isConfigured();

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectsService.getAll();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectTasks = async (projectId: string) => {
    try {
      const response = await tasksService.getByProject(projectId);
      if (response.success && response.data) {
        setProjectTasks(prev => new Map(prev).set(projectId, response.data!));
      }
    } catch (error) {
      console.error('Failed to load project tasks:', error);
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
    loadProjects();
    loadGoals();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectTasks(selectedProject.id);
    }
  }, [selectedProject]);

  const handleCreateProject = async (input: CreateProjectInput) => {
    setIsSubmitting(true);
    try {
      const response = await projectsService.create(input);
      if (response.success && response.data) {
        setProjects([response.data, ...projects]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (id: string, input: UpdateProjectInput) => {
    setIsSubmitting(true);
    try {
      const response = await projectsService.update(id, input);
      if (response.success && response.data) {
        const updatedProjects = projects.map((p) => (p.id === id ? response.data! : p));
        setProjects(updatedProjects);
        if (selectedProject && selectedProject.id === id) {
          setSelectedProject(response.data);
        }
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await projectsService.delete(projectToDelete.id);
      if (response.success) {
        const updatedProjects = projects.filter((p) => p.id !== projectToDelete.id);
        setProjects(updatedProjects);
        if (selectedProject && selectedProject.id === projectToDelete.id) {
          setSelectedProject(null);
        }
        setProjectToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToGrid = () => {
    setSelectedProject(null);
  };

  const handleGoalLink = async (projectId: string, goalId: string) => {
    // TODO: Implement linkToGoal in projectsService
    void projectId;
    void goalId;
    console.log('Goal linking not yet implemented');
  };

  const handleGoalUnlink = async (projectId: string, goalId: string) => {
    // TODO: Implement unlinkFromGoal in projectsService
    void projectId;
    void goalId;
    console.log('Goal unlinking not yet implemented');
  };

  const handleGoalSave = () => {
    if (!selectedProject) return;
    const currentIds = new Set(projectGoals.get(selectedProject.id)?.map(g => g.id) || []);
    const newIds = new Set(selectedGoalIds);

    currentIds.forEach(id => {
      if (!newIds.has(id)) {
        handleGoalUnlink(selectedProject.id, id);
      }
    });

    newIds.forEach(id => {
      if (!currentIds.has(id)) {
        handleGoalLink(selectedProject.id, id);
      }
    });
  };

  const handleCreateTasksFromAI = async (newTasks: import('../../types/growth-system').CreateTaskInput[]) => {
    if (!selectedProject) return;

    for (const task of newTasks) {
      const taskInput = {
        ...task,
        area: selectedProject.area,
      };
      await tasksService.create(taskInput);
    }
    loadProjectTasks(selectedProject.id);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = !searchQuery || project.name.toLowerCase().includes(searchQuery.toLowerCase()) || (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesArea = !filters.area || project.area === filters.area;
    const matchesStatus = !filters.status || project.status === filters.status;
    const matchesPriority = !filters.priority || project.priority === filters.priority;
    return matchesSearch && matchesArea && matchesStatus && matchesPriority;
  });

  const getProjectStats = (projectId: string) => {
    const tasks = projectTasks.get(projectId) || [];
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const goals = projectGoals.get(projectId) || [];
    return {
      taskCount: tasks.length,
      completedTaskCount: completedTasks,
      goalCount: goals.length,
    };
  };

  if (selectedProject) {
    const tasks = projectTasks.get(selectedProject.id) || [];
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const goals = projectGoals.get(selectedProject.id) || [];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBackToGrid}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Projects
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <PriorityIndicator priority={selectedProject.priority} size="lg" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedProject.name}
                  </h1>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <AreaBadge area={selectedProject.area} />
                  {selectedProject.subCategory && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {SUBCATEGORY_LABELS[selectedProject.subCategory]}
                    </span>
                  )}
                  <StatusBadge status={selectedProject.status} size="sm" />
                </div>
                {selectedProject.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedProject.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <ProgressRing progress={progress} size="lg" showLabel />
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
                    onClick={() => setProjectToDelete(selectedProject)}
                    className="hover:!bg-red-50 hover:!text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {selectedProject.impact > 0 && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Impact Score</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProject.impact}/10</div>
                </div>
              )}
              {selectedProject.startDate && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedProject.startDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              {selectedProject.endDate && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target End</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedProject.endDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {selectedProject.notes && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedProject.notes}</p>
              </div>
            )}

            {isAIConfigured && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAIAssist(!showAIAssist)}
                  className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <Sparkles size={18} />
                  <span>AI Project Tools</span>
                  {showAIAssist ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showAIAssist && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setAIMode('health')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${
                          aiMode === 'health'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Health Analysis
                      </button>
                      <button
                        onClick={() => setAIMode('generate')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${
                          aiMode === 'generate'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Generate Tasks
                      </button>
                      <button
                        onClick={() => setAIMode('risks')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${
                          aiMode === 'risks'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Risk Assessment
                      </button>
                    </div>

                    <AIProjectAssistPanel
                      mode={aiMode}
                      project={selectedProject}
                      tasks={tasks}
                      onClose={() => setShowAIAssist(false)}
                      onCreateTasks={handleCreateTasksFromAI}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Tasks ({tasks.length})
                </h2>
              </div>
              {tasks.length === 0 ? (
                <EmptyState
                  title="No tasks yet"
                  description="Add tasks to this project from the Tasks page"
                />
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Goals ({goals.length})
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedGoalIds(goals.map(g => g.id));
                    setIsGoalPickerOpen(true);
                  }}
                >
                  Link Goals
                </Button>
              </div>
              {goals.length === 0 ? (
                <EmptyState
                  title="No linked goals"
                  description="Link this project to strategic goals"
                  actionLabel="Link Goals"
                  onAction={() => setIsGoalPickerOpen(true)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {goals.map(goal => (
                    <EntityLinkChip
                      key={goal.id}
                      id={goal.id}
                      label={goal.title}
                      type="goal"
                      area={goal.area}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Edit Project"
          className="max-w-2xl"
        >
          <ProjectEditForm
            key={selectedProject.id}
            project={selectedProject}
            onSubmit={handleUpdateProject}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </Dialog>

        <RelationshipPicker
          isOpen={isGoalPickerOpen}
          onClose={() => setIsGoalPickerOpen(false)}
          title="Link to Goals"
          entities={allGoals}
          selectedIds={selectedGoalIds}
          onSelectionChange={setSelectedGoalIds}
          onSave={handleGoalSave}
          entityType="goal"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your projects and track progress
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <AISuggestionBanner entityType="project" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              availableFilters={{
                statuses: STATUSES,
              }}
            />
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <EmptyState
                title="No projects found"
                description={
                  searchQuery || filters.area || filters.status || filters.priority
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first project'
                }
                actionLabel="Create Project"
                onAction={() => setIsCreateDialogOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => {
                  const stats = getProjectStats(project.id);
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={handleProjectClick}
                      {...stats}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create New Project"
        className="max-w-2xl"
      >
        <ProjectCreateForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsCreateDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </Dialog>

      <Dialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>
          {projectToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                {projectToDelete.name}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setProjectToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteProject}
              disabled={isSubmitting}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
