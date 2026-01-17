import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tasksService,
  habitsService,
  metricsService,
  goalsService,
  projectsService,
  logbookService,
} from '../services/growth-system';
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
} from '../types/growth-system';
import { useBackendStatus } from '../contexts/BackendStatusContext';
import type { ApiError } from '../types/api-contracts';

// TODO: These hooks use React Query to fetch data from backend API
// Currently will fail until backend is implemented or mock data is provided
// Auth requirement is temporarily bypassed (see ProtectedRoute component)

// Helper to check if error is a network error
const isNetworkError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const errorObj = error as { code?: string; error?: { code?: string } };
  const errorCode = errorObj.code || errorObj.error?.code;
  return (
    errorCode === 'NETWORK_ERROR' ||
    errorCode === 'ERR_CONNECTION_REFUSED' ||
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ETIMEDOUT' ||
    errorCode === 'ERR_NETWORK'
  );
};

// Helper to extract ApiError from React Query error
const extractApiError = (error: unknown): ApiError | null => {
  if (!error) return null;

  // If it's already an ApiError
  if (typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as ApiError;
  }

  // If it's wrapped in an object with error property
  if (typeof error === 'object' && 'error' in error) {
    const wrappedError = (error as { error: unknown }).error;
    if (wrappedError && typeof wrappedError === 'object' && 'code' in wrappedError) {
      return wrappedError as ApiError;
    }
  }

  // If it's an Error object, try to extract network error info from message
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('connection refused') ||
      message.includes('econnrefused') ||
      message.includes('network error') ||
      message.includes('timeout') ||
      message.includes('failed to fetch')
    ) {
      return {
        message: error.message,
        code:
          message.includes('connection refused') || message.includes('econnrefused')
            ? 'ERR_CONNECTION_REFUSED'
            : message.includes('timeout')
              ? 'ETIMEDOUT'
              : 'NETWORK_ERROR',
      };
    }
  }

  return null;
};

export const useTasks = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();
  const { recordError, recordSuccess } = useBackendStatus();

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const result = await tasksService.getAll();
      // Record success if we got data
      if (result.success || result.data) {
        recordSuccess();
      }
      return result;
    },
    enabled: true,
    onError: (err) => {
      const apiError = extractApiError(err);
      if (apiError && isNetworkError(apiError)) {
        recordError(apiError);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => tasksService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      tasksService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  return {
    tasks: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: isLoading && !isError,
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

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const result = await habitsService.getAll();
      if (result.success || result.data) {
        recordSuccess();
      }
      return result;
    },
    enabled: true,
    onError: (err) => {
      const apiError = extractApiError(err);
      if (apiError && isNetworkError(apiError)) {
        recordError(apiError);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateHabitInput) => habitsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHabitInput }) =>
      habitsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => habitsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const logCompletionMutation = useMutation({
    mutationFn: habitsService.logCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  return {
    habits: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: isLoading && !isError,
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

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const result = await metricsService.getAll();
      if (result.success || result.data) {
        recordSuccess();
      }
      return result;
    },
    enabled: true,
    onError: (err) => {
      const apiError = extractApiError(err);
      if (apiError && isNetworkError(apiError)) {
        recordError(apiError);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateMetricInput) => metricsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMetricInput }) =>
      metricsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => metricsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  return {
    metrics: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: isLoading && !isError,
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

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const result = await goalsService.getAll();
      if (result.success || result.data) {
        recordSuccess();
      }
      return result;
    },
    enabled: true,
    onError: (err) => {
      const apiError = extractApiError(err);
      if (apiError && isNetworkError(apiError)) {
        recordError(apiError);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => goalsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      goalsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  return {
    goals: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: isLoading && !isError,
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

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await projectsService.getAll();
      if (result.success || result.data) {
        recordSuccess();
      }
      return result;
    },
    enabled: true,
    onError: (err) => {
      const apiError = extractApiError(err);
      if (apiError && isNetworkError(apiError)) {
        recordError(apiError);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => projectsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  return {
    projects: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: isLoading && !isError,
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

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['logbook'],
    queryFn: async () => {
      const result = await logbookService.getAll();
      if (result.success || result.data) {
        recordSuccess();
      }
      return result;
    },
    enabled: true,
    onError: (err) => {
      const apiError = extractApiError(err);
      if (apiError && isNetworkError(apiError)) {
        recordError(apiError);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateLogbookEntryInput) => logbookService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLogbookEntryInput }) =>
      logbookService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => logbookService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] });
    },
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  return {
    entries: isError && isNetworkErr ? [] : data?.data || [],
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error || data?.error,
    createEntry: createMutation.mutateAsync,
    updateEntry: updateMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
  };
};
