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

// TODO: These hooks use React Query to fetch data from backend API
// Currently will fail until backend is implemented or mock data is provided
// Auth requirement is temporarily bypassed (see ProtectedRoute component)

export const useTasks = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksService.getAll(),
    enabled: true,
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

  return {
    tasks: data?.data || [],
    isLoading,
    error: error,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
  };
};

export const useHabits = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error } = useQuery({
    queryKey: ['habits'],
    queryFn: () => habitsService.getAll(),
    enabled: true,
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
    mutationFn: ({ habitId, notes }: { habitId: string; notes?: string }) =>
      habitsService.logCompletion(habitId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return {
    habits: data?.data || [],
    isLoading,
    error: error || data?.error,
    createHabit: createMutation.mutateAsync,
    updateHabit: updateMutation.mutateAsync,
    deleteHabit: deleteMutation.mutateAsync,
    logCompletion: logCompletionMutation.mutateAsync,
  };
};

export const useMetrics = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => metricsService.getAll(),
    enabled: true,
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

  return {
    metrics: data?.data || [],
    isLoading,
    error: error || data?.error,
    createMetric: createMutation.mutateAsync,
    updateMetric: updateMutation.mutateAsync,
    deleteMetric: deleteMutation.mutateAsync,
  };
};

export const useGoals = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsService.getAll(),
    enabled: true,
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

  return {
    goals: data?.data || [],
    isLoading,
    error: error || data?.error,
    createGoal: createMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
  };
};

export const useProjects = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getAll(),
    enabled: true,
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

  return {
    projects: data?.data || [],
    isLoading,
    error: error || data?.error,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
  };
};

export const useLogbook = () => {
  // TODO: Temporarily not checking user authentication (bypassed in ProtectedRoute)
  const queryClient = useQueryClient();

  // TODO: Temporarily allowing queries without user authentication
  const { data, isLoading, error } = useQuery({
    queryKey: ['logbook'],
    queryFn: () => logbookService.getAll(),
    enabled: true,
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

  return {
    entries: data?.data || [],
    isLoading,
    error: error || data?.error,
    createEntry: createMutation.mutateAsync,
    updateEntry: updateMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
  };
};
