import { Loader2 } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

export interface LiveOutputPreviewActionBarProps {
  disabled?: boolean;
  isRegenerating?: boolean;
  isOpeningWorkbench?: boolean;
  sectionsCollapsed?: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onToggleSections: () => void;
  onOpenWorkbench: () => void;
  className?: string;
}

export default function LiveOutputPreviewActionBar({
  disabled = false,
  isRegenerating = false,
  isOpeningWorkbench = false,
  sectionsCollapsed = false,
  onCopy,
  onRegenerate,
  onToggleSections,
  onOpenWorkbench,
  className,
}: LiveOutputPreviewActionBarProps) {
  const busy = disabled || isRegenerating || isOpeningWorkbench;

  return (
    <div
      role="toolbar"
      aria-label="Preview actions"
      className={cn(
        'sticky top-0 z-10 -mx-3 flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-gray-50/95 px-3 py-2 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90',
        className
      )}
    >
      <Button type="button" size="sm" variant="secondary" onClick={onCopy} disabled={busy}>
        Copy
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={onRegenerate}
        disabled={busy}
        className="inline-flex items-center gap-1.5"
      >
        {isRegenerating ? (
          <>
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Regenerating…
          </>
        ) : (
          'Regenerate'
        )}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onToggleSections} disabled={busy}>
        {sectionsCollapsed ? 'Expand sections' : 'Collapse sections'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="primary"
        onClick={onOpenWorkbench}
        disabled={busy}
        className="ml-auto inline-flex items-center gap-1.5"
      >
        {isOpeningWorkbench ? (
          <>
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Opening…
          </>
        ) : (
          'Use as draft in Content Workbench'
        )}
      </Button>
    </div>
  );
}
