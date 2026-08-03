import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useMarkdownCollapseState } from './useMarkdownCollapseState';

describe('useMarkdownCollapseState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('collapseAll collapses the provided heading ids', () => {
    const { result } = renderHook(() => useMarkdownCollapseState('test-doc.md'));

    act(() => {
      result.current.collapseAll(['heading-1', 'heading-2']);
    });

    expect(result.current.collapsedHeadings.has('heading-1')).toBe(true);
    expect(result.current.collapsedHeadings.has('heading-2')).toBe(true);
    expect(result.current.collapsedHeadings.size).toBe(2);
  });

  it('resetState expands all headings', () => {
    const { result } = renderHook(() => useMarkdownCollapseState('test-doc.md'));

    act(() => {
      result.current.collapseAll(['heading-1']);
    });
    act(() => {
      result.current.resetState();
    });

    expect(result.current.collapsedHeadings.size).toBe(0);
  });
});
