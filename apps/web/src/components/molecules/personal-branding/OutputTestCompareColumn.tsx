import MarkdownRenderer from '@/components/molecules/MarkdownRenderer';
import PlatformRulePolicySummary from '@/components/molecules/personal-branding/PlatformRulePolicySummary';
import UniversalRulesFallbackNotice from '@/components/molecules/personal-branding/UniversalRulesFallbackNotice';
import OutputTestPreviewSkeleton from '@/components/molecules/personal-branding/OutputTestPreviewSkeleton';
import {
  formatAppliedPlatformRuleNames,
  hasResolvedPlatformPolicy,
  resolvePlatformRuleSource,
  shouldShowUniversalFallbackNotice,
} from '@/lib/personal-branding/profile-strength';
import { statusPillClassName } from '@/pages/admin/personal-branding/personal-branding-ui';
import { cn } from '@/lib/utils';
import { contentTextStats } from '@/pages/admin/personal-branding/content-workbench/content-workbench-helpers';
import type {
  BrandPlatform,
  BrandProfileOutputTest,
  EffectivePlatformRules,
  PlatformRuleCatalog,
} from '@/types/api/personal-branding.dto';
import { BRAND_PLATFORM_LABELS } from '@/types/api/personal-branding.dto';

const COMPARE_COLUMN_MARKDOWN_CLASS =
  'prose-sm prose-headings:text-sm prose-p:text-xs prose-headings:border-l-2 prose-headings:border-blue-500/30 prose-headings:pl-2';

export interface OutputTestCompareColumnProps {
  platform: BrandPlatform;
  result?: BrandProfileOutputTest | null;
  isGenerating?: boolean;
  error?: string | null;
  effectivePolicy?: EffectivePlatformRules | null;
  policyLoading?: boolean;
  policyError?: boolean;
  catalog?: PlatformRuleCatalog | null;
  bannedPhrases?: string[];
  showPolicySection?: boolean;
  className?: string;
}

export default function OutputTestCompareColumn({
  platform,
  result,
  isGenerating = false,
  error,
  effectivePolicy,
  policyLoading = false,
  policyError = false,
  catalog,
  bannedPhrases = [],
  showPolicySection = false,
  className,
}: OutputTestCompareColumnProps) {
  const resolvedPolicy = effectivePolicy?.resolvedPolicy;
  const contributingRules = effectivePolicy?.rules ?? [];
  const ruleSource = effectivePolicy ? resolvePlatformRuleSource(contributingRules) : 'none';
  const appliedRuleNames = formatAppliedPlatformRuleNames(contributingRules);
  const hasPolicyConstraints = resolvedPolicy ? hasResolvedPlatformPolicy(resolvedPolicy) : false;

  const compliance = result?.body
    ? (() => {
        const stats = contentTextStats(result.body);
        return {
          ...stats,
          characterCount: result.body.length,
          characterLimit: resolvedPolicy?.characterLimit ?? null,
          readTimeLimitMinutes: resolvedPolicy?.readTimeLimitMinutes ?? null,
        };
      })()
    : null;

  return (
    <section
      className={cn(
        'flex min-h-[280px] min-w-0 flex-col rounded-lg border border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-950/40',
        className
      )}
      aria-label={`${BRAND_PLATFORM_LABELS[platform]} comparison column`}
    >
      <header className="shrink-0 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {BRAND_PLATFORM_LABELS[platform]}
        </h3>
      </header>

      {showPolicySection ? (
        <div className="shrink-0 space-y-2 border-b border-gray-200 px-3 py-2 text-xs dark:border-gray-700">
          {policyLoading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading policy…</p>
          ) : policyError ? (
            <p className="text-red-600 dark:text-red-300">Could not load policy.</p>
          ) : (
            <>
              {shouldShowUniversalFallbackNotice(ruleSource) ? (
                <UniversalRulesFallbackNotice
                  platformLabel={BRAND_PLATFORM_LABELS[platform]}
                  mode={ruleSource === 'none' ? 'none' : 'universalOnly'}
                />
              ) : null}
              {appliedRuleNames.length > 0 ? (
                <ul className="flex flex-wrap gap-1" role="list">
                  {appliedRuleNames.map((name) => (
                    <li key={name}>
                      <span className={statusPillClassName('neutral')}>{name}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {hasPolicyConstraints && resolvedPolicy ? (
                <PlatformRulePolicySummary
                  catalog={catalog}
                  characterLimit={resolvedPolicy.characterLimit}
                  readTimeLimitMinutes={resolvedPolicy.readTimeLimitMinutes}
                  rhetoricalModes={resolvedPolicy.rhetoricalModes}
                  rhetoricalDevices={resolvedPolicy.rhetoricalDevices}
                  requirements={resolvedPolicy.requirements}
                />
              ) : null}
              {bannedPhrases.length > 0 ? (
                <ul className="flex flex-wrap gap-1" role="list">
                  {bannedPhrases.map((phrase) => (
                    <li key={phrase}>
                      <span className={statusPillClassName('warning')}>{phrase}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
        {isGenerating ? (
          <OutputTestPreviewSkeleton />
        ) : error ? (
          <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
        ) : result ? (
          <article className="space-y-2 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{result.title}</h4>
              <p className="text-xs text-gray-500">
                {new Date(result.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <MarkdownRenderer
              content={result.body}
              filePath={`live-output-compare/${result.id}`}
              className={COMPARE_COLUMN_MARKDOWN_CLASS}
            />
            {compliance ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {compliance.wordCount} words · ~{compliance.readingTimeMinutes} min read
                {compliance.characterLimit != null
                  ? ` · ${compliance.characterCount}/${compliance.characterLimit} chars`
                  : ` · ${compliance.characterCount} chars`}
              </p>
            ) : null}
          </article>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Generate a comparison to preview this platform.
          </p>
        )}
      </div>
    </section>
  );
}
