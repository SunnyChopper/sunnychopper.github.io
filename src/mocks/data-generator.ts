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
import { generateId } from './storage';

const USER_ID = 'user-1';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function generateSeedData() {
  const now = new Date();
  const tasks: Task[] = [];
  const projects: Project[] = [];
  const goals: Goal[] = [];
  const metrics: Metric[] = [];
  const metricLogs: MetricLog[] = [];
  const habits: Habit[] = [];
  const habitLogs: HabitLog[] = [];
  const logbookEntries: LogbookEntry[] = [];

  const taskDependencies: TaskDependency[] = [];
  const taskProjects: TaskProject[] = [];
  const taskGoals: TaskGoal[] = [];
  const projectGoals: ProjectGoal[] = [];
  const goalMetrics: GoalMetric[] = [];
  const habitGoals: HabitGoal[] = [];
  const logbookTasks: LogbookTask[] = [];
  const logbookProjects: LogbookProject[] = [];
  const logbookGoals: LogbookGoal[] = [];
  const logbookHabits: LogbookHabit[] = [];

  const goal1: Goal = {
    id: generateId(),
    title: 'Launch Side Project',
    description: 'Build and launch a SaaS product to generate passive income',
    area: 'Wealth',
    subCategory: 'Income',
    timeHorizon: 'Yearly',
    priority: 'P1',
    status: 'Active',
    targetDate: formatDate(addDays(now, 180)),
    completedDate: null,
    successCriteria: [
      'Complete MVP with core features',
      'Acquire 100 paying customers',
      'Generate $5,000 MRR',
    ],
    notes: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -90)),
    updatedAt: formatDate(now),
  };
  goals.push(goal1);

  const goal2: Goal = {
    id: generateId(),
    title: 'Run First Marathon',
    description: 'Train for and complete a full marathon',
    area: 'Health',
    subCategory: 'Exercise',
    timeHorizon: 'Yearly',
    priority: 'P2',
    status: 'OnTrack',
    targetDate: formatDate(addDays(now, 120)),
    completedDate: null,
    successCriteria: [
      'Build up to 40 miles per week',
      'Complete a half marathon',
      'Finish marathon in under 4 hours',
    ],
    notes: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -60)),
    updatedAt: formatDate(now),
  };
  goals.push(goal2);

  const goal3: Goal = {
    id: generateId(),
    title: 'Q1 Revenue Target',
    description: 'Hit quarterly revenue goals for the business',
    area: 'DayJob',
    subCategory: 'Performance',
    timeHorizon: 'Quarterly',
    priority: 'P1',
    status: 'Active',
    targetDate: formatDate(addDays(now, 30)),
    completedDate: null,
    successCriteria: ['Close 15 new deals', 'Achieve $150K in revenue', 'Maintain 95% customer retention'],
    notes: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -60)),
    updatedAt: formatDate(now),
  };
  goals.push(goal3);

  const project1: Project = {
    id: generateId(),
    name: 'SaaS MVP Development',
    description: 'Build minimum viable product with core features',
    area: 'Wealth',
    subCategory: 'Projects',
    priority: 'P1',
    status: 'Active',
    impact: 9,
    startDate: formatDate(addDays(now, -30)),
    endDate: formatDate(addDays(now, 90)),
    completedDate: null,
    notes: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -30)),
    updatedAt: formatDate(now),
  };
  projects.push(project1);
  projectGoals.push({ projectId: project1.id, goalId: goal1.id, createdAt: formatDate(now) });

  const project2: Project = {
    id: generateId(),
    name: 'Marathon Training Program',
    description: '16-week marathon training plan',
    area: 'Health',
    subCategory: 'Exercise',
    priority: 'P2',
    status: 'Active',
    impact: 8,
    startDate: formatDate(addDays(now, -45)),
    endDate: formatDate(addDays(now, 75)),
    completedDate: null,
    notes: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -45)),
    updatedAt: formatDate(now),
  };
  projects.push(project2);
  projectGoals.push({ projectId: project2.id, goalId: goal2.id, createdAt: formatDate(now) });

  const task1: Task = {
    id: generateId(),
    title: 'Design database schema',
    description: 'Create PostgreSQL schema for user data',
    extendedDescription: 'Include users, subscriptions, and usage tables. Consider multi-tenancy.',
    area: 'Wealth',
    subCategory: 'Projects',
    priority: 'P1',
    status: 'Done',
    size: 5,
    dueDate: formatDate(addDays(now, -5)),
    scheduledDate: formatDate(addDays(now, -7)),
    completedDate: formatDate(addDays(now, -3)),
    notes: null,
    isRecurring: false,
    recurrenceRule: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -20)),
    updatedAt: formatDate(addDays(now, -3)),
  };
  tasks.push(task1);
  taskProjects.push({ taskId: task1.id, projectId: project1.id, createdAt: formatDate(now) });
  taskGoals.push({ taskId: task1.id, goalId: goal1.id, createdAt: formatDate(now) });

  const task2: Task = {
    id: generateId(),
    title: 'Build authentication system',
    description: 'Implement user auth with JWT',
    extendedDescription: null,
    area: 'Wealth',
    subCategory: 'Projects',
    priority: 'P1',
    status: 'InProgress',
    size: 8,
    dueDate: formatDate(addDays(now, 3)),
    scheduledDate: formatDate(now),
    completedDate: null,
    notes: 'Consider using OAuth for social login',
    isRecurring: false,
    recurrenceRule: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -15)),
    updatedAt: formatDate(now),
  };
  tasks.push(task2);
  taskProjects.push({ taskId: task2.id, projectId: project1.id, createdAt: formatDate(now) });
  taskGoals.push({ taskId: task2.id, goalId: goal1.id, createdAt: formatDate(now) });
  taskDependencies.push({
    id: generateId(),
    taskId: task2.id,
    dependsOnTaskId: task1.id,
    createdAt: formatDate(now),
  });

  const task3: Task = {
    id: generateId(),
    title: 'Create API endpoints',
    description: 'Build RESTful API for core features',
    extendedDescription: null,
    area: 'Wealth',
    subCategory: 'Projects',
    priority: 'P1',
    status: 'Blocked',
    size: 13,
    dueDate: formatDate(addDays(now, 7)),
    scheduledDate: formatDate(addDays(now, 3)),
    completedDate: null,
    notes: 'Blocked by authentication system',
    isRecurring: false,
    recurrenceRule: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -15)),
    updatedAt: formatDate(now),
  };
  tasks.push(task3);
  taskProjects.push({ taskId: task3.id, projectId: project1.id, createdAt: formatDate(now) });
  taskDependencies.push({
    id: generateId(),
    taskId: task3.id,
    dependsOnTaskId: task2.id,
    createdAt: formatDate(now),
  });

  const task4: Task = {
    id: generateId(),
    title: 'Long run: 10 miles',
    description: 'Build endurance with long slow distance run',
    extendedDescription: null,
    area: 'Health',
    subCategory: 'Exercise',
    priority: 'P2',
    status: 'NotStarted',
    size: 3,
    dueDate: formatDate(addDays(now, 2)),
    scheduledDate: formatDate(addDays(now, 2)),
    completedDate: null,
    notes: 'Easy pace, focus on completing distance',
    isRecurring: true,
    recurrenceRule: { frequency: 'Weekly', interval: 1, endDate: formatDate(addDays(now, 75)) },
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -30)),
    updatedAt: formatDate(now),
  };
  tasks.push(task4);
  taskProjects.push({ taskId: task4.id, projectId: project2.id, createdAt: formatDate(now) });
  taskGoals.push({ taskId: task4.id, goalId: goal2.id, createdAt: formatDate(now) });

  const metric1: Metric = {
    id: generateId(),
    name: 'Weekly Running Miles',
    description: 'Total miles run per week',
    area: 'Health',
    subCategory: 'Exercise',
    unit: 'count',
    customUnit: 'miles',
    direction: 'Higher',
    targetValue: 40,
    thresholdLow: 20,
    thresholdHigh: 50,
    source: 'Manual',
    status: 'Active',
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -45)),
    updatedAt: formatDate(now),
  };
  metrics.push(metric1);
  goalMetrics.push({ goalId: goal2.id, metricId: metric1.id, createdAt: formatDate(now) });

  for (let i = 0; i < 6; i++) {
    metricLogs.push({
      id: generateId(),
      metricId: metric1.id,
      value: 15 + i * 3,
      notes: null,
      loggedAt: formatDate(addDays(now, -35 + i * 7)),
      userId: USER_ID,
      createdAt: formatDate(addDays(now, -35 + i * 7)),
    });
  }

  const metric2: Metric = {
    id: generateId(),
    name: 'MRR',
    description: 'Monthly Recurring Revenue',
    area: 'Wealth',
    subCategory: 'Income',
    unit: 'dollars',
    customUnit: null,
    direction: 'Higher',
    targetValue: 5000,
    thresholdLow: 1000,
    thresholdHigh: 10000,
    source: 'App',
    status: 'Active',
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -90)),
    updatedAt: formatDate(now),
  };
  metrics.push(metric2);
  goalMetrics.push({ goalId: goal1.id, metricId: metric2.id, createdAt: formatDate(now) });

  metricLogs.push({
    id: generateId(),
    metricId: metric2.id,
    value: 0,
    notes: 'Pre-launch',
    loggedAt: formatDate(addDays(now, -30)),
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -30)),
  });

  const habit1: Habit = {
    id: generateId(),
    name: 'Morning Run',
    description: 'Run 3-5 miles in the morning',
    area: 'Health',
    subCategory: 'Exercise',
    habitType: 'Build',
    frequency: 'Daily',
    dailyTarget: 1,
    weeklyTarget: 5,
    intent: 'Build cardiovascular fitness and mental clarity',
    trigger: 'After waking up and having water',
    action: 'Put on running clothes and run 3-5 miles',
    reward: 'Feel energized and track progress',
    frictionUp: null,
    frictionDown: 'Lay out running clothes the night before, prep water bottle',
    notes: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -30)),
    updatedAt: formatDate(now),
  };
  habits.push(habit1);
  habitGoals.push({ habitId: habit1.id, goalId: goal2.id, createdAt: formatDate(now) });

  for (let i = 0; i < 20; i++) {
    if (i % 7 !== 6) {
      habitLogs.push({
        id: generateId(),
        habitId: habit1.id,
        completedAt: formatDate(addDays(now, -20 + i)),
        amount: 1,
        notes: null,
        userId: USER_ID,
        createdAt: formatDate(addDays(now, -20 + i)),
      });
    }
  }

  const habit2: Habit = {
    id: generateId(),
    name: 'Daily Coding',
    description: 'Work on side project for at least 1 hour',
    area: 'Wealth',
    subCategory: 'Projects',
    habitType: 'Build',
    frequency: 'Daily',
    dailyTarget: 1,
    weeklyTarget: 5,
    intent: 'Make consistent progress on SaaS product',
    trigger: 'After dinner when laptop is open',
    action: 'Code for 1 hour on side project',
    reward: 'Update progress tracker and celebrate small wins',
    frictionUp: null,
    frictionDown: 'Have development environment ready, clear task list prepared',
    notes: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -30)),
    updatedAt: formatDate(now),
  };
  habits.push(habit2);
  habitGoals.push({ habitId: habit2.id, goalId: goal1.id, createdAt: formatDate(now) });

  for (let i = 0; i < 15; i++) {
    habitLogs.push({
      id: generateId(),
      habitId: habit2.id,
      completedAt: formatDate(addDays(now, -15 + i)),
      amount: 1,
      notes: null,
      userId: USER_ID,
      createdAt: formatDate(addDays(now, -15 + i)),
    });
  }

  const habit3: Habit = {
    id: generateId(),
    name: 'Reduce Social Media',
    description: 'Limit social media to 30 minutes per day',
    area: 'Operations',
    subCategory: 'Productivity',
    habitType: 'Reduce',
    frequency: 'Daily',
    dailyTarget: 30,
    weeklyTarget: null,
    intent: 'Reclaim time for more productive activities',
    trigger: 'When feeling bored or procrastinating',
    action: 'Check screen time limit before opening apps',
    reward: 'More time for meaningful work',
    frictionUp: 'Delete apps from phone, use browser only with blocker extensions',
    frictionDown: null,
    notes: null,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -20)),
    updatedAt: formatDate(now),
  };
  habits.push(habit3);

  const logbook1: LogbookEntry = {
    id: generateId(),
    date: formatDate(addDays(now, -1)),
    title: 'Productive Day on MVP',
    notes: 'Made great progress on authentication system. Feeling good about the architecture decisions. Energy was high in the morning after my run.',
    mood: 'High',
    energy: 8,
    userId: USER_ID,
    createdAt: formatDate(addDays(now, -1)),
    updatedAt: formatDate(addDays(now, -1)),
  };
  logbookEntries.push(logbook1);
  logbookTasks.push({ logbookEntryId: logbook1.id, taskId: task2.id, createdAt: formatDate(now) });
  logbookProjects.push({ logbookEntryId: logbook1.id, projectId: project1.id, createdAt: formatDate(now) });
  logbookHabits.push({ logbookEntryId: logbook1.id, habitId: habit1.id, createdAt: formatDate(now) });
  logbookHabits.push({ logbookEntryId: logbook1.id, habitId: habit2.id, createdAt: formatDate(now) });

  const logbook2: LogbookEntry = {
    id: generateId(),
    date: formatDate(now),
    title: null,
    notes: 'Rest day from running. Focused on planning the API architecture.',
    mood: 'Steady',
    energy: 7,
    userId: USER_ID,
    createdAt: formatDate(now),
    updatedAt: formatDate(now),
  };
  logbookEntries.push(logbook2);
  logbookHabits.push({ logbookEntryId: logbook2.id, habitId: habit2.id, createdAt: formatDate(now) });

  return {
    tasks,
    projects,
    goals,
    metrics,
    metricLogs,
    habits,
    habitLogs,
    logbookEntries,
    taskDependencies,
    taskProjects,
    taskGoals,
    projectGoals,
    goalMetrics,
    habitGoals,
    logbookTasks,
    logbookProjects,
    logbookGoals,
    logbookHabits,
  };
}
