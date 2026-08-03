import { arrayMove } from '@dnd-kit/sortable';

/** Pure reorder helper for drag-end and unit tests. */
export function applyTemplateExerciseReorder(
  exerciseIds: string[],
  activeId: string,
  overId: string | null | undefined
): string[] {
  if (!overId || activeId === overId) return exerciseIds;
  const oldIndex = exerciseIds.indexOf(activeId);
  const newIndex = exerciseIds.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0) return exerciseIds;
  return arrayMove(exerciseIds, oldIndex, newIndex);
}
