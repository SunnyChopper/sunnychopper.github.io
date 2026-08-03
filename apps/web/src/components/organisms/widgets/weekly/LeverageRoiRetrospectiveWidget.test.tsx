import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LeverageRoiRetrospectiveWidget } from '@/components/organisms/widgets/weekly/LeverageRoiRetrospectiveWidget';
import { tasksUntaggedCompletedHref } from '@/lib/growth-system/tasks-deep-links';
import type { WeeklyReviewLeverageRoiResponse } from '@/types/growth-system';

const sampleData: WeeklyReviewLeverageRoiResponse = {
  days: 7,
  anchorDate: '2026-04-15',
  periodStart: '2026-04-09',
  periodEnd: '2026-04-15',
  timeZone: 'UTC',
  leverageThreshold: 55,
  quadrants: [
    { key: 'coreWins', label: 'High ROI - Core Wins', tasks: [] },
    { key: 'strategicInvestments', label: 'Strategic Investments', tasks: [] },
    { key: 'necessaryFriction', label: 'Necessary Friction', tasks: [] },
    {
      key: 'bikesheddingTrap',
      label: 'Bikeshedding Trap',
      tasks: [
        {
          taskId: 't1',
          title: 'Over-polish docs',
          completedDate: '2026-04-14',
          energyWeight: 3,
          energyWeightSource: 'tagged',
          energyLevel: 'Deep Work',
          plannerScore: 20,
          roi: 6.67,
          quadrant: 'bikesheddingTrap',
          reason: 'High energy spent on low-leverage work',
        },
      ],
    },
  ],
  summary: {
    headline: '1 completed task was high-energy, low-leverage',
    bikesheddingCount: 1,
    coreWinsCount: 0,
    strategicInvestmentsCount: 0,
    necessaryFrictionCount: 0,
  },
  dataQuality: { untaggedEnergyCount: 0, totalCompleted: 1 },
};

function renderWidget(data: WeeklyReviewLeverageRoiResponse = sampleData) {
  return render(
    <MemoryRouter>
      <LeverageRoiRetrospectiveWidget data={data} />
    </MemoryRouter>
  );
}

describe('LeverageRoiRetrospectiveWidget', () => {
  it('renders Leverage ROI Matrix heading and four quadrant labels', () => {
    renderWidget();
    expect(screen.getByRole('heading', { name: /Leverage ROI Matrix/i })).toBeInTheDocument();
    expect(screen.getByText('Quick Wins')).toBeInTheDocument();
    expect(screen.getByText('High leverage / low energy')).toBeInTheDocument();
    expect(screen.getByText('Deep Focus Investments')).toBeInTheDocument();
    expect(screen.getByText('High leverage / high energy')).toBeInTheDocument();
    expect(screen.getByText('Routine Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Low leverage / low energy')).toBeInTheDocument();
    expect(screen.getByText(/The Bikeshedding Trap/i)).toBeInTheDocument();
    expect(screen.getByText('Low leverage / high energy')).toBeInTheDocument();
    expect(screen.getByText('Over-polish docs')).toBeInTheDocument();
  });

  it('shows unique empty-quadrant prompts instead of generic copy', () => {
    const allEmpty: WeeklyReviewLeverageRoiResponse = {
      ...sampleData,
      dataQuality: { untaggedEnergyCount: 0, totalCompleted: 2 },
      quadrants: sampleData.quadrants.map((q) => ({ ...q, tasks: [] })),
    };
    renderWidget(allEmpty);
    expect(screen.queryByText('No tasks in this quadrant.')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Tag energy on completed high-leverage tasks to land Quick Wins here/i,
      })
    ).toHaveAttribute('href', tasksUntaggedCompletedHref());
    expect(
      screen.getByRole('link', {
        name: /Protect Deep Work time for a high-leverage goal to fill this quadrant/i,
      })
    ).toHaveAttribute('href', '/admin/planner');
    expect(
      screen.getByRole('link', {
        name: /Tag Admin or Low Kinetic on routine completions to show maintenance load/i,
      })
    ).toHaveAttribute('href', tasksUntaggedCompletedHref());
    expect(
      screen.getByText(/Empty is healthy — keep Deep Work off low-leverage chores/i)
    ).toBeInTheDocument();
  });

  it('shows bikeshedding trap warning copy', () => {
    renderWidget();
    expect(
      screen.getByText(/High cognitive energy spent on low-leverage work/i)
    ).toBeInTheDocument();
  });

  it('shows ROI formula in tooltip when info button is activated', async () => {
    const user = userEvent.setup();
    renderWidget();
    const infoBtn = screen.getByRole('button', { name: /How leverage ROI is calculated/i });
    await user.hover(infoBtn);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(/ROI = PlannerScore/i);
    expect(tooltip).toHaveTextContent(/EnergyWeight/i);
    expect(tooltip).toHaveTextContent(/Admin = 1/i);
    expect(tooltip).toHaveTextContent(/Deep Work = 3/i);
  });

  it('shows empty state when no completed tasks', () => {
    const empty: WeeklyReviewLeverageRoiResponse = {
      ...sampleData,
      dataQuality: { untaggedEnergyCount: 0, totalCompleted: 0 },
      quadrants: sampleData.quadrants.map((q) => ({ ...q, tasks: [] })),
    };
    renderWidget(empty);
    expect(screen.getByText(/Complete tasks with energy levels set/i)).toBeInTheDocument();
  });

  it('shows untagged energy callout with Tasks deep-link', () => {
    const untagged: WeeklyReviewLeverageRoiResponse = {
      ...sampleData,
      dataQuality: { untaggedEnergyCount: 2, totalCompleted: 3 },
    };
    renderWidget(untagged);
    expect(screen.getByText(/lack an energy tag/i)).toBeInTheDocument();
    expect(screen.queryByText(/Planner/i)).not.toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Tag untagged tasks' });
    expect(link).toHaveAttribute('href', tasksUntaggedCompletedHref());
  });

  it('shows energy pattern insight callout above untagged banner', () => {
    const withPattern: WeeklyReviewLeverageRoiResponse = {
      ...sampleData,
      energyPatternInsight: {
        lookbackDays: 28,
        leverageThreshold: 55,
        taggedHighLeverageCount: 10,
        sampleWeeks: 4,
        dominantEnergyLevel: 'Deep Work',
        dominantCount: 7,
        sharePct: 70,
      },
      dataQuality: { untaggedEnergyCount: 1, totalCompleted: 2 },
    };
    renderWidget(withPattern);
    expect(screen.getByTestId('energy-pattern-insight-callout')).toBeInTheDocument();
    expect(
      screen.getByText(/Your high-leverage work tends to be Deep Work energy/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/lack an energy tag/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <MemoryRouter>
        <LeverageRoiRetrospectiveWidget isLoading />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading leverage ROI matrix/i)).toBeInTheDocument();
  });
});
