import { create } from 'zustand';
import type {
  Task,
  Habit,
  Metric,
  Goal,
  Project,
  LogbookEntry,
} from '../types/growth-system';

interface GrowthSystemState {
  tasks: Task[];
  habits: Habit[];
  metrics: Metric[];
  goals: Goal[];
  projects: Project[];
  logbookEntries: LogbookEntry[];

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  removeTask: (id: string) => void;

  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  removeHabit: (id: string) => void;

  setMetrics: (metrics: Metric[]) => void;
  addMetric: (metric: Metric) => void;
  updateMetric: (id: string, metric: Partial<Metric>) => void;
  removeMetric: (id: string) => void;

  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;

  setLogbookEntries: (entries: LogbookEntry[]) => void;
  addLogbookEntry: (entry: LogbookEntry) => void;
  updateLogbookEntry: (id: string, entry: Partial<LogbookEntry>) => void;
  removeLogbookEntry: (id: string) => void;

  reset: () => void;
}

const initialState = {
  tasks: [],
  habits: [],
  metrics: [],
  goals: [],
  projects: [],
  logbookEntries: [],
};

export const useGrowthSystemStore = create<GrowthSystemState>((set) => ({
  ...initialState,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)),
    })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
  updateHabit: (id, updatedHabit) =>
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updatedHabit } : h)),
    })),
  removeHabit: (id) => set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),

  setMetrics: (metrics) => set({ metrics }),
  addMetric: (metric) => set((state) => ({ metrics: [metric, ...state.metrics] })),
  updateMetric: (id, updatedMetric) =>
    set((state) => ({
      metrics: state.metrics.map((m) => (m.id === id ? { ...m, ...updatedMetric } : m)),
    })),
  removeMetric: (id) => set((state) => ({ metrics: state.metrics.filter((m) => m.id !== id) })),

  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
  updateGoal: (id, updatedGoal) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updatedGoal } : g)),
    })),
  removeGoal: (id) => set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, updatedProject) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updatedProject } : p)),
    })),
  removeProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),

  setLogbookEntries: (entries) => set({ logbookEntries: entries }),
  addLogbookEntry: (entry) => set((state) => ({ logbookEntries: [entry, ...state.logbookEntries] })),
  updateLogbookEntry: (id, updatedEntry) =>
    set((state) => ({
      logbookEntries: state.logbookEntries.map((e) => (e.id === id ? { ...e, ...updatedEntry } : e)),
    })),
  removeLogbookEntry: (id) =>
    set((state) => ({ logbookEntries: state.logbookEntries.filter((e) => e.id !== id) })),

  reset: () => set(initialState),
}));
