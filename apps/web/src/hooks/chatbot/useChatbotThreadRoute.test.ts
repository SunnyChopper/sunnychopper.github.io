import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { NavigateFunction } from 'react-router-dom';
import { useChatbotThreadRoute } from '@/hooks/chatbot/useChatbotThreadRoute';
import type { ChatThread } from '@/types/chatbot';

function makeThread(id: string): ChatThread {
  const now = new Date().toISOString();
  return {
    id,
    userId: 'user-1',
    title: `Thread ${id}`,
    createdAt: now,
    updatedAt: now,
  };
}

describe('useChatbotThreadRoute', () => {
  it('toasts and navigates when route thread id is missing from the list', async () => {
    const threads = [makeThread('thread-a'), makeThread('thread-b')];
    const navigate = vi.fn() as unknown as NavigateFunction;
    const showToast = vi.fn();

    renderHook(() =>
      useChatbotThreadRoute({
        routeThreadId: 'missing-thread',
        threads,
        navigate,
        showToast,
        userId: 'user-1',
      })
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/admin/assistant/thread-a', { replace: true });
    });
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Chat not found',
      message: 'That chat link is no longer available. Opening your latest chat instead.',
    });
  });

  it('navigates without toast when suppress id matches the missing route thread', async () => {
    const threads = [makeThread('thread-a'), makeThread('thread-b')];
    const navigate = vi.fn() as unknown as NavigateFunction;
    const showToast = vi.fn();

    renderHook(() =>
      useChatbotThreadRoute({
        routeThreadId: 'deleted-thread',
        threads,
        navigate,
        showToast,
        userId: 'user-1',
        suppressInvalidToastThreadId: 'deleted-thread',
      })
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/admin/assistant/thread-a', { replace: true });
    });
    expect(showToast).not.toHaveBeenCalled();
  });

  it('does not toast when route thread exists in the list', async () => {
    const threads = [makeThread('thread-a'), makeThread('thread-b')];
    const navigate = vi.fn() as unknown as NavigateFunction;
    const showToast = vi.fn();

    renderHook(() =>
      useChatbotThreadRoute({
        routeThreadId: 'thread-b',
        threads,
        navigate,
        showToast,
        userId: 'user-1',
      })
    );

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
    expect(showToast).not.toHaveBeenCalled();
  });
});
