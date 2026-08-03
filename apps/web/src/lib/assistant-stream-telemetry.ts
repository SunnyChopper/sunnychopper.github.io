/**
 * Report handled assistant streaming / WebSocket UX errors to the alert pipeline.
 * Global window.onerror does not see these — they are caught and shown in UI only.
 */
import type { WsRunErrorPayload } from '@/types/chatbot';
import { reportClientError } from '@/lib/client-telemetry';

const SKIP_CODES = new Set(['SESSION_EXPIRED']);

const REPORTABLE_CONNECTION_CODES = new Set([
  'WS_BACKEND_REJECTED',
  'WS_NETWORK_FAILURE',
  'CONNECTION_FAILED',
]);

const THROTTLE_MS = 60_000;
const lastReportedAt = new Map<string, number>();

function normalizeForThrottle(message: string): string {
  return message.replace(/\s+/g, ' ').trim().slice(0, 200);
}

function throttleKey(code: string, message: string): string {
  return `${code}|${normalizeForThrottle(message)}`;
}

function shouldThrottle(code: string, message: string): boolean {
  const key = throttleKey(code, message);
  const now = Date.now();
  const last = lastReportedAt.get(key) ?? 0;
  if (now - last < THROTTLE_MS) {
    return true;
  }
  lastReportedAt.set(key, now);
  return false;
}

export function isReportableAssistantStreamCode(code: string | undefined): boolean {
  if (!code || SKIP_CODES.has(code)) {
    return false;
  }
  if (REPORTABLE_CONNECTION_CODES.has(code)) {
    return true;
  }
  // Server runError payloads (non-connection run ids) — report unless skipped above.
  return true;
}

export type AssistantStreamErrorReport = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  threadId?: string;
  runId?: string;
  stack?: string;
};

export function reportAssistantStreamError(report: AssistantStreamErrorReport): void {
  const code = report.code ?? 'UNKNOWN';
  if (!isReportableAssistantStreamCode(code)) {
    return;
  }
  if (shouldThrottle(code, report.message)) {
    return;
  }

  void reportClientError({
    message: report.message,
    source: 'web',
    stack: report.stack,
    metadata: {
      kind: 'assistant-stream',
      code,
      threadId: report.threadId,
      runId: report.runId,
      details: report.details,
    },
  });
}

/**
 * Report from a WsRunErrorPayload after setError in useAssistantStreaming.
 * Skips partial runs that already streamed assistant content.
 */
export function reportAssistantStreamErrorFromWsPayload(
  payload: WsRunErrorPayload,
  options: { hadStreamedAssistant?: boolean } = {}
): void {
  if (options.hadStreamedAssistant) {
    return;
  }
  reportAssistantStreamError({
    message: payload.message,
    code: payload.code,
    details: payload.details,
    threadId: payload.threadId,
    runId: payload.runId,
  });
}

/** @internal test helper */
export function resetAssistantStreamTelemetryThrottleForTests(): void {
  lastReportedAt.clear();
}
