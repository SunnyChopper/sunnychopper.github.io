import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AISuggestedTasks } from '@/components/organisms/AISuggestedTasks';
import type {
  SuccessCriterion,
  WeeklyReviewAcceptedTask,
  WeeklyReviewSuggestedTask,
  WeeklyReviewVelocityWeek,
} from '@/types/growth-system';

const GOAL_ID = 'goal-cadence';
const GOAL_TITLE = 'Hitting the Cadence';

const criteria: SuccessCriterion[] = [
  {
    id: 'c1',
    description: 'Complete P2 and P3 goals',
    isCompleted: false,
    completedAt: null,
    linkedMetricId: null,
    linkedTaskId: null,
    targetDate: null,
    order: 0,
  },
];

const velocityData: WeeklyReviewVelocityWeek[] = [
  { weekStart: '2026-07-14', storyPointsCompleted: 8, tasksCompleted: 3 },
  { weekStart: '2026-07-21', storyPointsCompleted: 12, tasksCompleted: 4 },
];

function makeSuggestion(title: string): WeeklyReviewSuggestedTask {
  return {
    title,
    rationale: `This task is related to the goal '${GOAL_TITLE}' and is a high-priority task.`,
    suggestedStoryPoints: 5,
    goalIds: [GOAL_ID],
    projectIds: [],
  };
}

const unanimousSuggestions = [
  makeSuggestion('Complete P2 and P3 Goals'),
  makeSuggestion('Job Applications Tracking System'),
  makeSuggestion('Tour the Residences Apartments'),
  makeSuggestion('Fix Usage and Observability Feature'),
];

const goalById = {
  [GOAL_ID]: { title: GOAL_TITLE, successCriteria: criteria },
};

function ControlledSuggestions({
  initialSuggestions,
  accepted = [],
  readOnly = false,
}: {
  initialSuggestions: WeeklyReviewSuggestedTask[];
  accepted?: WeeklyReviewAcceptedTask[];
  readOnly?: boolean;
}) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);

  return (
    <AISuggestedTasks
      suggestions={suggestions}
      accepted={accepted}
      onAdd={vi.fn()}
      onDismiss={(index) => setSuggestions((list) => list.filter((_, i) => i !== index))}
      onRefresh={vi.fn()}
      readOnly={readOnly}
      goalById={goalById}
      velocityTrend="stable"
      velocityData={velocityData}
    />
  );
}

