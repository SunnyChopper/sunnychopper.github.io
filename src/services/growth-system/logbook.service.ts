import { supabase } from '../../lib/supabase';
import type {
  LogbookEntry,
  CreateLogbookEntryInput,
  UpdateLogbookEntryInput,
  ApiResponse,
} from '../../types/growth-system';

export const logbookService = {
  async getAll(userId: string): Promise<ApiResponse<LogbookEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch logbook entries',
        success: false,
      };
    }
  },

  async getById(id: string, userId: string): Promise<ApiResponse<LogbookEntry>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Logbook entry not found');

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch logbook entry',
        success: false,
      };
    }
  },

  async getByDate(date: string, userId: string): Promise<ApiResponse<LogbookEntry>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .select('*')
        .eq('date', date)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return { data: data || null, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch logbook entry',
        success: false,
      };
    }
  },

  async create(input: CreateLogbookEntryInput, userId: string): Promise<ApiResponse<LogbookEntry>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .insert({
          ...input,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create logbook entry',
        success: false,
      };
    }
  },

  async update(id: string, input: UpdateLogbookEntryInput, userId: string): Promise<ApiResponse<LogbookEntry>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .update(input)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update logbook entry',
        success: false,
      };
    }
  },

  async delete(id: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('logbook_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete logbook entry',
        success: false,
      };
    }
  },

  async linkTask(entryId: string, taskId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const entryCheck = await supabase
        .from('logbook_entries')
        .select('id')
        .eq('id', entryId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!entryCheck.data) {
        throw new Error('Logbook entry not found or access denied');
      }

      const { error } = await supabase
        .from('logbook_tasks')
        .insert({ logbook_entry_id: entryId, task_id: taskId });

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to link task to logbook entry',
        success: false,
      };
    }
  },

  async unlinkTask(entryId: string, taskId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const entryCheck = await supabase
        .from('logbook_entries')
        .select('id')
        .eq('id', entryId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!entryCheck.data) {
        throw new Error('Logbook entry not found or access denied');
      }

      const { error } = await supabase
        .from('logbook_tasks')
        .delete()
        .eq('logbook_entry_id', entryId)
        .eq('task_id', taskId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to unlink task from logbook entry',
        success: false,
      };
    }
  },

  async linkHabit(entryId: string, habitId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const entryCheck = await supabase
        .from('logbook_entries')
        .select('id')
        .eq('id', entryId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!entryCheck.data) {
        throw new Error('Logbook entry not found or access denied');
      }

      const { error } = await supabase
        .from('logbook_habits')
        .insert({ logbook_entry_id: entryId, habit_id: habitId });

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to link habit to logbook entry',
        success: false,
      };
    }
  },

  async unlinkHabit(entryId: string, habitId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const entryCheck = await supabase
        .from('logbook_entries')
        .select('id')
        .eq('id', entryId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!entryCheck.data) {
        throw new Error('Logbook entry not found or access denied');
      }

      const { error } = await supabase
        .from('logbook_habits')
        .delete()
        .eq('logbook_entry_id', entryId)
        .eq('habit_id', habitId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to unlink habit from logbook entry',
        success: false,
      };
    }
  },
};
