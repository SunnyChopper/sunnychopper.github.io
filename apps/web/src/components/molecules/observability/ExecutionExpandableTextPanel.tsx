import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Button from '@/components/atoms/Button';
import { executionDetailTextPanelClassName } from '@/lib/observability/execution-detail-surfaces';
import { cn } from '@/lib/utils';

export type ExecutionExpandableTextPanelProps = {
  children: ReactNode;
  collapsedMaxHeightClassName?: string;
  expandedMaxHeightClassName?: string;
};

const DEFAULT_COLLAPSED = 'max-h-48';
const DEFAULT_EXPANDED = 'max-h-[32rem]';

export default function ExecutionExpandableTextPanel({
  children,
  collapsedMaxHeightClassName = DEFAULT_COLLAPSED,
  expandedMaxHeightClassName = DEFAULT_EXPANDED,
}: ExecutionExpandableTextPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || expanded) return;

    setNeedsExpand(panel.scrollHeight > panel.clientHeight + 2);
  }, [children, expanded, collapsedMaxHeightClassName]);

  return (
    <div className="space-y-2">
      <div
        ref={panelRef}
        className={cn(
          executionDetailTextPanelClassName,
          expanded ? expandedMaxHeightClassName : collapsedMaxHeightClassName
        )}
      >
        {children}
      </div>

      {needsExpand || expanded ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      ) : null}
    </div>
  );
}
