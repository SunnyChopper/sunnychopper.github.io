import type { ModelPickerDraft } from '@/lib/assistant/run-config-picker-draft';
import type { ProactiveAutomationKind, ProactiveThreadStrategy } from '@/types/api-contracts';

export type AutomationFormSnapshot = {
  kind: ProactiveAutomationKind;
  localTime: string;
  timeZone: string;
  customUserPrompt: string;
  threadStrategy: ProactiveThreadStrategy;
  channelEmailEnabled: boolean;
  channelWebhookEnabled: boolean;
  title: string;
  daysOfWeek: number[];
  modelDraft: ModelPickerDraft;
};

function stableSnapshotJson(snapshot: AutomationFormSnapshot): string {
  const normalized: AutomationFormSnapshot = {
    ...snapshot,
    title: snapshot.title.trim(),
    customUserPrompt: snapshot.customUserPrompt.trim(),
    localTime: snapshot.localTime.trim(),
    daysOfWeek: [...snapshot.daysOfWeek].sort((a, b) => a - b),
    modelDraft: { ...snapshot.modelDraft },
  };
  return JSON.stringify(normalized);
}

export function automationFormSnapshotsEqual(
  a: AutomationFormSnapshot,
  b: AutomationFormSnapshot
): boolean {
  return stableSnapshotJson(a) === stableSnapshotJson(b);
}

export function buildAutomationFormSnapshot(params: {
  kind: ProactiveAutomationKind;
  localTime: string;
  timeZone: string;
  customUserPrompt: string;
  threadStrategy: ProactiveThreadStrategy;
  channelEmailEnabled: boolean;
  channelWebhookEnabled: boolean;
  title: string;
  daysOfWeek: number[];
  modelDraft: ModelPickerDraft;
}): AutomationFormSnapshot {
  return {
    kind: params.kind,
    localTime: params.localTime,
    timeZone: params.timeZone,
    customUserPrompt: params.customUserPrompt,
    threadStrategy: params.threadStrategy,
    channelEmailEnabled: params.channelEmailEnabled,
    channelWebhookEnabled: params.channelWebhookEnabled,
    title: params.title,
    daysOfWeek: [...params.daysOfWeek],
    modelDraft: { ...params.modelDraft },
  };
}
