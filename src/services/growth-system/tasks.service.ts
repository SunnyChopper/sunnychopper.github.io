import { supabase } from '../../lib/supabase';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ApiResponse,
} from '../../types/growth-system';

export const tasksService = {
  async getAll(userId: string): Promise<ApiResponse<Task[]>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        success: false,
      };
    }
  },

  async getById(id: string, userId: string): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Task not found');

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch task',
        success: false,
      };
    }
  },

  async create(input: CreateTaskInput, userId: string): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...input,
          user_id: userId,
          status: input.status || 'todo',
          priority: input.priority || 'medium',
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create task',
        success: false,
      };
    }
  },

  async update(id: string, input: UpdateTaskInput, userId: string): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
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
        error: error instanceof Error ? error.message : 'Failed to update task',
        success: false,
      };
    }
  },

  async delete(id: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete task',
        success: false,
      };
    }
  },

  async getByProjectId(projectId: string, userId: string): Promise<ApiResponse<Task[]>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch project tasks',
        success: false,
      };
    }
  },
};
