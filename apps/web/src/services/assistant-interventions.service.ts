import { apiClient } from '@/lib/api-client';
import type { AssistantIntervention, AssistantInterventionListResult } from '@/types/api-contracts';

export const assistantInterventionsService = {
  async list(params?: {
    status?: string;
    kind?: string;
    page?: number;
    pageSize?: number;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AssistantInterventionListResult> {
    const response = await apiClient.getAssistantInterventions(params);
    if (response.success && response.data) {
      return response.data;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to fetch interventions');
  },

  async unreadCount(): Promise<number> {
    const response = await apiClient.getAssistantInterventionUnreadCount();
    if (response.success && response.data) {
      return response.data.unreadCount;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to fetch intervention unread count');
  },

  async markRead(interventionId: string): Promise<AssistantIntervention> {
    const response = await apiClient.markAssistantInterventionRead(interventionId);
    if (response.success && response.data) {
      return response.data;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to mark intervention read');
  },

  async dismiss(interventionId: string, reason: string): Promise<AssistantIntervention> {
    const response = await apiClient.dismissAssistantIntervention(interventionId, reason);
    if (response.success && response.data) {
      return response.data;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to dismiss intervention');
  },

  async reply(interventionId: string, message: string): Promise<{ threadId: string }> {
    const response = await apiClient.replyAssistantIntervention(interventionId, message);
    if (response.success && response.data) {
      return { threadId: response.data.threadId };
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to reply to intervention');
  },

  async convertToChat(interventionId: string): Promise<{ threadId: string }> {
    const response = await apiClient.convertAssistantInterventionToChat(interventionId);
    if (response.success && response.data) {
      return { threadId: response.data.threadId };
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to convert intervention to chat');
  },
};
