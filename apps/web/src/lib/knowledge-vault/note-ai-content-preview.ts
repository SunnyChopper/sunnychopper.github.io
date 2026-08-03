import type {
  ExpandContentOutput,
  GenerateContentOutput,
  ImproveClarityOutput,
  SummarizeContentOutput,
} from '@/lib/llm/schemas/note-ai-schemas';

export type NoteAiContentAction = 'expand' | 'summarize' | 'improve' | 'generate';

export type NoteAiContentApiData =
  | ExpandContentOutput
  | SummarizeContentOutput
  | ImproveClarityOutput
  | GenerateContentOutput;

const CONTENT_ACTIONS: ReadonlySet<NoteAiContentAction> = new Set([
  'expand',
  'summarize',
  'improve',
  'generate',
]);

export function isNoteEditorEmpty(content: string): boolean {
  return !content.trim();
}

export function isNoteAiContentAction(action: string): action is NoteAiContentAction {
  return CONTENT_ACTIONS.has(action as NoteAiContentAction);
}

/** True when the action would overwrite body markdown and the editor is non-empty. */
export function shouldGateNoteAiContentWrite(
  action: NoteAiContentAction,
  content: string
): boolean {
  if (!CONTENT_ACTIONS.has(action)) {
    return false;
  }
  return !isNoteEditorEmpty(content);
}

export function extractProposedContent(
  action: NoteAiContentAction,
  data: NoteAiContentApiData
): string {
  switch (action) {
    case 'expand':
      return (data as ExpandContentOutput).expandedContent;
    case 'summarize':
      return (data as SummarizeContentOutput).summary;
    case 'improve':
      return (data as ImproveClarityOutput).improvedContent;
    case 'generate':
      return (data as GenerateContentOutput).generatedContent;
    default:
      return '';
  }
}

const PREVIEW_TITLES: Record<NoteAiContentAction, string> = {
  expand: 'Review expanded content',
  summarize: 'Review summary',
  improve: 'Review improved content',
  generate: 'Review generated content',
};

export function noteAiContentPreviewTitle(action: NoteAiContentAction): string {
  return PREVIEW_TITLES[action];
}

const SUCCESS_MESSAGES: Record<NoteAiContentAction, string> = {
  expand: 'Content expanded successfully',
  summarize: 'Content summarized successfully',
  improve: 'Content improved successfully',
  generate: 'Content generated successfully',
};

export function noteAiContentSuccessMessage(
  action: NoteAiContentAction,
  data?: NoteAiContentApiData
): string {
  if (action === 'summarize' && data && 'wordCount' in data && 'summaryWordCount' in data) {
    return `Summarized from ${data.wordCount} to ${data.summaryWordCount} words`;
  }
  if (action === 'improve' && data && 'changes' in data) {
    const improveData = data as ImproveClarityOutput;
    return `Improved with ${improveData.changes.length} changes`;
  }
  return SUCCESS_MESSAGES[action];
}
