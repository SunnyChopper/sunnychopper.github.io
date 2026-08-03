import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HealthErrorPanel from './HealthErrorPanel';
import HealthJobRow from './HealthJobRow';
import HealthSummaryStrip from './HealthSummaryStrip';
import type { ObservabilityHealthRow } from '@/types/observability';

const editorSettings = { localRepoRoot: '/repo', protocol: 'none' as const };

const failedRow: ObservabilityHealthRow = {
  rowId: 'job-run-1',
  jobName: 'proactive_daily',
  jobType: 'proactive_automation',
  lastStatus: 'failed',
  lastStartedAt: '2026-07-23T08:00:40.000Z',
  lastFinishedAt: '2026-07-23T08:01:15.000Z',
  errorMessage: 'Dispatch failed',
  stackTrace: 'Traceback (most recent call last):\nValueError: boom',
};

describe('HealthSummaryStrip', () => {
  it('renders dashboard metrics with danger styling when failures exist', () => {
    render(
      <HealthSummaryStrip
        sinceDays={14}
        onSinceDaysChange={() => {}}
        summary={{ totalRuns: 38, failureCount: 5, lastFailureAt: '2026-07-23T22:01:15.000Z' }}
      />
    );

    expect(screen.getByLabelText('Automation health summary')).toBeInTheDocument();
    expect(screen.getByText('Runs')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText('Failures')).toBeInTheDocument();
    expect(screen.getByText('5')).toHaveClass('text-red-700');
    expect(screen.getByText('Last failure')).toBeInTheDocument();
  });
});

describe('HealthJobRow', () => {
  it('shows failed accent, status badge, and Replay as primary action first', () => {
    render(
      <table>
        <tbody>
          <HealthJobRow
            row={failedRow}
            isExpanded={false}
            onToggleDetails={() => {}}
            onInvestigate={() => {}}
            onReplay={() => {}}
            isReplayPending={false}
            editorLinkSettings={editorSettings}
          />
        </tbody>
      </table>
    );

    const row = screen.getByText('proactive_daily').closest('tr');
    expect(row).toHaveClass('border-l-red-500');
    expect(screen.getByText('failed')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Replay');
    expect(buttons[0].className).toContain('bg-primary');
    expect(buttons[1]).toHaveTextContent('Investigate');
    expect(buttons[2]).toHaveTextContent('Details');
  });

  it('expands calm error panel with copy affordance', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <table>
        <tbody>
          <HealthJobRow
            row={failedRow}
            isExpanded
            onToggleDetails={() => {}}
            onInvestigate={() => {}}
            onReplay={() => {}}
            isReplayPending={false}
            editorLinkSettings={editorSettings}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Dispatch failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy error/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /copy error/i }));
    expect(writeText).toHaveBeenCalledWith(
      'Dispatch failed\n\nTraceback (most recent call last):\nValueError: boom'
    );
  });
});

describe('HealthErrorPanel', () => {
  it('shows empty state when no payload', () => {
    render(<HealthErrorPanel errorMessage={null} stackTrace={null} settings={editorSettings} />);
    expect(screen.getByText('No error payload for this run.')).toBeInTheDocument();
  });
});
