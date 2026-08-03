import Button from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

export type InboxBucketStatus = 'pending' | 'triaged' | 'filed' | 'dismissed';

const BUCKET_COPY: Record<InboxBucketStatus, string> = {
  pending: 'Nothing awaiting triage. Paste a URL or note above.',
  triaged: 'No items ready to file. Capture something new to triage.',
  filed: 'Nothing filed yet. Capture content to start filling the vault.',
  dismissed: 'No dismissed items right now.',
};

interface InboxBucketEmptyStateProps {
  status: InboxBucketStatus;
  onQuickCapture: () => void;
  className?: string;
}

export function InboxBucketEmptyState({
  status,
  onQuickCapture,
  className,
}: InboxBucketEmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-center',
        className
      )}
    >
      <p className="text-sm text-gray-600 dark:text-gray-400">{BUCKET_COPY[status]}</p>
      <Button type="button" size="sm" className="mt-3" onClick={onQuickCapture}>
        Quick capture
      </Button>
    </div>
  );
}
