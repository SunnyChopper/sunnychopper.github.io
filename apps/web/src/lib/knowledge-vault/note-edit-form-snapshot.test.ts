import { describe, expect, it } from 'vitest';
import {
  buildNoteEditFormSnapshot,
  buildNoteEditFormSnapshotFromNote,
  listDirtyNoteEditFields,
  noteEditFormSnapshotsEqual,
} from '@/lib/knowledge-vault/note-edit-form-snapshot';
import type { Note } from '@/types/knowledge-vault';

describe('note-edit-form-snapshot', () => {
  const base = buildNoteEditFormSnapshot({
    title: 'Observability',
    content: '# Logging\n\nDetails here',
    area: 'Operations',
    sourceUrl: 'https://example.com',
    tags: ['ops', 'metrics'],
    linkedItems: ['note-2', 'note-1'],
  });

  it('detects dirty when content changes', () => {
    const current = buildNoteEditFormSnapshot({
      ...base,
      content: '# Logging\n\nUpdated details',
    });
    expect(noteEditFormSnapshotsEqual(base, current)).toBe(false);
    expect(listDirtyNoteEditFields(base, current)).toEqual([{ key: 'content', label: 'Content' }]);
  });

  it('lists metadata-only dirty fields', () => {
    const current = buildNoteEditFormSnapshot({
      ...base,
      area: 'Health',
      sourceUrl: '',
    });
    expect(listDirtyNoteEditFields(base, current)).toEqual([
      { key: 'area', label: 'Area' },
      { key: 'sourceUrl', label: 'Source URL' },
    ]);
  });

  it('treats trimmed strings as equal', () => {
    const a = buildNoteEditFormSnapshot({
      ...base,
      title: ' Title ',
      content: ' Body ',
      sourceUrl: ' https://example.com ',
    });
    const b = buildNoteEditFormSnapshot({
      ...base,
      title: 'Title',
      content: 'Body',
      sourceUrl: 'https://example.com',
    });
    expect(noteEditFormSnapshotsEqual(a, b)).toBe(true);
  });

  it('sorts tags and linked items for stable compare', () => {
    const a = buildNoteEditFormSnapshot({
      ...base,
      tags: ['metrics', 'ops'],
      linkedItems: ['note-2', 'note-1'],
    });
    const b = buildNoteEditFormSnapshot({
      ...base,
      tags: ['ops', 'metrics'],
      linkedItems: ['note-1', 'note-2'],
    });
    expect(noteEditFormSnapshotsEqual(a, b)).toBe(true);
  });

  it('builds snapshot from note with defaults', () => {
    const note = {
      id: 'note-1',
      type: 'note',
      title: 'Draft',
      content: 'Body',
      area: 'Operations',
      status: 'active',
      searchableText: 'draft body',
      userId: 'user-1',
      sourceUrl: null,
      tags: [],
      linkedItems: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      lastAccessedAt: null,
    } as Note;

    expect(buildNoteEditFormSnapshotFromNote(note)).toEqual(
      buildNoteEditFormSnapshot({
        title: 'Draft',
        content: 'Body',
        area: 'Operations',
        sourceUrl: '',
        tags: [],
        linkedItems: [],
      })
    );
  });
});
