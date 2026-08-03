export const URL_METADATA_DEBOUNCE_MS = 400;

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function shouldOfferTitleApply(title: string | null | undefined): boolean {
  return Boolean(title?.trim());
}

export function confirmOverwriteTitle(currentTitle: string, suggestedTitle: string): boolean {
  const current = currentTitle.trim();
  if (!current) return true;
  return window.confirm(`Replace the current title "${current}" with "${suggestedTitle.trim()}"?`);
}

export type UrlMetadataPreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

export function resolvePreviewStatus(input: {
  url: string;
  loading: boolean;
  fetchFailed: boolean;
  hasTitle: boolean;
}): UrlMetadataPreviewStatus {
  if (!isValidHttpUrl(input.url)) return 'idle';
  if (input.loading) return 'loading';
  if (input.fetchFailed) return 'error';
  if (input.hasTitle) return 'ready';
  return 'idle';
}
