import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  LogbookEntry,
  CreateLogbookEntryInput,
  UpdateLogbookEntryInput,
  LogbookTask,
  LogbookHabit,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

const USER_ID = 'user-1';

export const logbookService = {
  async getAll(): Promise<ApiListResponse<LogbookEntry>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const entries = await storage.getAll<LogbookEntry>('logbookEntries');
    const sorted = entries.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return { data: sorted, total: sorted.length, success: true };
  },

  async getById(id: string): Promise<ApiResponse<LogbookEntry>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const entry = await storage.getById<LogbookEntry>('logbookEntries', id);
    if (!entry) {
      return {
        data: undefined,
        error: { message: 'Logbook entry not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: entry, success: true };
  },

  async getByDate(date: string): Promise<ApiResponse<LogbookEntry>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const entries = await storage.getAll<LogbookEntry>('logbookEntries');
    const entry = entries.find((e) => e.date === date);
    if (!entry) {
      return {
        data: undefined,
        error: { message: 'No logbook entry found for this date', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: entry, success: true };
  },

  async create(input: CreateLogbookEntryInput): Promise<ApiResponse<LogbookEntry>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();

    // Check if an entry already exists for this date
    const entries = await storage.getAll<LogbookEntry>('logbookEntries');
    const existing = entries.find((e) => e.date === input.date);
    if (existing) {
      return {
        data: undefined,
        error: { message: 'Logbook entry already exists for this date', code: 'CONFLICT' },
        success: false,
      };
    }

    const entry: LogbookEntry = {
      id: generateId(),
      date: input.date,
      title: input.title || null,
      notes: input.notes || null,
      mood: input.mood || null,
      energy: input.energy || null,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    await storage.create('logbookEntries', entry.id, entry);
    return { data: entry, success: true };
  },

  async update(id: string, input: UpdateLogbookEntryInput): Promise<ApiResponse<LogbookEntry>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const updated = await storage.update<LogbookEntry>('logbookEntries', id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      return {
        data: undefined,
        error: { message: 'Logbook entry not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: updated, success: true };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const deleted = await storage.delete('logbookEntries', id);
    if (!deleted) {
      return {
        data: undefined,
        error: { message: 'Logbook entry not found', code: 'NOT_FOUND' },
        success: false,
      };
    }

    // Delete related logbook-task links
    const allLogbookTasks = await storage.getAll<LogbookTask>('logbookTasks');
    for (const lt of allLogbookTasks.filter((lt) => lt.logbookEntryId === id)) {
      await storage.deleteRelation('logbookTasks', `${lt.logbookEntryId}-${lt.taskId}`);
    }

    // Delete related logbook-habit links
    const allLogbookHabits = await storage.getAll<LogbookHabit>('logbookHabits');
    for (const lh of allLogbookHabits.filter((lh) => lh.logbookEntryId === id)) {
      await storage.deleteRelation('logbookHabits', `${lh.logbookEntryId}-${lh.habitId}`);
    }

    return { data: undefined, success: true };
  },

  async linkTask(entryId: string, taskId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const link: LogbookTask = {
      logbookEntryId: entryId,
      taskId,
      createdAt: new Date().toISOString(),
    };
    await storage.createRelation('logbookTasks', `${entryId}-${taskId}`, link as unknown as Record<string, unknown>);
    return { data: undefined, success: true };
  },

  async unlinkTask(entryId: string, taskId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    await storage.deleteRelation('logbookTasks', `${entryId}-${taskId}`);
    return { data: undefined, success: true };
  },

  async linkHabit(entryId: string, habitId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const link: LogbookHabit = {
      logbookEntryId: entryId,
      habitId,
      createdAt: new Date().toISOString(),
    };
    await storage.createRelation('logbookHabits', `${entryId}-${habitId}`, link as unknown as Record<string, unknown>);
    return { data: undefined, success: true };
  },

  async unlinkHabit(entryId: string, habitId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    await storage.deleteRelation('logbookHabits', `${entryId}-${habitId}`);
    return { data: undefined, success: true };
  },
};
