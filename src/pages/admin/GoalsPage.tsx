import { useState, useEffect } from 'react';
import { Plus, Search, ArrowLeft, Edit2, Trash2, Target, FolderKanban, LayoutGrid, Layers } from 'lucide-react';
import type { Goal, CreateGoalInput, UpdateGoalInput, GoalStatus, TimeHorizon, EntitySummary, FilterOptions } from '../../types/growth-system';
import { goalsService } from '../../services/growth-system/goals.service';
import { projectsService } from '../../services/growth-system/projects.service';
import Button from '../../components/atoms/Button';
import { GoalCard } from '../../components/molecules/GoalCard';
import { FilterPanel } from '../../components/molecules/FilterPanel';
import { GoalCreateForm } from '../../components/organisms/GoalCreateForm';
import { GoalEditForm } from '../../components/organisms/GoalEditForm';
import Dialog from '../../components/organisms/Dialog';
import { EmptyState } from '../../components/molecules/EmptyState';
import { AreaBadge } from '../../components/atoms/AreaBadge';
import { PriorityIndicator } from '../../components/atoms/PriorityIndicator';
import { ProgressRing } from '../../components/atoms/ProgressRing';
import { EntityLinkChip } from '../../components/atoms/EntityLinkChip';
import { RelationshipPicker } from '../../components/organisms/RelationshipPicker';

const STATUSES: GoalStatus[] = ['Planning', 'Active', 'OnTrack', 'AtRisk', 'Achieved', 'Abandoned'];
const TIME_HORIZONS: TimeHorizon[] = ['Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily'];

type ViewMode = 'timeHorizon' | 'area';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [viewMode, setViewMode] = useState<ViewMode>('timeHorizon');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const [goalProjects] = useState<Map<string, EntitySummary[]>>(new Map());
  const [allProjects, setAllProjects] = useState<EntitySummary[]>([]);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const response = await goalsService.getAll();
      if (response.success && response.data) {
        setGoals(response.data);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    loadGoals();
    loadProjects();
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

  const handleProjectLink = async (_goalId: string, _projectId: string) => {
    console.log('Project linking not yet implemented');
  };

  const handleProjectUnlink = async (_goalId: string, _projectId: string) => {
    console.log('Project unlinking not yet implemented');
  };

  const handleProjectSave = () => {
    if (!selectedGoal) return;
    const currentIds = new Set(goalProjects.get(selectedGoal.id)?.map(p => p.id) || []);
    const newIds = new Set(selectedProjectIds);

    currentIds.forEach(id => {
      if (!newIds.has(id)) {
        handleProjectUnlink(selectedGoal.id, id);
      }
    });

    newIds.forEach(id => {
      if (!currentIds.has(id)) {
        handleProjectLink(selectedGoal.id, id);
      }
    });
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = !searchQuery || goal.title.toLowerCase().includes(searchQuery.toLowerCase()) || (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesArea = !filters.area || goal.area === filters.area;
    const matchesStatus = !filters.status || goal.status === filters.status;
    const matchesPriority = !filters.priority || goal.priority === filters.priority;
    return matchesSearch && matchesArea && matchesStatus && matchesPriority;
  });

  const getGoalProgress = (goal: Goal) => {
    const completedCriteria = goal.successCriteria.filter(c => c.includes('✓')).length;
    const totalCriteria = goal.successCriteria.length;
    return totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : 0;
  };

  const groupedByTimeHorizon = TIME_HORIZONS.reduce((acc, horizon) => {
    acc[horizon] = filteredGoals.filter(g => g.timeHorizon === horizon);
    return acc;
  }, {} as Record<TimeHorizon, Goal[]>);

  const groupedByArea = filteredGoals.reduce((acc, goal) => {
    if (!acc[goal.area]) acc[goal.area] = [];
    acc[goal.area].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  if (selectedGoal) {
    const progress = getGoalProgress(selectedGoal);
    const projects = goalProjects.get(selectedGoal.id) || [];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBackToGrid}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Goals
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <PriorityIndicator priority={selectedGoal.priority} size="lg" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedGoal.title}
                  </h1>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <AreaBadge area={selectedGoal.area} />
                  {selectedGoal.subCategory && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedGoal.subCategory}
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    {selectedGoal.timeHorizon}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedGoal.status === 'Achieved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    selectedGoal.status === 'OnTrack' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    selectedGoal.status === 'Active' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' :
                    selectedGoal.status === 'AtRisk' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {selectedGoal.status}
                  </span>
                </div>
                {selectedGoal.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedGoal.description}
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
                    onClick={() => setGoalToDelete(selectedGoal)}
                    className="hover:!bg-red-50 hover:!text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {selectedGoal.targetDate && (
              <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Date</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedGoal.targetDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {selectedGoal.successCriteria.length > 0 && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Success Criteria</h3>
                <div className="space-y-2">
                  {selectedGoal.successCriteria.map((criterion, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedGoal.notes && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedGoal.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5" />
                Projects ({projects.length})
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedProjectIds(projects.map(p => p.id));
                  setIsProjectPickerOpen(true);
                }}
              >
                Link Projects
              </Button>
            </div>
            {projects.length === 0 ? (
              <EmptyState
                title="No linked projects"
                description="Link this goal to projects that help achieve it"
                actionLabel="Link Projects"
                onAction={() => setIsProjectPickerOpen(true)}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {projects.map(project => (
                  <EntityLinkChip
                    key={project.id}
                    id={project.id}
                    label={project.title}
                    type="project"
                    area={project.area}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

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

        <RelationshipPicker
          isOpen={isProjectPickerOpen}
          onClose={() => setIsProjectPickerOpen(false)}
          title="Link to Projects"
          entities={allProjects}
          selectedIds={selectedProjectIds}
          onSelectionChange={setSelectedProjectIds}
          onSave={handleProjectSave}
          entityType="project"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Goals Vision Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your goals and success criteria
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Goal
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
            <button
              onClick={() => setViewMode('timeHorizon')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'timeHorizon'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              By Time Horizon
            </button>
            <button
              onClick={() => setViewMode('area')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'area'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              By Area
            </button>
          </div>
        </div>

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
                  <p className="text-gray-600 dark:text-gray-400">Loading goals...</p>
                </div>
              </div>
            ) : filteredGoals.length === 0 ? (
              <EmptyState
                title="No goals found"
                description={
                  searchQuery || filters.area || filters.status || filters.priority
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first goal'
                }
                actionLabel="Create Goal"
                onAction={() => setIsCreateDialogOpen(true)}
              />
            ) : viewMode === 'timeHorizon' ? (
              <div className="space-y-8">
                {TIME_HORIZONS.map(horizon => {
                  const horizonGoals = groupedByTimeHorizon[horizon];
                  if (horizonGoals.length === 0) return null;
                  return (
                    <div key={horizon}>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                          {horizon}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({horizonGoals.length} {horizonGoals.length === 1 ? 'goal' : 'goals'})
                        </span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {horizonGoals.map(goal => (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            onClick={handleGoalClick}
                            progress={getGoalProgress(goal)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedByArea).map(([area, areaGoals]) => (
                  <div key={area}>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <AreaBadge area={area as any} />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({areaGoals.length} {areaGoals.length === 1 ? 'goal' : 'goals'})
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {areaGoals.map(goal => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          onClick={handleGoalClick}
                          progress={getGoalProgress(goal)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

      <Dialog
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        title="Delete Goal"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this goal? This action cannot be undone.
          </p>
          {goalToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                {goalToDelete.title}
              </p>
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
