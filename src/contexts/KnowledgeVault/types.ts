import { createContext } from 'react';
import type {
  VaultItem,
  Note,
  Document,
  Flashcard,
  Course,
  VaultItemType,
  VaultItemFilters,
  CreateNoteInput,
  UpdateNoteInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateFlashcardInput,
  UpdateFlashcardInput,
  CreateCourseInput,
  UpdateCourseInput,
} from '../../types/knowledge-vault';

export interface KnowledgeVaultContextType {
  vaultItems: VaultItem[];
  flashcards: Flashcard[];
  courses: Course[];
  loading: boolean;
  error: string | null;
  refreshVaultItems: () => Promise<void>;
  refreshCourses: () => Promise<void>;
  searchItems: (query: string) => Promise<VaultItem[]>;
  getItemsByType: (type: VaultItemType) => VaultItem[];
  filterItems: (filters: VaultItemFilters) => Promise<VaultItem[]>;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, input: UpdateNoteInput) => Promise<Note>;
  createDocument: (input: CreateDocumentInput) => Promise<Document>;
  updateDocument: (id: string, input: UpdateDocumentInput) => Promise<Document>;
  createFlashcard: (input: CreateFlashcardInput) => Promise<Flashcard>;
  updateFlashcard: (id: string, input: UpdateFlashcardInput) => Promise<Flashcard>;
  createCourse: (input: CreateCourseInput) => Promise<Course>;
  updateCourse: (id: string, input: UpdateCourseInput) => Promise<Course>;
  deleteItem: (id: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  markItemAccessed: (id: string) => Promise<void>;
}

export const KnowledgeVaultContext = createContext<KnowledgeVaultContextType | undefined>(
  undefined
);

// Re-export types for convenience
export type {
  VaultItem,
  Note,
  Document,
  Flashcard,
  Course,
  VaultItemType,
  VaultItemFilters,
  CreateNoteInput,
  UpdateNoteInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateFlashcardInput,
  UpdateFlashcardInput,
  CreateCourseInput,
  UpdateCourseInput,
};
