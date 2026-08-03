import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { uploadToS3WithProgress } from '@/lib/upload-to-s3-with-progress';

type XhrListener = (this: XMLHttpRequest, ev: ProgressEvent) => void;

class MockXHR {
  static instances: MockXHR[] = [];
  upload = { onprogress: null as XhrListener | null };
  status = 200;
  statusText = 'OK';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  aborted = false;
  method = '';
  url = '';
  headers: Record<string, string> = {};
  body: File | null = null;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  send(body: File) {
    this.body = body;
    MockXHR.instances.push(this);
  }

  abort() {
    this.aborted = true;
    this.onabort?.();
  }

  simulateProgress(loaded: number, total: number) {
    const onprogress = this.upload.onprogress;
    onprogress?.call(
      this as unknown as XMLHttpRequest,
      {
        lengthComputable: true,
        loaded,
        total,
      } as ProgressEvent
    );
  }

  simulateSuccess() {
    this.onload?.();
  }
}

describe('uploadToS3WithProgress', () => {
  beforeEach(() => {
    MockXHR.instances = [];
    vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('uploads via PUT and reports throttled progress', async () => {
    const onProgress = vi.fn();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    const promise = uploadToS3WithProgress('https://s3.example/upload', file, onProgress);

    const xhr = MockXHR.instances[0];
    expect(xhr.method).toBe('PUT');
    expect(xhr.headers['Content-Type']).toBe('application/pdf');

    xhr.simulateProgress(50, 100);
    vi.advanceTimersByTime(200);
    expect(onProgress).toHaveBeenCalledWith(50);

    xhr.simulateProgress(100, 100);
    xhr.simulateSuccess();
    await promise;
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it('rejects with AbortError when signal is aborted', async () => {
    const controller = new AbortController();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    const promise = uploadToS3WithProgress('https://s3.example/upload', file, undefined, {
      signal: controller.signal,
    });

    const xhr = MockXHR.instances[0];
    controller.abort();
    expect(xhr.aborted).toBe(true);

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects immediately if signal already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });

    await expect(
      uploadToS3WithProgress('https://s3.example/upload', file, undefined, {
        signal: controller.signal,
      })
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
