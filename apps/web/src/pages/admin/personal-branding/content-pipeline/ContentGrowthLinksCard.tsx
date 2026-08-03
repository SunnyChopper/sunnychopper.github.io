import { useMemo, useState } from 'react';
import { Link2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/atoms/Button';
import { EntityLinkChip } from '@/components/atoms/EntityLinkChip';
import { RelationshipPicker } from '@/components/organisms/RelationshipPicker';
import { useGoals, useTasks } from '@/hooks/useGrowthSystem';
import { queryKeys } from '@/lib/react-query/query-keys';
import { personalBrandingService } from '@/services/personal-branding.service';
import type { ContentNode } from '@/types/api/personal-branding.dto';
import type { EntitySummary } from '@/types/growth-system';
import { pbBodySecondaryClassName, pbNestedSectionTitleClassName } from '../personal-branding-ui';

interface ContentGrowthLinksCardProps {
  content: ContentNode;
}

export default function ContentGrowthLinksCard({ content }: ContentGrowthLinksCardProps) {
  const queryClient = useQueryClient();
  const { goals } = useGoals();
  const { tasks } = useTasks();
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(content.linkedGoalIds ?? []);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(content.linkedTaskIds ?? []);
  const [saveError, setSaveError] = useState<string | null>(null);

  const goalEntities = useMemo<EntitySummary[]>(
    () =>
      goals.map((g) => ({
        id: g.id,
        title: g.title,
        type: 'goal' as const,
        area: g.area,
        status: g.status,
        parentGoalId: g.parentGoalId,
        targetDate: g.targetDate,
        completedDate: g.completedDate,
      })),
    [goals]
  );

  const taskEntities = useMemo<EntitySummary[]>(
    () =>
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        type: 'task' as const,
        area: t.area,
        status: t.status,
      })),
    [tasks]
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      personalBrandingService.updateContentNode(content.id, {
        linkedGoalIds: selectedGoalIds,
        linkedTaskIds: selectedTaskIds,
      }),
    onSuccess: async () => {
      setSaveError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.personalBranding.content.all() });
    },
    onError: (error: Error) => {
      setSaveError(error.message || 'Could not save growth links.');
    },
  });

  const linkedGoalSummaries = goalEntities.filter((g) =>
    (content.linkedGoalIds ?? []).includes(g.id)
  );
  const linkedTaskSummaries = taskEntities.filter((t) =>
    (content.linkedTaskIds ?? []).includes(t.id)
  );

  const saveLinks = async () => {
    await saveMutation.mutateAsync();
    setGoalPickerOpen(false);
    setTaskPickerOpen(false);
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200/80 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/30">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
        <h3 className={pbNestedSectionTitleClassName}>Growth links</h3>
      </div>
      <p className={pbBodySecondaryClassName}>
        Link goals and tasks so publish and engagement events update Growth System notes
        automatically.
      </p>

      <LinkGroup
        label="Goals"
        entities={linkedGoalSummaries}
        onEdit={() => {
          setSelectedGoalIds(content.linkedGoalIds ?? []);
          setGoalPickerOpen(true);
        }}
      />
      <LinkGroup
        label="Tasks"
        entities={linkedTaskSummaries}
        onEdit={() => {
          setSelectedTaskIds(content.linkedTaskIds ?? []);
          setTaskPickerOpen(true);
        }}
      />

      {saveError ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {saveError}
        </p>
      ) : null}

      <RelationshipPicker
        isOpen={goalPickerOpen}
        onClose={() => setGoalPickerOpen(false)}
        title="Link goals"
        entities={goalEntities}
        selectedIds={selectedGoalIds}
        onSelectionChange={setSelectedGoalIds}
        onSave={saveLinks}
        isSaving={saveMutation.isPending}
        saveError={saveError}
        entityType="goal"
      />
      <RelationshipPicker
        isOpen={taskPickerOpen}
        onClose={() => setTaskPickerOpen(false)}
        title="Link tasks"
        entities={taskEntities}
        selectedIds={selectedTaskIds}
        onSelectionChange={setSelectedTaskIds}
        onSave={saveLinks}
        isSaving={saveMutation.isPending}
        saveError={saveError}
        entityType="task"
      />
    </div>
  );
}

function LinkGroup({
  label,
  entities,
  onEdit,
}: {
  label: string;
  entities: EntitySummary[];
  onEdit: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      {entities.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">None linked</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entities.map((entity) => (
            <EntityLinkChip
              key={entity.id}
              id={entity.id}
              label={entity.title}
              type={entity.type}
              area={entity.area}
            />
          ))}
        </div>
      )}
    </div>
  );
}
