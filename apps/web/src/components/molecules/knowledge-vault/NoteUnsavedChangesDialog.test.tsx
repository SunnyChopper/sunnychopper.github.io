import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NoteUnsavedChangesDialog } from '@/components/molecules/knowledge-vault/NoteUnsavedChangesDialog';
import { nestedOverlayBackdropClassName } from '@/lib/overlay-layer';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

describe('NoteUnsavedChangesDialog', () => {
  const baseProps = {
    isOpen: true,
    dirtyFields: [
      { key: 'content' as const, label: 'Content' },
      { key: 'area' as const, label: 'Area' },
    ],
    onDiscard: vi.fn(),
    onSaveAndClose: vi.fn(),
    onKeepEditing: vi.fn(),
  };

  it('renders dirty field labels with nested overlay z-index', () => {
    render(<NoteUnsavedChangesDialog {...baseProps} />);

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Area')).toBeInTheDocument();

    const backdrop = Array.from(document.body.querySelectorAll('div')).find((el) =>
      el.className.includes(nestedOverlayBackdropClassName)
    );
    expect(backdrop).toBeDefined();
  });

  it('calls action handlers from footer buttons', async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    const onSaveAndClose = vi.fn();
    const onKeepEditing = vi.fn();

    render(
      <NoteUnsavedChangesDialog
        {...baseProps}
        onDiscard={onDiscard}
        onSaveAndClose={onSaveAndClose}
        onKeepEditing={onKeepEditing}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await user.click(screen.getByRole('button', { name: 'Save & Close' }));
    await user.click(screen.getByRole('button', { name: 'Keep Editing' }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onSaveAndClose).toHaveBeenCalledTimes(1);
    expect(onKeepEditing).toHaveBeenCalledTimes(1);
  });

  it('disables Save & Close while saving', () => {
    render(<NoteUnsavedChangesDialog {...baseProps} saving />);

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Keep Editing' })).toBeDisabled();
  });
});
