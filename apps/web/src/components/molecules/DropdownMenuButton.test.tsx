import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import DropdownMenuButton from '@/components/molecules/DropdownMenuButton';

describe('DropdownMenuButton', () => {
  it('opens menu on icon trigger click and sets aria-expanded', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenuButton
        icon={MoreHorizontal}
        ariaLabel="Project options"
        items={[
          { key: 'edit', label: 'Edit', icon: Edit2, onClick: vi.fn() },
          { key: 'delete', label: 'Delete', icon: Trash2, onClick: vi.fn(), tone: 'danger' },
        ]}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Project options' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('invokes item callbacks and closes menu', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <DropdownMenuButton
        icon={MoreHorizontal}
        ariaLabel="Project options"
        items={[
          { key: 'edit', label: 'Edit', onClick: onEdit },
          { key: 'delete', label: 'Delete', onClick: onDelete, tone: 'danger' },
        ]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Project options' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Project options' }));
    const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
    expect(deleteItem).toHaveClass('text-red-600');
    await user.click(deleteItem);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('aligns menu to the end when align is end', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenuButton
        label="Actions"
        align="end"
        items={[{ key: 'one', label: 'One', onClick: vi.fn() }]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = screen.getByRole('menu');
    expect(menu.className).toContain('right-0');
  });
});
