import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  queryLogger: {
    warn: vi.fn(),
  },
}));

vi.mock('@/services/assistant-unread.service', () => ({
  assistantUnreadService: {
    markThreadRead: vi.fn(),
  },
}));

import { queryLogger } from '@/lib/logger';
import { markAssistantThreadReadBestEffort } from '@/hooks/chatbot/useAssistantUnreadSummary';
import { assistantUnreadService } from '@/services/assistant-unread.service';

describe('markAssistantThreadReadBestEffort', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the service payload on success', async () => {
    vi.mocked(assistantUnreadService.markThreadRead).mockResolvedValue({
      threadId: 'thread-1',
      unreadCount: 0,
    });

    await expect(markAssistantThreadReadBestEffort('thread-1')).resolves.toEqual({
      threadId: 'thread-1',
      unreadCount: 0,
    });
  });

  it('soft-fails timeout-shaped errors without rethrowing', async () => {
    vi.mocked(assistantUnreadService.markThreadRead).mockRejectedValue(
      new Error('Request timed out. The server may be slow or unavailable.')
    );

    await expect(markAssistantThreadReadBestEffort('thread-1')).resolves.toBeNull();
    expect(queryLogger.warn).toHaveBeenCalledWith(
      'markThreadRead failed (best-effort)',
      expect.objectContaining({
        threadId: 'thread-1',
        error: 'Request timed out. The server may be slow or unavailable.',
      })
    );
  });
});
