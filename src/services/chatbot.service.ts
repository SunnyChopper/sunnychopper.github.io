import type {
  ChatThread,
  ChatMessage,
  CreateThreadRequest,
  CreateMessageRequest,
  UpdateThreadRequest,
} from '@/types/chatbot';
import { apiClient } from '@/lib/api-client';

export const chatbotService = {
  async getThreads(): Promise<ChatThread[]> {
    const response = await apiClient.getChatThreads();
    if (response.success && response.data) {
      return response.data.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
    throw new Error(response.error?.message || 'Failed to fetch threads');
  },

  async getThread(id: string): Promise<ChatThread | null> {
    const response = await apiClient.getChatThread(id);
    if (response.success && response.data) {
      return response.data;
    }
    if (response.error?.code === 'NOT_FOUND' || response.error?.code === 'HTTP_404') {
      return null;
    }
    throw new Error(response.error?.message || 'Failed to fetch thread');
  },

  async createThread(request: CreateThreadRequest): Promise<ChatThread> {
    const response = await apiClient.createChatThread(request);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to create thread');
  },

  async updateThread(request: UpdateThreadRequest): Promise<ChatThread> {
    const response = await apiClient.updateChatThread(request.id, request);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to update thread');
  },

  async deleteThread(id: string): Promise<void> {
    const response = await apiClient.deleteChatThread(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete thread');
    }
  },

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const response = await apiClient.getChatMessages(threadId);
    if (response.success && response.data) {
      return response.data.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    throw new Error(response.error?.message || 'Failed to fetch messages');
  },

  async createMessage(request: CreateMessageRequest): Promise<ChatMessage> {
    const response = await apiClient.createChatMessage(request);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to create message');
  },

  async updateMessage(id: string, content: string): Promise<ChatMessage> {
    const response = await apiClient.updateChatMessage(id, content);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to update message');
  },

  async deleteMessagesAfter(messageId: string, threadId: string): Promise<void> {
    const response = await apiClient.deleteMessagesAfter(messageId, threadId);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete messages');
    }
  },
};
