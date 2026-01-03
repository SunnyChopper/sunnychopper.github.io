import { supabase } from '../../lib/supabase';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ApiResponse,
} from '../../types/growth-system';

export const projectsService = {
  async getAll(userId: string): Promise<ApiResponse<Project[]>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        success: false,
      };
    }
  },

  async getById(id: string, userId: string): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Project not found');

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch project',
        success: false,
      };
    }
  },

  async create(input: CreateProjectInput, userId: string): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...input,
          user_id: userId,
          status: input.status || 'planning',
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create project',
        success: false,
      };
    }
  },

  async update(id: string, input: UpdateProjectInput, userId: string): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from('projects')
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
        error: error instanceof Error ? error.message : 'Failed to update project',
        success: false,
      };
    }
  },

  async delete(id: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete project',
        success: false,
      };
    }
  },

  async calculateProgress(projectId: string, userId: string): Promise<ApiResponse<number>> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      if (!tasks || tasks.length === 0) {
        return { data: 0, error: null, success: true };
      }

      const completedTasks = tasks.filter((t) => t.status === 'completed').length;
      const progress = Math.round((completedTasks / tasks.length) * 100);

      await supabase
        .from('projects')
        .update({ progress })
        .eq('id', projectId)
        .eq('user_id', userId);

      return { data: progress, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to calculate project progress',
        success: false,
      };
    }
  },
};
