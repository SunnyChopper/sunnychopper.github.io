import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Area } from '@/types/growth-system';
import TasksFiltersBar from '@/components/molecules/TasksFiltersBar';

const defaultProps = {
  taskSortField: 'priority' as const,
  onTaskSortFieldChange: vi.fn(),
  duePreset: 'none' as const,
  onDuePresetChange: vi.fn(),
  selectedArea: undefined,
  onAreaChange: vi.fn(),
  selectedStatus: undefined,
  onStatusChange: vi.fn(),
  selectedPriority: undefined,
  onPriorityChange: vi.fn(),
  energyTag: 'any' as const,
  onEnergyTagChange: vi.fn(),
  showDeletedOnly: false,
  onShowDeletedOnlyChange: vi.fn(),
  activeFilterCount: 0,
  onClearAll: vi.fn(),
  onClose: vi.fn(),
};

describe('TasksFiltersBar', () => {
  it('renders labeled filter selects including view', () => {
    render(<TasksFiltersBar {...defaultProps} />);

    expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    expect(screen.getByLabelText('Due date')).toBeInTheDocument();
    expect(screen.getByLabelText('Area')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('View')).toBeInTheDocument();
    expect(screen.getByLabelText('Energy tag')).toBeInTheDocument();
  });

  it('shows active area chip and removes it', async () => {
    const user = userEvent.setup();
    const onAreaChange = vi.fn();

    render(
      <TasksFiltersBar
        {...defaultProps}
        selectedArea={'Health' as Area}
        activeFilterCount={1}
        onAreaChange={onAreaChange}
      />
    );

    expect(screen.getByText('Area: Health')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Area: Health filter' }));

    expect(onAreaChange).toHaveBeenCalledWith(undefined);
  });

  it('shows active energy tag chip and removes it', async () => {
    const user = userEvent.setup();
    const onEnergyTagChange = vi.fn();

    render(
      <TasksFiltersBar
        {...defaultProps}
        energyTag="untagged"
        activeFilterCount={1}
        onEnergyTagChange={onEnergyTagChange}
      />
    );

    expect(screen.getByText('Energy: Untagged')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Energy: Untagged filter' }));

    expect(onEnergyTagChange).toHaveBeenCalledWith('any');
  });

  it('keeps Clear all visible and disabled when no filters are active', () => {
    render(<TasksFiltersBar {...defaultProps} />);

    const clearAll = screen.getByRole('button', { name: 'Clear all filters' });
    expect(clearAll).toBeDisabled();
    expect(screen.getByText('No filters applied')).toBeInTheDocument();
  });

  it('enables Clear all when filters are active', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();

    render(
      <TasksFiltersBar
        {...defaultProps}
        duePreset="today"
        activeFilterCount={1}
        onClearAll={onClearAll}
      />
    );

    const clearAll = screen.getByRole('button', { name: 'Clear all filters' });
    expect(clearAll).toBeEnabled();

    await user.click(clearAll);
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('calls onClose from the close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<TasksFiltersBar {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close filters' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
