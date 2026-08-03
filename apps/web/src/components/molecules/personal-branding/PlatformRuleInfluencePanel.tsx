import CollapsibleSection from '@/components/molecules/CollapsibleSection';
import type { PlatformRuleSetInfluenceItem } from '@/types/api/personal-branding.dto';
import { cn } from '@/lib/utils';

interface PlatformRuleInfluencePanelProps {
  influences: PlatformRuleSetInfluenceItem[];
  isLoading: boolean;
  error: string | null;
  activeExcerpt: string | null;
  onSelectExcerpt: (excerpt: string | null) => void;
  isStale: boolean;
}

function influenceSummary(influences: PlatformRuleSetInfluenceItem[]): string {
  if (influences.length === 0) {
    return 'None detected';
  }
  return influences.length === 1 ? '1 influence' : `${influences.length} influences`;
}

export default function PlatformRuleInfluencePanel({
  influences,
  isLoading,
  error,
  activeExcerpt,
  onSelectExcerpt,
  isStale,
}: PlatformRuleInfluencePanelProps) {
  if (isStale) {
    return null;
  }

  return (
    <CollapsibleSection
      title="Rule influence"
      defaultOpen
      summary={isLoading ? 'Analyzing…' : influenceSummary(influences)}
      className="border-0 shadow-none bg-transparent"
      headerClassName="px-0"
      bodyClassName="px-0"
    >
      {isLoading ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing rule influence…</p>
      ) : null}

      {error ? (
        <p className="text-sm text-amber-700 dark:text-amber-300" role="status">
          {error}
        </p>
      ) : null}

      {!isLoading && !error && influences.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No attributable policy influences were detected in this preview.
        </p>
      ) : null}

      {!isLoading && influences.length > 0 ? (
        <ul className="space-y-2">
          {influences.map((influence) => {
            const isActive = activeExcerpt === influence.previewExcerpt;
            return (
              <li key={`${influence.kind}:${influence.id}:${influence.previewExcerpt}`}>
                <button
                  type="button"
                  onClick={() => onSelectExcerpt(isActive ? null : influence.previewExcerpt)}
                  className={cn(
                    'w-full rounded-md border px-3 py-2 text-left transition-colors',
                    isActive
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-gray-600'
                  )}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {influence.summary}
                  </p>
                  <blockquote className="mt-1 border-l-2 border-gray-300 pl-2 text-xs italic text-gray-600 dark:border-gray-600 dark:text-gray-400">
                    “{influence.previewExcerpt}”
                  </blockquote>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </CollapsibleSection>
  );
}
