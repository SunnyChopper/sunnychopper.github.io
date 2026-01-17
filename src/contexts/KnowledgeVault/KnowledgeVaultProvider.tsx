import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { vaultItemsService, coursesService } from '@/services/knowledge-vault';
import {
  KnowledgeVaultContext,
  type KnowledgeVaultContextType,
  type VaultItem,
  type Course,
  type Note,
  type Document,
  type Flashcard,
  type VaultItemType,
  type VaultItemFilters,
  type CreateNoteInput,
  type UpdateNoteInput,
  type CreateDocumentInput,
  type UpdateDocumentInput,
  type CreateFlashcardInput,
  type UpdateFlashcardInput,
  type CreateCourseInput,
  type UpdateCourseInput,
} from './types';

interface KnowledgeVaultProviderProps {
  children: ReactNode;
}

export const KnowledgeVaultProvider = ({ children }: KnowledgeVaultProviderProps) => {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const refreshVaultItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await vaultItemsService.getAll();

      if (response.success && response.data) {
        setVaultItems(response.data);
      } else {
        // Only set error if it's not a 404 (endpoint might not exist yet)
        const is404 = response.error?.includes('404') || response.error?.includes('Not Found');
        if (!is404) {
          setError(response.error);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vault items';
      // Only set error if it's not a 404
      const is404 = errorMessage.includes('404') || errorMessage.includes('Not Found');
      if (!is404) {
        setError(errorMessage);
      }
      console.error('Error loading vault items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    try {
      setError(null);

      const response = await coursesService.getAll();

      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        // Only set error if it's not a 404 (endpoint might not exist yet)
        const is404 = response.error?.includes('404') || response.error?.includes('Not Found');
        if (!is404) {
          setError(response.error);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load courses';
      // Only set error if it's not a 404
      const is404 = errorMessage.includes('404') || errorMessage.includes('Not Found');
      if (!is404) {
        setError(errorMessage);
      }
      console.error('Error loading courses:', err);
    }
  }, []);

  useEffect(() => {
    // Only initialize once
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      refreshVaultItems();
      refreshCourses();
    }
  }, [refreshVaultItems, refreshCourses]);

  const searchItems = useCallback(async (query: string): Promise<VaultItem[]> => {
    try {
      setError(null);
      const response = await vaultItemsService.search(query);

      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      return [];
    }
  }, []);

  const getItemsByType = useCallback(
    (type: VaultItemType): VaultItem[] => {
      return vaultItems.filter((item) => item.type === type);
    },
    [vaultItems]
  );

  const filterItems = useCallback(async (filters: VaultItemFilters): Promise<VaultItem[]> => {
    try {
      setError(null);
      const response = await vaultItemsService.getAll(filters);

      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Filter failed';
      setError(errorMessage);
      return [];
    }
  }, []);

  const createNote = useCallback(
    async (input: CreateNoteInput): Promise<Note> => {
      try {
        setError(null);
        const response = await vaultItemsService.createNote(input);

        if (response.success && response.data) {
          await refreshVaultItems();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to create note');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshVaultItems]
  );

  const updateNote = useCallback(
    async (id: string, input: UpdateNoteInput): Promise<Note> => {
      try {
        setError(null);
        const response = await vaultItemsService.updateNote(id, input);

        if (response.success && response.data) {
          await refreshVaultItems();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to update note');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshVaultItems]
  );

  const createDocument = useCallback(
    async (input: CreateDocumentInput): Promise<Document> => {
      try {
        setError(null);
        const response = await vaultItemsService.createDocument(input);

        if (response.success && response.data) {
          await refreshVaultItems();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to create document');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshVaultItems]
  );

  const updateDocument = useCallback(
    async (id: string, input: UpdateDocumentInput): Promise<Document> => {
      try {
        setError(null);
        const response = await vaultItemsService.updateDocument(id, input);

        if (response.success && response.data) {
          await refreshVaultItems();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to update document');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshVaultItems]
  );

  const createFlashcard = useCallback(
    async (input: CreateFlashcardInput): Promise<Flashcard> => {
      try {
        setError(null);
        const response = await vaultItemsService.createFlashcard(input);

        if (response.success && response.data) {
          await refreshVaultItems();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to create flashcard');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create flashcard';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshVaultItems]
  );

  const updateFlashcard = useCallback(
    async (id: string, input: UpdateFlashcardInput): Promise<Flashcard> => {
      try {
        setError(null);
        const response = await vaultItemsService.updateFlashcard(id, input);

        if (response.success && response.data) {
          await refreshVaultItems();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to update flashcard');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update flashcard';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshVaultItems]
  );

  const createCourse = useCallback(
    async (input: CreateCourseInput): Promise<Course> => {
      try {
        setError(null);
        const response = await coursesService.create(input);

        if (response.success && response.data) {
          await refreshCourses();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to create course');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshCourses]
  );

  const updateCourse = useCallback(
    async (id: string, input: UpdateCourseInput): Promise<Course> => {
      try {
        setError(null);
        const response = await coursesService.update(id, input);

        if (response.success && response.data) {
          await refreshCourses();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to update course');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update course';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshCourses]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);
        const response = await vaultItemsService.delete(id);

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete item');
        }

        await refreshVaultItems();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshVaultItems]
  );

  const deleteCourse = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);
        const response = await coursesService.delete(id);

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete course');
        }

        await refreshCourses();
        await refreshVaultItems();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshCourses, refreshVaultItems]
  );

  const markItemAccessed = useCallback(async (id: string): Promise<void> => {
    try {
      await vaultItemsService.markAccessed(id);
    } catch (err) {
      console.error('Error marking item as accessed:', err);
    }
  }, []);

  const flashcards = vaultItems.filter((item): item is Flashcard => item.type === 'flashcard');

  const value: KnowledgeVaultContextType = {
    vaultItems,
    flashcards,
    courses,
    loading,
    error,
    refreshVaultItems,
    refreshCourses,
    searchItems,
    getItemsByType,
    filterItems,
    createNote,
    updateNote,
    createDocument,
    updateDocument,
    createFlashcard,
    updateFlashcard,
    createCourse,
    updateCourse,
    deleteItem,
    deleteCourse,
    markItemAccessed,
  };

  return <KnowledgeVaultContext.Provider value={value}>{children}</KnowledgeVaultContext.Provider>;
};
