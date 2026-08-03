import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/growth-system/projects.service';
import {
  applyCascadedProjectUpdatesToCache,
  upsertProjectCache,
} from '@/lib/react-query/growth-system-cache';
import { queryKeys } from '@/lib/react-query/query-keys';
import type { Project, ProjectDependency, UpdateProjectInput } from '@/types/growth-system';

function invalidateProjectDependencyQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.growthSystem.projects.dependencies(),
  });
}

function applyDependencyMutationResult(
  queryClient: ReturnType<typeof useQueryClient>,
  result: {
    dependency?: ProjectDependency;
    cascaded?: { id: string; startDate?: string | null; targetEndDate?: string | null }[];
  }
) {
  if (result.cascaded?.length) {
    applyCascadedProjectUpdatesToCache(queryClient, result.cascaded);
  }
  invalidateProjectDependencyQueries(queryClient);
}

export function useProjectDependencies(projectIds?: string[]) {
  const queryClient = useQueryClient();
  const filterKey = projectIds?.length ? projectIds.join(',') : 'all';

  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKeys.growthSystem.projects.dependencies(), filterKey],
    queryFn: async () => {
      const response = await projectsService.listAllDependencies(projectIds);
      return response.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async ({
      successorProjectId,
      predecessorProjectId,
      lagDays,
    }: {
      successorProjectId: string;
      predecessorProjectId: string;
      lagDays?: number;
    }) => projectsService.addDependency(successorProjectId, predecessorProjectId, lagDays),
    onSuccess: (response) => {
      if (response.success && response.data) {
        applyDependencyMutationResult(queryClient, response.data);
      }
    },
  });

  const updateLagMutation = useMutation({
    mutationFn: async ({
      successorProjectId,
      predecessorProjectId,
      lagDays,
    }: {
      successorProjectId: string;
      predecessorProjectId: string;
      lagDays: number;
    }) => projectsService.updateDependencyLag(successorProjectId, predecessorProjectId, lagDays),
    onSuccess: (response) => {
      if (response.success && response.data) {
        applyDependencyMutationResult(queryClient, response.data);
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({
      successorProjectId,
      predecessorProjectId,
    }: {
      successorProjectId: string;
      predecessorProjectId: string;
    }) => projectsService.removeDependency(successorProjectId, predecessorProjectId),
    onSuccess: () => {
      invalidateProjectDependencyQueries(queryClient);
    },
  });

  return {
    dependencies: data ?? [],
    isLoading,
    error,
    addDependency: addMutation.mutateAsync,
    updateDependencyLag: updateLagMutation.mutateAsync,
    removeDependency: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}

/** 1-hop predecessors/successors for project detail dependency mini-graph. */
export function useProjectDependencyNeighborhood(projectId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKeys.growthSystem.projects.dependencies(), 'neighborhood', projectId],
    queryFn: async () => {
      const response = await projectsService.listDependenciesForProject(projectId!);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch project dependencies');
    },
    enabled: Boolean(projectId),
    staleTime: 2 * 60 * 1000,
  });

  const predecessors = data?.predecessors ?? [];
  const successors = data?.successors ?? [];

  return {
    predecessors,
    successors,
    edgeCount: predecessors.length + successors.length,
    isLoading,
    error,
  };
}

/** Cascade-aware project date update for timeline Gantt. */
export function useProjectTimelineUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      startDate,
      targetEndDate,
    }: {
      id: string;
      startDate?: string | null;
      targetEndDate?: string | null;
    }) => {
      const input: UpdateProjectInput = {};
      if (startDate !== undefined && startDate !== null) input.startDate = startDate;
      if (targetEndDate !== undefined && targetEndDate !== null)
        input.targetEndDate = targetEndDate;
      return projectsService.update(id, input, { cascade: true });
    },
    onSuccess: async (response) => {
      if (!response.success || !response.data) return;
      if ('project' in response.data) {
        upsertProjectCache(queryClient, response.data.project);
        applyCascadedProjectUpdatesToCache(queryClient, response.data.cascaded);
      } else {
        upsertProjectCache(queryClient, response.data as Project);
      }
    },
  });
}
