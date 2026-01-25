import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tasksService,
  habitsService,
  metricsService,
  goalsService,
  projectsService,
  logbookService,
} from '@/services/growth-system';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  CreateHabitInput,
  UpdateHabitInput,
  CreateMetricInput,
  UpdateMetricInput,
  CreateGoalInput,
  UpdateGoalInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateLogbookEntryInput,
  UpdateLogbookEntryInput,
} from '@/types/growth-system';
import { useBackendStatus } from '@/contexts/BackendStatusContext';
import { queryKeys } from '@/lib/react-query/query-keys';
import { extractApiError, isNetworkError } from '@/lib/react-query/error-utils';

// TODO: These hooks use React Query to fetch data from backend API
// Currently will fail until backend is implemented or mock data is provided
// Auth requirement is temporarily bypassed (see ProtectedRoute component)

export const useTasks = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();
  const { recordError, recordSuccess } = useBackendStatus();

  // Block list fetches while the dashboard query is pending/successful
  const dashboardQueryState = queryClient.getQueryState(queryKeys.growthSystem.data());
  const dashboardControlsLoading = !!dashboardQueryState && dashboardQueryState.status !== 'error';

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.growthSystem.tasks.lists(),
    queryFn: async () => {
      try {
        const result = await tasksService.getAll();
        // Record success if we got data
        if (result.data) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: !dashboardControlsLoading, // Only fetch if dashboard isn't controlling data
    staleTime: 10 * 60 * 1000, // 10 minutes - goals don't change frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => tasksService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.tasks.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      tasksService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.tasks.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.tasks.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  const isWaitingForDashboard = dashboardControlsLoading && !data?.data;

  return {
    tasks: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: (isWaitingForDashboard || isLoading) && !isError,
    isError,
    error: apiError || error,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
  };
};

export const useHabits = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();
  const { recordError, recordSuccess } = useBackendStatus();

  // Block list fetches while the dashboard query is pending/successful
  const dashboardQueryState = queryClient.getQueryState(queryKeys.growthSystem.data());
  const dashboardControlsLoading = !!dashboardQueryState && dashboardQueryState.status !== 'error';

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.growthSystem.habits.lists(),
    queryFn: async () => {
      try {
        const result = await habitsService.getAll();
        if (result.success || result.data) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: !dashboardControlsLoading, // Only fetch if dashboard isn't controlling data
    staleTime: 5 * 60 * 1000, // 5 minutes - habits change moderately
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateHabitInput) => habitsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.habits.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHabitInput }) =>
      habitsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.habits.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => habitsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.habits.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const logCompletionMutation = useMutation({
    mutationFn: habitsService.logCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.habits.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  const isWaitingForDashboard = dashboardControlsLoading && !data?.data;

  return {
    habits: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: (isWaitingForDashboard || isLoading) && !isError,
    isError,
    error: apiError || error || data?.error,
    createHabit: createMutation.mutateAsync,
    updateHabit: updateMutation.mutateAsync,
    deleteHabit: deleteMutation.mutateAsync,
    logCompletion: logCompletionMutation.mutateAsync,
  };
};

export const useMetrics = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();
  const { recordError, recordSuccess } = useBackendStatus();

  // Block list fetches while the dashboard query is pending/successful
  const dashboardQueryState = queryClient.getQueryState(queryKeys.growthSystem.data());
  const dashboardControlsLoading = !!dashboardQueryState && dashboardQueryState.status !== 'error';

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.growthSystem.metrics.lists(),
    queryFn: async () => {
      try {
        const result = await metricsService.getAll();
        if (result.success || result.data) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: !dashboardControlsLoading, // Only fetch if dashboard isn't controlling data
    staleTime: 5 * 60 * 1000, // 5 minutes - metrics change moderately
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateMetricInput) => metricsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.metrics.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMetricInput }) =>
      metricsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.metrics.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => metricsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.metrics.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  const isWaitingForDashboard = dashboardControlsLoading && !data?.data;

  return {
    metrics: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: (isWaitingForDashboard || isLoading) && !isError,
    isError,
    error: apiError || error || data?.error,
    createMetric: createMutation.mutateAsync,
    updateMetric: updateMutation.mutateAsync,
    deleteMetric: deleteMutation.mutateAsync,
  };
};

