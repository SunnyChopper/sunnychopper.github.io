import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteForm from '@/components/organisms/NoteForm';

const mockCreateNote = vi.fn();
const mockSaveDraftNote = vi.fn().mockResolvedValue(undefined);

vi.mock('@/contexts/KnowledgeVault', () => ({
  useKnowledgeVault: () => ({
    createNote: mockCreateNote,
    updateNote: vi.fn(),
    deleteItem: vi.fn(),
  }),
}));

vi.mock('@/hooks/useDraftNotes', () => ({
  useDraftNote: () => ({ draft: null }),
  useDraftNoteMutations: () => ({
    saveDraftNote: mockSaveDraftNote,
    deleteDraftNote: vi.fn(),
  }),
}));

vi.mock('@/components/molecules/MarkdownEditor', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="content" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock('@/components/molecules/TagInput', () => ({
  default: () => <div data-testid="tag-input" />,
}));

vi.mock('@/components/molecules/LinkedItemsPicker', () => ({
  default: () => <div data-testid="linked-items" />,
}));

vi.mock('@/components/molecules/NoteAIAssistPanel', () => ({
  default: () => null,
}));

vi.mock('@/components/organisms/VaultKnowledgeToolsPanel', () => ({
  VaultKnowledgeToolsPanel: () => null,
}));

const mockFetchUrlMetadata = vi.fn();

vi.mock('@/services/knowledge-vault/url-metadata.service', () => ({
  fetchUrlMetadata: (...args: unknown[]) => mockFetchUrlMetadata(...args),
}));

describe('NoteForm URL metadata preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchUrlMetadata.mockResolvedValue({
      url: 'https://example.com/article',
      title: 'Fetched Article Title',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
      fileType: 'html',
      fetchFailed: false,
      warning: null,
    });
  });

  it('shows apply CTA when title is empty and metadata resolves', async () => {
    const user = userEvent.setup();
    render(<NoteForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /metadata/i }));
    const sourceInput = screen.getByPlaceholderText(/example\.com\/article/i);
    await user.type(sourceInput, 'https://example.com/article');

    await waitFor(() => {
      expect(mockFetchUrlMetadata).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Fetched Article Title')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /use title as note title/i }));
    expect(screen.getByDisplayValue('Fetched Article Title')).toBeInTheDocument();
  });

  it('shows muted error when metadata fetch fails', async () => {
    mockFetchUrlMetadata.mockResolvedValue({
      url: 'https://example.com/broken',
      title: null,
      faviconUrl: null,
      fileType: null,
      fetchFailed: true,
      warning: 'Could not fetch',
    });

    const user = userEvent.setup();
    render(<NoteForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /metadata/i }));
    await user.type(
      screen.getByPlaceholderText(/example\.com\/article/i),
      'https://example.com/broken'
    );

    await waitFor(() => {
      expect(screen.getByText('Could not fetch')).toBeInTheDocument();
    });
  });
});
