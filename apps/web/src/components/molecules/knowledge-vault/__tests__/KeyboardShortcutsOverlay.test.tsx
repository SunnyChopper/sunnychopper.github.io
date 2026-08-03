import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import KeyboardShortcutsOverlay from '@/components/molecules/knowledge-vault/KeyboardShortcutsOverlay';
import { getKnowledgeVaultShortcutSections } from '@/lib/knowledge-vault/keyboard-shortcuts';

const sections = getKnowledgeVaultShortcutSections();

describe('KeyboardShortcutsOverlay', () => {
  it('renders shortcut sections when open', () => {
    render(<KeyboardShortcutsOverlay isOpen onClose={vi.fn()} sections={sections} />);

    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Edit Note')).toBeInTheDocument();
    expect(screen.getByText('Save note')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<KeyboardShortcutsOverlay isOpen={false} onClose={vi.fn()} sections={sections} />);

    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<KeyboardShortcutsOverlay isOpen onClose={onClose} sections={sections} />);

    await user.click(screen.getByTestId('keyboard-shortcuts-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<KeyboardShortcutsOverlay isOpen onClose={onClose} sections={sections} />);

    await user.click(screen.getByRole('button', { name: 'Close keyboard shortcuts' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape via capture listener', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsOverlay isOpen onClose={onClose} sections={sections} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
