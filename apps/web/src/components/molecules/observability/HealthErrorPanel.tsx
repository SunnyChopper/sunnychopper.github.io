import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import LinkedStackTrace from '@/components/molecules/observability/LinkedStackTrace';
import {
  buildHealthErrorCopyText,
  healthErrorPanelClassName,
  healthErrorPanelScrollClassName,
} from '@/lib/observability/health-row';
import type { EditorLinkSettings } from '@/lib/editor-links';
import { cn } from '@/lib/utils';

export type HealthErrorPanelProps = {
  errorMessage?: string | null;
  stackTrace?: string | null;
  settings: EditorLinkSettings;
  className?: string;
};

export default function HealthErrorPanel({
  errorMessage,
  stackTrace,
  settings,
  className,
}: HealthErrorPanelProps) {
  const [copied, setCopied] = useState(false);
  const copyText = buildHealthErrorCopyText(errorMessage, stackTrace);
  const hasPayload = Boolean(errorMessage?.trim() || stackTrace?.trim());

  const handleCopy = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy error:', error);
    }
  };

  if (!hasPayload) {
    return <span className="text-xs text-gray-500">No error payload for this run.</span>;
  }

  return (
    <div className={cn(healthErrorPanelClassName, 'p-3 space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Error
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          disabled={!copyText}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label={copied ? 'Copied' : 'Copy error'}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy error
            </>
          )}
        </button>
      </div>

      <div className={healthErrorPanelScrollClassName}>
        {errorMessage?.trim() && (
          <p className="whitespace-pre-wrap break-words">{errorMessage.trim()}</p>
        )}
        {stackTrace?.trim() && (
          <LinkedStackTrace
            text={stackTrace}
            settings={settings}
            className={cn(
              errorMessage?.trim() && 'mt-2 pt-2 border-t border-gray-200 dark:border-gray-700'
            )}
          />
        )}
      </div>
    </div>
  );
}
