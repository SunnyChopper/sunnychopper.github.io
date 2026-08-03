import { AssistantTraceJsonViewer } from '@/components/molecules/AssistantTraceJsonViewer';
import { executionDetailRawPayloadPanelClassName } from '@/lib/observability/execution-detail-surfaces';

export type ExecutionRawPayloadsProps = {
  entries: { label: string; data: unknown }[];
};

export default function ExecutionRawPayloads({ entries }: ExecutionRawPayloadsProps) {
  return (
    <div className="space-y-4">
      {entries.map(({ label, data }) => (
        <div key={label} className="min-w-0">
          <div className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</div>
          <div className={executionDetailRawPayloadPanelClassName}>
            <AssistantTraceJsonViewer data={data} topLevelExpanded={false} />
          </div>
        </div>
      ))}
    </div>
  );
}
