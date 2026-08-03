import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlannerDayColumn } from '@/components/organisms/planner/PlannerDayColumn';
import {
  plannerTodayColumnBgClassName,
  plannerTodayColumnBorderClassName,
  plannerTodayColumnRingClassName,
} from '@/lib/planner/planner-surfaces';
import type { PlannerDay } from '@/types/planner';

function baseDay(partial: Partial<PlannerDay> = {}): PlannerDay {
  return {
    date: '2026-07-28',
    capacityStoryPoints: 3.4,
    scheduledStoryPoints: 0,
    scheduledMinutes: 0,
    loadRatio: 0,
    capacityState: 'healthy',
    oneThingTaskId: null,
    calendarBusyMinutes: 0,
    calendarFreeMinutes: 0,
    lastGeneratedAt: null,
    blocks: [],
    rolloverTasks: [],
    ...partial,
  };
}

describe('PlannerDayColumn', () => {
  it('shows Clear Out of Office when manually blocked', () => {
    render(
      <PlannerDayColumn
        day={baseDay({
          isBlocked: true,
          capacityState: 'blocked',
          capacityStoryPoints: 0,
          blockingContexts: [
            {
              id: 'exc-1',
              source: 'manual',
              kind: 'outOfOffice',
              label: 'Out of Office',
              startDate: '2026-07-28',
              endDate: '2026-07-28',
              isManual: true,
            },
          ],
        })}
        onToggleBlocked={vi.fn()}
      />
    );
    expect(screen.getByText('Clear Out of Office')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear Out of Office for 2026-07-28')).toBeInTheDocument();
  });

  it('shows non-manual blocked hint without clear CTA', () => {
    render(
      <PlannerDayColumn
        day={baseDay({
          isBlocked: true,
          capacityState: 'blocked',
          capacityStoryPoints: 0,
          blockingContexts: [
            {
              id: 'standby-1',
              source: 'standby',
              kind: 'outOfOffice',
              label: 'OOO Standby',
              startDate: '2026-07-28',
              endDate: '2026-07-30',
              isManual: false,
            },
          ],
        })}
        onToggleBlocked={vi.fn()}
      />
    );
    expect(screen.queryByText('Clear Out of Office')).not.toBeInTheDocument();
    expect(screen.getByText(/Blocked by OOO Standby/)).toBeInTheDocument();
  });

  it('opens Plan Day when header date is clicked', () => {
    const onSelect = vi.fn();
    const onToggleBlocked = vi.fn();
    render(
      <PlannerDayColumn day={baseDay()} onSelect={onSelect} onToggleBlocked={onToggleBlocked} />
    );
    fireEvent.click(screen.getByLabelText('Plan day Tue 07-28'));
    expect(onSelect).toHaveBeenCalledWith('2026-07-28');
    expect(onToggleBlocked).not.toHaveBeenCalled();
  });

  it('opens Plan Day when capacity load line is clicked', () => {
    const onSelect = vi.fn();
    const onToggleBlocked = vi.fn();
    render(
      <PlannerDayColumn day={baseDay()} onSelect={onSelect} onToggleBlocked={onToggleBlocked} />
    );
    fireEvent.click(screen.getByText('Capacity'));
    expect(onSelect).toHaveBeenCalledWith('2026-07-28');
    expect(onToggleBlocked).not.toHaveBeenCalled();
  });

  it('marks OOO from secondary control without opening Plan Day', () => {
    const onSelect = vi.fn();
    const onToggleBlocked = vi.fn();
    render(
      <PlannerDayColumn day={baseDay()} onSelect={onSelect} onToggleBlocked={onToggleBlocked} />
    );
    fireEvent.click(screen.getByLabelText('Mark 2026-07-28 Out of Office'));
    expect(onToggleBlocked).toHaveBeenCalledWith('2026-07-28');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('clears manual OOO from secondary control', () => {
    const onToggleBlocked = vi.fn();
    render(
      <PlannerDayColumn
        day={baseDay({
          isBlocked: true,
          capacityState: 'blocked',
          capacityStoryPoints: 0,
          blockingContexts: [
            {
              id: 'exc-1',
              source: 'manual',
              kind: 'outOfOffice',
              label: 'Out of Office',
              startDate: '2026-07-28',
              endDate: '2026-07-28',
              isManual: true,
            },
          ],
        })}
        onToggleBlocked={onToggleBlocked}
      />
    );
    fireEvent.click(screen.getByLabelText('Clear Out of Office for 2026-07-28'));
    expect(onToggleBlocked).toHaveBeenCalledWith('2026-07-28');
  });

  it('does not offer Mark OOO toggle for non-manual blocked days', () => {
    render(
      <PlannerDayColumn
        day={baseDay({
          isBlocked: true,
          capacityState: 'blocked',
          blockingContexts: [
            {
              id: 'v1',
              source: 'voyager',
              kind: 'trip',
              label: 'Tokyo',
              startDate: '2026-07-28',
              endDate: '2026-08-02',
              isManual: false,
            },
          ],
        })}
        onToggleBlocked={vi.fn()}
      />
    );
    expect(screen.queryByLabelText(/Mark .* Out of Office/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Clear Out of Office/)).not.toBeInTheDocument();
    expect(screen.getByText(/Blocked by Voyager trip/)).toBeInTheDocument();
  });

  it('renders dashed empty slot and secondary capacity label for content-empty day', () => {
    const { container } = render(<PlannerDayColumn day={baseDay()} />);
    expect(screen.getByText('Capacity')).toBeInTheDocument();
    expect(screen.getByText('0.0 / 3.4 pts')).toBeInTheDocument();
    expect(screen.getByText('No scheduled work')).toBeInTheDocument();
    expect(container.querySelector('.border-dashed')).toBeInTheDocument();
    expect(screen.queryByTestId('planner-capacity-fill')).not.toBeInTheDocument();
  });

  it('does not render empty slot when day has a block', () => {
    const { container } = render(
      <PlannerDayColumn
        day={baseDay({
          blocks: [
            {
              id: 'b1',
              date: '2026-07-28',
              startAt: '2026-07-28T09:00:00',
              endAt: '2026-07-28T10:00:00',
              durationMinutes: 60,
              taskId: 't1',
              taskTitleSnapshot: 'Ship feature',
              source: 'manual',
              status: 'scheduled',
              storyPointsLoad: 2,
              calendarEventId: null,
              microStepId: null,
              microStepText: null,
              createdAt: '',
              updatedAt: '',
            },
          ],
        })}
      />
    );
    expect(screen.getByText('Ship feature')).toBeInTheDocument();
    expect(container.querySelector('.border-dashed')).not.toBeInTheDocument();
    expect(screen.getByTestId('planner-capacity-fill')).toBeInTheDocument();
  });

  it('does not render empty slot for blocked day', () => {
    const { container } = render(
      <PlannerDayColumn
        day={baseDay({
          isBlocked: true,
          capacityState: 'blocked',
          capacityStoryPoints: 0,
          blockingContexts: [
            {
              id: 'exc-1',
              source: 'manual',
              kind: 'outOfOffice',
              label: 'Out of Office',
              startDate: '2026-07-28',
              endDate: '2026-07-28',
              isManual: true,
            },
          ],
        })}
        onToggleBlocked={vi.fn()}
      />
    );
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(container.querySelector('.border-dashed')).not.toBeInTheDocument();
  });

  it('applies today shell tokens when isToday and not focused', () => {
    const { container } = render(<PlannerDayColumn day={baseDay()} isToday />);
    const shell = container.firstElementChild as HTMLElement;
    expect(shell).toHaveClass(plannerTodayColumnBgClassName);
    expect(shell).toHaveClass(plannerTodayColumnBorderClassName);
    expect(shell).toHaveClass(plannerTodayColumnRingClassName);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan day Tue 07-28, today')).toBeInTheDocument();
  });

  it('keeps today wash when isToday and isFocused (Plan Day open)', () => {
    const { container } = render(<PlannerDayColumn day={baseDay()} isToday isFocused />);
    const shell = container.firstElementChild as HTMLElement;
    expect(shell).toHaveClass(plannerTodayColumnBgClassName);
    expect(shell).toHaveClass('ring-blue-500/40');
    expect(shell).not.toHaveClass(plannerTodayColumnRingClassName);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('does not apply today wash when isFocused on a non-today day', () => {
    const { container } = render(<PlannerDayColumn day={baseDay()} isFocused />);
    const shell = container.firstElementChild as HTMLElement;
    expect(shell).not.toHaveClass(plannerTodayColumnBgClassName);
    expect(shell).toHaveClass('border-blue-500');
    expect(shell).toHaveClass('ring-blue-500/40');
  });
});
