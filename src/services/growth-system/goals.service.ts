import { supabase } from '../../lib/supabase';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  ApiResponse,
} from '../../types/growth-system';

export const goalsService = {
  async getAll(userId: string): Promise<ApiResponse<Goal[]>> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch goals',
        success: false,
      };
    }
  },

  async getById(id: string, userId: string): Promise<ApiResponse<Goal>> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Goal not found');

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch goal',
        success: false,
      };
    }
  },

  async create(input: CreateGoalInput, userId: string): Promise<ApiResponse<Goal>> {
    try {
      const { data, error } = await supabase
        .from('goals')
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
        error: error instanceof Error ? error.message : 'Failed to create goal',
        success: false,
      };
    }
  },

  async update(id: string, input: UpdateGoalInput, userId: string): Promise<ApiResponse<Goal>> {
    try {
      const { data, error } = await supabase
        .from('goals')
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
        error: error instanceof Error ? error.message : 'Failed to update goal',
        success: false,
      };
    }
  },

  async delete(id: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete goal',
        success: false,
      };
    }
  },

  async linkMetric(goalId: string, metricId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const goalCheck = await supabase
        .from('goals')
        .select('id')
        .eq('id', goalId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!goalCheck.data) {
        throw new Error('Goal not found or access denied');
      }

      const { error } = await supabase
        .from('goal_metrics')
        .insert({ goal_id: goalId, metric_id: metricId });

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to link metric to goal',
        success: false,
      };
    }
  },

  async unlinkMetric(goalId: string, metricId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const goalCheck = await supabase
        .from('goals')
        .select('id')
        .eq('id', goalId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!goalCheck.data) {
        throw new Error('Goal not found or access denied');
      }

      const { error } = await supabase
        .from('goal_metrics')
        .delete()
        .eq('goal_id', goalId)
        .eq('metric_id', metricId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to unlink metric from goal',
        success: false,
      };
    }
  },

  async linkProject(goalId: string, projectId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const goalCheck = await supabase
        .from('goals')
        .select('id')
        .eq('id', goalId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!goalCheck.data) {
        throw new Error('Goal not found or access denied');
      }

      const { error } = await supabase
        .from('goal_projects')
        .insert({ goal_id: goalId, project_id: projectId });

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to link project to goal',
        success: false,
      };
    }
  },

  async unlinkProject(goalId: string, projectId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const goalCheck = await supabase
        .from('goals')
        .select('id')
        .eq('id', goalId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!goalCheck.data) {
        throw new Error('Goal not found or access denied');
      }

      const { error } = await supabase
        .from('goal_projects')
        .delete()
        .eq('goal_id', goalId)
        .eq('project_id', projectId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to unlink project from goal',
        success: false,
      };
    }
  },
};