describe('AISuggestedTasks', () => {
  it('renders unanimous goal header and strips repeated goal rationale', () => {
    render(
      <AISuggestedTasks
        suggestions={unanimousSuggestions.slice(0, 2)}
        accepted={[]}
        onAdd={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        goalById={goalById}
        velocityTrend="stable"
        velocityData={velocityData}
      />
    );

    expect(screen.getByText(/All suggestions for/i)).toBeInTheDocument();
    expect(screen.getByText(GOAL_TITLE)).toBeInTheDocument();
    expect(
      screen.queryByText(/related to the goal 'Hitting the Cadence'/i)
    ).not.toBeInTheDocument();
  });

  it('shows only first two suggestions until expanded', async () => {
    const user = userEvent.setup();
    render(
      <AISuggestedTasks
        suggestions={unanimousSuggestions}
        accepted={[]}
        onAdd={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        goalById={goalById}
        velocityTrend="stable"
        velocityData={velocityData}
      />
    );

    expect(screen.getByText('Complete P2 and P3 Goals')).toBeInTheDocument();
    expect(screen.getByText('Job Applications Tracking System')).toBeInTheDocument();
    expect(screen.queryByText('Tour the Residences Apartments')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show 2 more/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Show 2 more/i }));
    expect(screen.getByText('Tour the Residences Apartments')).toBeInTheDocument();
    expect(screen.getByText('Fix Usage and Observability Feature')).toBeInTheDocument();
  });

  it('shows Why this? tooltip with criteria and velocity grounding', async () => {
    const user = userEvent.setup();
    render(
      <AISuggestedTasks
        suggestions={[unanimousSuggestions[0]!]}
        accepted={[]}
        onAdd={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        goalById={goalById}
        velocityTrend="stable"
        velocityData={velocityData}
      />
    );

    const whyButtons = screen.getAllByRole('button', { name: 'Why this?' });
    await user.click(whyButtons[0]!);

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Open criterion: Complete P2 and P3 goals'
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Velocity is stable');
  });

  it('exposes Add to this week and Dismiss on each editable card', () => {
    render(
      <AISuggestedTasks
        suggestions={unanimousSuggestions.slice(0, 2)}
        accepted={[]}
        onAdd={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        goalById={goalById}
        velocityTrend="stable"
        velocityData={velocityData}
      />
    );

    expect(screen.getAllByRole('button', { name: /Add to this week/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /^Dismiss$/i })).toHaveLength(2);
  });

  it('calls onAdd with suggested story points when accepting', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const suggestion = unanimousSuggestions[0]!;

    render(
      <AISuggestedTasks
        suggestions={[suggestion]}
        accepted={[]}
        onAdd={onAdd}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        goalById={goalById}
        velocityTrend="stable"
        velocityData={velocityData}
      />
    );

    await user.click(screen.getByRole('button', { name: /Add to this week/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: suggestion.title,
        description: suggestion.rationale,
        size: suggestion.suggestedStoryPoints,
      })
    );
  });

  it('shows Added and hides Dismiss after accept', () => {
    const suggestion = unanimousSuggestions[0]!;

    render(
      <AISuggestedTasks
        suggestions={[suggestion]}
        accepted={[
          {
            title: suggestion.title,
            description: suggestion.rationale,
            area: 'Operations',
            priority: 'P3',
            size: suggestion.suggestedStoryPoints,
            goalIds: suggestion.goalIds,
            projectIds: suggestion.projectIds,
          },
        ]}
        onAdd={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        goalById={goalById}
        velocityTrend="stable"
        velocityData={velocityData}
      />
    );

    expect(screen.getByRole('button', { name: /^Added$/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^Dismiss$/i })).not.toBeInTheDocument();
  });

  it('removes a card from the list when Dismiss is clicked', async () => {
    const user = userEvent.setup();

    render(<ControlledSuggestions initialSuggestions={unanimousSuggestions.slice(0, 2)} />);

    expect(screen.getByText('Complete P2 and P3 Goals')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /^Dismiss$/i })[0]!);
    expect(screen.queryByText('Complete P2 and P3 Goals')).not.toBeInTheDocument();
    expect(screen.getByText('Job Applications Tracking System')).toBeInTheDocument();
  });

  it('calls onDismiss with the suggestion index', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <AISuggestedTasks
        suggestions={unanimousSuggestions.slice(0, 2)}
        accepted={[]}
        onAdd={vi.fn()}
        onDismiss={onDismiss}
        onRefresh={vi.fn()}
        goalById={goalById}
        velocityTrend="stable"
        velocityData={velocityData}
      />
    );

    await user.click(screen.getAllByRole('button', { name: /^Dismiss$/i })[1]!);
    expect(onDismiss).toHaveBeenCalledWith(1);
  });

  it('hides Add and Dismiss in readOnly mode', () => {
    render(<ControlledSuggestions initialSuggestions={[unanimousSuggestions[0]!]} readOnly />);

    expect(screen.queryByRole('button', { name: /Add to this week/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Dismiss$/i })).not.toBeInTheDocument();
  });

  it('allows keyboard focus on Add and Dismiss buttons', async () => {
    const user = userEvent.setup();

    render(
      <AISuggestedTasks
        suggestions={[unanimousSuggestions[0]!]}
        accepted={[]}
        onAdd={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        goalById={goalById}
        velocityTrend="stable"
        velocityData={velocityData}
      />
    );

    const addButton = screen.getByRole('button', { name: /Add to this week/i });
    const dismissButton = screen.getByRole('button', { name: /^Dismiss$/i });

    addButton.focus();
    expect(addButton).toHaveFocus();

    await user.tab();
    expect(dismissButton).toHaveFocus();
  });
});
