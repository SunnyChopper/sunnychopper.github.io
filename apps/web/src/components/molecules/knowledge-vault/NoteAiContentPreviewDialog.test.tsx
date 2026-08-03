import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NoteAiContentPreviewDialog } from '@/components/molecules/knowledge-vault/NoteAiContentPreviewDialog';
import { nestedOverlayBackdropClassName } from '@/lib/overlay-layer';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

describe('NoteAiContentPreviewDialog', () => {
  const baseProps = {
    isOpen: true,
    title: 'Review generated content',
    originalContent: 'Original markdown',
    proposedContent: 'Generated markdown',
    onAccept: vi.fn(),
    onRegenerate: vi.fn(),
    onDiscard: vi.fn(),
  };

  it('renders original and proposed panes with nested overlay z-index', () => {
    render(<NoteAiContentPreviewDialog {...baseProps} />);

    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Proposed')).toBeInTheDocument();
    expect(screen.getByText('Original markdown')).toBeInTheDocument();
    expect(screen.getByText('Generated markdown')).toBeInTheDocument();

    const backdrop = Array.from(document.body.querySelectorAll('div')).find((el) =>
      el.className.includes(nestedOverlayBackdropClassName)
    );
    expect(backdrop).toBeDefined();
  });

  it('calls onAccept when Accept is clicked', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(<NoteAiContentPreviewDialog {...baseProps} onAccept={onAccept} />);

    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onDiscard when Discard is clicked', async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    render(<NoteAiContentPreviewDialog {...baseProps} onDiscard={onDiscard} />);

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('calls onRegenerate when Regenerate is clicked', async () => {
    const user = userEvent.setup();
    const onRegenerate = vi.fn();
    render(<NoteAiContentPreviewDialog {...baseProps} onRegenerate={onRegenerate} />);

    await user.click(screen.getByRole('button', { name: 'Regenerate' }));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it('disables Accept while regenerating', () => {
    render(<NoteAiContentPreviewDialog {...baseProps} regenerating />);

    expect(screen.getByRole('button', { name: 'Accept' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Regenerating…' })).toBeDisabled();
  });
});
