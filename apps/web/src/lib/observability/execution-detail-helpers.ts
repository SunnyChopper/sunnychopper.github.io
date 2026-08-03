import type { ObservabilityExecutionDetail } from '@/types/observability';

export function isExecutionFailure(status: string): boolean {
  return status !== 'succeeded';
}

export function getRawPayloadEntries(detail: ObservabilityExecutionDetail) {
  const entries: { label: string; data: unknown }[] = [];
  if (detail.promptPayloadJson != null) {
    entries.push({ label: 'promptPayloadJson', data: detail.promptPayloadJson });
  }
  if (detail.requestMetadataJson != null) {
    entries.push({ label: 'requestMetadataJson', data: detail.requestMetadataJson });
  }
  if (detail.retryPayloadJson != null) {
    entries.push({ label: 'retryPayloadJson', data: detail.retryPayloadJson });
  }
  if (detail.pricingSnapshotJson != null) {
    entries.push({ label: 'pricingSnapshotJson', data: detail.pricingSnapshotJson });
  }
  return entries;
}

export function hasFailureDetails(detail: ObservabilityExecutionDetail): boolean {
  return Boolean(
    detail.errorMessage?.trim() || detail.stackTrace?.trim() || detail.partialResponseText?.trim()
  );
}

export function getTraceSummary(detail: ObservabilityExecutionDetail): string {
  return detail.threadId ?? detail.runId ?? detail.requestId ?? 'IDs';
}
