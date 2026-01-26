import { ArrowLeft, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react';
import type { LogbookEntry } from '@/types/growth-system';
import Button from '@/components/atoms/Button';
import { LogbookEntryMetadata } from '@/components/molecules/LogbookEntryMetadata';
import { LogbookAIModeSelector } from '@/components/molecules/LogbookAIModeSelector';
import { AILogbookAssistPanel } from '@/components/molecules/AILogbookAssistPanel';
import { llmConfig } from '@/lib/llm';

type AIMode = 'prompts' | 'digest' | 'patterns' | 'sentiment' | 'review' | 'connections';

interface LogbookDetailViewProps {
  entry: LogbookEntry;
  allEntries: LogbookEntry[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showAIAssist: boolean;
  aiMode: AIMode;
  onToggleAIAssist: () => void;
  onAIModeChange: (mode: AIMode) => void;
}

export function LogbookDetailView({
  entry,
  allEntries,
  onBack,
  onEdit,
  onDelete,
  showAIAssist,
  aiMode,
  onToggleAIAssist,
  onAIModeChange,
}: LogbookDetailViewProps) {
  const isAIConfigured = llmConfig.isConfigured();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Logbook
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h1>
              </div>
              {entry.title && (
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {entry.title}
                </h2>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onDelete}
                className="hover:!bg-red-50 hover:!text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          <LogbookEntryMetadata entry={entry} />

          {entry.notes && (
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-gray-900 dark:text-white whitespace-pre-wrap">{entry.notes}</div>
            </div>
          )}

          {isAIConfigured && (
            <>
              <LogbookAIModeSelector
                isExpanded={showAIAssist}
                currentMode={aiMode}
                onToggle={onToggleAIAssist}
                onModeChange={onAIModeChange}
              />

              {showAIAssist && (
                <div className="mt-4">
                  <AILogbookAssistPanel
                    mode={aiMode}
                    entry={entry}
                    entries={allEntries}
                    onClose={() => onToggleAIAssist()}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
