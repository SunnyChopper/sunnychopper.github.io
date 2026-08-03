import type { ModelPickerDraft } from '@/lib/assistant/run-config-picker-draft';
import { normalizeFactCriteria } from '@/lib/settings/assistantMemoryIngestionFactCriteria';
import type {
  AssistantMemoryIngestionFactCriteria,
  AssistantToolApprovalMode,
} from '@/types/api-contracts';

export type AssistantSettingsSnapshot = {
  mode: AssistantToolApprovalMode;
  dangerousTools: string[];
  deniedReadTools: string[];
  memProvider: string;
  memModel: string;
  factCriteria: AssistantMemoryIngestionFactCriteria;
  defaultModelsDraft: ModelPickerDraft;
};

export function buildAssistantSettingsSnapshot(params: {
  mode: AssistantToolApprovalMode;
  dangerousSet: Set<string>;
  deniedReadSet: Set<string>;
  memProvider: string;
  memModel: string;
  memFactCriteria: AssistantMemoryIngestionFactCriteria;
  defaultModelsDraft: ModelPickerDraft;
}): AssistantSettingsSnapshot {
  return {
    mode: params.mode,
    dangerousTools: [...params.dangerousSet].sort(),
    deniedReadTools: [...params.deniedReadSet].sort(),
    memProvider: params.memProvider,
    memModel: params.memModel,
    factCriteria: normalizeFactCriteria(params.memFactCriteria),
    defaultModelsDraft: { ...params.defaultModelsDraft },
  };
}

function stableSnapshotJson(snapshot: AssistantSettingsSnapshot): string {
  const normalized: AssistantSettingsSnapshot = {
    ...snapshot,
    dangerousTools: [...snapshot.dangerousTools].sort(),
    deniedReadTools: [...snapshot.deniedReadTools].sort(),
    factCriteria: normalizeFactCriteria(snapshot.factCriteria),
    defaultModelsDraft: { ...snapshot.defaultModelsDraft },
  };
  return JSON.stringify(normalized);
}

export function assistantSettingsSnapshotsEqual(
  a: AssistantSettingsSnapshot,
  b: AssistantSettingsSnapshot
): boolean {
  return stableSnapshotJson(a) === stableSnapshotJson(b);
}
