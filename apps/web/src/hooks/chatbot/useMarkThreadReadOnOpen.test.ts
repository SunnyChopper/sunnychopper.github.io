import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMarkThreadReadOnOpen } from '@/hooks/chatbot/useMarkThreadReadOnOpen';

describe('useMarkThreadReadOnOpen', () => {
  it('marks the thread once when the parent re-renders with the same threadId', () => {
    const markThreadRead = vi.fn();

    const { rerender } = renderHook(
      ({ threadId }) => useMarkThreadReadOnOpen(threadId, markThreadRead),
      { initialProps: { threadId: 'thread-abc' } },
    );

    expect(markThreadRead).toHaveBeenCalledTimes(1);
    expect(markThreadRead).toHaveBeenCalledWith('thread-abc');

    rerender({ threadId: 'thread-abc' });
    rerender({ threadId: 'thread-abc' });

    expect(markThreadRead).toHaveBeenCalledTimes(1);
  });

  it('marks a new thread when threadId changes', () => {
    const markThreadRead = vi.fn();

    const { rerender } = renderHook(
      ({ threadId }) => useMarkThreadReadOnOpen(threadId, markThreadRead),
      { initialProps: { threadId: 'thread-abc' } },
    );

    rerender({ threadId: 'thread-def' });

    expect(markThreadRead).toHaveBeenCalledTimes(2);
    expect(markThreadRead).toHaveBeenNthCalledWith(1, 'thread-abc');
    expect(markThreadRead).toHaveBeenNthCalledWith(2, 'thread-def');
  });

  it('does not mark when threadId is undefined', () => {
    const markThreadRead = vi.fn();

    renderHook(() => useMarkThreadReadOnOpen(undefined, markThreadRead));

    expect(markThreadRead).not.toHaveBeenCalled();
  });

  it('marks again after leaving and returning to the same thread', () => {
    const markThreadRead = vi.fn();

    const { rerender } = renderHook(
      ({ threadId }) => useMarkThreadReadOnOpen(threadId, markThreadRead),
      { initialProps: { threadId: 'thread-abc' as string | undefined } },
    );

    expect(markThreadRead).toHaveBeenCalledTimes(1);

    rerender({ threadId: undefined });
    rerender({ threadId: 'thread-abc' });

    expect(markThreadRead).toHaveBeenCalledTimes(2);
  });
});
