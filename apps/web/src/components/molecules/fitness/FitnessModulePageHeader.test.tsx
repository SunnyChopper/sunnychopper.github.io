import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Coffee } from 'lucide-react';
import { FitnessModulePageHeader } from '@/components/molecules/fitness/FitnessModulePageHeader';
import {
  assertFitnessModulePurpose,
  FITNESS_MODULE_PURPOSE_MAX_LENGTH,
  isValidFitnessModulePurpose,
} from '@/lib/fitness/fitness-module-page-header';

describe('fitness-module-page-header helpers', () => {
  it('accepts purpose at or under the max length', () => {
    const purpose = 'a'.repeat(FITNESS_MODULE_PURPOSE_MAX_LENGTH);
    expect(isValidFitnessModulePurpose(purpose)).toBe(true);
    expect(() => assertFitnessModulePurpose(purpose)).not.toThrow();
  });

  it('rejects purpose over the max length', () => {
    const purpose = 'a'.repeat(FITNESS_MODULE_PURPOSE_MAX_LENGTH + 1);
    expect(isValidFitnessModulePurpose(purpose)).toBe(false);
    expect(() => assertFitnessModulePurpose(purpose)).toThrow(/≤ 90/);
  });
});

describe('FitnessModulePageHeader', () => {
  it('renders icon, title, and purpose', () => {
    render(
      <FitnessModulePageHeader
        icon={Coffee}
        title="Nutrition"
        purpose="Log meals, manage your pantry, and plan from ingredients at home."
        accent="emerald"
      />
    );

    expect(screen.getByRole('heading', { name: 'Nutrition' })).toBeInTheDocument();
    expect(
      screen.getByText('Log meals, manage your pantry, and plan from ingredients at home.')
    ).toBeInTheDocument();
  });

  it('renders optional actions slot', () => {
    render(
      <FitnessModulePageHeader
        icon={Coffee}
        title="Rewards"
        purpose="Configure earn rules and claim points into your global wallet."
        actions={<button type="button">New rule</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'New rule' })).toBeInTheDocument();
  });

  it('omits actions slot when not provided', () => {
    const { container } = render(
      <FitnessModulePageHeader
        icon={Coffee}
        title="Aura"
        purpose="See how daily recovery correlates with completed story points."
      />
    );

    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
