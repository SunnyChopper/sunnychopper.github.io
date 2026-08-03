import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/routes';
import type { WeeklyReviewAiAnalysis } from '@/types/growth-system';
import {
  normalizeWeeklyReviewInsightCards,
  weeklyReviewNoSignalLabel,
} from '../weekly-review-insight-cards';

function baseAnalysis(overrides: Partial<WeeklyReviewAiAnalysis> = {}): WeeklyReviewAiAnalysis {
  return {
    tasksSummary: '',
    overdueTasks: [],
    velocityTrend: 'stable',
    habitsSummary: '',
    habitsOnTarget: false,
    habitsAiMessage: '',
    metricsSummary: '',
    metricDeltas: [],
    goalsSummary: '',
    atRiskAlerts: [],
    logbookSummary: '',
    quarantineCandidates: [],
    suggestedTasks: [],
    hypeSummary: 'Ready',
    ...overrides,
  };
}

describe('normalizeWeeklyReviewInsightCards', () => {
  it('dedupes duplicate habit sentences into one signal card', () => {
    const result = normalizeWeeklyReviewInsightCards(
      baseAnalysis({
        habitsSummary: 'You have 4 active habits.',
        habitsAiMessage: 'You have 4 active habits.',
      })
    );

    expect(result.signalCards).toHaveLength(1);
    expect(result.signalCards[0].id).toBe('habits');
    expect(result.signalCards[0].body).toBe('You have 4 active habits.');
    expect(result.emptyDomains.map((d) => d.id)).toEqual([
      'tasks',
      'metrics',
      'goals',
      'projects',
      'logbook',
    ]);
  });

  it('puts zero-signal tasks, metrics, and logbook into emptyDomains only', () => {
    const result = normalizeWeeklyReviewInsightCards(
      baseAnalysis({
        tasksSummary: 'You have completed 0 tasks.',
        metricsSummary: 'There are no metrics.',
        logbookSummary: 'Your logbook is empty.',
        goalsSummary: 'There are 27 active goals.',
      })
    );

    expect(result.signalCards).toHaveLength(1);
    expect(result.signalCards[0].id).toBe('goals-projects');
    expect(result.emptyDomains.map((d) => d.label)).toEqual([
      'Tasks',
      'Habits',
      'Metrics',
      'Logbook',
    ]);
  });

  it('returns mixed signal cards and empty domain links', () => {
    const result = normalizeWeeklyReviewInsightCards(
      baseAnalysis({
        tasksSummary: 'Completed 5 tasks (12 story points) with 3 still open.',
        habitsSummary: 'Logged 8 habit completions against 10 weekly targets (80%).',
        habitsAiMessage: 'Strong habit week — keep the streak going.',
        metricsSummary: 'No metrics logged this period.',
        goalsSummary: '3 active goals.',
        logbookSummary: 'No journal entries this period.',
      })
    );

    expect(result.signalCards.map((c) => c.id)).toEqual(['tasks', 'habits', 'goals-projects']);
    expect(result.emptyDomains.map((d) => d.label)).toEqual(['Metrics', 'Logbook']);
    expect(result.signalCards[0].href).toBe(ROUTES.admin.tasks);
    expect(result.signalCards[1].href).toBe(ROUTES.admin.habits);
    expect(result.signalCards[2].href).toBe(ROUTES.admin.goals);
  });

  it('returns all domains as empty links when every domain is zero-signal', () => {
    const result = normalizeWeeklyReviewInsightCards(
      baseAnalysis({
        tasksSummary: 'You have completed 0 tasks.',
        habitsSummary: '',
        habitsAiMessage: '',
        metricsSummary: 'There are no metrics.',
        goalsSummary: '0 active goals.',
        logbookSummary: 'Your logbook is empty.',
      })
    );

    expect(result.signalCards).toHaveLength(0);
    expect(result.emptyDomains.map((d) => d.id)).toEqual([
      'tasks',
      'habits',
      'metrics',
      'goals',
      'projects',
      'logbook',
    ]);
    expect(result.emptyDomains.find((d) => d.id === 'goals')?.href).toBe(ROUTES.admin.goals);
    expect(result.emptyDomains.find((d) => d.id === 'projects')?.href).toBe(ROUTES.admin.projects);
  });

  it('exports no-signal label constant', () => {
    expect(weeklyReviewNoSignalLabel).toBe('No signal this week — quiet across modules.');
  });
});
