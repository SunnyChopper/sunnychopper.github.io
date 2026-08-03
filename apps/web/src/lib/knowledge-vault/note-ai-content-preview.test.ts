import { describe, expect, it } from 'vitest';

import {
  extractProposedContent,
  isNoteEditorEmpty,
  noteAiContentPreviewTitle,
  noteAiContentSuccessMessage,
  shouldGateNoteAiContentWrite,
} from '@/lib/knowledge-vault/note-ai-content-preview';

describe('isNoteEditorEmpty', () => {
  it('treats whitespace-only as empty', () => {
    expect(isNoteEditorEmpty('')).toBe(true);
    expect(isNoteEditorEmpty('   \n\t  ')).toBe(true);
  });

  it('treats non-whitespace as non-empty', () => {
    expect(isNoteEditorEmpty('hello')).toBe(false);
    expect(isNoteEditorEmpty('  x  ')).toBe(false);
  });
});

describe('shouldGateNoteAiContentWrite', () => {
  it('gates content actions when editor is non-empty', () => {
    expect(shouldGateNoteAiContentWrite('expand', 'existing')).toBe(true);
    expect(shouldGateNoteAiContentWrite('summarize', 'existing')).toBe(true);
    expect(shouldGateNoteAiContentWrite('improve', 'existing')).toBe(true);
    expect(shouldGateNoteAiContentWrite('generate', 'existing')).toBe(true);
  });

  it('does not gate generate when editor is empty', () => {
    expect(shouldGateNoteAiContentWrite('generate', '')).toBe(false);
    expect(shouldGateNoteAiContentWrite('generate', '  ')).toBe(false);
  });
});

describe('extractProposedContent', () => {
  it('maps each action to the correct field', () => {
    expect(
      extractProposedContent('expand', {
        expandedContent: 'expanded',
        addedSections: [],
        improvements: [],
        confidence: 0.9,
      })
    ).toBe('expanded');

    expect(
      extractProposedContent('summarize', {
        summary: 'short',
        keyPoints: [],
        wordCount: 10,
        summaryWordCount: 3,
        confidence: 0.9,
      })
    ).toBe('short');

    expect(
      extractProposedContent('improve', {
        improvedContent: 'clearer',
        changes: [],
        confidence: 0.9,
      })
    ).toBe('clearer');

    expect(
      extractProposedContent('generate', {
        generatedContent: 'new body',
        structure: [],
        keyTopics: [],
        confidence: 0.9,
      })
    ).toBe('new body');
  });
});

describe('noteAiContentPreviewTitle', () => {
  it('returns action-specific titles', () => {
    expect(noteAiContentPreviewTitle('expand')).toBe('Review expanded content');
    expect(noteAiContentPreviewTitle('generate')).toBe('Review generated content');
  });
});

describe('noteAiContentSuccessMessage', () => {
  it('returns summarize word counts when data provided', () => {
    expect(
      noteAiContentSuccessMessage('summarize', {
        summary: 's',
        keyPoints: [],
        wordCount: 100,
        summaryWordCount: 20,
        confidence: 0.9,
      })
    ).toBe('Summarized from 100 to 20 words');
  });

  it('returns improve change count when data provided', () => {
    expect(
      noteAiContentSuccessMessage('improve', {
        improvedContent: 'x',
        changes: [{ type: 'grammar', description: 'fix' }],
        confidence: 0.9,
      })
    ).toBe('Improved with 1 changes');
  });
});
