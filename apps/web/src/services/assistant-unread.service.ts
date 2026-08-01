import { apiClient } from '@/lib/api-client';
import type { AssistantUnreadSummary, MarkThreadReadResult } from '@/types/api-contracts';

export const assistantUnreadService = {
  async getUnreadSummary(): Promise<AssistantUnreadSummary> {
    const response = await apiClient.getAssistantUnreadSummary();
    if (response.success && response.data) {
      return response.data;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to fetch assistant unread summary');
  },

  async markThreadRead(threadId: string): Promise<MarkThreadReadResult> {
    const response = await apiClient.markAssistantThreadRead(threadId);
    if (response.success && response.data) {
      return response.data;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to mark assistant thread read');
  },
};
