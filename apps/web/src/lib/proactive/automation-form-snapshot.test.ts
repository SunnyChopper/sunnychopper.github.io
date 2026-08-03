import { describe, expect, it } from 'vitest';
import {
  automationFormSnapshotsEqual,
  buildAutomationFormSnapshot,
} from '@/lib/proactive/automation-form-snapshot';
import { modelPickerDraftFromRunConfig } from '@/lib/assistant/run-config-picker-draft';

describe('automation-form-snapshot', () => {
  const baseDraft = modelPickerDraftFromRunConfig(null, null);

  it('detects dirty when title changes', () => {
    const baseline = buildAutomationFormSnapshot({
      kind: 'dailyBriefing',
      localTime: '08:00',
      timeZone: 'America/Chicago',
      customUserPrompt: '',
      threadStrategy: 'reuseFixedThread',
      channelEmailEnabled: true,
      channelWebhookEnabled: false,
      title: '',
      daysOfWeek: [],
      modelDraft: baseDraft,
    });
    const current = buildAutomationFormSnapshot({
      ...baseline,
      title: 'Morning',
    });
    expect(automationFormSnapshotsEqual(baseline, current)).toBe(false);
  });

  it('treats trimmed strings as equal', () => {
    const a = buildAutomationFormSnapshot({
      kind: 'custom',
      localTime: '08:00',
      timeZone: 'America/Chicago',
      customUserPrompt: ' prompt ',
      threadStrategy: 'reuseFixedThread',
      channelEmailEnabled: true,
      channelWebhookEnabled: false,
      title: ' Title ',
      daysOfWeek: [1, 0],
      modelDraft: baseDraft,
    });
    const b = buildAutomationFormSnapshot({
      kind: 'custom',
      localTime: '08:00',
      timeZone: 'America/Chicago',
      customUserPrompt: 'prompt',
      threadStrategy: 'reuseFixedThread',
      channelEmailEnabled: true,
      channelWebhookEnabled: false,
      title: 'Title',
      daysOfWeek: [0, 1],
      modelDraft: baseDraft,
    });
    expect(automationFormSnapshotsEqual(a, b)).toBe(true);
  });
});
