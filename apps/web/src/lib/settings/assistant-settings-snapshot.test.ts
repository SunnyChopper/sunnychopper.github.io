import { describe, expect, it } from 'vitest';
import {
  assistantSettingsSnapshotsEqual,
  buildAssistantSettingsSnapshot,
} from '@/lib/settings/assistant-settings-snapshot';

describe('assistant-settings-snapshot', () => {
  const baseDraft = {
    mode: 'auto' as const,
    reasoningModelId: 'openai:a',
    responseModelId: 'openai:b',
    optimizeFor: 'intelligence' as const,
    compactionMode: 'auto' as const,
  };

  it('sorts dangerousTools for stable comparison', () => {
    const a = buildAssistantSettingsSnapshot({
      mode: 'dangerousOnly',
      dangerousSet: new Set(['z-tool', 'a-tool']),
      deniedReadSet: new Set(),
      memProvider: 'groq',
      memModel: 'm1',
      memFactCriteria: { alwaysCapture: [], neverCapture: [] },
      defaultModelsDraft: baseDraft,
    });
    const b = buildAssistantSettingsSnapshot({
      mode: 'dangerousOnly',
      dangerousSet: new Set(['a-tool', 'z-tool']),
      deniedReadSet: new Set(),
      memProvider: 'groq',
      memModel: 'm1',
      memFactCriteria: { alwaysCapture: [], neverCapture: [] },
      defaultModelsDraft: baseDraft,
    });
    expect(assistantSettingsSnapshotsEqual(a, b)).toBe(true);
  });

  it('normalizes fact criteria lists before compare', () => {
    const a = buildAssistantSettingsSnapshot({
      mode: 'dangerousOnly',
      dangerousSet: new Set(),
      deniedReadSet: new Set(),
      memProvider: 'groq',
      memModel: 'm1',
      memFactCriteria: { alwaysCapture: ['  Foo  '], neverCapture: [] },
      defaultModelsDraft: baseDraft,
    });
    const b = buildAssistantSettingsSnapshot({
      mode: 'dangerousOnly',
      dangerousSet: new Set(),
      deniedReadSet: new Set(),
      memProvider: 'groq',
      memModel: 'm1',
      memFactCriteria: { alwaysCapture: ['Foo'], neverCapture: [] },
      defaultModelsDraft: baseDraft,
    });
    expect(assistantSettingsSnapshotsEqual(a, b)).toBe(true);
  });

  it('detects mode and draft changes', () => {
    const baseline = buildAssistantSettingsSnapshot({
      mode: 'dangerousOnly',
      dangerousSet: new Set(),
      deniedReadSet: new Set(),
      memProvider: 'groq',
      memModel: 'm1',
      memFactCriteria: { alwaysCapture: [], neverCapture: [] },
      defaultModelsDraft: baseDraft,
    });
    const edited = buildAssistantSettingsSnapshot({
      mode: 'allWrites',
      dangerousSet: new Set(),
      deniedReadSet: new Set(),
      memProvider: 'groq',
      memModel: 'm1',
      memFactCriteria: { alwaysCapture: [], neverCapture: [] },
      defaultModelsDraft: baseDraft,
    });
    expect(assistantSettingsSnapshotsEqual(baseline, edited)).toBe(false);
  });
});