export const useGoals = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();
  const { recordError, recordSuccess } = useBackendStatus();

  // Block list fetches while the dashboard query is pending/successful
  const dashboardQueryState = queryClient.getQueryState(queryKeys.growthSystem.data());
  const dashboardControlsLoading = !!dashboardQueryState && dashboardQueryState.status !== 'error';

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.growthSystem.goals.lists(),
    queryFn: async () => {
      try {
        const result = await goalsService.getAll();
        if (result.success || result.data) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: !dashboardControlsLoading, // Only fetch if dashboard isn't controlling data
    staleTime: 10 * 60 * 1000, // 10 minutes - goals don't change frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => goalsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.goals.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      goalsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.goals.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.goals.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  const isWaitingForDashboard = dashboardControlsLoading && !data?.data;

  return {
    goals: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: (isWaitingForDashboard || isLoading) && !isError,
    isError,
    error: apiError || error || data?.error,
    createGoal: createMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
  };
};

export const useProjects = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();
  const { recordError, recordSuccess } = useBackendStatus();

  // Block list fetches while the dashboard query is pending/successful
  const dashboardQueryState = queryClient.getQueryState(queryKeys.growthSystem.data());
  const dashboardControlsLoading = !!dashboardQueryState && dashboardQueryState.status !== 'error';

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.growthSystem.projects.lists(),
    queryFn: async () => {
      try {
        const result = await projectsService.getAll();
        if (result.success || result.data) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: !dashboardControlsLoading, // Only fetch if dashboard isn't controlling data
    staleTime: 10 * 60 * 1000, // 10 minutes - projects don't change frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => projectsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.projects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.projects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.projects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  const isWaitingForDashboard = dashboardControlsLoading && !data?.data;

  return {
    projects: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: (isWaitingForDashboard || isLoading) && !isError,
    isError,
    error: apiError || error || data?.error,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
  };
};

export const useLogbook = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();
  const { recordError, recordSuccess } = useBackendStatus();

  // Block list fetches while the dashboard query is pending/successful
  const dashboardQueryState = queryClient.getQueryState(queryKeys.growthSystem.data());
  const dashboardControlsLoading = !!dashboardQueryState && dashboardQueryState.status !== 'error';

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.growthSystem.logbook.lists(),
    queryFn: async () => {
      try {
        const result = await logbookService.getAll();
        if (result.success || result.data) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: !dashboardControlsLoading, // Only fetch if dashboard isn't controlling data
    staleTime: 2 * 60 * 1000, // 2 minutes - logbook entries change frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateLogbookEntryInput) => logbookService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.logbook.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLogbookEntryInput }) =>
      logbookService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.logbook.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => logbookService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.logbook.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  const isWaitingForDashboard = dashboardControlsLoading && !data?.data;

  return {
    entries: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: (isWaitingForDashboard || isLoading) && !isError,
    isError,
    error: apiError || error || data?.error,
    createEntry: createMutation.mutateAsync,
    updateEntry: updateMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
  };
};

/**
 * Hook to fetch task dependencies for multiple tasks in a batched manner
 * This is more efficient than calling getDependencies for each task individually
 */
export const useTaskDependencies = (taskIds: string[]) => {
  const { recordError, recordSuccess } = useBackendStatus();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: [...queryKeys.growthSystem.tasks.all(), 'dependencies', taskIds.sort().join(',')],
    queryFn: async () => {
      try {
        // Batch fetch dependencies for all tasks in parallel
        const { tasksService } = await import('@/services/growth-system/tasks.service');
        const dependencyPromises = taskIds.map((taskId) =>
          tasksService.getDependencies(taskId).then((res) => ({
            taskId,
            dependencies: res.success && res.data ? res.data : [],
          }))
        );

        const results = await Promise.all(dependencyPromises);
        const dependencyMap = new Map<string, (typeof results)[0]['dependencies']>();
        const allDependencies: (typeof results)[0]['dependencies'] = [];

        results.forEach(({ dependencies }) => {
          allDependencies.push(...dependencies);
        });

        if (results.length > 0) {
          recordSuccess();
        }

        return {
          dependencyMap,
          allDependencies,
        };
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: taskIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes - dependencies don't change frequently
  });

  const apiError = error ? extractApiError(error) : null;

  return {
    dependencyMap: data?.dependencyMap || new Map(),
    allDependencies: data?.allDependencies || [],
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error,
  };
};
