import { describe, it, expect } from 'vitest';
import { formatRewardRulePreview, hasAdvancedRuleValues } from './reward-rule-preview';

describe('formatRewardRulePreview', () => {
  const base = {
    name: '',
    points: 10,
    category: 'custom' as const,
    target: '',
    triggerType: 'manual' as const,
    autoMetric: '' as const,
    cooldownHours: '',
    maxClaimsPerDay: '',
  };

  it('formats default create state', () => {
    expect(formatRewardRulePreview(base)).toBe('Earn 10 pts (manual, custom)');
  });

  it('formats target with max per day and category', () => {
    expect(
      formatRewardRulePreview({
        ...base,
        category: 'hydration',
        target: '12 oz water',
        maxClaimsPerDay: '3',
      })
    ).toBe('Earn 10 pts for every 12 oz water (manual, hydration, max 3/day)');
  });

  it('falls back to name when target is empty', () => {
    expect(
      formatRewardRulePreview({
        ...base,
        name: 'Water',
        category: 'hydration',
      })
    ).toBe('Earn 10 pts for Water (manual, hydration)');
  });

  it('reflects category changes', () => {
    expect(
      formatRewardRulePreview({
        ...base,
        name: 'Snack',
        category: 'nutrition',
      })
    ).toBe('Earn 10 pts for Snack (manual, nutrition)');
  });

  it('formats auto trigger with autoMetric and cooldown', () => {
    expect(
      formatRewardRulePreview({
        ...base,
        points: 15,
        category: 'workout',
        target: 'PR',
        triggerType: 'auto',
        autoMetric: 'workout_set_pr',
        cooldownHours: '4',
      })
    ).toBe('Earn 15 pts for every PR (auto, workout, workout_set_pr, 4h cooldown)');
  });
});

describe('hasAdvancedRuleValues', () => {
  const base = {
    target: '',
    triggerType: 'manual' as const,
    cooldownHours: '',
    maxClaimsPerDay: '',
  };

  it('returns false for defaults', () => {
    expect(hasAdvancedRuleValues(base)).toBe(false);
  });

  it('returns true when target is set', () => {
    expect(hasAdvancedRuleValues({ ...base, target: '12oz' })).toBe(true);
  });

  it('returns true when trigger is auto', () => {
    expect(hasAdvancedRuleValues({ ...base, triggerType: 'auto' })).toBe(true);
  });

  it('returns true when cooldown or max per day is set', () => {
    expect(hasAdvancedRuleValues({ ...base, cooldownHours: '2' })).toBe(true);
    expect(hasAdvancedRuleValues({ ...base, maxClaimsPerDay: '3' })).toBe(true);
  });
});
