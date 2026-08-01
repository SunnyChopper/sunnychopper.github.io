import { describe, expect, it } from 'vitest';
import {
  nextMarkedThreadReadId,
  shouldScheduleMarkThreadRead,
} from '@/hooks/chatbot/mark-thread-read-guard';

describe('mark-thread-read-guard', () => {
  describe('shouldScheduleMarkThreadRead', () => {
    it('returns false when threadId is undefined', () => {
      expect(shouldScheduleMarkThreadRead(undefined, null)).toBe(false);
      expect(shouldScheduleMarkThreadRead(undefined, 'thread-1')).toBe(false);
    });

    it('returns false when the thread was already marked', () => {
      expect(shouldScheduleMarkThreadRead('thread-1', 'thread-1')).toBe(false);
    });

    it('returns true for a new server thread id', () => {
      expect(shouldScheduleMarkThreadRead('thread-2', 'thread-1')).toBe(true);
      expect(shouldScheduleMarkThreadRead('thread-1', null)).toBe(true);
    });
  });

  describe('nextMarkedThreadReadId', () => {
    it('clears the marked id when leaving a server thread', () => {
      expect(nextMarkedThreadReadId(undefined, 'thread-1')).toBeNull();
    });

    it('keeps the marked id when the same thread is already scheduled', () => {
      expect(nextMarkedThreadReadId('thread-1', 'thread-1')).toBe('thread-1');
    });

    it('advances the marked id when switching threads', () => {
      expect(nextMarkedThreadReadId('thread-2', 'thread-1')).toBe('thread-2');
    });

    it('allows re-scheduling after leaving and returning to a thread', () => {
      expect(nextMarkedThreadReadId(undefined, 'thread-1')).toBeNull();
      expect(nextMarkedThreadReadId('thread-1', null)).toBe('thread-1');
    });
  });
});
