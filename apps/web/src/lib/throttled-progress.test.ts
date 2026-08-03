import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createMinIntervalProgress } from '@/lib/throttled-progress';

describe('createMinIntervalProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits 0 immediately on creation', () => {
    const onProgress = vi.fn();
    const reporter = createMinIntervalProgress(onProgress, 200);
    expect(onProgress).toHaveBeenCalledWith(0);
    reporter.dispose();
  });

  it('coalesces updates to min interval', () => {
    const onProgress = vi.fn();
    const reporter = createMinIntervalProgress(onProgress, 200);
    onProgress.mockClear();

    reporter.report(10);
    reporter.report(25);
    reporter.report(50);
    expect(onProgress).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(onProgress).toHaveBeenCalledWith(50);

    reporter.dispose();
  });

  it('always emits 100 on complete', () => {
    const onProgress = vi.fn();
    const reporter = createMinIntervalProgress(onProgress, 200);
    reporter.report(90);
    reporter.complete();
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it('stops interval on dispose', () => {
    const onProgress = vi.fn();
    const reporter = createMinIntervalProgress(onProgress, 200);
    onProgress.mockClear();
    reporter.report(40);
    reporter.dispose();
    vi.advanceTimersByTime(400);
    expect(onProgress).not.toHaveBeenCalled();
  });
});
