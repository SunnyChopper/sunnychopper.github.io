import { useMemo, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import type { PlanDaySuggestion } from '@/types/planner';
import type { Priority } from '@/types/growth-system';
import { formatCapacityExcessPoints } from '@/lib/planner/trim-selected-to-capacity';
import { cn } from '@/lib/utils';

export interface SuggestionsListProps {
  suggestions: PlanDaySuggestion[];
  orderedIds: string[];
  capacityPoints: number;
  selectedIds: Set<string>;
  onToggleTask: (taskId: string) => void;
  onReorder: (nextOrderedIds: string[]) => void;
  onTrimToFit?: () => void;
}

const CAPACITY_EPSILON = 1e-6;

function getCapacityBatteryPresentation(selectedPoints: number, capacityPoints: number) {
  const ratio = capacityPoints > 0 ? selectedPoints / capacityPoints : 0;
  const c = capacityPoints;
  const isOverCapacity = capacityPoints > 0 && selectedPoints > capacityPoints + CAPACITY_EPSILON;
  const excessStatus = formatCapacityExcessPoints(selectedPoints, capacityPoints);

  if (selectedPoints <= 0.8 * c) {
    return {
      ratio,
      batteryColor: 'bg-teal-400 dark:bg-teal-500',
      statusText: 'Under-allocated',
      isOverloaded: false,
      isOverCapacity: false,
    };
  }
  if (selectedPoints <= c) {
    return {
      ratio,
      batteryColor: 'bg-emerald-500 dark:bg-emerald-400',
      statusText: 'Optimal Capacity',
      isOverloaded: false,
      isOverCapacity: false,
    };
  }
  if (selectedPoints <= 1.3 * c) {
    return {
      ratio,
      batteryColor: 'bg-amber-500',
      statusText: excessStatus,
      isOverloaded: false,
      isOverCapacity,
    };
  }
  return {
    ratio,
    batteryColor: 'bg-red-500 dark:bg-red-600 animate-pulse',
    statusText: excessStatus,
    isOverloaded: true,
    isOverCapacity,
  };
}

function SortableRow({
  item,
  selected,
  onToggle,
}: {
  item: PlanDaySuggestion;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const reasonId = `suggestion-reason-${item.taskId}`;
  const showMeta = expanded || focused;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.taskId,
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
      className="group flex gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-700 dark:bg-gray-950"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 self-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div
        className="flex min-w-0 flex-1 items-start gap-2"
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setFocused(false);
          }
        }}
      >
        <input
          type="checkbox"
          className="mt-0.5 shrink-0 accent-blue-600"
          checked={selected}
          onChange={onToggle}
          aria-describedby={reasonId}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="min-w-0 flex-1 truncate text-left text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:text-white"
              title={item.title}
              aria-expanded={expanded}
              aria-controls={reasonId}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {item.title}
            </button>
            <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-blue-800 dark:bg-blue-950/60 dark:text-blue-200">
              {item.storyPoints} pts
            </span>
          </div>
          <div
            id={reasonId}
            className={cn(
              'mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400',
              showMeta ? 'block' : 'hidden group-hover:block'
            )}
          >
            <span>{item.reason}</span>
            <PriorityIndicator
              priority={item.priority as Priority}
              variant="badge"
              size="sm"
              className="shrink-0"
            />
            {item.contextMatch ? (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                Fits today
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export function SuggestionsList({
  suggestions,
  orderedIds,
  capacityPoints,
  selectedIds,
  onToggleTask,
  onReorder,
  onTrimToFit,
}: SuggestionsListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byId = useMemo(() => new Map(suggestions.map((s) => [s.taskId, s])), [suggestions]);
  const orderedSuggestions = orderedIds
    .map((id) => byId.get(id))
    .filter(Boolean) as PlanDaySuggestion[];

  const selectedPoints = orderedSuggestions.reduce(
    (sum, s) => sum + (selectedIds.has(s.taskId) ? s.storyPoints : 0),
    0
  );

  const { ratio, batteryColor, statusText, isOverloaded, isOverCapacity } =
    getCapacityBatteryPresentation(selectedPoints, capacityPoints);
  const fillPct = Math.min(ratio * 100, 100);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ordered = [...orderedIds];
    const oldIndex = ordered.indexOf(String(active.id));
    const newIndex = ordered.indexOf(String(over.id));
    if (oldIndex >= 0 && newIndex >= 0) {
      onReorder(arrayMove(ordered, oldIndex, newIndex));
    }
  };

  if (orderedSuggestions.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No sized backlog tasks available—add Fibonacci estimates to unblock planning.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="mb-2 space-y-2">
        <div className="flex items-end justify-between gap-2 text-sm">
          <span
            className={
              isOverloaded
                ? 'font-bold text-red-600 dark:text-red-400'
                : isOverCapacity
                  ? 'font-semibold text-amber-700 dark:text-amber-300'
                  : 'font-medium text-gray-600 dark:text-gray-300'
            }
          >
            {statusText}
          </span>
          <span className="shrink-0 tabular-nums font-semibold text-gray-900 dark:text-white">
            {selectedPoints.toFixed(1)} / ~{capacityPoints.toFixed(1)} pts
          </span>
        </div>
        {isOverCapacity && onTrimToFit ? (
          <button
            type="button"
            onClick={onTrimToFit}
            className="w-full rounded-lg border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/20"
          >
            Remove lowest-priority to fit
          </button>
        ) : null}
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
          role="progressbar"
          aria-valuenow={Math.round(fillPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Daily capacity: ${statusText}`}
        >
          <div
            className={`h-full transition-all duration-500 ease-out ${batteryColor}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1">
            {orderedSuggestions.map((s) => (
              <SortableRow
                key={s.taskId}
                item={s}
                selected={selectedIds.has(s.taskId)}
                onToggle={() => onToggleTask(s.taskId)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
