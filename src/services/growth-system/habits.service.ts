import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  Habit,
  HabitLog,
  CreateHabitInput,
  UpdateHabitInput,
  CreateHabitLogInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

const USER_ID = 'user-1';

export const habitsService = {
  async getAll(): Promise<ApiListResponse<Habit>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const habits = await storage.getAll<Habit>('habits');
    return { data: habits, total: habits.length, success: true };
  },

  async getById(id: string): Promise<ApiResponse<Habit>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const habit = await storage.getById<Habit>('habits', id);
    if (!habit) {
      return {
        data: undefined,
        error: { message: 'Habit not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: habit, success: true };
  },

  async create(input: CreateHabitInput): Promise<ApiResponse<Habit>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();
    const habit: Habit = {
      id: generateId(),
      name: input.name,
      description: input.description || null,
      area: input.area,
      subCategory: input.subCategory || null,
      habitType: input.habitType,
      frequency: input.frequency,
      dailyTarget: input.dailyTarget || null,
      weeklyTarget: input.weeklyTarget || null,
      intent: input.intent || null,
      trigger: input.trigger || null,
      action: input.action || null,
      reward: input.reward || null,
      frictionUp: input.frictionUp || null,
      frictionDown: input.frictionDown || null,
      notes: input.notes || null,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    await storage.create('habits', habit.id, habit);
    return { data: habit, success: true };
  },

  async update(id: string, input: UpdateHabitInput): Promise<ApiResponse<Habit>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const updated = await storage.update<Habit>('habits', id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      return {
        data: undefined,
        error: { message: 'Habit not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: updated, success: true };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const deleted = await storage.delete('habits', id);
    if (!deleted) {
      return {
        data: undefined,
        error: { message: 'Habit not found', code: 'NOT_FOUND' },
        success: false,
      };
    }

    // Delete related habit logs
    const allLogs = await storage.getAll<HabitLog>('habitLogs');
    for (const log of allLogs.filter((l) => l.habitId === id)) {
      await storage.delete('habitLogs', log.id);
    }

    return { data: undefined, success: true };
  },

  async logCompletion(input: CreateHabitLogInput): Promise<ApiResponse<HabitLog>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();
    const log: HabitLog = {
      id: generateId(),
      habitId: input.habitId,
      completedAt: input.completedAt || now,
      amount: input.amount || null,
      notes: input.notes || null,
      userId: USER_ID,
      createdAt: now,
    };
    await storage.create('habitLogs', log.id, log);

    return { data: log, success: true };
  },

  async getLogsByHabit(habitId: string): Promise<ApiListResponse<HabitLog>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const allLogs = await storage.getAll<HabitLog>('habitLogs');
    const logs = allLogs
      .filter((l) => l.habitId === habitId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return { data: logs, total: logs.length, success: true };
  },
};
