import { afterEach, describe, expect, it } from 'vitest';
import {
  ENTITY_EXPLAIN_INSET_VAR,
  ENTITY_EXPLAIN_PANEL_WIDTH,
  applyEntityExplainDesktopInset,
} from '@/lib/entity-explain/panel-inset';

describe('applyEntityExplainDesktopInset', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(ENTITY_EXPLAIN_INSET_VAR);
  });

  it('sets inset width on large viewports', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('1024px'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });

    const cleanup = applyEntityExplainDesktopInset();
    expect(document.documentElement.style.getPropertyValue(ENTITY_EXPLAIN_INSET_VAR)).toBe(
      ENTITY_EXPLAIN_PANEL_WIDTH
    );
    cleanup();
    expect(document.documentElement.style.getPropertyValue(ENTITY_EXPLAIN_INSET_VAR)).toBe('');
  });

  it('clears inset on small viewports', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });

    const cleanup = applyEntityExplainDesktopInset();
    expect(document.documentElement.style.getPropertyValue(ENTITY_EXPLAIN_INSET_VAR)).toBe('0px');
    cleanup();
  });
});
