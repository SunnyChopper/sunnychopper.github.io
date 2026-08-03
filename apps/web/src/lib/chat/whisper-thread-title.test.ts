import { describe, expect, it } from 'vitest';

import {
  buildWhisperThreadTitle,
  resolveThreadListBadge,
  resolveThreadTitleDisplay,
  toTitleCase,
} from '@/lib/chat/whisper-thread-title';

describe('whisper-thread-title', () => {
  it('title-cases words and caps whisper thread title length', () => {
    expect(toTitleCase('strict plan requested')).toBe('Strict Plan Requested');
    expect(buildWhisperThreadTitle('recovery is low today')).toBe('Recovery Is Low Today');
    expect(buildWhisperThreadTitle('a'.repeat(50))).toHaveLength(40);
  });

  it('normalizes legacy whisper-prefixed titles for display', () => {
    const result = resolveThreadTitleDisplay({
      title: 'Whisper: strict plan requested',
      whisperOriginated: false,
    });
    expect(result.displayTitle).toBe('Strict Plan Requested');
    expect(result.showWhisperBadge).toBe(true);
  });

  it('shows whisper badge for flagged threads without legacy prefix', () => {
    const result = resolveThreadTitleDisplay({
      title: 'Recovery Is Low',
      whisperOriginated: true,
    });
    expect(result.displayTitle).toBe('Recovery Is Low');
    expect(result.showWhisperBadge).toBe(true);
  });

  it('prefers whisper badge over auto when both flags are set', () => {
    expect(
      resolveThreadListBadge({
        title: 'Strict Plan Requested',
        whisperOriginated: true,
        automationOriginated: true,
      })
    ).toBe('Whisper');
  });

  it('shows auto badge for automation threads only', () => {
    expect(
      resolveThreadListBadge({
        title: 'Evening Logbook',
        whisperOriginated: false,
        automationOriginated: true,
      })
    ).toBe('Auto');
  });
});
