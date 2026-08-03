import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EntityExplainChatDrawer } from '@/components/organisms/EntityExplainChatDrawer';
import { buildEntityExplainContext } from '@/lib/entity-explain/build-entity-explain-context';
import type { Task } from '@/types/growth-system';

const sendUserMessage = vi.fn();
const createThread = vi.fn().mockResolvedValue({ id: 'thread-1' });

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: null }),
}));

vi.mock('@/contexts/EntityExplainChatContext', () => ({
  useEntityExplainChat: () => ({
    setThreadId: vi.fn(),
    setThreadCreating: vi.fn(),
    setThreadError: vi.fn(),
  }),
}));

vi.mock('@/hooks/chatbot/useChatMutations', () => ({
  useChatThreadMutations: () => ({ createThread }),
}));

vi.mock('@/hooks/chatbot/useChatMessages', () => ({
  useMessageTree: () => ({ tree: null, nodeById: new Map(), isLoading: false }),
}));

vi.mock('@/hooks/chatbot/useBranchSelection', () => ({
  useBranchSelection: () => ({
    selectedLeafId: null,
    transcript: [],
    setSelectedLeafId: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAssistantStreaming', () => ({
  useAssistantStreaming: () => ({
    sendUserMessage,
    isStreaming: false,
    isAwaitingRunStart: false,
    connectionState: 'connected',
    runs: {},
    reconnect: vi.fn(),
    error: null,
  }),
}));

const baseTask: Task = {
  id: 'task-1',
  title: 'Ship entity explain',
  description: null,
  extendedDescription: null,
  area: 'Day Job',
  subCategory: null,
  priority: 'P1',
  status: 'In Progress',
  size: 3,
  dueDate: null,
  scheduledDate: null,
  completedDate: null,
  rolloverCount: 0,
  parentTaskId: null,
  notes: null,
  isRecurring: false,
  recurrenceRule: null,
  pointValue: 5,
  pointsAwarded: false,
  projectIds: [],
  goalIds: [],
  userId: 'user-1',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-20T00:00:00.000Z',
};

function renderDrawer() {
  const ref = { entityType: 'task' as const, entity: baseTask };
  const context = buildEntityExplainContext(ref);
  const restoreFocusRef = { current: document.createElement('button') };
  document.body.appendChild(restoreFocusRef.current);
  const onClose = vi.fn();

  const view = render(
    <EntityExplainChatDrawer
      session={{
        ref,
        context,
        threadId: 'thread-1',
        isCreatingThread: false,
        threadError: null,
      }}
      onClose={onClose}
      restoreFocusRef={restoreFocusRef}
    />
  );

  return { onClose, restoreFocusRef, ...view };
}

describe('EntityExplainChatDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('1024px'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
  });

  it('renders structured header with status badge and suggestion chips', () => {
    renderDrawer();
    expect(screen.getByRole('dialog', { name: 'Explain with Assistant' })).toBeInTheDocument();
    expect(screen.getByText('Ship entity explain')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Why is this still open?' })).toBeInTheDocument();
  });

  it('closes on Escape and restores focus to opener', async () => {
    const user = userEvent.setup();
    const { onClose, restoreFocusRef, unmount } = renderDrawer();
    const focusSpy = vi.spyOn(restoreFocusRef.current, 'focus');

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
    unmount();

    await waitFor(() => {
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  it('sends chip prompt on one tap', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole('button', { name: 'Why is this still open?' }));

    await waitFor(() => {
      expect(sendUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ source: 'entityExplain', taskId: 'task-1' }),
        })
      );
    });
  });
});
