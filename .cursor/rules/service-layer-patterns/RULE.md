---
description: 'USE WHEN creating service modules for data access, business logic, and API calls.'
globs: 'src/services/**/*.ts'
alwaysApply: false
---

# Service Layer Patterns

Standards for service modules that handle data operations.

## Service Structure

```tsx
// services/tasks.service.ts
import { storage } from '@/lib/storage';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types';

const STORAGE_KEY = 'tasks';

export const tasksService = {
  async getAll(): Promise<Task[]> {
    return storage.getAll<Task>(STORAGE_KEY);
  },

  async getById(id: string): Promise<Task | null> {
    return storage.get<Task>(STORAGE_KEY, id);
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await storage.create(STORAGE_KEY, task);
    return task;
  },

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Task not found');

    const updated: Task = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await storage.update(STORAGE_KEY, id, updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await storage.delete(STORAGE_KEY, id);
  },
};
```

## Service with Business Logic

```tsx
export const habitService = {
  async logCompletion(habitId: string, date: string): Promise<HabitLog> {
    const habit = await this.getById(habitId);
    if (!habit) throw new Error('Habit not found');

    const existingLog = await this.getLogForDate(habitId, date);
    if (existingLog) {
      return this.updateLog(existingLog.id, {
        completedAt: new Date().toISOString(),
      });
    }

    return this.createLog({
      habitId,
      date,
      completedAt: new Date().toISOString(),
    });
  },

  calculateStreak(logs: HabitLog[]): number {
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
};
```

## Service with Filtering

```tsx
export const tasksService = {
  async getFiltered(filters: TaskFilters): Promise<Task[]> {
    let tasks = await this.getAll();

    if (filters.status) {
      tasks = tasks.filter((t) => t.status === filters.status);
    }

    if (filters.priority) {
      tasks = tasks.filter((t) => t.priority === filters.priority);
    }

    if (filters.projectId) {
      tasks = tasks.filter((t) => t.projectId === filters.projectId);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      );
    }

    return this.sortTasks(tasks, filters.sortBy, filters.sortOrder);
  },

  sortTasks(tasks: Task[], sortBy: string = 'createdAt', order: 'asc' | 'desc' = 'desc'): Task[] {
    return [...tasks].sort((a, b) => {
      const aVal = a[sortBy as keyof Task];
      const bVal = b[sortBy as keyof Task];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },
};
```

## Service Composition

```tsx
// Higher-level service using other services
export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const [tasks, habits, goals] = await Promise.all([
      tasksService.getAll(),
      habitsService.getAll(),
      goalsService.getAll(),
    ]);

    return {
      taskStats: this.calculateTaskStats(tasks),
      habitStats: this.calculateHabitStats(habits),
      goalProgress: this.calculateGoalProgress(goals),
    };
  },

  calculateTaskStats(tasks: Task[]): TaskStats {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter((t) => this.isOverdue(t)).length,
    };
  },
};
```

## Error Handling

```tsx
export const tasksService = {
  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new NotFoundError(`Task with id ${id} not found`);
      }

      const updated = { ...existing, ...input };
      await storage.update(STORAGE_KEY, id, updated);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new ServiceError('Failed to update task', { cause: error });
    }
  },
};
```

## Service Naming Conventions

- File: `feature.service.ts`
- Export: `featureService` (object) or `FeatureService` (class)
- Methods: verb + noun (getAll, getById, create, update, delete)
- Private helpers: underscore prefix or not exported
