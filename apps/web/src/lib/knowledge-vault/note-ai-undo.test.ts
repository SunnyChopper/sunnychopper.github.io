import { describe, expect, it, vi } from 'vitest';

import {
  applyNoteAISnapshot,
  createNoteAISnapshot,
  isUndoableContentAction,
  NOTE_AI_UNDO_TOAST_DURATION_MS,
  shouldOfferUndoToast,
} from '@/lib/knowledge-vault/note-ai-undo';

describe('note-ai-undo helpers', () => {
  it('uses 15 second undo toast duration', () => {
    expect(NOTE_AI_UNDO_TOAST_DURATION_MS).toBe(15_000);
  });

  it('identifies undoable content actions', () => {
    expect(isUndoableContentAction('expand')).toBe(true);
    expect(isUndoableContentAction('summarize')).toBe(true);
    expect(isUndoableContentAction('improve')).toBe(true);
    expect(isUndoableContentAction('generate')).toBe(true);
    expect(isUndoableContentAction('suggestTags')).toBe(false);
    expect(isUndoableContentAction('suggestArea')).toBe(false);
    expect(isUndoableContentAction('analyze')).toBe(false);
  });

  it('creates content snapshot for content mutators', () => {
    expect(createNoteAISnapshot('expand', 'before', ['tag'])).toEqual({ content: 'before' });
    expect(createNoteAISnapshot('summarize', 'before', [])).toEqual({ content: 'before' });
    expect(createNoteAISnapshot('improve', 'before', [])).toEqual({ content: 'before' });
    expect(createNoteAISnapshot('generate', 'before', [])).toEqual({ content: 'before' });
  });

  it('creates tags snapshot for suggest tags', () => {
    expect(createNoteAISnapshot('suggestTags', 'body', ['a', 'b'])).toEqual({
      tags: ['a', 'b'],
    });
  });

  it('returns null snapshot for non-undoable actions', () => {
    expect(createNoteAISnapshot('suggestArea', 'body', [])).toBeNull();
    expect(createNoteAISnapshot('analyze', 'body', [])).toBeNull();
  });

  it('offers undo toast only for mutating successes', () => {
    expect(shouldOfferUndoToast('expand')).toBe(true);
    expect(shouldOfferUndoToast('summarize')).toBe(true);
    expect(shouldOfferUndoToast('improve')).toBe(true);
    expect(shouldOfferUndoToast('generate')).toBe(true);
    expect(shouldOfferUndoToast('suggestTags', 0)).toBe(false);
    expect(shouldOfferUndoToast('suggestTags', 2)).toBe(true);
    expect(shouldOfferUndoToast('suggestArea')).toBe(false);
    expect(shouldOfferUndoToast('analyze')).toBe(false);
  });

  it('applies snapshot via parent callbacks', () => {
    const onContentChange = vi.fn();
    const onTagsChange = vi.fn();

    applyNoteAISnapshot({ content: 'restored' }, onContentChange, onTagsChange);
    expect(onContentChange).toHaveBeenCalledWith('restored');
    expect(onTagsChange).not.toHaveBeenCalled();

    applyNoteAISnapshot({ tags: ['x'] }, onContentChange, onTagsChange);
    expect(onTagsChange).toHaveBeenCalledWith(['x']);
  });
});
