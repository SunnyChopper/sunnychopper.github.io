import { formatExecutionPreview } from '@/lib/observability/execution-log-filters';
import { executionLogPreviewPanelClassName } from '@/lib/observability/execution-log-surfaces';

export type ExecutionPreviewCellProps = {
  preview: string | null | undefined;
};

export default function ExecutionPreviewCell({ preview }: ExecutionPreviewCellProps) {
  const fullText = formatExecutionPreview(preview);
  const isExpandable = fullText !== '—';

  return (
    <div
      className="group/preview relative min-w-0 max-w-xs"
      tabIndex={isExpandable ? 0 : undefined}
      title={isExpandable ? fullText : undefined}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      <span className="block truncate text-xs text-gray-600 dark:text-gray-400">{fullText}</span>
      {isExpandable ? (
        <div className={executionLogPreviewPanelClassName} role="tooltip">
          {fullText}
        </div>
      ) : null}
    </div>
  );
}
