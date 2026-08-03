import { Textarea } from '@/components/atoms/Textarea';
import PlatformRuleInfluencePanel from '@/components/molecules/personal-branding/PlatformRuleInfluencePanel';
import { renderPreviewBodyWithHighlight } from '@/lib/personal-branding/platform-rule-preview-highlight';
import type {
  PlatformRuleSetInfluenceItem,
  PlatformRuleSetPreviewResult,
} from '@/types/api/personal-branding.dto';

interface PlatformRuleSetPreviewPanelProps {
  sampleText: string;
  onSampleTextChange: (value: string) => void;
  preview: PlatformRuleSetPreviewResult | null;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  influences: PlatformRuleSetInfluenceItem[];
  influenceLoading: boolean;
  influenceError: string | null;
  activeExcerpt: string | null;
  onSelectExcerpt: (excerpt: string | null) => void;
}

export default function PlatformRuleSetPreviewPanel({
  sampleText,
  onSampleTextChange,
  preview,
  isLoading,
  error,
  isStale,
  influences,
  influenceLoading,
  influenceError,
  activeExcerpt,
  onSelectExcerpt,
}: PlatformRuleSetPreviewPanelProps) {
  const sampleId = 'platform-rule-set-sample-text';
  const validationIssues = preview?.validationIssues ?? [];

  return (
    <div
      className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Rule set preview</h3>
        {isStale && preview && !isLoading ? (
          <span className="text-xs text-amber-700 dark:text-amber-300">
            Draft changed — run test again
          </span>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor={sampleId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sample
        </label>
        <Textarea
          id={sampleId}
          aria-label="Sample text for rule test"
          value={sampleText}
          onChange={(e) => onSampleTextChange(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Paste your draft, then click Test this rule set.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Generating preview…</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {preview && !isLoading ? (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-gray-700 dark:text-gray-300">Preview</p>
          <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {renderPreviewBodyWithHighlight(preview.body, activeExcerpt)}
          </p>
          {validationIssues.length > 0 ? (
            <div
              className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40"
              role="status"
              aria-label="Preview validation issues"
            >
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                Preview may still violate:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-800 dark:text-amber-100">
                {validationIssues.map((issue) => (
                  <li key={issue.id}>{issue.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <PlatformRuleInfluencePanel
            influences={influences}
            isLoading={influenceLoading}
            error={influenceError}
            activeExcerpt={activeExcerpt}
            onSelectExcerpt={onSelectExcerpt}
            isStale={isStale}
          />
        </div>
      ) : null}
    </div>
  );
}
