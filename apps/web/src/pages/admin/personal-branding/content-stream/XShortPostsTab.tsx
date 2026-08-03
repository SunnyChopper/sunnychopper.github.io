import { ThumbsDown, ThumbsUp } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { InsetPanel } from '@/components/molecules/personal-branding/InsetPanel';
import type { Toast } from '@/hooks/use-toast';
import type { ContentStreamHook } from '@/hooks/useContentStream';
import { useContentStreamJob } from '@/hooks/useContentStreamJob';
import { cn } from '@/lib/utils';
import {
  SOCIAL_CURRENCY_ANGLE_LABELS,
  type ContentStreamPost,
} from '@/types/api/personal-branding.dto';
import { PageCard, SectionIntro } from '../PersonalBrandingPageTemplate';

interface XShortPostsTabProps {
  stream: ContentStreamHook;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  activeJobId: string | null;
  onJobIdChange: (jobId: string | null) => void;
}

function PostCard({
  post,
  onFeedback,
  updating,
}: {
  post: ContentStreamPost;
  onFeedback: (postId: string, feedback: 'up' | 'down') => void;
  updating: boolean;
}) {
  const angleLabel =
    SOCIAL_CURRENCY_ANGLE_LABELS[post.socialCurrencyAngle] ?? post.socialCurrencyAngle;

  return (
    <InsetPanel
      className={cn(
        'space-y-3',
        post.status === 'kept' && 'border-green-300/60 dark:border-green-800/60',
        post.status === 'discarded' && 'opacity-60'
      )}
      padding="standard"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
          {angleLabel}
        </span>
        {post.status !== 'pending' ? (
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{post.status}</span>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-gray-100">
        {post.body}
      </p>
      {post.angleRationale ? (
        <p className="text-xs text-gray-600 dark:text-gray-400">{post.angleRationale}</p>
      ) : null}
      {post.memeSuggestion ? (
        <div className="rounded-lg border border-dashed border-amber-300/70 bg-amber-50/60 p-3 text-xs dark:border-amber-800/50 dark:bg-amber-950/20">
          <p className="font-medium text-amber-900 dark:text-amber-200">Meme idea</p>
          <p className="mt-1 text-gray-700 dark:text-gray-300">{post.memeSuggestion.concept}</p>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{post.memeSuggestion.visualBrief}</p>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={updating}
          onClick={() => onFeedback(post.id, 'up')}
          aria-label="Thumbs up"
        >
          <ThumbsUp className={cn('size-4', post.status === 'kept' && 'text-green-600')} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={updating}
          onClick={() => onFeedback(post.id, 'down')}
          aria-label="Thumbs down"
        >
          <ThumbsDown className={cn('size-4', post.status === 'discarded' && 'text-red-500')} />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => navigator.clipboard.writeText(post.body)}
        >
          Copy
        </Button>
      </div>
    </InsetPanel>
  );
}

export default function XShortPostsTab({
  stream,
  showToast,
  activeJobId,
  onJobIdChange,
}: XShortPostsTabProps) {
  const posts = stream.posts.data?.data ?? [];
  const jobQuery = useContentStreamJob(
    activeJobId,
    (job) => {
      if (job.status === 'succeeded') {
        showToast({
          type: 'success',
          title: `Generated ${job.createdPostIds.length} post(s)`,
        });
        stream.posts.refetch();
        stream.settings.refetch();
      } else if (job.status === 'failed') {
        showToast({
          type: 'error',
          title: job.error ?? 'Generation failed',
        });
      }
      onJobIdChange(null);
    },
    () => {
      showToast({ type: 'error', title: 'Generation timed out — check back shortly' });
      onJobIdChange(null);
    }
  );

  const isGenerating =
    stream.generate.isPending ||
    Boolean(activeJobId && jobQuery.data && ['queued', 'running'].includes(jobQuery.data.status));

  const handleGenerate = async () => {
    try {
      const start = await stream.generate.mutateAsync({});
      onJobIdChange(start.jobId);
      showToast({ type: 'info', title: 'Generating short posts…' });
    } catch (err) {
      showToast({
        type: 'error',
        title: err instanceof Error ? err.message : 'Failed to start generation',
      });
    }
  };

  const handleFeedback = async (postId: string, feedback: 'up' | 'down') => {
    try {
      await stream.feedback.mutateAsync({ postId, feedback });
    } catch (err) {
      showToast({
        type: 'error',
        title: err instanceof Error ? err.message : 'Feedback failed',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/90 p-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">X short-post stream</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {stream.settings.data?.remainingDailyBudget ?? 0} of{' '}
            {stream.settings.data?.postsPerDay ?? 5} daily posts remaining
          </p>
        </div>
        <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating…' : 'Generate now'}
        </Button>
      </div>

      {jobQuery.data?.message ? (
        <p className="text-xs text-gray-600 dark:text-gray-400">{jobQuery.data.message}</p>
      ) : null}

      {posts.length === 0 ? (
        <PageCard>
          <SectionIntro
            title="No posts yet"
            description="Configure your X username in Settings, then generate your first batch of short posts."
          />
        </PageCard>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onFeedback={handleFeedback}
              updating={stream.feedback.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
