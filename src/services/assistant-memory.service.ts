import { apiClient } from '@/lib/api-client';
import { markdownFilesService } from '@/services/markdown-files.service';
import { vaultItemsService } from '@/services/knowledge-vault';
import type {
  ConsolidateMemoryResponse,
  LongTermMemoryNote,
  ShortTermMemoryHistoryResponse,
  ShortTermMemoryResponse,
} from '@/types/assistant-memory';

export const assistantMemoryService = {
  async getShortTerm(date?: string): Promise<ShortTermMemoryResponse> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const response = await apiClient.get<ShortTermMemoryResponse>(`/assistant/memory/short-term${query}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to load short-term memory');
  },

  async getShortTermHistory(includeArchived = true): Promise<ShortTermMemoryHistoryResponse> {
    const query = `?includeArchived=${includeArchived ? 'true' : 'false'}`;
    const response = await apiClient.get<ShortTermMemoryHistoryResponse>(
      `/assistant/memory/short-term/history${query}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to load memory history');
  },

  async getShortTermContent(fileId: string): Promise<string> {
    const response = await markdownFilesService.getFileContent(fileId);
    if (response.success && response.data) {
      return response.data.content;
    }
    throw new Error(response.error?.message || 'Failed to load memory content');
  },

  async updateShortTerm(fileId: string, content: string): Promise<ShortTermMemoryResponse> {
    const response = await apiClient.put<ShortTermMemoryResponse>(
      `/assistant/memory/short-term/${fileId}`,
      { content }
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to update short-term memory');
  },

  async consolidate(date?: string): Promise<ConsolidateMemoryResponse> {
    const response = await apiClient.post<ConsolidateMemoryResponse>('/assistant/memory/consolidate', {
      date,
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to consolidate memory');
  },

  async getLongTermNotes(search?: string): Promise<LongTermMemoryNote[]> {
    const response = await vaultItemsService.getAll({
      type: 'note',
      tags: ['long-term-memory'],
      ...(search ? { search } : {}),
    });
    if (response.success && response.data) {
      return response.data as LongTermMemoryNote[];
    }
    throw new Error(response.error || 'Failed to load long-term memory');
  },
};
