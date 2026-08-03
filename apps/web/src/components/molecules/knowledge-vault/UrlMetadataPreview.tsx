import { useState } from 'react';
import {
  getFaviconUrl,
  getSourceHostname,
  getSourceLetterAvatar,
} from '@/lib/personal-branding/source-favicon';
import {
  confirmOverwriteTitle,
  shouldOfferTitleApply,
  type UrlMetadataPreviewStatus,
} from '@/lib/knowledge-vault/url-metadata';

export interface UrlMetadataPreviewProps {
  url: string;
  status: UrlMetadataPreviewStatus;
  title: string | null;
  faviconUrl: string | null;
  warning: string | null;
  currentTitle: string;
  applyLabel: string;
  onApplyTitle: (title: string) => void;
}

function FaviconAvatar({ url, faviconUrl }: { url: string; faviconUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const hostname = getSourceHostname(url);
  const src = faviconUrl ?? (hostname ? getFaviconUrl(hostname) : null);

  if (src && !failed) {
    return (
      <img src={src} alt="" className="h-5 w-5 shrink-0 rounded" onError={() => setFailed(true)} />
    );
  }

  const label = hostname ?? url;
  const avatar = getSourceLetterAvatar(label);
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
      style={{ backgroundColor: avatar.backgroundColor }}
      aria-hidden
    >
      {avatar.letter}
    </span>
  );
}

export default function UrlMetadataPreview({
  url,
  status,
  title,
  faviconUrl,
  warning,
  currentTitle,
  applyLabel,
  onApplyTitle,
}: UrlMetadataPreviewProps) {
  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div
        className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/60"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
        <div className="h-3 flex-1 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400" role="status">
        {warning ?? 'Could not fetch'}
      </p>
    );
  }

  if (!shouldOfferTitleApply(title)) return null;

  const suggestedTitle = title!.trim();

  const handleApply = () => {
    if (!confirmOverwriteTitle(currentTitle, suggestedTitle)) return;
    onApplyTitle(suggestedTitle);
  };

  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg border border-purple-100 bg-purple-50/60 px-3 py-2 dark:border-purple-900/40 dark:bg-purple-950/30">
      <FaviconAvatar url={url} faviconUrl={faviconUrl} />
      <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-200">
        {suggestedTitle}
      </span>
      <button
        type="button"
        onClick={handleApply}
        className="shrink-0 text-sm font-medium text-purple-700 hover:underline dark:text-purple-300"
      >
        {applyLabel}
      </button>
    </div>
  );
}
