import type { MarkdownFile } from '@/types/markdown-files';
import type { Note } from '@/types/knowledge-vault';

export interface AssistantMemoryFile extends MarkdownFile {
  userId?: string;
  s3Key?: string;
  s3Bucket?: string;
  mimeType?: string;
  sharedWith?: string[];
}

export interface ShortTermMemoryResponse {
  file: AssistantMemoryFile;
  content: string;
}

export interface ShortTermMemoryHistoryResponse {
  files: AssistantMemoryFile[];
}

export interface ConsolidateMemoryResponse {
  date: string;
  sourceFile: AssistantMemoryFile;
  archivedFile?: AssistantMemoryFile | null;
  factsCreated: number;
  factsUpdated: number;
  linkedNotes: number;
  archived: boolean;
}

export type LongTermMemoryNote = Note;
