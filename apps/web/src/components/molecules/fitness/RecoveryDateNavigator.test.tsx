import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecoveryDateNavigator } from '@/components/molecules/fitness/RecoveryDateNavigator';
import { fitnessRecoveryDateCapsuleClassName } from '@/lib/fitness/fitness-surfaces';

const useFitnessRecoveryRangeMock = vi.fn();

vi.mock('@/hooks/useFitness', () => ({
  useFitnessRecoveryRange: (...args: unknown[]) => useFitnessRecoveryRangeMock(...args),
}));

describe('RecoveryDateNavigator', () => {
  const today = '2026-07-29';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 29, 12, 0, 0));
    useFitnessRecoveryRangeMock.mockReturnValue({ data: undefined });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('shows Today on the label when value is today', () => {
    render(<RecoveryDateNavigator value={today} onChange={vi.fn()} maxDate={today} />);
    expect(screen.getByRole('button', { name: /Select date/i })).toHaveTextContent('Today');
  });

  it('shows Yesterday when value is prior day', () => {
    render(<RecoveryDateNavigator value="2026-07-28" onChange={vi.fn()} maxDate={today} />);
    expect(screen.getByRole('button', { name: /Select date/i })).toHaveTextContent('Yesterday');
  });

  it('uses the capsule shell treatment', () => {
    const { container } = render(
      <RecoveryDateNavigator value={today} onChange={vi.fn()} maxDate={today} />
    );
    const shell = container.firstElementChild;
    expect(shell).toHaveClass(fitnessRecoveryDateCapsuleClassName.split(' ')[0]);
    expect(shell).toHaveClass('rounded-full');
  });

  it('disables next chevron when on today', () => {
    render(<RecoveryDateNavigator value={today} onChange={vi.fn()} maxDate={today} />);
    expect(screen.getByRole('button', { name: 'Next day' })).toBeDisabled();
  });

  it('does not fetch recovery range while the calendar is closed', () => {
    render(<RecoveryDateNavigator value={today} onChange={vi.fn()} maxDate={today} />);
    expect(useFitnessRecoveryRangeMock).toHaveBeenCalledWith('2026-06-28', '2026-08-08', {
      enabled: false,
    });
  });

  it('steps to previous day via chevron', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecoveryDateNavigator value={today} onChange={onChange} maxDate={today} />);

    await user.click(screen.getByRole('button', { name: 'Previous day' }));
    expect(onChange).toHaveBeenCalledWith('2026-07-28');
  });

  it('opens calendar popover and disables future days', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<RecoveryDateNavigator value={today} onChange={vi.fn()} maxDate={today} />);

    await user.click(screen.getByRole('button', { name: /Select date/i }));
    expect(screen.getByRole('dialog', { name: 'Choose recovery date' })).toBeInTheDocument();
    expect(useFitnessRecoveryRangeMock).toHaveBeenLastCalledWith('2026-06-28', '2026-08-08', {
      enabled: true,
    });

    const tomorrow = screen.getByRole('gridcell', { name: /July 30, 2026/i });
    expect(tomorrow).toBeDisabled();
  });

  it('shows logged-day dots for persisted recovery rows when open', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    useFitnessRecoveryRangeMock.mockReturnValue({
      data: {
        success: true,
        data: {
          data: [
            {
              date: '2026-07-27',
              isPersisted: true,
            },
          ],
        },
      },
    });

    render(<RecoveryDateNavigator value={today} onChange={vi.fn()} maxDate={today} />);
    await user.click(screen.getByRole('button', { name: /Select date/i }));

    expect(screen.getByTestId('recovery-log-dot-2026-07-27')).toBeInTheDocument();
    expect(screen.queryByTestId('recovery-log-dot-2026-07-28')).not.toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: /July 27, 2026, recovery logged/i })
    ).toBeInTheDocument();
  });

  it('selects a past day from the calendar', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecoveryDateNavigator value={today} onChange={onChange} maxDate={today} />);

    await user.click(screen.getByRole('button', { name: /Select date/i }));
    await user.click(screen.getByRole('gridcell', { name: /July 27, 2026/i }));

    expect(onChange).toHaveBeenCalledWith('2026-07-27');
    expect(screen.queryByRole('dialog', { name: 'Choose recovery date' })).not.toBeInTheDocument();
  });

  it('closes popover on Escape', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<RecoveryDateNavigator value={today} onChange={vi.fn()} maxDate={today} />);

    await user.click(screen.getByRole('button', { name: /Select date/i }));
    expect(screen.getByRole('dialog', { name: 'Choose recovery date' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Choose recovery date' })).not.toBeInTheDocument();
  });

  it('selects focused day with keyboard Enter', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecoveryDateNavigator value={today} onChange={onChange} maxDate={today} />);

    await user.click(screen.getByRole('button', { name: /Select date/i }));
    await user.keyboard('{ArrowLeft}{Enter}');

    expect(onChange).toHaveBeenCalledWith('2026-07-28');
  });
});
