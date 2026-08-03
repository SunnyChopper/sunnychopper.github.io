import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Area, Priority } from '@/types/growth-system';
import ProjectsActiveFilterChips from '@/components/molecules/ProjectsActiveFilterChips';

const defaultProps = {
  selectedArea: undefined,
  onAreaChange: vi.fn(),
  selectedStatus: undefined,
  onStatusChange: vi.fn(),
  selectedPriority: undefined,
  onPriorityChange: vi.fn(),
  onClearAll: vi.fn(),
};

describe('ProjectsActiveFilterChips', () => {
  it('renders nothing when no filters are active', () => {
    const { container } = render(<ProjectsActiveFilterChips {...defaultProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows active priority chip and removes it', async () => {
    const user = userEvent.setup();
    const onPriorityChange = vi.fn();

    render(
      <ProjectsActiveFilterChips
        {...defaultProps}
        selectedPriority={'P1' as Priority}
        onPriorityChange={onPriorityChange}
      />
    );

    expect(screen.getByText('Priority: P1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Priority: P1 filter' }));

    expect(onPriorityChange).toHaveBeenCalledWith(undefined);
  });

  it('shows active area chip and removes it', async () => {
    const user = userEvent.setup();
    const onAreaChange = vi.fn();

    render(
      <ProjectsActiveFilterChips
        {...defaultProps}
        selectedArea={'Health' as Area}
        onAreaChange={onAreaChange}
      />
    );

    expect(screen.getByText('Area: Health')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Area: Health filter' }));

    expect(onAreaChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onClearAll from Clear all button', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();

    render(
      <ProjectsActiveFilterChips
        {...defaultProps}
        selectedPriority={'P1' as Priority}
        onClearAll={onClearAll}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });
});
