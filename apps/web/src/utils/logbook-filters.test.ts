import { describe, expect, it } from 'vitest';
import type { LogbookEntry } from '@/types/growth-system';
import { filterLogbookEntries, sortLogbookEntriesByDate } from '@/utils/logbook-filters';

const entry = (overrides: Partial<LogbookEntry>): LogbookEntry => ({
  id: overrides.id ?? 'entry-1',
  date: overrides.date ?? '2026-01-01',
  title: overrides.title ?? null,
  notes: overrides.notes ?? null,
  mood: overrides.mood ?? null,
  energy: overrides.energy ?? null,
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('logbook-filters', () => {
  it('sortLogbookEntriesByDate returns newest date first', () => {
    const entries = [
      entry({ id: 'a', date: '2026-04-10' }),
      entry({ id: 'b', date: '2026-08-01' }),
      entry({ id: 'c', date: '2026-05-12' }),
    ];

    const sorted = sortLogbookEntriesByDate(entries);

    expect(sorted.map((item) => item.id)).toEqual(['b', 'c', 'a']);
  });

  it('filterLogbookEntries matches title, notes, and date', () => {
    const entries = [
      entry({ id: 'a', title: 'Major Gap', notes: 'work stress', date: '2026-05-13' }),
      entry({ id: 'b', title: 'Quiet day', notes: 'rested', date: '2026-04-10' }),
    ];

    expect(filterLogbookEntries(entries, 'major').map((item) => item.id)).toEqual(['a']);
    expect(filterLogbookEntries(entries, 'rested').map((item) => item.id)).toEqual(['b']);
    expect(filterLogbookEntries(entries, '2026-05').map((item) => item.id)).toEqual(['a']);
  });
});
