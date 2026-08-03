import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AmbientPresenceStrip } from '@/components/organisms/assistant/AmbientPresenceStrip';

const mutateAsync = vi.fn().mockResolvedValue({ ack: true });

vi.mock('@/hooks/chatbot/useAmbientPresence', () => ({
  useAmbientPresence: () => ({
    data: {
      items: [
        {
          id: 'dashboard:recovery-missing',
          surface: 'dashboard',
          kind: 'recoveryMissing',
          tone: 'nudge',
          title: 'Log how you slept',
          body: 'No recovery check-in yet today.',
          href: '/admin/health-fitness',
          askPrompt: 'Help me log recovery',
          source: 'aggregate',
          dismissible: true,
          actions: [{ id: 'openQuickRecovery', label: 'Log now', style: 'primary' }],
        },
      ],
    },
    isLoading: false,
  }),
  useAmbientPresenceMutations: () => ({
    dismissMutation: { mutate: vi.fn(), isPending: false },
    actionMutation: { mutateAsync, isPending: false },
  }),
}));

vi.mock('@/contexts/AmbientAskContext', () => ({
  useAmbientAsk: () => ({ openAsk: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('AmbientPresenceStrip', () => {
  it('opens quick recovery when Log now is clicked', async () => {
    const onQuickRecovery = vi.fn();
    const user = userEvent.setup();

    render(<AmbientPresenceStrip surface="dashboard" onQuickRecovery={onQuickRecovery} />);

    await user.click(screen.getByRole('button', { name: 'Log now' }));

    expect(onQuickRecovery).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ actionId: 'openQuickRecovery' })
    );
  });
});
