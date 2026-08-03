import { describe, expect, it } from 'vitest';
import type { LogbookEntry } from '@/types/growth-system';
import {
  buildLinkedEntitiesAfterToggle,
  getLinkedLogbookEntryIds,
  isLogbookLinkedToEntity,
  logbookEntryToEntitySummary,
} from '@/lib/growth-system/logbook-entity-links';

const baseEntry = (overrides: Partial<LogbookEntry> = {}): LogbookEntry => ({
  id: 'entry-1',
  date: '2026-05-01',
  title: 'Daily reflection',
  notes: null,
  mood: null,
  energy: null,
  linkedEntities: [],
  userId: 'user-1',
  createdAt: '2026-05-01T12:00:00.000Z',
  updatedAt: '2026-05-01T12:00:00.000Z',
  ...overrides,
});

describe('logbook-entity-links', () => {
  it('maps logbook entries to EntitySummary rows', () => {
    expect(logbookEntryToEntitySummary(baseEntry())).toEqual({
      id: 'entry-1',
      title: 'Daily reflection',
      type: 'logbook',
      area: 'Operations',
      status: '2026-05-01',
    });
  });

  it('falls back to date when title is empty', () => {
    expect(logbookEntryToEntitySummary(baseEntry({ title: null })).title).toBe('2026-05-01');
  });

  it('detects linked project entries', () => {
    const entry = baseEntry({
      linkedEntities: [{ entityType: 'project', entityId: 'proj-1', entityName: 'Alpha' }],
    });
    expect(isLogbookLinkedToEntity(entry, 'project', 'proj-1')).toBe(true);
    expect(getLinkedLogbookEntryIds([entry], 'project', 'proj-1')).toEqual(['entry-1']);
  });

  it('adds and removes project links while preserving other links', () => {
    const entry = baseEntry({
      linkedEntities: [{ entityType: 'goal', entityId: 'goal-1', entityName: 'Goal A' }],
    });

    const linked = buildLinkedEntitiesAfterToggle(entry, 'project', 'proj-1', 'Alpha', true);
    expect(linked).toEqual([
      { entityType: 'goal', entityId: 'goal-1', entityName: 'Goal A' },
      { entityType: 'project', entityId: 'proj-1', entityName: 'Alpha' },
    ]);

    const unlinked = buildLinkedEntitiesAfterToggle(
      { ...entry, linkedEntities: linked },
      'project',
      'proj-1',
      'Alpha',
      false
    );
    expect(unlinked).toEqual([{ entityType: 'goal', entityId: 'goal-1', entityName: 'Goal A' }]);
  });
});
