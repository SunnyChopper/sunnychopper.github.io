import type { Area, EntitySummary } from '@/types/growth-system';

export const DEFAULT_SUGGESTION_LIMIT = 12;

const TERMINAL_TASK_STATUSES = new Set(['Done', 'Cancelled']);
const TERMINAL_GOAL_STATUSES = new Set(['Achieved', 'Abandoned']);

export function isTerminalEntityStatus(entity: EntitySummary): boolean {
  if (entity.type === 'task') {
    return TERMINAL_TASK_STATUSES.has(entity.status);
  }
  if (entity.type === 'goal') {
    return TERMINAL_GOAL_STATUSES.has(entity.status);
  }
  return false;
}

function entityUpdatedAtMs(entity: EntitySummary): number {
  const raw = entity.updatedAt;
  if (!raw) return 0;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : 0;
}

function areaMatchScore(entity: EntitySummary, contextArea: Area | undefined): number {
  if (!contextArea) return 0;
  return entity.area === contextArea ? 1 : 0;
}

/** Higher sort order = more relevant (used with descending sort). */
export function compareByRelevance(
  a: EntitySummary,
  b: EntitySummary,
  contextArea: Area | undefined
): number {
  const areaDelta = areaMatchScore(b, contextArea) - areaMatchScore(a, contextArea);
  if (areaDelta !== 0) return areaDelta;

  const terminalA = isTerminalEntityStatus(a) ? 1 : 0;
  const terminalB = isTerminalEntityStatus(b) ? 1 : 0;
  if (terminalA !== terminalB) return terminalA - terminalB;

  const updatedDelta = entityUpdatedAtMs(b) - entityUpdatedAtMs(a);
  if (updatedDelta !== 0) return updatedDelta;

  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}

export function entityMatchesSearch(entity: EntitySummary, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return true;
  return entity.title.toLowerCase().includes(q);
}

export interface PartitionRelationshipPickerEntitiesInput {
  entities: EntitySummary[];
  searchQuery: string;
  baselineLinkedIds: string[];
  contextArea?: Area;
  suggestionLimit?: number;
}

export interface PartitionedRelationshipPickerEntities {
  currentlyLinked: EntitySummary[];
  suggested: EntitySummary[];
  other: EntitySummary[];
}

export function partitionRelationshipPickerEntities({
  entities,
  searchQuery,
  baselineLinkedIds,
  contextArea,
  suggestionLimit = DEFAULT_SUGGESTION_LIMIT,
}: PartitionRelationshipPickerEntitiesInput): PartitionedRelationshipPickerEntities {
  const baselineSet = new Set(baselineLinkedIds);
  const filtered = entities.filter((entity) => entityMatchesSearch(entity, searchQuery));

  const currentlyLinked: EntitySummary[] = [];
  const candidates: EntitySummary[] = [];

  for (const entity of filtered) {
    if (baselineSet.has(entity.id)) {
      currentlyLinked.push(entity);
    } else {
      candidates.push(entity);
    }
  }

  currentlyLinked.sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  );

  if (!contextArea) {
    const other = [...candidates].sort((a, b) => compareByRelevance(a, b, contextArea));
    return { currentlyLinked, suggested: [], other };
  }

  const ranked = [...candidates].sort((a, b) => compareByRelevance(a, b, contextArea));
  const suggested = ranked.slice(0, suggestionLimit);
  const suggestedIds = new Set(suggested.map((entity) => entity.id));
  const other = ranked.filter((entity) => !suggestedIds.has(entity.id));

  return { currentlyLinked, suggested, other };
}
