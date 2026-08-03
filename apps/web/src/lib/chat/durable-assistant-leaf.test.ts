import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '@/types/chatbot';
import {
  isDurableAssistantMessageId,
  isDurableContextUsageLeaf,
  resolveDurableContextUsageLeaf,
} from './durable-assistant-leaf';

describe('durable-assistant-leaf', () => {
  it('accepts msg- ids and rejects client optimistic ids', () => {
    expect(isDurableAssistantMessageId('msg-01kyrtkxdsf1j28188nacjwswp')).toBe(true);
    expect(isDurableAssistantMessageId('client-user-abc')).toBe(false);
    expect(isDurableAssistantMessageId('client-123')).toBe(false);
    expect(isDurableAssistantMessageId(null)).toBe(false);
  });

  it('rejects sending clientStatus even when id looks durable', () => {
    const nodeById = new Map<string, ChatMessage>([
      [
        'msg-1',
        {
          id: 'msg-1',
          threadId: 'thread-1',
          role: 'user',
          content: 'hi',
          createdAt: '2026-01-01T00:00:00.000Z',
          clientStatus: 'sending',
        },
      ],
    ]);
    expect(isDurableContextUsageLeaf('msg-1', nodeById)).toBe(false);
  });

  it('resolveDurableContextUsageLeaf prefers selected when durable', () => {
    const leaf = resolveDurableContextUsageLeaf('msg-selected', 'msg-active', undefined);
    expect(leaf).toBe('msg-selected');
  });

  it('resolveDurableContextUsageLeaf falls back to active when selected is optimistic', () => {
    const leaf = resolveDurableContextUsageLeaf('client-user-1', 'msg-active', undefined);
    expect(leaf).toBe('msg-active');
  });

  it('resolveDurableContextUsageLeaf returns null when neither leaf is durable', () => {
    expect(resolveDurableContextUsageLeaf('client-user-1', null, undefined)).toBe(null);
  });
});
