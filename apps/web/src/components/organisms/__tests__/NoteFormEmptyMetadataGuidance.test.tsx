import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteForm from '@/components/organisms/NoteForm';
import type { Note } from '@/types/knowledge-vault';
import { EMPTY_METADATA_GUIDANCE_TEXT } from '@/lib/knowledge-vault/note-empty-metadata-guidance';

const mockOnCancel = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock('@/contexts/KnowledgeVault', () => ({
  useKnowledgeVault: () => ({
    createNote: vi.fn(),
    updateNote: vi.fn(),
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
  default: ({ onChange }: { onChange: (tags: string[]) => void }) => (
    <button type="button" onClick={() => onChange(['ops'])}>
      Add test tag
    </button>
  ),
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

const defaultNote = {
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

async function expandMetadata(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Metadata' }));
}

describe('NoteForm empty metadata guidance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not show guidance when Metadata is collapsed', () => {
    render(<NoteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.queryByText(EMPTY_METADATA_GUIDANCE_TEXT)).not.toBeInTheDocument();
  });

  it('shows guidance when Metadata is expanded with default area and no tags', async () => {
    const user = userEvent.setup();
    render(<NoteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await expandMetadata(user);

    expect(screen.getByText(EMPTY_METADATA_GUIDANCE_TEXT)).toBeInTheDocument();
  });

  it('hides guidance when Area changes away from default', async () => {
    const user = userEvent.setup();
    render(<NoteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await expandMetadata(user);
    expect(screen.getByText(EMPTY_METADATA_GUIDANCE_TEXT)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox'), 'Health');

    expect(screen.queryByText(EMPTY_METADATA_GUIDANCE_TEXT)).not.toBeInTheDocument();
  });

  it('hides guidance when a tag is added', async () => {
    const user = userEvent.setup();
    render(<NoteForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await expandMetadata(user);
    expect(screen.getByText(EMPTY_METADATA_GUIDANCE_TEXT)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add test tag' }));

    expect(screen.queryByText(EMPTY_METADATA_GUIDANCE_TEXT)).not.toBeInTheDocument();
  });

  it('does not show guidance for notes with non-default area', async () => {
    const user = userEvent.setup();
    const note = { ...defaultNote, area: 'Health' as Note['area'] };
    render(<NoteForm note={note} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await expandMetadata(user);

    expect(screen.queryByText(EMPTY_METADATA_GUIDANCE_TEXT)).not.toBeInTheDocument();
  });

  it('does not show guidance for notes with existing tags', async () => {
    const user = userEvent.setup();
    const note = { ...defaultNote, tags: ['ops'] };
    render(<NoteForm note={note} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await expandMetadata(user);

    expect(screen.queryByText(EMPTY_METADATA_GUIDANCE_TEXT)).not.toBeInTheDocument();
  });
});
