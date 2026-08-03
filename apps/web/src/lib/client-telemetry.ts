/**
 * Report client-side errors to the backend alert pipeline.
 * Production stacks are remapped via deployed source maps when available.
 */
import { apiClient } from '@/lib/api-client';
import { resolveOriginalStack } from '@/lib/resolve-error-stack';
import { getResolvedApiBaseUrl } from '@/lib/vite-public-env';

export type ClientErrorSource = 'web' | 'mobile';

export interface ClientErrorReport {
  message: string;
  source?: ClientErrorSource;
  stack?: string;
  originalStack?: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
  release?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  metadata?: Record<string, unknown>;
}

export type ClientErrorFlushMode = 'immediate' | 'deferred';

export interface ReportClientErrorOptions {
  /** Crash handlers should use immediate so reload does not drop the POST. */
  flush?: ClientErrorFlushMode;
}

let _queue: ClientErrorReport[] = [];
let _flushTimer: ReturnType<typeof setTimeout> | null = null;
let _warnedPostFailure = false;

function appRelease(): string {
  const fromEnv = import.meta.env.VITE_APP_RELEASE;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  return `web@${import.meta.env.MODE}`;
}

function warnPostFailureOnce(err: unknown) {
  if (_warnedPostFailure || !import.meta.env.DEV) return;
  _warnedPostFailure = true;
  console.warn('[client-telemetry] failed to POST client error', err);
}

function scheduleFlush() {
  if (_flushTimer) return;
  _flushTimer = setTimeout(() => {
    _flushTimer = null;
    void flushClientErrors();
  }, 2000);
}

async function postClientErrorKeepalive(item: ClientErrorReport): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const token = apiClient.getAuthToken();
  if (!token) return false;
  try {
    const response = await fetch(`${getResolvedApiBaseUrl()}/telemetry/client-error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function sendClientErrorItem(item: ClientErrorReport): Promise<void> {
  try {
    const result = await apiClient.post<{ status: string }>('/telemetry/client-error', item);
    if (!result.success) {
      throw new Error(result.error?.message || 'client-error rejected');
    }
  } catch (err) {
    const keepaliveOk = await postClientErrorKeepalive(item);
    if (!keepaliveOk) {
      warnPostFailureOnce(err);
    }
  }
}

export async function reportClientError(
  report: ClientErrorReport,
  options: ReportClientErrorOptions = {}
): Promise<void> {
  let originalStack = report.originalStack;
  if (!originalStack && report.stack) {
    try {
      originalStack = await resolveOriginalStack(report.stack);
    } catch {
      // Remapping is best-effort.
    }
  }

  _queue.push({
    ...report,
    source: report.source ?? 'web',
    originalStack,
    release: report.release ?? appRelease(),
    url: report.url ?? (typeof window !== 'undefined' ? window.location.href : undefined),
    userAgent:
      report.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
  });

  if (options.flush === 'immediate') {
    await flushClientErrors();
    return;
  }
  scheduleFlush();
}

export async function flushClientErrors(): Promise<void> {
  if (_queue.length === 0) return;
  const batch = _queue.splice(0, 5);
  for (const item of batch) {
    await sendClientErrorItem(item);
  }
  if (_queue.length > 0) scheduleFlush();
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (_queue.length === 0) return;
    const pending = _queue.splice(0, _queue.length);
    for (const item of pending) {
      void postClientErrorKeepalive(item);
    }
  });
}

/** Test helper */
export function resetClientTelemetryForTests(): void {
  _queue = [];
  if (_flushTimer) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }
  _warnedPostFailure = false;
}
