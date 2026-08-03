import { createMinIntervalProgress } from '@/lib/throttled-progress';

export type UploadToS3Options = {
  signal?: AbortSignal;
  /** Minimum ms between progress callbacks (default 200). */
  minProgressIntervalMs?: number;
};

/**
 * PUT a file to a presigned S3 URL with upload progress (0–100).
 * Supports AbortSignal for clean cancel mid-upload.
 */
export function uploadToS3WithProgress(
  presignedUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
  options?: UploadToS3Options
): Promise<void> {
  const minIntervalMs = options?.minProgressIntervalMs ?? 200;
  const signal = options?.signal;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let throttled: ReturnType<typeof createMinIntervalProgress> | null = null;

    const cleanup = () => {
      throttled?.dispose();
      throttled = null;
    };

    const rejectAbort = () => {
      cleanup();
      reject(new DOMException('Upload aborted', 'AbortError'));
    };

    if (signal?.aborted) {
      rejectAbort();
      return;
    }

    const onAbort = () => {
      xhr.abort();
      rejectAbort();
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    if (onProgress) {
      throttled = createMinIntervalProgress(onProgress, minIntervalMs);
    }

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && throttled) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        throttled.report(pct);
      }
    };
    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        throttled?.complete();
        cleanup();
        resolve();
      } else {
        cleanup();
        reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      cleanup();
      reject(new Error('S3 upload network error'));
    };
    xhr.onabort = () => {
      signal?.removeEventListener('abort', onAbort);
      // abort handler already rejected via signal listener
      if (!signal?.aborted) {
        cleanup();
        rejectAbort();
      }
    };
    xhr.send(file);
  });
}
