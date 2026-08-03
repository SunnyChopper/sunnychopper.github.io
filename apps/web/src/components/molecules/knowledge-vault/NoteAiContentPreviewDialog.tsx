import Button from '@/components/atoms/Button';
import Dialog from '@/components/molecules/Dialog';
import { cn } from '@/lib/utils';

interface NoteAiContentPreviewDialogProps {
  isOpen: boolean;
  title: string;
  originalContent: string;
  proposedContent: string;
  regenerating?: boolean;
  onAccept: () => void;
  onRegenerate: () => void;
  onDiscard: () => void;
}

function ContentPane({
  label,
  content,
  className,
}: {
  label: string;
  content: string;
  className?: string;
}) {
  return (
    <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <pre
        className={cn(
          'min-h-[12rem] flex-1 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3',
          'font-mono text-xs leading-relaxed text-gray-900 whitespace-pre-wrap break-words',
          'dark:border-gray-600 dark:bg-gray-900/60 dark:text-gray-100'
        )}
      >
        {content || '(empty)'}
      </pre>
    </div>
  );
}

export function NoteAiContentPreviewDialog({
  isOpen,
  title,
  originalContent,
  proposedContent,
  regenerating = false,
  onAccept,
  onRegenerate,
  onDiscard,
}: NoteAiContentPreviewDialogProps) {
  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onDiscard} disabled={regenerating}>
        Discard
      </Button>
      <Button type="button" variant="secondary" onClick={onRegenerate} disabled={regenerating}>
        {regenerating ? 'Regenerating…' : 'Regenerate'}
      </Button>
      <Button type="button" variant="primary" onClick={onAccept} disabled={regenerating}>
        Accept
      </Button>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onDiscard}
      title={title}
      size="xl"
      layer="nested"
      trapFocus
      footer={footer}
    >
      <div className="flex min-h-[16rem] flex-col gap-4 md:flex-row md:gap-6">
        <ContentPane label="Original" content={originalContent} />
        <ContentPane label="Proposed" content={proposedContent} />
      </div>
    </Dialog>
  );
}
