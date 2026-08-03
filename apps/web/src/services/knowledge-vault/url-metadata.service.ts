import { apiClient } from '@/lib/api-client';

export interface UrlMetadataResult {
  url: string;
  title: string | null;
  faviconUrl: string | null;
  fileType: string | null;
  fetchFailed: boolean;
  warning: string | null;
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadataResult> {
  const response = await apiClient.post<UrlMetadataResult>('/knowledge/url-metadata', { url });
  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Could not fetch');
  }
  return response.data;
}
