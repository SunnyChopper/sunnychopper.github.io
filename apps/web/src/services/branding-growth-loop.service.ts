import { apiClient } from '@/lib/api-client';

export interface BrandingGrowthLoopConfig {
  draftLogbookOnPublish: boolean;
}

export const brandingGrowthLoopService = {
  async getConfig(): Promise<BrandingGrowthLoopConfig> {
    const res = await apiClient.get<BrandingGrowthLoopConfig>('/preferences/branding-growth-loop');
    if (res.success && res.data) return res.data;
    throw new Error(res.error?.message || 'Failed to load branding growth loop preferences');
  },

  async setConfig(config: BrandingGrowthLoopConfig): Promise<BrandingGrowthLoopConfig> {
    const res = await apiClient.put<BrandingGrowthLoopConfig>(
      '/preferences/branding-growth-loop',
      config
    );
    if (res.success && res.data) return res.data;
    throw new Error(res.error?.message || 'Failed to save branding growth loop preferences');
  },
};
