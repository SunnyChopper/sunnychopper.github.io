import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AutomationRunHistoryItem from './AutomationRunHistoryItem';
import AutomationRunHistoryDialog from './AutomationRunHistoryDialog';
import type { ProactiveAutomation, ProactiveAutomationRun } from '@/types/api-contracts';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

import { useQuery } from '@tanstack/react-query';

const mockedUseQuery = vi.mocked(useQuery);

function makeRun(overrides: Partial<ProactiveAutomationRun> = {}): ProactiveAutomationRun {
  return {
    id: 'run-1',
    automationId: 'auto-1',
    status: 'failed',
    ranAt: '2026-07-23T12:00:00.000Z',
    runSource: 'scheduled',
    errorMessage: 'Dispatch failed: validation error on field prompt',
    threadId: 'thread-abc',
    ...overrides,
  };
}

const automation: ProactiveAutomation = {
  id: 'auto-1',
  kind: 'dailyBriefing',
  enabled: true,
  localTime: '08:00',
  timeZone: 'America/Chicago',
  threadStrategy: 'newThreadEachRun',
  channelEmailEnabled: false,
  channelWebhookEnabled: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('AutomationRunHistoryItem', () => {
  it('renders failed accent and expandable error with break-words', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const longError =
      'runId=run-01longidentifierwithoutspaces Dispatch failed with a very long unbroken token';

    render(
      <ul>
        <AutomationRunHistoryItem
          run={makeRun({ errorMessage: longError })}
          errorExpanded={false}
          onToggleError={onToggle}
          reduceMotion
        />
      </ul>
    );

    const row = screen.getByRole('button', { name: /show error details/i }).closest('li');
    expect(row).toHaveClass('border-l-red-500');

    await user.click(screen.getByRole('button', { name: /show error details/i }));
    expect(onToggle).toHaveBeenCalled();
  });

  it('shows error body with wrap classes when expanded', () => {
    const longError =
      'runId=run-01longidentifierwithoutspaces Dispatch failed with a very long unbroken token';

    render(
      <ul>
        <AutomationRunHistoryItem
          run={makeRun({ errorMessage: longError })}
          errorExpanded
          onToggleError={() => {}}
          reduceMotion
        />
      </ul>
    );

    const errorBody = screen.getByText(/runId=run-01longidentifier/);
    expect(errorBody).toHaveClass('break-words');
    expect(errorBody).toHaveClass('overflow-x-hidden');
  });

  it('shows clamped success preview and secondary Open thread link', () => {
    render(
      <ul>
        <AutomationRunHistoryItem
          run={makeRun({
            status: 'succeeded',
            errorMessage: null,
            responsePreview: 'Here is a short assistant summary for the operator.',
          })}
          errorExpanded={false}
          onToggleError={() => {}}
          reduceMotion
        />
      </ul>
    );

    const preview = screen.getByText(/short assistant summary/);
    expect(preview).toHaveClass('line-clamp-3');

    const link = screen.getByRole('link', { name: /open thread/i });
    expect(link).toHaveClass('text-gray-500');
    expect(link).toHaveAttribute('href', expect.stringContaining('thread-abc'));
  });
});

describe('AutomationRunHistoryDialog', () => {
  beforeEach(() => {
    mockedUseQuery.mockReset();
  });

  it('shows empty state title No runs yet', () => {
    mockedUseQuery.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof useQuery>);

    render(
      <AutomationRunHistoryDialog
        isOpen
        onClose={() => {}}
        automation={automation}
        kindLabel="Daily Briefing"
      />
    );

    expect(screen.getByText('No runs yet')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Run history' })).toBeInTheDocument();
    expect(screen.getByText('Daily Briefing')).toBeInTheDocument();
  });

  it('expands the most recent failed run by default', () => {
    const runs = [
      makeRun({
        id: 'run-fail-newest',
        status: 'failed',
        errorMessage: 'Newest failure',
        ranAt: '2026-07-23T14:00:00.000Z',
      }),
      makeRun({
        id: 'run-ok',
        status: 'succeeded',
        errorMessage: null,
        responsePreview: 'All good',
        ranAt: '2026-07-23T13:00:00.000Z',
      }),
    ];

    mockedUseQuery.mockReturnValue({
      data: runs,
      isPending: false,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof useQuery>);

    render(
      <AutomationRunHistoryDialog
        isOpen
        onClose={() => {}}
        automation={automation}
        kindLabel="Daily Briefing"
      />
    );

    expect(screen.getByText('Newest failure')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide error details/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});
