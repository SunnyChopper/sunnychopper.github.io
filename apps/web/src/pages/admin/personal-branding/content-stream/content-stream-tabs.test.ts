import { describe, expect, it } from 'vitest';

const VALID_TAB_IDS = new Set(['x-short-posts', 'settings']);

function resolveTabId(raw: string | null): 'x-short-posts' | 'settings' {
  if (raw && VALID_TAB_IDS.has(raw)) {
    return raw as 'x-short-posts' | 'settings';
  }
  return 'x-short-posts';
}

describe('ContentStream tab URL sync', () => {
  it('defaults to x-short-posts', () => {
    expect(resolveTabId(null)).toBe('x-short-posts');
  });

  it('accepts settings tab', () => {
    expect(resolveTabId('settings')).toBe('settings');
  });

  it('rejects unknown tabs', () => {
    expect(resolveTabId('unknown')).toBe('x-short-posts');
  });
});
