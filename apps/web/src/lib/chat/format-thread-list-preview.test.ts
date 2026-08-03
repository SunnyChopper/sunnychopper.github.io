import { describe, expect, it } from 'vitest';
import { formatThreadListPreview } from '@/lib/chat/format-thread-list-preview';

describe('formatThreadListPreview', () => {
  it('prefixes user messages with You:', () => {
    expect(formatThreadListPreview('user', 'Hello there')).toBe('You: Hello there');
  });

  it('prefixes assistant messages with AI:', () => {
    expect(formatThreadListPreview('assistant', '**Hi**')).toBe('AI: Hi');
  });

  it('returns undefined for empty preview', () => {
    expect(formatThreadListPreview(undefined, undefined)).toBeUndefined();
    expect(formatThreadListPreview('user', '   ')).toBeUndefined();
  });
});
