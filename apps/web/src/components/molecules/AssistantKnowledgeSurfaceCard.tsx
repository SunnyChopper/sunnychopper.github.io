import { BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import type { KnowledgeSurfaceSuggestion } from '@/types/knowledge-surface';

export interface AssistantKnowledgeSurfaceCardProps {
  messageId: string;
  suggestion: KnowledgeSurfaceSuggestion;
  onDismiss: (dismissKey: string) => void;
}

function dismissKeyFor(messageId: string, suggestion: KnowledgeSurfaceSuggestion): string {
  return `${messageId}:${suggestion.artifactType}:${suggestion.artifactId}`;
}

export function AssistantKnowledgeSurfaceCard({
  messageId,
  suggestion,
  onDismiss,
}: AssistantKnowledgeSurfaceCardProps) {
  const navigate = useNavigate();
  const dismissKey = dismissKeyFor(messageId, suggestion);

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  return (
    <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-amber-800/80 dark:text-amber-300/80">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span>Learning match</span>
          </div>
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
            {suggestion.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
            {suggestion.reason}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleNavigate(suggestion.cta.href)}>
              {suggestion.cta.label}
            </Button>
            {suggestion.secondaryCta ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleNavigate(suggestion.secondaryCta!.href)}
              >
                {suggestion.secondaryCta.label}
              </Button>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss suggestion"
          onClick={() => onDismiss(dismissKey)}
          className="shrink-0 rounded p-1 text-gray-500 hover:bg-amber-100/80 hover:text-gray-700 dark:hover:bg-amber-900/30 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
