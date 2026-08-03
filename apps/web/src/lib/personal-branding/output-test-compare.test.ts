import { describe, expect, it } from 'vitest';
import type { BrandProfileOutputTest } from '@/types/api/personal-branding.dto';
import {
  buildStructuralDiff,
  classifyHookStyle,
  DEFAULT_COMPARE_PLATFORMS,
  findReusableOutputTest,
  isValidCompareSelection,
  normalizeOutputTestTopic,
  toggleComparePlatform,
} from './output-test-compare';

function makeTest(overrides: Partial<BrandProfileOutputTest> = {}): BrandProfileOutputTest {
  return {
    id: 'test-1',
    profileId: 'profile-1',
    topic: 'Same topic',
    contentType: 'DEEP_DIVE_BLOG',
    platform: 'linkedin',
    title: 'Title',
    body: 'Body text.',
    cached: false,
    userId: 'u1',
    createdAt: '2026-07-14T12:00:00Z',
    ...overrides,
  };
}

describe('output-test-compare', () => {
  it('normalizes topic whitespace', () => {
    expect(normalizeOutputTestTopic('  hello   world  ')).toBe('hello world');
  });

  it('finds reusable output test by normalized topic', () => {
    const history = [
      makeTest({
        id: 'older',
        topic: 'Same  topic',
        platform: 'x',
        createdAt: '2026-07-13T12:00:00Z',
      }),
      makeTest({ id: 'newer', topic: 'Same topic', platform: 'linkedin' }),
    ];

    const match = findReusableOutputTest(history, {
      topic: '  Same   topic ',
      platform: 'linkedin',
      profileId: 'profile-1',
    });

    expect(match?.id).toBe('newer');
  });

  it('classifies hook styles', () => {
    expect(classifyHookStyle('Why do agents fail at scale?')).toBe('question');
    expect(classifyHookStyle('Stop chaining prompts blindly.')).toBe('imperative');
    expect(classifyHookStyle('73% of teams ship broken agents.')).toBe('statistic');
    expect(classifyHookStyle('1. Start with state.')).toBe('list_opener');
    expect(classifyHookStyle('LangGraph changed how I ship agents.')).toBe('statement');
  });

  it('builds structural diff with shared and unique rhetoric', () => {
    const diff = buildStructuralDiff([
      {
        platform: 'x',
        body: 'Why orchestration beats prompt chains?',
        resolvedPolicy: {
          characterLimit: 280,
          readTimeLimitMinutes: 1,
          wordLimit: 200,
          rhetoricalModes: [{ mode: 'narrative', strength: 'moderate' }],
          rhetoricalDevices: ['metaphor'],
          requirements: '',
          appliedRuleIds: [],
        },
      },
      {
        platform: 'linkedin',
        body: 'LangGraph gives you explicit state management.',
        resolvedPolicy: {
          characterLimit: 3000,
          readTimeLimitMinutes: 5,
          wordLimit: 1000,
          rhetoricalModes: [{ mode: 'narrative', strength: 'strong' }],
          rhetoricalDevices: ['metaphor', 'analogy'],
          requirements: '',
          appliedRuleIds: [],
        },
      },
    ]);

    expect(diff.hookStylesDiffer).toBe(true);
    expect(diff.sharedModes).toEqual(['narrative']);
    expect(diff.uniqueDevices.linkedin).toEqual(['analogy']);
    expect(diff.columns).toHaveLength(2);
    expect(diff.columns[0]?.withinCharacterLimit).toBe(true);
  });

  it('validates compare selection bounds', () => {
    expect(isValidCompareSelection(DEFAULT_COMPARE_PLATFORMS)).toBe(true);
    expect(isValidCompareSelection(['x'])).toBe(false);
    expect(isValidCompareSelection(['x', 'linkedin', 'instagram', 'medium'])).toBe(false);
  });

  it('toggles compare platform selection with max cap', () => {
    expect(toggleComparePlatform(['x', 'linkedin'], 'instagram')).toEqual([
      'x',
      'linkedin',
      'instagram',
    ]);
    expect(toggleComparePlatform(['x', 'linkedin', 'instagram'], 'medium')).toEqual([
      'x',
      'linkedin',
      'instagram',
    ]);
    expect(toggleComparePlatform(['x', 'linkedin'], 'x')).toEqual(['linkedin']);
  });
});
