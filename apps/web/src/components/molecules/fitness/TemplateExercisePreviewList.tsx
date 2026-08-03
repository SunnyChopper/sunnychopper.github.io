import { useMemo } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { applyTemplateExerciseReorder } from '@/lib/fitness/template-exercise-preview';
import { fitnessInteractiveRowClassName } from '@/lib/fitness/fitness-surfaces';
import { cn } from '@/lib/utils';

export interface TemplateExercisePreviewListProps {
  exerciseIds: string[];
  nameById: Map<string, string> | Record<string, string>;
  onChange: (next: string[]) => void;
  className?: string;
}

function resolveName(id: string, nameById: Map<string, string> | Record<string, string>): string {
  if (nameById instanceof Map) {
    return nameById.get(id) ?? id;
  }
  return nameById[id] ?? id;
}

function SortableExerciseRow({
  id,
  index,
  name,
  onRemove,
}: {
  id: string;
  index: number;
  name: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        fitnessInteractiveRowClassName,
        'group flex items-center gap-2 transition-colors hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label={`Reorder ${name}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="shrink-0 w-5 text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">
        {index + 1}.
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-gray-800 dark:text-gray-200">
        {name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-xs font-medium text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
      >
        Remove
      </button>
    </li>
  );
}

export function TemplateExercisePreviewList({
  exerciseIds,
  nameById,
  onChange,
  className,
}: TemplateExercisePreviewListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const labels = useMemo(
    () => exerciseIds.map((id) => ({ id, name: resolveName(id, nameById) })),
    [exerciseIds, nameById]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    onChange(
      applyTemplateExerciseReorder(exerciseIds, String(active.id), over ? String(over.id) : null)
    );
  };

  const handleRemove = (id: string) => {
    onChange(exerciseIds.filter((entryId) => entryId !== id));
  };

  if (exerciseIds.length === 0) {
    return (
      <p className={cn('text-xs text-gray-500', className)}>Add exercises to preview order.</p>
    );
  }

  return (
    <div aria-live="polite" aria-label="Template preview" className={className}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
          <ol className="m-0 list-none space-y-2 p-0">
            {labels.map(({ id, name }, index) => (
              <SortableExerciseRow
                key={id}
                id={id}
                index={index}
                name={name}
                onRemove={() => handleRemove(id)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}
