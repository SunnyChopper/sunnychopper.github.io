import { supabase } from '../../lib/supabase';
import type {
  Habit,
  HabitLog,
  CreateHabitInput,
  UpdateHabitInput,
  ApiResponse,
} from '../../types/growth-system';

export const habitsService = {
  async getAll(userId: string): Promise<ApiResponse<Habit[]>> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch habits',
        success: false,
      };
    }
  },

  async getById(id: string, userId: string): Promise<ApiResponse<Habit>> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Habit not found');

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch habit',
        success: false,
      };
    }
  },

  async create(input: CreateHabitInput, userId: string): Promise<ApiResponse<Habit>> {
    try {
      const { data, error } = await supabase
        .from('habits')
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
        error: error instanceof Error ? error.message : 'Failed to create habit',
        success: false,
      };
    }
  },

  async update(id: string, input: UpdateHabitInput, userId: string): Promise<ApiResponse<Habit>> {
    try {
      const { data, error } = await supabase
        .from('habits')
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
        error: error instanceof Error ? error.message : 'Failed to update habit',
        success: false,
      };
    }
  },

  async delete(id: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete habit',
        success: false,
      };
    }
  },

  async logCompletion(habitId: string, userId: string, notes?: string): Promise<ApiResponse<HabitLog>> {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: userId,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const { data: habit } = await supabase
        .from('habits')
        .select('streak')
        .eq('id', habitId)
        .eq('user_id', userId)
        .single();

      await supabase
        .from('habits')
        .update({
          streak: (habit?.streak || 0) + 1,
          last_completed: new Date().toISOString(),
        })
        .eq('id', habitId)
        .eq('user_id', userId);

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to log habit completion',
        success: false,
      };
    }
  },

  async getHabitLogs(habitId: string, userId: string): Promise<ApiResponse<HabitLog[]>> {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch habit logs',
        success: false,
      };
    }
  },
};
