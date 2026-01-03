import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
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

export const useTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => tasksService.getAll(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => tasksService.create(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      tasksService.update(id, input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.delete(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  return {
    tasks: data?.data || [],
    isLoading,
    error: error || data?.error,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
  };
};

export const useHabits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: () => habitsService.getAll(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateHabitInput) => habitsService.create(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHabitInput }) =>
      habitsService.update(id, input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => habitsService.delete(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
    },
  });

  const logCompletionMutation = useMutation({
    mutationFn: ({ habitId, notes }: { habitId: string; notes?: string }) =>
      habitsService.logCompletion(habitId, user!.id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics', user?.id],
    queryFn: () => metricsService.getAll(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateMetricInput) => metricsService.create(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMetricInput }) =>
      metricsService.update(id, input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => metricsService.delete(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', user?.id] });
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: () => goalsService.getAll(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => goalsService.create(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      goalsService.update(id, input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalsService.delete(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => projectsService.getAll(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => projectsService.create(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsService.update(id, input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsService.delete(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['logbook', user?.id],
    queryFn: () => logbookService.getAll(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateLogbookEntryInput) => logbookService.create(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLogbookEntryInput }) =>
      logbookService.update(id, input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => logbookService.delete(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook', user?.id] });
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
