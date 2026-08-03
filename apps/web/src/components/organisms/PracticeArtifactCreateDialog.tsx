import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  aiCoursePracticeService,
  formatPracticeGenerationError,
  practiceArtifactsService,
} from '@/services/knowledge-vault';
import type { PracticeSourceScope, VaultItemType } from '@/types/knowledge-vault';
import { useKnowledgeVault } from '@/contexts/KnowledgeVault';
import { queryKeys } from '@/lib/react-query/query-keys';
import { formatApiFailure } from '@/utils/api-error-formatter';
import type { ApiError } from '@/types/api-contracts';
import { PracticeSourcePicker } from '@/components/molecules/knowledge-vault/PracticeSourcePicker';

function errText(err: unknown, fallback: string): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const apiErr = err as ApiError;
    return formatPracticeGenerationError(apiErr, formatApiFailure(apiErr, fallback));
  }
  return fallback;
}

export type PracticeArtifactCreateKind = Extract<
  VaultItemType,
  'practice_question_set' | 'quiz' | 'homework_assignment'
>;

interface PracticeArtifactCreateDialogProps {
  kind: PracticeArtifactCreateKind;
  initialSourceIds?: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

function resolveInitialSourceIds(
  initialSourceIds: string[] | undefined,
  eligibleIds: Set<string>
): string[] {
  if (!initialSourceIds?.length) return [];
  return initialSourceIds.filter((id) => eligibleIds.has(id));
}

export function PracticeArtifactCreateDialog({
  kind,
  initialSourceIds,
  onSuccess,
  onCancel,
}: PracticeArtifactCreateDialogProps) {
  const { vaultItems } = useKnowledgeVault();
  const queryClient = useQueryClient();

  const notesAndDocs = useMemo(
    () =>
      vaultItems.filter(
        (v) => (v.type === 'note' || v.type === 'document') && v.status !== 'archived'
      ),
    [vaultItems]
  );

  const eligibleIds = useMemo(() => new Set(notesAndDocs.map((item) => item.id)), [notesAndDocs]);

  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(() =>
    resolveInitialSourceIds(initialSourceIds, eligibleIds)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildContext = () => {
    const parts = selectedSourceIds
      .map((id) => vaultItems.find((v) => v.id === id))
      .filter(Boolean)
      .map((v) => `# ${v!.title}\n\n${v!.content ?? ''}`);
    return parts.join('\n\n---\n\n') || 'General knowledge vault practice.';
  };

  const sourceScope: PracticeSourceScope = {
    sourceType: selectedSourceIds.length ? 'vault' : 'vault',
    sourceItemIds: selectedSourceIds,
  };

  const handleCreate = async (opts?: { stricterPrompt?: boolean }) => {
    setBusy(true);
    setError(null);
    const context = buildContext();
    const stricterPrompt = opts?.stricterPrompt ?? false;
    try {
      if (kind === 'practice_question_set') {
        const gen = await aiCoursePracticeService.generatePracticeQuestions({
          context,
          sourceScope,
          stricterPrompt,
        });
        if (!gen.success || !gen.data) throw new Error(gen.error || 'Generation failed');
        const saved = await practiceArtifactsService.createPracticeSet({
          title: gen.data.title,
          questions: gen.data.questions,
          difficulty: gen.data.difficulty,
          sourceScope: gen.data.sourceScope,
        });
        if (!saved.success) throw new Error(errText(saved.error, 'Save failed'));
      } else if (kind === 'quiz') {
        const gen = await aiCoursePracticeService.generateQuiz({
          context,
          sourceScope,
          count: 10,
          stricterPrompt,
        });
        if (!gen.success || !gen.data) throw new Error(gen.error || 'Generation failed');
        const saved = await practiceArtifactsService.createQuiz({
          title: gen.data.title,
          questions: gen.data.questions,
          difficulty: gen.data.difficulty,
          adaptiveContextSummary: gen.data.adaptiveContextSummary,
          timeLimitMinutes: gen.data.timeLimitMinutes,
          sourceScope: gen.data.sourceScope,
        });
        if (!saved.success) throw new Error(errText(saved.error, 'Save failed'));
      } else {
        const gen = await aiCoursePracticeService.generateHomework({
          context,
          sourceScope,
          stricterPrompt,
        });
        if (!gen.success || !gen.data) throw new Error(gen.error || 'Generation failed');
        const saved = await practiceArtifactsService.createHomework({
          title: gen.data.title,
          prompt: gen.data.prompt,
          deliverables: gen.data.deliverables,
          rubric: gen.data.rubric,
          dueDate: gen.data.suggestedDueDate,
          estimatedMinutes: gen.data.estimatedMinutes,
          sourceScope: gen.data.sourceScope,
        });
        if (!saved.success) throw new Error(errText(saved.error, 'Save failed'));
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.knowledgeVault.practiceArtifacts(),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeVault.vaultItems() });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setBusy(false);
    }
  };

  const label =
    kind === 'practice_question_set' ? 'Practice Questions' : kind === 'quiz' ? 'Quiz' : 'Homework';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Generate {label.toLowerCase()} from selected Library sources (optional).
      </p>
      <PracticeSourcePicker
        items={notesAndDocs}
        value={selectedSourceIds}
        onChange={setSelectedSourceIds}
        initialSourceIds={initialSourceIds}
      />
      {error && (
        <div
          className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded border">
          Cancel
        </button>
        {error && (
          <button
            type="button"
            disabled={busy}
            onClick={() => handleCreate({ stricterPrompt: true })}
            className="px-4 py-2 text-sm rounded border border-amber-600 text-amber-800 dark:text-amber-300 disabled:opacity-50"
          >
            {busy ? 'Retrying…' : 'Retry with stricter prompt'}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => handleCreate()}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          {busy ? 'Generating…' : `Generate ${label}`}
        </button>
      </div>
    </div>
  );
}
