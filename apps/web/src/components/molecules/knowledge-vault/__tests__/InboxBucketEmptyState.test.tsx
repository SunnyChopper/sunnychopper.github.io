import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InboxBucketEmptyState } from '@/components/molecules/knowledge-vault/InboxBucketEmptyState';

describe('InboxBucketEmptyState', () => {
  it('renders pending copy and invokes onQuickCapture from CTA', async () => {
    const onQuickCapture = vi.fn();
    render(<InboxBucketEmptyState status="pending" onQuickCapture={onQuickCapture} />);
    const user = userEvent.setup();

    expect(screen.getByRole('status')).toHaveTextContent(/nothing awaiting triage/i);
    await user.click(screen.getByRole('button', { name: /quick capture/i }));

    expect(onQuickCapture).toHaveBeenCalledTimes(1);
  });

  it('renders triaged copy', () => {
    render(<InboxBucketEmptyState status="triaged" onQuickCapture={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent(/no items ready to file/i);
  });

  it('renders filed copy', () => {
    render(<InboxBucketEmptyState status="filed" onQuickCapture={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent(/nothing filed yet/i);
  });
});
