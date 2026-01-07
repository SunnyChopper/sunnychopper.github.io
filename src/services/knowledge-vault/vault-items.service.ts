import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  VaultItem,
  Note,
  Document,
  Flashcard,
  VaultItemType,
  VaultItemStatus,
  VaultItemFilters,
  CreateNoteInput,
  UpdateNoteInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateFlashcardInput,
  UpdateFlashcardInput,
  ApiResponse,
} from '../../types/knowledge-vault';

const USER_ID = 'user-1';
const COLLECTION = 'vault_items';

function generateSearchableText(item: Partial<VaultItem>): string {
  const parts = [
    item.title || '',
    item.content || '',
    item.tags?.join(' ') || '',
  ];
  return parts.join(' ').toLowerCase();
}

function filterItems(items: VaultItem[], filters: VaultItemFilters): VaultItem[] {
  let filtered = items;

  if (filters.type) {
    filtered = filtered.filter(item => item.type === filters.type);
  }

  if (filters.area) {
    filtered = filtered.filter(item => item.area === filters.area);
  }

  if (filters.status) {
    filtered = filtered.filter(item => item.status === filters.status);
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(item =>
      filters.tags!.some(tag => item.tags.includes(tag))
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(item =>
      item.searchableText.includes(searchLower)
    );
  }

  return filtered;
}

export const vaultItemsService = {
  async getAll(filters?: VaultItemFilters): Promise<ApiResponse<VaultItem[]>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const items = await storage.getAll<VaultItem>(COLLECTION);

    const filtered = filters ? filterItems(items, filters) : items;

    return {
      data: filtered.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
      error: null,
      success: true,
    };
  },

  async getById(id: string): Promise<ApiResponse<VaultItem>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const item = await storage.getById<VaultItem>(COLLECTION, id);

    if (!item) {
      return { data: null, error: 'Item not found', success: false };
    }

    return { data: item, error: null, success: true };
  },

  async getByType(type: VaultItemType): Promise<ApiResponse<VaultItem[]>> {
    return this.getAll({ type });
  },

  async search(query: string): Promise<ApiResponse<VaultItem[]>> {
    return this.getAll({ search: query });
  },

  async createNote(input: CreateNoteInput): Promise<ApiResponse<Note>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      type: 'note',
      title: input.title,
      content: input.content || null,
      tags: input.tags || [],
      area: input.area,
      status: 'active',
      searchableText: '',
      linkedItems: input.linkedItems || [],
      sourceUrl: input.sourceUrl || null,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: null,
    };

    note.searchableText = generateSearchableText(note);

    const created = await storage.create<Note>(COLLECTION, note.id, note);
    return { data: created, error: null, success: true };
  },

  async createDocument(input: CreateDocumentInput): Promise<ApiResponse<Document>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const now = new Date().toISOString();
    const document: Document = {
      id: generateId(),
      type: 'document',
      title: input.title,
      content: input.content || null,
      tags: input.tags || [],
      area: input.area,
      status: 'active',
      searchableText: '',
      fileUrl: input.fileUrl || null,
      fileType: input.fileType || null,
      pageCount: input.pageCount || null,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: null,
    };

    document.searchableText = generateSearchableText(document);

    const created = await storage.create<Document>(COLLECTION, document.id, document);
    return { data: created, error: null, success: true };
  },

  async createFlashcard(input: CreateFlashcardInput): Promise<ApiResponse<Flashcard>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const now = new Date().toISOString();
    const flashcard: Flashcard = {
      id: generateId(),
      type: 'flashcard',
      title: input.title,
      content: `Front: ${input.front}\n\nBack: ${input.back}`,
      tags: input.tags || [],
      area: input.area,
      status: 'active',
      searchableText: '',
      front: input.front,
      back: input.back,
      sourceItemId: input.sourceItemId || null,
      nextReviewDate: now,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: null,
    };

    flashcard.searchableText = generateSearchableText(flashcard);

    const created = await storage.create<Flashcard>(COLLECTION, flashcard.id, flashcard);
    return { data: created, error: null, success: true };
  },

  async update(id: string, updates: Partial<VaultItem>): Promise<ApiResponse<VaultItem>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.title || updates.content || updates.tags) {
      const current = await storage.getById<VaultItem>(COLLECTION, id);
      if (current) {
        updatedData.searchableText = generateSearchableText({
          ...current,
          ...updates,
        });
      }
    }

    const updated = await storage.update<VaultItem>(COLLECTION, id, updatedData);

    if (!updated) {
      return { data: null, error: 'Item not found', success: false };
    }

    return { data: updated, error: null, success: true };
  },

  async updateNote(id: string, input: UpdateNoteInput): Promise<ApiResponse<Note>> {
    const response = await this.update(id, input);
    return response as ApiResponse<Note>;
  },

  async updateDocument(id: string, input: UpdateDocumentInput): Promise<ApiResponse<Document>> {
    const response = await this.update(id, input);
    return response as ApiResponse<Document>;
  },

  async updateFlashcard(id: string, input: UpdateFlashcardInput): Promise<ApiResponse<Flashcard>> {
    const response = await this.update(id, input);
    return response as ApiResponse<Flashcard>;
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    await randomDelay();
    const storage = getStorageAdapter();

    await storage.update<VaultItem>(COLLECTION, id, {
      status: 'archived' as VaultItemStatus,
      updatedAt: new Date().toISOString(),
    });

    return { data: true, error: null, success: true };
  },

  async markAccessed(id: string): Promise<ApiResponse<VaultItem>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const updated = await storage.update<VaultItem>(COLLECTION, id, {
      lastAccessedAt: new Date().toISOString(),
    });

    if (!updated) {
      return { data: null, error: 'Item not found', success: false };
    }

    return { data: updated, error: null, success: true };
  },
};
