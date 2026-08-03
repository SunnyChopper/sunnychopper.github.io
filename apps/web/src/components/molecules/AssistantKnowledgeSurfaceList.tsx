import { useMemo, useState } from 'react';
import { AssistantKnowledgeSurfaceCard } from '@/components/molecules/AssistantKnowledgeSurfaceCard';
import type { KnowledgeSurfaceSuggestion } from '@/types/knowledge-surface';

interface AssistantKnowledgeSurfaceListProps {
  messageId: string;
  surfaces: KnowledgeSurfaceSuggestion[];
}

function dismissKeyFor(messageId: string, suggestion: KnowledgeSurfaceSuggestion): string {
  return `${messageId}:${suggestion.artifactType}:${suggestion.artifactId}`;
}

export function AssistantKnowledgeSurfaceList({
  messageId,
  surfaces,
}: AssistantKnowledgeSurfaceListProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  const visible = useMemo(
    () => surfaces.filter((s) => !dismissed.has(dismissKeyFor(messageId, s))),
    [dismissed, messageId, surfaces]
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {visible.map((suggestion) => (
        <AssistantKnowledgeSurfaceCard
          key={dismissKeyFor(messageId, suggestion)}
          messageId={messageId}
          suggestion={suggestion}
          onDismiss={(key) => setDismissed((prev) => new Set(prev).add(key))}
        />
      ))}
    </div>
  );
}
