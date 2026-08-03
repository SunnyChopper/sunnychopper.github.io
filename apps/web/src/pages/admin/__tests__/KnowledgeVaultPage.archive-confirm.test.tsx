import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import KnowledgeVaultPage from '@/pages/admin/KnowledgeVaultPage';
import type { Document, Note } from '@/types/knowledge-vault';

const navigateMock = vi.fn();
const deleteItemMock = vi.fn();
const refreshVaultItemsMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const mockNote: Note = {
  id: 'note-archive-1',
  type: 'note',
  title: 'Archive Me Note',
  content: 'Body',
  tags: ['alpha', 'beta', 'gamma'],
  area: 'Operations',
  status: 'active',
  searchableText: 'Archive Me Note',
  userId: 'user-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  lastAccessedAt: null,
  linkedItems: [],
  sourceUrl: null,
};

const mockDocument: Document = {
  id: 'doc-archive-1',
  type: 'document',
  title: 'Archive Me Doc',
  content: 'Body',
  tags: ['docs'],
  area: 'Operations',
  status: 'active',
  searchableText: 'Archive Me Doc',
  userId: 'user-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  lastAccessedAt: null,
  fileUrl: null,
  fileType: 'md',
  pageCount: 1,
  indexingStatus: 'complete',
  chunkCount: 2,
};

vi.mock('@/contexts/KnowledgeVault', () => ({
  useKnowledgeVault: () => ({
    vaultItems: [mockNote, mockDocument],
    courses: [],
    flashcardDecks: [],
    loading: false,
    refreshVaultItems: refreshVaultItemsMock,
    deleteItem: deleteItemMock,
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <KnowledgeVaultPage />
    </MemoryRouter>
  );
}

describe('KnowledgeVaultPage archive confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteItemMock.mockResolvedValue(undefined);
    refreshVaultItemsMock.mockResolvedValue(undefined);
  });

  it('opens archive preview with title, type, and tag count', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Archive note' }));

    const dialog = screen.getByRole('dialog', { name: 'Archive item?' });
    const preview = within(dialog);

    expect(preview.getByText('Archive Me Note')).toBeInTheDocument();
    expect(preview.getByText('Note')).toBeInTheDocument();
    expect(preview.getByText('3 tags')).toBeInTheDocument();
    expect(preview.getByText('This can be restored from the Archive view')).toBeInTheDocument();
    expect(deleteItemMock).not.toHaveBeenCalled();
  });

  it('dismisses archive preview on Cancel without archiving', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Archive document' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Archive item?' })).not.toBeInTheDocument();
    });
    expect(deleteItemMock).not.toHaveBeenCalled();
  });

  it('dismisses archive preview on Escape without archiving', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Archive note' }));
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Archive item?' })).not.toBeInTheDocument();
    });
    expect(deleteItemMock).not.toHaveBeenCalled();
  });

  it('archives only after explicit Archive confirmation', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Archive note' }));
    await user.click(screen.getByRole('button', { name: 'Archive' }));

    expect(deleteItemMock).toHaveBeenCalledWith('note-archive-1');
    expect(refreshVaultItemsMock).toHaveBeenCalled();
  });
});
