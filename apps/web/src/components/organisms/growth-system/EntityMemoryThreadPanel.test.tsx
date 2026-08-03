import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EntityMemoryThreadPanel } from '@/components/organisms/growth-system/EntityMemoryThreadPanel';

describe('EntityMemoryThreadPanel', () => {
  it('renders quiet empty state CTA when thread is empty', async () => {
    const onEmptyAction = vi.fn();
    const fetchThread = vi.fn().mockResolvedValue({
      entityType: 'project',
      entityId: 'proj-1',
      entityName: 'Alpha',
      items: [],
      totalItems: 0,
    });

    render(
      <EntityMemoryThreadPanel
        entityType="project"
        entityId="proj-1"
        fetchThread={fetchThread}
        onEmptyAction={onEmptyAction}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'No memory linked yet' })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: 'Link a logbook entry or start a memory thread' })
    );
    expect(onEmptyAction).toHaveBeenCalledTimes(1);
  });
});
