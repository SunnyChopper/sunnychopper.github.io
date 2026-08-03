import { describe, expect, it } from 'vitest';
import type { Area, EntitySummary } from '@/types/growth-system';
import {
  compareByRelevance,
  entityMatchesSearch,
  partitionRelationshipPickerEntities,
} from '@/lib/growth-system/relationship-picker-relevance';

function task(id: string, overrides: Partial<EntitySummary> = {}): EntitySummary {
  return {
    id,
    title: `Task ${id}`,
    type: 'task',
    area: 'Operations',
    status: 'Not Started',
    ...overrides,
  };
}

describe('relationship-picker-relevance', () => {
  it('prefers area match, then recency, then demotes terminal statuses', () => {
    const wealthRecent = task('a', {
      area: 'Wealth',
      updatedAt: '2026-07-20T00:00:00.000Z',
      status: 'In Progress',
    });
    const wealthDone = task('b', {
      area: 'Wealth',
      updatedAt: '2026-07-25T00:00:00.000Z',
      status: 'Done',
    });
    const opsRecent = task('c', {
      area: 'Operations',
      updatedAt: '2026-07-26T00:00:00.000Z',
      status: 'In Progress',
    });

    const ranked = [wealthDone, opsRecent, wealthRecent].sort((a, b) =>
      compareByRelevance(a, b, 'Wealth' as Area)
    );

    expect(ranked.map((entity) => entity.id)).toEqual(['a', 'b', 'c']);
  });

  it('filters entities by search query', () => {
    const entities = [
      task('1', { title: 'Polish Projects UI' }),
      task('2', { title: 'Enroll in UND course' }),
    ];

    expect(entityMatchesSearch(entities[0], 'polish')).toBe(true);
    expect(entityMatchesSearch(entities[1], 'polish')).toBe(false);
  });

  it('partitions baseline linked, suggested cap, and other', () => {
    const entities: EntitySummary[] = [
      task('linked', { title: 'Linked task', area: 'Wealth' }),
      ...Array.from({ length: 15 }, (_, index) =>
        task(`s${index}`, {
          title: `Suggested ${index}`,
          area: index % 2 === 0 ? 'Wealth' : 'Operations',
          updatedAt: `2026-07-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
        })
      ),
    ];

    const result = partitionRelationshipPickerEntities({
      entities,
      searchQuery: '',
      baselineLinkedIds: ['linked'],
      contextArea: 'Wealth' as Area,
      suggestionLimit: 12,
    });

    expect(result.currentlyLinked.map((entity) => entity.id)).toEqual(['linked']);
    expect(result.suggested).toHaveLength(12);
    expect(result.other).toHaveLength(3);
    expect(result.suggested.every((entity) => entity.id !== 'linked')).toBe(true);
  });

  it('keeps deselected baseline rows in currently linked when still in entity list', () => {
    const entities = [
      task('linked', { title: 'Was linked' }),
      task('other', { title: 'Other task' }),
    ];

    const result = partitionRelationshipPickerEntities({
      entities,
      searchQuery: '',
      baselineLinkedIds: ['linked', 'missing'],
      contextArea: 'Operations' as Area,
    });

    expect(result.currentlyLinked.map((entity) => entity.id)).toEqual(['linked']);
  });

  it('returns flat other list when contextArea is unset', () => {
    const entities = [task('1'), task('2')];

    const result = partitionRelationshipPickerEntities({
      entities,
      searchQuery: '',
      baselineLinkedIds: [],
    });

    expect(result.suggested).toEqual([]);
    expect(result.other).toHaveLength(2);
  });
});
