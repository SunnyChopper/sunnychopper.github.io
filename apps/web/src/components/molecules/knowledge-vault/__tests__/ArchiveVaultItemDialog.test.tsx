import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ArchiveVaultItemDialog from '@/components/molecules/knowledge-vault/ArchiveVaultItemDialog';
import type { Note } from '@/types/knowledge-vault';

const mockNote: Note = {
  id: 'note-1',
  type: 'note',
  title: 'My research note',
  content: 'Body',
  tags: ['ai', 'vault'],
  area: 'Operations',
  status: 'active',
  searchableText: 'My research note',
  userId: 'user-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  lastAccessedAt: null,
  linkedItems: [],
  sourceUrl: null,
};

describe('ArchiveVaultItemDialog', () => {
  it('renders preview fields and restore note', () => {
    render(<ArchiveVaultItemDialog isOpen item={mockNote} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByText('My research note')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('2 tags')).toBeInTheDocument();
    expect(screen.getByText('This can be restored from the Archive view')).toBeInTheDocument();
  });

  it('calls onConfirm when Archive is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ArchiveVaultItemDialog isOpen item={mockNote} onClose={vi.fn()} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('button', { name: 'Archive' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onClose when Cancel is clicked without confirming', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ArchiveVaultItemDialog isOpen item={mockNote} onClose={onClose} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows API error when provided', () => {
    render(
      <ArchiveVaultItemDialog
        isOpen
        item={mockNote}
        error="Failed to archive item"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Failed to archive item')).toBeInTheDocument();
  });
});
