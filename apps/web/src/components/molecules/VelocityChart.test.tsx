import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VelocityChart } from '@/components/molecules/VelocityChart';
import { computeRollingAverages } from '@/utils/velocity-chart-math';

describe('computeRollingAverages', () => {
  it('computes trailing means oldest-first', () => {
    expect(computeRollingAverages([8, 4, 6, 10], 4)).toEqual([8, 6, 6, 7]);
  });

  it('handles window smaller than series length', () => {
    expect(computeRollingAverages([2, 4, 6], 2)).toEqual([2, 3, 5]);
  });

  it('returns empty for empty input', () => {
    expect(computeRollingAverages([], 4)).toEqual([]);
  });
});

describe('VelocityChart', () => {
  it('renders dashed placeholder and empty-week tooltip for zero story points', () => {
    const { container } = render(
      <VelocityChart
        weeks={[
          { weekStart: '2026-07-20', storyPointsCompleted: 0, tasksCompleted: 0 },
          { weekStart: '2026-07-13', storyPointsCompleted: 10, tasksCompleted: 3 },
        ]}
        currentWeekStart="2026-07-20"
      />
    );

    const emptyPlaceholders = container.querySelectorAll('[data-empty-week="true"]');
    expect(emptyPlaceholders.length).toBeGreaterThanOrEqual(2);

    const dashedOutline = container.querySelector('[data-empty-week="true"][stroke-dasharray]');
    expect(dashedOutline).toBeTruthy();
    expect(dashedOutline?.getAttribute('stroke-dasharray')).toBe('3 2');

    const titles = Array.from(container.querySelectorAll('title')).map((el) => el.textContent);
    expect(titles).toContain('No story points completed');
    expect(titles.some((t) => t?.includes('10 story points'))).toBe(true);
  });

  it('renders solid bars for positive story points without dashed placeholder', () => {
    const { container } = render(
      <VelocityChart
        weeks={[{ weekStart: '2026-07-13', storyPointsCompleted: 8, tasksCompleted: 2 }]}
        currentWeekStart="2026-07-13"
      />
    );

    expect(container.querySelector('[data-velocity-bar="true"]')).toBeTruthy();
    expect(container.querySelector('[data-empty-week="true"]')).toBeNull();
  });

  it('omits columns for weeks not in the series', () => {
    const { container } = render(
      <VelocityChart
        weeks={[{ weekStart: '2026-07-13', storyPointsCompleted: 5, tasksCompleted: 1 }]}
        currentWeekStart="2026-07-13"
      />
    );

    const dateLabels = Array.from(container.querySelectorAll('text')).map((el) => el.textContent);
    expect(dateLabels).toContain('07-13');
    expect(dateLabels).not.toContain('07-06');
  });
});
