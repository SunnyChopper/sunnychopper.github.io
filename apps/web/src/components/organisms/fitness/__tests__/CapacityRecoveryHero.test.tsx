import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CapacityRecoveryHero } from '@/components/organisms/fitness/CapacityRecoveryHero';

const TODAY = '2026-07-29';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

vi.mock('@/lib/date/local-calendar', () => ({
  localCalendarDate: () => TODAY,
}));

vi.mock('@/components/organisms/fitness/DailyRecoveryDialog', () => ({
  DailyRecoveryDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="recovery-dialog">Dialog open</div> : null,
}));

vi.mock('@/hooks/useFitness', () => ({
  useFitnessRecoveryRange: vi.fn(),
  useSleepDebt: vi.fn(),
  useSleepDebtPreferences: vi.fn(),
  useSetSleepDebtPreferencesMutation: vi.fn(),
}));

import {
  useFitnessRecoveryRange,
  useSetSleepDebtPreferencesMutation,
  useSleepDebt,
  useSleepDebtPreferences,
} from '@/hooks/useFitness';

function renderHero() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CapacityRecoveryHero />
    </QueryClientProvider>
  );
}

describe('CapacityRecoveryHero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSleepDebt).mockReturnValue({
      data: {
        success: true,
        data: {
          targetHours: 8,
          windowDays: 7,
          debtHours: 0,
          loggedDays: 0,
          startDate: '2026-07-23',
          endDate: TODAY,
          source: 'manual',
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useSleepDebt>);
    vi.mocked(useSleepDebtPreferences).mockReturnValue({
      data: { targetHours: 8 },
      isLoading: false,
    } as unknown as ReturnType<typeof useSleepDebtPreferences>);
    vi.mocked(useSetSleepDebtPreferencesMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useSetSleepDebtPreferencesMutation>);
  });

  it('shows unknown status and Log recovery when no row', () => {
    vi.mocked(useFitnessRecoveryRange).mockReturnValue({
      data: { success: true, data: { data: [], total: 0, page: 1, pageSize: 50 } },
      isLoading: false,
    } as unknown as ReturnType<typeof useFitnessRecoveryRange>);

    renderHero();

    expect(screen.getByTestId('capacity-recovery-status')).toHaveTextContent(
      'No recovery logged · capacity unknown'
    );
    expect(screen.getByTestId('capacity-sleep-debt')).toHaveTextContent(
      'Sleep debt · no sleep logged (7d)'
    );
    expect(screen.getByRole('button', { name: 'Log recovery' })).toBeInTheDocument();
    expect(screen.getByTestId('sleep-target-trigger')).toHaveTextContent('Target 8h');
  });

  it('shows recovered status and Update recovery when score is high', () => {
    vi.mocked(useFitnessRecoveryRange).mockReturnValue({
      data: {
        success: true,
        data: {
          data: [
            {
              date: TODAY,
              userId: 'u1',
              recoveryScore: 82,
              isPersisted: true,
            },
          ],
          total: 1,
          page: 1,
          pageSize: 50,
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useFitnessRecoveryRange>);
    vi.mocked(useSleepDebt).mockReturnValue({
      data: {
        success: true,
        data: {
          targetHours: 8,
          windowDays: 7,
          debtHours: 1.5,
          loggedDays: 2,
          startDate: '2026-07-23',
          endDate: TODAY,
          source: 'manual',
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useSleepDebt>);

    renderHero();

    expect(screen.getByTestId('capacity-recovery-status')).toHaveTextContent(
      'Recovered · ready for volume'
    );
    expect(screen.getByTestId('capacity-sleep-debt')).toHaveTextContent(
      'Sleep debt · 1.5h short (7d)'
    );
    expect(screen.getByRole('button', { name: 'Update recovery' })).toBeInTheDocument();
    expect(screen.getByLabelText('Recovery score 82')).toBeInTheDocument();
  });

  it('opens recovery dialog when CTA clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useFitnessRecoveryRange).mockReturnValue({
      data: { success: true, data: { data: [], total: 0, page: 1, pageSize: 50 } },
      isLoading: false,
    } as unknown as ReturnType<typeof useFitnessRecoveryRange>);

    renderHero();

    await user.click(screen.getByRole('button', { name: 'Log recovery' }));
    expect(screen.getByTestId('recovery-dialog')).toBeInTheDocument();
  });

  it('opens target editor and saves new target', async () => {
    const user = userEvent.setup();
    const mutate = vi.fn((_hours: number, opts?: { onSuccess?: () => void }) => {
      opts?.onSuccess?.();
    });
    vi.mocked(useSetSleepDebtPreferencesMutation).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSetSleepDebtPreferencesMutation>);
    vi.mocked(useFitnessRecoveryRange).mockReturnValue({
      data: { success: true, data: { data: [], total: 0, page: 1, pageSize: 50 } },
      isLoading: false,
    } as unknown as ReturnType<typeof useFitnessRecoveryRange>);

    renderHero();

    await user.click(screen.getByTestId('sleep-target-trigger'));
    const input = screen.getByTestId('sleep-target-input');
    await user.clear(input);
    await user.type(input, '7.5');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(mutate).toHaveBeenCalledWith(7.5, expect.any(Object));
  });
});
