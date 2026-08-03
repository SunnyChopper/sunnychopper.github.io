import type { ReactNode } from 'react';

export function renderPreviewBodyWithHighlight(
  body: string,
  activeExcerpt: string | null
): ReactNode {
  if (!activeExcerpt) {
    return body;
  }

  const index = body.indexOf(activeExcerpt);
  if (index < 0) {
    return body;
  }

  const before = body.slice(0, index);
  const after = body.slice(index + activeExcerpt.length);

  return (
    <>
      {before}
      <mark className="rounded-sm bg-amber-200/80 px-0.5 text-gray-900 dark:bg-amber-500/30 dark:text-gray-100">
        {activeExcerpt}
      </mark>
      {after}
    </>
  );
}
