import MarkdownRenderer from '@/components/molecules/MarkdownRenderer';
import {
  getObservabilityMessageRole,
  parseObservabilityPromptText,
  resolveObservabilityMessageContent,
} from '@/lib/observability-prompt-display';
import {
  executionDetailPreClassName,
  executionDetailPromptRoleClassName,
} from '@/lib/observability/execution-detail-surfaces';

export function renderExecutionPromptText(text: string) {
  const parsed = parseObservabilityPromptText(text);

  if (parsed.kind === 'messages') {
    return (
      <div className="space-y-4">
        {parsed.messages.map((msg, idx) => (
          <div
            key={idx}
            className="space-y-1 border-b border-gray-200 pb-3 last:border-0 last:pb-0 dark:border-gray-800"
          >
            <div className={executionDetailPromptRoleClassName}>
              {getObservabilityMessageRole(msg)}
            </div>
            <div className="min-w-0 break-words">
              <MarkdownRenderer content={resolveObservabilityMessageContent(msg)} variant="chat" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (parsed.kind === 'json') {
    return (
      <pre className={executionDetailPreClassName}>{JSON.stringify(parsed.value, null, 2)}</pre>
    );
  }

  return (
    <div className="min-w-0 break-words">
      <MarkdownRenderer content={parsed.content} variant="chat" />
    </div>
  );
}
