import { Skeleton } from '@/components/atoms/Skeleton';

/**
 * Mirrors Live Output Test preview article anatomy: title, meta, body paragraphs.
 */
export default function OutputTestPreviewSkeleton() {
  return (
    <article className="w-full space-y-3 text-sm" role="status" aria-label="Generating preview">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </article>
  );
}
