import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConversationListRow } from '@/components/molecules/chat/ConversationListRow';

describe('ConversationListRow', () => {
  it('renders title, badge, timestamp, and preview on separate lines', () => {
    render(
      <ConversationListRow
        title="Evening Logbook"
        preview="AI: Sparse day example"
        timestamp="2026-07-29T12:00:00Z"
        badge="Auto"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Evening Logbook')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('AI: Sparse day example')).toBeInTheDocument();
  });

  it('opens context menu on right-click and triggers rename', () => {
    const onStartEdit = vi.fn();
    render(
      <ConversationListRow
        title="Evening Logbook"
        timestamp="2026-07-29T12:00:00Z"
        onSelect={vi.fn()}
        onStartEdit={onStartEdit}
        onDelete={vi.fn()}
      />
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /Evening Logbook conversation/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Rename/i }));
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });
});
