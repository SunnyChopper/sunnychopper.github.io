export const NOTE_AI_UNDO_TOAST_DURATION_MS = 15_000;
export const NOTE_AI_WORKING_LABEL = 'Working…';

export type UndoableNoteAIAction = 'expand' | 'summarize' | 'improve' | 'generate' | 'suggestTags';

export type NoteAIActionId = UndoableNoteAIAction | 'suggestArea' | 'analyze';

export interface NoteAISnapshot {
  content?: string;
  tags?: string[];
}

const UNDOABLE_CONTENT_ACTIONS: ReadonlySet<UndoableNoteAIAction> = new Set([
  'expand',
  'summarize',
  'improve',
  'generate',
]);

export function isUndoableContentAction(action: NoteAIActionId): boolean {
  return UNDOABLE_CONTENT_ACTIONS.has(action as UndoableNoteAIAction);
}

export function createNoteAISnapshot(
  action: NoteAIActionId,
  content: string,
  tags: string[]
): NoteAISnapshot | null {
  if (isUndoableContentAction(action)) {
    return { content };
  }
  if (action === 'suggestTags') {
    return { tags: [...tags] };
  }
  return null;
}

export function shouldOfferUndoToast(action: NoteAIActionId, tagsAddedCount = 0): boolean {
  if (action === 'suggestTags') {
    return tagsAddedCount > 0;
  }
  return isUndoableContentAction(action);
}

export function applyNoteAISnapshot(
  snapshot: NoteAISnapshot,
  onContentChange: (content: string) => void,
  onTagsChange: (tags: string[]) => void
): void {
  if (snapshot.content !== undefined) {
    onContentChange(snapshot.content);
  }
  if (snapshot.tags !== undefined) {
    onTagsChange(snapshot.tags);
  }
}
