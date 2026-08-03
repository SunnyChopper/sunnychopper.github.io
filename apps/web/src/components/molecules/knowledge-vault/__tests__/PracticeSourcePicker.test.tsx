import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PracticeSourcePicker } from '@/components/molecules/knowledge-vault/PracticeSourcePicker';
import type { Note, Document, VaultItem } from '@/types/knowledge-vault';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    type: 'note',
    title: 'Agentic Engineering Concepts',
    content: 'Body',
    tags: [],
    area: 'Operations',
    status: 'active',
    searchableText: 'agentic engineering concepts body',
    userId: 'user-1',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-29T00:00:00.000Z',
    lastAccessedAt: null,
    linkedItems: [],
    sourceUrl: null,
    ...overrides,
  };
}

function makeDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    type: 'document',
    title: 'Linear Algebra PDF',
    content: null,
    tags: [],
    area: 'Operations',
    status: 'active',
    searchableText: 'linear algebra gaussian elimination',
    userId: 'user-1',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
    lastAccessedAt: null,
    fileUrl: null,
    fileType: 'pdf',
    pageCount: 12,
    ...overrides,
  };
}

const items: VaultItem[] = [
  makeNote(),
  makeDocument(),
  makeNote({
    id: 'note-archived',
    title: 'Archived note',
    status: 'archived',
  }),
];

describe('PracticeSourcePicker', () => {
  it('filters list by search query', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PracticeSourcePicker items={items} value={[]} onChange={onChange} />);

    expect(screen.getByText('Agentic Engineering Concepts')).toBeInTheDocument();
    expect(screen.getByText('Linear Algebra PDF')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search library sources'), 'linear');

    expect(screen.queryByText('Agentic Engineering Concepts')).not.toBeInTheDocument();
    expect(screen.getByText('Linear Algebra PDF')).toBeInTheDocument();
  });

  it('uses mutually exclusive type chips', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PracticeSourcePicker items={items} value={[]} onChange={onChange} />);

    const noteChip = screen.getByRole('button', { name: /note/i });
    const documentChip = screen.getByRole('button', { name: /document/i });
    const allChip = screen.getByRole('button', { name: /^all$/i });

    await user.click(noteChip);
    expect(noteChip).toHaveAttribute('aria-pressed', 'true');
    expect(documentChip).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Agentic Engineering Concepts')).toBeInTheDocument();
    expect(screen.queryByText('Linear Algebra PDF')).not.toBeInTheDocument();

    await user.click(documentChip);
    expect(noteChip).toHaveAttribute('aria-pressed', 'false');
    expect(documentChip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Linear Algebra PDF')).toBeInTheDocument();
    expect(screen.queryByText('Agentic Engineering Concepts')).not.toBeInTheDocument();

    await user.click(allChip);
    expect(allChip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Agentic Engineering Concepts')).toBeInTheDocument();
    expect(screen.getByText('Linear Algebra PDF')).toBeInTheDocument();
  });

  it('shows preselect styling and allows uncheck', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PracticeSourcePicker
        items={items}
        value={['note-1']}
        onChange={onChange}
        initialSourceIds={['note-1']}
      />
    );

    const row = screen.getByText('Agentic Engineering Concepts').closest('label');
    expect(row).toBeTruthy();
    expect(within(row!).getByText('From this note')).toBeInTheDocument();
    expect(row!.className).toMatch(/ring-green/);

    await user.click(screen.getByRole('checkbox', { name: /agentic engineering concepts/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('shows updated dates on rows', () => {
    render(<PracticeSourcePicker items={items} value={[]} onChange={vi.fn()} />);

    expect(screen.getAllByText(/^Updated /).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Agentic Engineering Concepts')).toBeInTheDocument();
    expect(screen.getByText('Linear Algebra PDF')).toBeInTheDocument();
  });
});
