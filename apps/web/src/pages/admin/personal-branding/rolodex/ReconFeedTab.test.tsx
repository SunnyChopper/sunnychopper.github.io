import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ReconPost } from '@/types/api/personal-branding.dto';
import ReconFeedTab from './ReconFeedTab';

const processedPost: ReconPost = {
  id: 'post-processed-1',
  connectionId: 'conn-1',
  connectionName: 'Example Creator',
  platformPostId: '1234567890',
  authorUsername: 'example',
  text: 'Processed post body for collapse test.',
  url: 'https://x.com/example/status/1234567890',
  postedAt: '2026-07-20T12:00:00.000Z',
  likeCount: 1,
  retweetCount: 0,
  replyCount: 0,
  relevanceScore: 0.82,
  relevanceRationale: 'Strong alignment',
  relevanceRationaleBullets: null,
  recommendedAction: 'reply',
  confidence: 0.9,
  status: 'DISMISSED',
  userId: 'user-1',
  createdAt: '2026-07-20T12:00:00.000Z',
  updatedAt: '2026-07-21T18:47:04.000Z',
};

const activePost: ReconPost = {
  ...processedPost,
  id: 'post-active-1',
  status: 'NEW',
  text: 'Active post body for scarcity banner test.',
};

const emptyQuery = {
  items: [] as ReconPost[],
  total: 0,
  isError: false,
  error: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: vi.fn(),
};

const pendingMutation = { mutateAsync: vi.fn(), isPending: false };

const scarcityHealthy = {
  recentHighSignalCount: 8,
  threshold: 0.5,
  isScarce: false,
  isLoading: false,
  isError: false,
  isSuccess: true,
};

const scarcityLow = {
  recentHighSignalCount: 2,
  threshold: 0.5,
  isScarce: true,
  isLoading: false,
  isError: false,
  isSuccess: true,
};

function buildReconFeedMock(overrides?: {
  posts?: typeof emptyQuery;
  scarcity?: typeof scarcityHealthy;
}) {
  return {
    posts: overrides?.posts ?? { ...emptyQuery },
    processedPosts: {
      ...emptyQuery,
      items: [processedPost],
      total: 71,
    },
    scarcity: overrides?.scarcity ?? scarcityHealthy,
    followSuggestions: { ...emptyQuery },
    runs: {
      data: { data: [], total: 0, page: 1, pageSize: 20, hasMore: false },
      isError: false,
      error: null,
      isLoading: false,
      isFetching: false,
    },
    activeRunId: null,
    activeRun: { data: undefined, isLoading: false },
    updatePost: pendingMutation,
    updatingPostId: null,
    updateFollowSuggestion: pendingMutation,
    explainFollowSuggestionConfidence: pendingMutation,
    submitFollowSuggestionConfidenceFeedback: pendingMutation,
    proposeFollowSuggestionConnection: pendingMutation,
    controlRun: pendingMutation,
    startRun: pendingMutation,
  };
}

const useReconFeedMock = vi.fn(() => buildReconFeedMock());

vi.mock('@/hooks/useReconFeed', () => ({
  useReconFeed: () => useReconFeedMock(),
  useReconRunDetail: () => ({
    detail: { data: undefined, isLoading: false },
  }),
  RECON_RUNS_PAGE_SIZE: 20,
  buildReconScarcityMessage: (
    recentHighSignalCount: number,
    threshold: number,
    hasTrackedXHandles: boolean
  ) => {
    const countLabel = recentHighSignalCount === 1 ? 'post' : 'posts';
    const base = `Only ${recentHighSignalCount} ${countLabel} from the last 48 h scored at or above your relevance threshold (${threshold})`;
    if (!hasTrackedXHandles) {
      return `${base}—add X handles in Connection Directory to start ingesting recon posts.`;
    }
    return `${base}—consider adding more high-signal accounts.`;
  },
}));

vi.mock('@/hooks/useRolodexReplyRuns', () => ({
  useRolodexReplyRuns: () => ({
    query: { data: undefined },
    startRun: pendingMutation,
    updateSuggestion: pendingMutation,
  }),
  useActiveReplyRuns: () => undefined,
}));

function renderTab(options?: {
  initialEntries?: string[];
  connections?: Array<{ id: string; handles?: { x?: string } }>;
}) {
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <ReconFeedTab
            showToast={vi.fn()}
            rolodex={
              {
                connections: {
                  data: {
                    data: options?.connections ?? [{ id: 'conn-1', handles: { x: 'example' } }],
                  },
                },
                createConnection: pendingMutation,
                logInteraction: pendingMutation,
              } as never
            }
            profiles={[]}
            selectedProfileId={null}
          />
        ),
      },
    ],
    { initialEntries: options?.initialEntries ?? ['/?tab=recon-feed'] }
  );

  return { ...render(<RouterProvider router={router} />), router };
}

describe('ReconFeedTab processed section', () => {
  it('hides processed cards by default and reveals restore after expand', async () => {
    const user = userEvent.setup();
    renderTab();

    expect(screen.getByText(/View processed · 1 of 71/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restore to feed' })).not.toBeInTheDocument();
    expect(
      screen.queryByText('Posts you reviewed, actioned, or dismissed.')
    ).not.toBeInTheDocument();

    const processedToggle = screen.getByRole('button', { name: /Processed/i });
    expect(processedToggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(processedToggle);

    expect(processedToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Posts you reviewed, actioned, or dismissed./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore to feed' })).toBeInTheDocument();
    expect(screen.getByText('Processed post body for collapse test.')).toBeInTheDocument();
  });
});

describe('ReconFeedTab scarcity hint', () => {
  it('shows the scarcity banner when high-signal volume is low', () => {
    useReconFeedMock.mockReturnValueOnce(
      buildReconFeedMock({
        posts: { ...emptyQuery, items: [activePost], total: 1 },
        scarcity: scarcityLow,
      })
    );

    renderTab();

    expect(
      screen.getAllByText(
        /Only 2 posts from the last 48 h scored at or above your relevance threshold \(0\.5\)/i
      ).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Open Connection Directory' })).toBeInTheDocument();
  });

  it('hides the scarcity banner when high-signal volume is healthy', () => {
    useReconFeedMock.mockReturnValueOnce(
      buildReconFeedMock({
        posts: { ...emptyQuery, items: [activePost], total: 1 },
        scarcity: scarcityHealthy,
      })
    );

    renderTab();

    expect(
      screen.queryByText(/Only .* posts from the last 48 h scored at or above/i)
    ).not.toBeInTheDocument();
  });

  it('uses scarcity empty-state copy and navigates to Connection Directory', async () => {
    const user = userEvent.setup();
    useReconFeedMock.mockReturnValueOnce(
      buildReconFeedMock({
        scarcity: scarcityLow,
      })
    );

    const { router } = renderTab();

    expect(
      screen.getByText(
        /Only 2 posts from the last 48 h scored at or above your relevance threshold \(0\.5\)/i
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open Connection Directory' }));

    expect(router.state.location.search).toContain('tab=directory');
  });

  it('strengthens the CTA when no tracked X handles exist', () => {
    useReconFeedMock.mockReturnValueOnce(
      buildReconFeedMock({
        scarcity: scarcityLow,
      })
    );

    renderTab({ connections: [] });

    expect(
      screen.getByRole('button', { name: 'Add X handles in Connection Directory' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add X handles in Connection Directory to start ingesting recon posts/i)
    ).toBeInTheDocument();
  });
});
