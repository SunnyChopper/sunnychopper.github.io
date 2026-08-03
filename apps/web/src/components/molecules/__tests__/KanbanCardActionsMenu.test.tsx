import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { KanbanCardActionsMenu } from '@/components/molecules/KanbanCardActionsMenu';

describe('KanbanCardActionsMenu', () => {
  it('opens menu and runs delete action', () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();

    render(
      <div className="group">
        <KanbanCardActionsMenu taskTitle="Ship feature" onEdit={onEdit} onDelete={onDelete} />
      </div>
    );

    fireEvent.click(screen.getByLabelText('Actions for task: Ship feature'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('shows restore in trash mode', () => {
    const onRestore = vi.fn();

    render(
      <div className="group">
        <KanbanCardActionsMenu
          taskTitle="Old task"
          onEdit={() => {}}
          trashMode
          onRestore={onRestore}
        />
      </div>
    );

    fireEvent.click(screen.getByLabelText('Actions for task: Old task'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Restore' }));

    expect(onRestore).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).toBeNull();
  });
});
