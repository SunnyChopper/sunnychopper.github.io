import { MockStorage } from './storage';
import { generateSeedData } from './data-generator';
import type {
  Task,
  Project,
  Goal,
  Metric,
  MetricLog,
  Habit,
  HabitLog,
  LogbookEntry,
  TaskDependency,
  TaskProject,
  TaskGoal,
  ProjectGoal,
  GoalMetric,
  HabitGoal,
  LogbookTask,
  LogbookProject,
  LogbookGoal,
  LogbookHabit,
} from '../types/growth-system';

const SEED_FLAG_KEY = 'gs_seeded';

export function initializeMockData(): void {
  const isSeeded = localStorage.getItem(SEED_FLAG_KEY);

  if (isSeeded) {
    return;
  }

  const data = generateSeedData();

  const taskStorage = new MockStorage<Task>('tasks');
  const projectStorage = new MockStorage<Project>('projects');
  const goalStorage = new MockStorage<Goal>('goals');
  const metricStorage = new MockStorage<Metric>('metrics');
  const metricLogStorage = new MockStorage<MetricLog>('metricLogs');
  const habitStorage = new MockStorage<Habit>('habits');
  const habitLogStorage = new MockStorage<HabitLog>('habitLogs');
  const logbookStorage = new MockStorage<LogbookEntry>('logbookEntries');

  const taskDependencyStorage = new MockStorage<TaskDependency>('taskDependencies');
  const taskProjectStorage = new MockStorage<TaskProject>('taskProjects');
  const taskGoalStorage = new MockStorage<TaskGoal>('taskGoals');
  const projectGoalStorage = new MockStorage<ProjectGoal>('projectGoals');
  const goalMetricStorage = new MockStorage<GoalMetric>('goalMetrics');
  const habitGoalStorage = new MockStorage<HabitGoal>('habitGoals');
  const logbookTaskStorage = new MockStorage<LogbookTask>('logbookTasks');
  const logbookProjectStorage = new MockStorage<LogbookProject>('logbookProjects');
  const logbookGoalStorage = new MockStorage<LogbookGoal>('logbookGoals');
  const logbookHabitStorage = new MockStorage<LogbookHabit>('logbookHabits');

  taskStorage.seed(data.tasks);
  projectStorage.seed(data.projects);
  goalStorage.seed(data.goals);
  metricStorage.seed(data.metrics);
  metricLogStorage.seed(data.metricLogs);
  habitStorage.seed(data.habits);
  habitLogStorage.seed(data.habitLogs);
  logbookStorage.seed(data.logbookEntries);

  taskDependencyStorage.seed(data.taskDependencies);
  taskProjectStorage.seed(data.taskProjects);
  taskGoalStorage.seed(data.taskGoals);
  projectGoalStorage.seed(data.projectGoals);
  goalMetricStorage.seed(data.goalMetrics);
  habitGoalStorage.seed(data.habitGoals);
  logbookTaskStorage.seed(data.logbookTasks);
  logbookProjectStorage.seed(data.logbookProjects);
  logbookGoalStorage.seed(data.logbookGoals);
  logbookHabitStorage.seed(data.logbookHabits);

  localStorage.setItem(SEED_FLAG_KEY, 'true');

  console.log('Mock data seeded successfully!');
  console.log('Tasks:', data.tasks.length);
  console.log('Projects:', data.projects.length);
  console.log('Goals:', data.goals.length);
  console.log('Metrics:', data.metrics.length);
  console.log('Habits:', data.habits.length);
}

export function clearMockData(): void {
  const entities = [
    'tasks',
    'projects',
    'goals',
    'metrics',
    'metricLogs',
    'habits',
    'habitLogs',
    'logbookEntries',
    'taskDependencies',
    'taskProjects',
    'taskGoals',
    'projectGoals',
    'goalMetrics',
    'habitGoals',
    'logbookTasks',
    'logbookProjects',
    'logbookGoals',
    'logbookHabits',
  ];

  entities.forEach((entity) => {
    const storage = new MockStorage(entity);
    storage.clear();
  });

  localStorage.removeItem(SEED_FLAG_KEY);

  console.log('Mock data cleared!');
}

export function reseedMockData(): void {
  clearMockData();
  initializeMockData();
}
