import type { Priority, Task } from '@/types/growth-system';

const VALID_PRIORITIES = new Set<Priority>(['P1', 'P2', 'P3', 'P4']);

export function buildPriorityByTaskId(tasks: Task[]): ReadonlyMap<string, Priority> {
  const map = new Map<string, Priority>();
  for (const task of tasks) {
    if (VALID_PRIORITIES.has(task.priority)) {
      map.set(task.id, task.priority);
    }
  }
  return map;
}

export function lookupTaskPriority(
  map: ReadonlyMap<string, Priority> | undefined,
  taskId: string | null | undefined
): Priority | undefined {
  if (!map || !taskId) return undefined;
  return map.get(taskId);
}
