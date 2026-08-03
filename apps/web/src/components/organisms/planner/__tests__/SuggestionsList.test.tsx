import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SuggestionsList } from '@/components/organisms/planner/SuggestionsList';
import type { PlanDaySuggestion } from '@/types/planner';

const sampleSuggestion = (partial: Partial<PlanDaySuggestion>): PlanDaySuggestion => ({
  taskId: 't1',
  title: 'Task one',
  storyPoints: 3,
  priority: 'P1',
  score: 100,
  reason: 'Test',
  ...partial,
});

function ToggleHarness({ suggestion }: { suggestion: PlanDaySuggestion }) {
  const [orderedIds, setOrderedIds] = useState([suggestion.taskId]);
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>([suggestion.taskId]));

  return (
    <SuggestionsList
      suggestions={[suggestion]}
      orderedIds={orderedIds}
      capacityPoints={5}
      selectedIds={selectedIds}
      onToggleTask={(tid) => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(tid)) next.delete(tid);
          else next.add(tid);
          return next;
        });
      }}
      onReorder={setOrderedIds}
    />
  );
}

function OverCapacityHarness({
  suggestions,
  capacityPoints,
  onTrimToFit,
}: {
  suggestions: PlanDaySuggestion[];
  capacityPoints: number;
  onTrimToFit?: () => void;
}) {
  const [orderedIds, setOrderedIds] = useState(suggestions.map((s) => s.taskId));
  const [selectedIds, setSelectedIds] = useState(
    () => new Set<string>(suggestions.map((s) => s.taskId))
  );

  return (
    <SuggestionsList
      suggestions={suggestions}
      orderedIds={orderedIds}
      capacityPoints={capacityPoints}
      selectedIds={selectedIds}
      onToggleTask={(tid) => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(tid)) next.delete(tid);
          else next.add(tid);
          return next;
        });
      }}
      onReorder={setOrderedIds}
      onTrimToFit={onTrimToFit}
    />
  );
}

describe('SuggestionsList', () => {
  it('subtracts unchecked tasks from totals', async () => {
    const suggestion = sampleSuggestion({});
    render(<ToggleHarness suggestion={suggestion} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText(/0\.0 \/ ~5\.0 pts/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /Daily capacity/i })).toBeInTheDocument();
  });

  it('hides reason meta by default and shows title with points', () => {
    const suggestion = sampleSuggestion({ reason: 'Overdue task; Due this week' });
    render(<ToggleHarness suggestion={suggestion} />);
    expect(screen.getByText('Task one')).toBeVisible();
    expect(screen.getByText('3 pts')).toBeVisible();
    expect(screen.getByText('Overdue task; Due this week').parentElement).toHaveClass('hidden');
  });

  it('reveals reason meta when row receives focus', async () => {
    const user = userEvent.setup();
    const suggestion = sampleSuggestion({ reason: 'Overdue task; Due this week' });
    render(<ToggleHarness suggestion={suggestion} />);
    await user.tab();
    await user.tab();
    expect(screen.getByText('Overdue task; Due this week').parentElement).toHaveClass('block');
    expect(screen.getByText('Overdue task; Due this week').parentElement).not.toHaveClass('hidden');
  });

  it('toggles sticky expand on title click', async () => {
    const user = userEvent.setup();
    const suggestion = sampleSuggestion({ reason: 'Due this week' });
    render(<ToggleHarness suggestion={suggestion} />);
    const title = screen.getByRole('button', { name: 'Task one' });
    const meta = screen.getByText('Due this week').parentElement;
    expect(title).toHaveAttribute('aria-expanded', 'false');
    expect(meta).toHaveClass('hidden');

    await user.click(title);
    expect(title).toHaveAttribute('aria-expanded', 'true');
    expect(meta).toHaveClass('block');
    expect(meta).not.toHaveClass('hidden');

    await user.click(title);
    expect(title).toHaveAttribute('aria-expanded', 'false');
    await user.tab();
    expect(meta).toHaveClass('hidden');
  });

  it('shows priority badge and Fits today chip in secondary meta after expand', async () => {
    const user = userEvent.setup();
    const suggestion = sampleSuggestion({ contextMatch: true, fitReason: 'Fits a lighter day' });
    render(<ToggleHarness suggestion={suggestion} />);
    const meta = screen.getByText('Test').parentElement;
    expect(meta).toHaveClass('hidden');
    await user.click(screen.getByRole('button', { name: 'Task one' }));
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('Fits today')).toBeInTheDocument();
    expect(meta).toHaveClass('block');
  });

  it('shows explicit excess points when over capacity', () => {
    const suggestions = [
      sampleSuggestion({ taskId: 'big', title: 'Big task', storyPoints: 8, priority: 'P1' }),
    ];
    render(
      <OverCapacityHarness suggestions={suggestions} capacityPoints={4.3} onTrimToFit={vi.fn()} />
    );
    expect(screen.getByText('3.7 pts over capacity')).toBeInTheDocument();
    expect(screen.getByText(/8\.0 \/ ~4\.3 pts/)).toBeInTheDocument();
  });

  it('shows trim button when over capacity and calls onTrimToFit', async () => {
    const onTrimToFit = vi.fn();
    const suggestions = [
      sampleSuggestion({ taskId: 'big', title: 'Big task', storyPoints: 8, priority: 'P1' }),
    ];
    render(
      <OverCapacityHarness
        suggestions={suggestions}
        capacityPoints={4.3}
        onTrimToFit={onTrimToFit}
      />
    );

    const trimButton = screen.getByRole('button', { name: /Remove lowest-priority to fit/i });
    await userEvent.click(trimButton);
    expect(onTrimToFit).toHaveBeenCalledTimes(1);
  });

  it('hides trim button when within capacity', () => {
    const suggestions = [sampleSuggestion({ storyPoints: 3 })];
    render(
      <OverCapacityHarness suggestions={suggestions} capacityPoints={3} onTrimToFit={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: /Remove lowest-priority to fit/i })).toBeNull();
    expect(screen.getByText('Optimal Capacity')).toBeInTheDocument();
  });
});
