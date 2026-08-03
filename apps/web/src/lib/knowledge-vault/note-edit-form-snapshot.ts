import type { Area } from '@/types/growth-system';
import type { Note } from '@/types/knowledge-vault';

export type NoteEditFormFieldKey =
  | 'title'
  | 'content'
  | 'area'
  | 'sourceUrl'
  | 'tags'
  | 'linkedItems';

export type NoteEditFormSnapshot = {
  title: string;
  content: string;
  area: Area;
  sourceUrl: string;
  tags: string[];
  linkedItems: string[];
};

export type DirtyNoteEditField = {
  key: NoteEditFormFieldKey;
  label: string;
};

const FIELD_LABELS: Record<NoteEditFormFieldKey, string> = {
  title: 'Title',
  content: 'Content',
  area: 'Area',
  sourceUrl: 'Source URL',
  tags: 'Tags',
  linkedItems: 'Linked items',
};

function normalizeSnapshot(snapshot: NoteEditFormSnapshot): NoteEditFormSnapshot {
  return {
    title: snapshot.title.trim(),
    content: snapshot.content.trim(),
    area: snapshot.area,
    sourceUrl: snapshot.sourceUrl.trim(),
    tags: [...snapshot.tags]
      .map((tag) => tag.trim())
      .filter(Boolean)
      .sort(),
    linkedItems: [...snapshot.linkedItems].sort(),
  };
}

function stableSnapshotJson(snapshot: NoteEditFormSnapshot): string {
  return JSON.stringify(normalizeSnapshot(snapshot));
}

export function noteEditFormSnapshotsEqual(
  a: NoteEditFormSnapshot,
  b: NoteEditFormSnapshot
): boolean {
  return stableSnapshotJson(a) === stableSnapshotJson(b);
}

export function buildNoteEditFormSnapshot(params: {
  title: string;
  content: string;
  area: Area;
  sourceUrl: string;
  tags: string[];
  linkedItems: string[];
}): NoteEditFormSnapshot {
  return {
    title: params.title,
    content: params.content,
    area: params.area,
    sourceUrl: params.sourceUrl,
    tags: [...params.tags],
    linkedItems: [...params.linkedItems],
  };
}

export function buildNoteEditFormSnapshotFromNote(note: Note): NoteEditFormSnapshot {
  return buildNoteEditFormSnapshot({
    title: note.title || '',
    content: note.content || '',
    area: note.area || 'Operations',
    sourceUrl: note.sourceUrl || '',
    tags: note.tags || [],
    linkedItems: note.linkedItems || [],
  });
}

export function listDirtyNoteEditFields(
  baseline: NoteEditFormSnapshot,
  current: NoteEditFormSnapshot
): DirtyNoteEditField[] {
  const normalizedBaseline = normalizeSnapshot(baseline);
  const normalizedCurrent = normalizeSnapshot(current);

  return (Object.keys(FIELD_LABELS) as NoteEditFormFieldKey[])
    .filter((key) => {
      const baseValue = normalizedBaseline[key];
      const currentValue = normalizedCurrent[key];
      if (Array.isArray(baseValue) && Array.isArray(currentValue)) {
        return JSON.stringify(baseValue) !== JSON.stringify(currentValue);
      }
      return baseValue !== currentValue;
    })
    .map((key) => ({
      key,
      label: FIELD_LABELS[key],
    }));
}
