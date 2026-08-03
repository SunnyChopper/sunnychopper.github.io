import { Skeleton } from '@/components/atoms/Skeleton';
import { assistantSettingsCardClassName } from '@/components/molecules/settings/assistant-settings-surfaces';

function AssistantSettingsCardSkeleton({ bodyRows }: { bodyRows: number }) {
  return (
    <div className={assistantSettingsCardClassName} aria-hidden>
      <Skeleton variant="rectangular" className="h-[1.125rem] w-36 mb-1" />
      <Skeleton className="h-4 w-full max-w-xl mb-1" />
      <Skeleton className="h-4 w-4/5 max-w-lg mb-6" />
      <div className="space-y-3">
        {Array.from({ length: bodyRows }, (_, i) => (
          <Skeleton key={i} variant="rectangular" className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export function AssistantSettingsPageSkeleton() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      aria-live="polite"
      data-testid="assistant-settings-skeleton"
    >
      <span className="sr-only">Loading assistant settings…</span>
      <AssistantSettingsCardSkeleton bodyRows={3} />
      <AssistantSettingsCardSkeleton bodyRows={4} />
      <AssistantSettingsCardSkeleton bodyRows={3} />
    </div>
  );
}
