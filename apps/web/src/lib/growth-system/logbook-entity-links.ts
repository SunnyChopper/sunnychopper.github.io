import { useCallback, useState } from 'react';
import { logbookService } from '@/services/growth-system/logbook.service';
import type { EntitySummary, LogbookEntry, LogbookLinkedEntity } from '@/types/growth-system';

export type MemoryThreadEntityType = 'project' | 'goal';

export function logbookEntryToEntitySummary(entry: LogbookEntry): EntitySummary {
  return {
    id: entry.id,
    title: entry.title?.trim() ? entry.title : entry.date,
    type: 'logbook',
    area: 'Operations',
    status: entry.date,
  };
}

export function isLogbookLinkedToEntity(
  entry: LogbookEntry,
  entityType: MemoryThreadEntityType,
  entityId: string
): boolean {
  return (entry.linkedEntities ?? []).some(
    (link) => link.entityType === entityType && link.entityId === entityId
  );
}

export function getLinkedLogbookEntryIds(
  entries: LogbookEntry[],
  entityType: MemoryThreadEntityType,
  entityId: string
): string[] {
  return entries
    .filter((entry) => isLogbookLinkedToEntity(entry, entityType, entityId))
    .map((entry) => entry.id);
}

export function buildLinkedEntitiesAfterToggle(
  entry: LogbookEntry,
  entityType: MemoryThreadEntityType,
  entityId: string,
  entityName: string,
  shouldLink: boolean
): LogbookLinkedEntity[] {
  const current = entry.linkedEntities ?? [];
  const withoutTarget = current.filter(
    (link) => !(link.entityType === entityType && link.entityId === entityId)
  );
  if (!shouldLink) {
    return withoutTarget;
  }
  return [...withoutTarget, { entityType, entityId, entityName }];
}

export async function fetchAllLogbookEntries(): Promise<LogbookEntry[]> {
  const pageSize = 100;
  let page = 1;
  const all: LogbookEntry[] = [];
  let total = Number.POSITIVE_INFINITY;

  while (all.length < total) {
    const response = await logbookService.getAll({ page, pageSize });
    if (!response.success || !response.data) {
      throw new Error('Failed to load logbook entries');
    }
    all.push(...response.data);
    total = response.total ?? all.length;
    if (response.data.length < pageSize) {
      break;
    }
    page += 1;
  }

  return all;
}

export async function syncLogbookEntityLinks(params: {
  entries: LogbookEntry[];
  entityType: MemoryThreadEntityType;
  entityId: string;
  entityName: string;
  selectedEntryIds: string[];
  previousEntryIds: string[];
}): Promise<void> {
  const { entries, entityType, entityId, entityName, selectedEntryIds, previousEntryIds } = params;
  const selectedSet = new Set(selectedEntryIds);
  const previousSet = new Set(previousEntryIds);

  const changedIds = [
    ...selectedEntryIds.filter((id) => !previousSet.has(id)),
    ...previousEntryIds.filter((id) => !selectedSet.has(id)),
  ];

  if (changedIds.length === 0) {
    return;
  }

  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const results = await Promise.allSettled(
    changedIds.map(async (entryId) => {
      const entry = entryById.get(entryId);
      if (!entry) {
        throw new Error('Logbook entry not found');
      }
      const shouldLink = selectedSet.has(entryId);
      const linkedEntities = buildLinkedEntitiesAfterToggle(
        entry,
        entityType,
        entityId,
        entityName,
        shouldLink
      );
      const response = await logbookService.update(entryId, { linkedEntities });
      if (!response.success) {
        throw new Error(response.error?.message || `Failed to update logbook entry ${entry.date}`);
      }
    })
  );

  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length > 0) {
    throw new Error(
      `Failed to update ${failed.length} logbook link${failed.length === 1 ? '' : 's'}`
    );
  }
}

interface UseEntityLogbookLinkPickerOptions {
  entityType: MemoryThreadEntityType;
  entityId: string;
  entityName: string;
  onError?: (message: string) => void;
}

export function useEntityLogbookLinkPicker({
  entityType,
  entityId,
  entityName,
  onError,
}: UseEntityLogbookLinkPickerOptions) {
  const [isLogbookPickerOpen, setIsLogbookPickerOpen] = useState(false);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [selectedLogbookIds, setSelectedLogbookIds] = useState<string[]>([]);
  const [baselineLogbookIds, setBaselineLogbookIds] = useState<string[]>([]);
  const [isLogbookSaving, setIsLogbookSaving] = useState(false);
  const [isLogbookLoading, setIsLogbookLoading] = useState(false);
  const [logbookSaveError, setLogbookSaveError] = useState<string | null>(null);
  const [memoryReloadKey, setMemoryReloadKey] = useState(0);

  const logbookPickerEntities = logbookEntries.map(logbookEntryToEntitySummary);

  const openLogbookPicker = useCallback(async () => {
    setLogbookSaveError(null);
    setIsLogbookLoading(true);
    try {
      const entries = await fetchAllLogbookEntries();
      const linkedIds = getLinkedLogbookEntryIds(entries, entityType, entityId);
      setLogbookEntries(entries);
      setSelectedLogbookIds(linkedIds);
      setBaselineLogbookIds(linkedIds);
      setIsLogbookPickerOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load logbook entries for linking';
      onError?.(message);
    } finally {
      setIsLogbookLoading(false);
    }
  }, [entityId, entityType, onError]);

  const handleLogbookSave = useCallback(async () => {
    setIsLogbookSaving(true);
    setLogbookSaveError(null);
    try {
      await syncLogbookEntityLinks({
        entries: logbookEntries,
        entityType,
        entityId,
        entityName,
        selectedEntryIds: selectedLogbookIds,
        previousEntryIds: baselineLogbookIds,
      });
      setBaselineLogbookIds(selectedLogbookIds);
      setMemoryReloadKey((key) => key + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save logbook links. Please try again.';
      setLogbookSaveError(message);
      throw error;
    } finally {
      setIsLogbookSaving(false);
    }
  }, [baselineLogbookIds, entityId, entityName, entityType, logbookEntries, selectedLogbookIds]);

  return {
    isLogbookPickerOpen,
    setIsLogbookPickerOpen,
    openLogbookPicker,
    logbookPickerEntities,
    selectedLogbookIds,
    setSelectedLogbookIds,
    handleLogbookSave,
    isLogbookSaving,
    isLogbookLoading,
    logbookSaveError,
    setLogbookSaveError,
    memoryReloadKey,
    bumpMemoryReload: () => setMemoryReloadKey((key) => key + 1),
  };
}
