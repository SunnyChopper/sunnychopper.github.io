import { FlaskConical, Sparkles } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';
import type { BrandProfileOutputTest } from '@/types/api/personal-branding.dto';
import { BRAND_PLATFORM_LABELS } from '@/types/api/personal-branding.dto';
import { cn } from '@/lib/utils';

function formatTestDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function truncateTopic(topic: string, max = 48): string {
  const trimmed = topic.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function HistoryRowSkeleton({ index }: { index: number }) {
  return (
    <li
      className="rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950/50"
      aria-hidden={index > 0}
    >
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </li>
  );
}

interface ProfileOutputTestHistoryProps {
  tests: BrandProfileOutputTest[];
  isLoading?: boolean;
  selectedTestId?: string | null;
  onSelect: (test: BrandProfileOutputTest) => void;
  onGenerateFirst?: () => void;
  generateDisabled?: boolean;
}

export default function ProfileOutputTestHistory({
  tests,
  isLoading = false,
  selectedTestId = null,
  onSelect,
  onGenerateFirst,
  generateDisabled = false,
}: ProfileOutputTestHistoryProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <div className="mb-3 flex items-start gap-2">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-gray-500" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Saved output tests
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Review past previews to compare quality as your profile evolves.
          </p>
        </div>
      </div>

      {isLoading ? (
        <ul className="space-y-2" role="status" aria-label="Loading saved tests">
          {Array.from({ length: 3 }, (_, index) => (
            <HistoryRowSkeleton key={index} index={index} />
          ))}
        </ul>
      ) : tests.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-200 bg-white/60 px-4 py-5 text-center dark:border-gray-700 dark:bg-gray-950/30">
          <p className="text-sm font-medium text-gray-900 dark:text-white">No saved previews yet</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Generate a preview to start building history you can compare over time.
          </p>
          {onGenerateFirst ? (
            <Button
              type="button"
              size="sm"
              onClick={onGenerateFirst}
              disabled={generateDisabled}
              className="mt-4 inline-flex items-center gap-2"
            >
              <Sparkles className="size-4" aria-hidden />
              Generate your first preview
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2">
          {tests.map((test) => {
            const isSelected = selectedTestId === test.id;
            return (
              <li key={test.id}>
                <button
                  type="button"
                  onClick={() => onSelect(test)}
                  className={cn(
                    'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950/50 dark:hover:border-gray-600 dark:hover:bg-gray-900/60'
                  )}
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {truncateTopic(test.topic)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {BRAND_PLATFORM_LABELS[test.platform]} · {formatTestDate(test.createdAt)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
