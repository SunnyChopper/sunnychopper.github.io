import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteForm from '@/components/organisms/NoteForm';
import type { Note } from '@/types/knowledge-vault';

const mockUpdateNote = vi.fn().mockResolvedValue({ id: 'note-1' });
const mockOnCancel = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock('@/contexts/KnowledgeVault', () => ({
  useKnowledgeVault: () => ({
    createNote: vi.fn(),
    updateNote: mockUpdateNote,
    deleteItem: vi.fn(),
  }),
}));

vi.mock('@/hooks/useDraftNotes', () => ({
  useDraftNote: () => ({ draft: null }),
  useDraftNoteMutations: () => ({
    saveDraftNote: vi.fn(),
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

vi.mock('@/lib/llm', () => ({
  llmConfig: {
    isConfigured: () => false,
  },
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const note = {
  id: 'note-1',
  type: 'note',
  title: 'Observability',
  content: '# Logging',
  area: 'Operations',
  status: 'active',
  searchableText: 'observability logging',
  userId: 'user-1',
  sourceUrl: null,
  tags: [],
  linkedItems: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  lastAccessedAt: null,
} as Note;

describe('NoteForm unsaved guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('closes immediately when clean and Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteForm note={note} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
  });

  it('opens confirm when dirty and Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteForm note={note} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText('content'), ' updated');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnCancel).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Unsaved changes' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Content')).toBeInTheDocument();
  });

  it('discards edits when Discard is confirmed', async () => {
    const user = userEvent.setup();
    render(<NoteForm note={note} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText('content'), ' updated');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Discard' }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockUpdateNote).not.toHaveBeenCalled();
  });

  it('keeps editing when Keep Editing is chosen', async () => {
    const user = userEvent.setup();
    render(<NoteForm note={note} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText('content'), ' updated');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Keep Editing' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Unsaved changes' })).not.toBeInTheDocument();
    });
    expect(mockOnCancel).not.toHaveBeenCalled();
    expect(screen.getByLabelText('content')).toHaveValue('# Logging updated');
  });

  it('saves and closes when Save & Close is chosen', async () => {
    const user = userEvent.setup();
    render(<NoteForm note={note} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText('content'), ' updated');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Save & Close' }));

    expect(mockUpdateNote).toHaveBeenCalledWith(
      'note-1',
      expect.objectContaining({
        title: 'Observability',
        content: '# Logging updated',
      })
    );
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });
});
