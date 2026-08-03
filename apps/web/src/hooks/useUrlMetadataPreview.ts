import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  URL_METADATA_DEBOUNCE_MS,
  isValidHttpUrl,
  type UrlMetadataPreviewStatus,
} from '@/lib/knowledge-vault/url-metadata';
import {
  fetchUrlMetadata,
  type UrlMetadataResult,
} from '@/services/knowledge-vault/url-metadata.service';

export interface UseUrlMetadataPreviewOptions {
  enabled?: boolean;
}

export interface UseUrlMetadataPreviewResult {
  status: UrlMetadataPreviewStatus;
  title: string | null;
  faviconUrl: string | null;
  warning: string | null;
}

const EMPTY: UseUrlMetadataPreviewResult = {
  status: 'idle',
  title: null,
  faviconUrl: null,
  warning: null,
};

export function useUrlMetadataPreview(
  url: string,
  options: UseUrlMetadataPreviewOptions = {}
): UseUrlMetadataPreviewResult {
  const { enabled = true } = options;
  const debouncedUrl = useDebouncedValue(url.trim(), URL_METADATA_DEBOUNCE_MS);
  const requestIdRef = useRef(0);
  const [result, setResult] = useState<UseUrlMetadataPreviewResult>(EMPTY);

  useEffect(() => {
    if (!enabled || !isValidHttpUrl(debouncedUrl)) {
      setResult(EMPTY);
      return;
    }

    const requestId = ++requestIdRef.current;
    setResult({
      status: 'loading',
      title: null,
      faviconUrl: null,
      warning: null,
    });

    void fetchUrlMetadata(debouncedUrl)
      .then((data: UrlMetadataResult) => {
        if (requestId !== requestIdRef.current) return;
        if (data.fetchFailed) {
          setResult({
            status: 'error',
            title: null,
            faviconUrl: data.faviconUrl,
            warning: data.warning ?? 'Could not fetch',
          });
          return;
        }
        if (!data.title?.trim()) {
          setResult({
            status: 'idle',
            title: null,
            faviconUrl: data.faviconUrl,
            warning: null,
          });
          return;
        }
        setResult({
          status: 'ready',
          title: data.title.trim(),
          faviconUrl: data.faviconUrl,
          warning: null,
        });
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setResult({
          status: 'error',
          title: null,
          faviconUrl: null,
          warning: 'Could not fetch',
        });
      });
  }, [debouncedUrl, enabled]);

  return result;
}
