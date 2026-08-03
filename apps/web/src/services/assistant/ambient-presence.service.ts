import { apiClient } from '@/lib/api-client';
import type {
  AmbientActionId,
  AmbientActionResult,
  AmbientEntityRef,
  AmbientPresenceData,
  AmbientSurface,
} from '@/types/chatbot';

export const ambientPresenceService = {
  async getAmbient(surface: AmbientSurface): Promise<AmbientPresenceData> {
    const response = await apiClient.getAssistantAmbient(surface);
    if (response.success && response.data) {
      return response.data;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to fetch ambient presence');
  },

  async executeAction(body: {
    surface: AmbientSurface;
    whisperId: string;
    actionId: AmbientActionId;
    entityRef?: AmbientEntityRef;
  }): Promise<AmbientActionResult> {
    const response = await apiClient.postAssistantAmbientAction(body);
    if (response.success && response.data) {
      return response.data;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to execute ambient action');
  },

  async dismiss(body: {
    surface: AmbientSurface;
    whisperId: string;
    ledgerEntryId?: string;
  }): Promise<void> {
    const response = await apiClient.postAssistantAmbientDismiss(body);
    if (response.success) {
      return;
    }
    if (response.error) {
      throw response.error;
    }
    throw new Error('Failed to dismiss ambient whisper');
  },
};
