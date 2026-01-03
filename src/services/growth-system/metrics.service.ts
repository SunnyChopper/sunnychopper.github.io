import { supabase } from '../../lib/supabase';
import type {
  Metric,
  MetricHistory,
  CreateMetricInput,
  UpdateMetricInput,
  ApiResponse,
} from '../../types/growth-system';

export const metricsService = {
  async getAll(userId: string): Promise<ApiResponse<Metric[]>> {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
        success: false,
      };
    }
  },

  async getById(id: string, userId: string): Promise<ApiResponse<Metric>> {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Metric not found');

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch metric',
        success: false,
      };
    }
  },

  async create(input: CreateMetricInput, userId: string): Promise<ApiResponse<Metric>> {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .insert({
          ...input,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('metric_history')
        .insert({
          metric_id: data.id,
          value: input.currentValue,
        });

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create metric',
        success: false,
      };
    }
  },

  async update(id: string, input: UpdateMetricInput, userId: string): Promise<ApiResponse<Metric>> {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .update(input)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (input.currentValue !== undefined) {
        await supabase
          .from('metric_history')
          .insert({
            metric_id: id,
            value: input.currentValue,
          });
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update metric',
        success: false,
      };
    }
  },

  async delete(id: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('metrics')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete metric',
        success: false,
      };
    }
  },

  async getHistory(metricId: string, userId: string): Promise<ApiResponse<MetricHistory[]>> {
    try {
      const metricCheck = await supabase
        .from('metrics')
        .select('id')
        .eq('id', metricId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!metricCheck.data) {
        throw new Error('Metric not found or access denied');
      }

      const { data, error } = await supabase
        .from('metric_history')
        .select('*')
        .eq('metric_id', metricId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch metric history',
        success: false,
      };
    }
  },
};
