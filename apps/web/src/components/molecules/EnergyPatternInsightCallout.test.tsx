import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EnergyPatternInsightCallout } from '@/components/molecules/EnergyPatternInsightCallout';
import type { LeverageRoiEnergyPatternInsight } from '@/types/growth-system';

const sampleInsight: LeverageRoiEnergyPatternInsight = {
  lookbackDays: 28,
  leverageThreshold: 55,
  taggedHighLeverageCount: 10,
  sampleWeeks: 4,
  dominantEnergyLevel: 'Deep Work',
  dominantCount: 7,
  sharePct: 70,
};

describe('EnergyPatternInsightCallout', () => {
  it('renders nothing when insight is null or undefined', () => {
    const { container: nullContainer } = render(<EnergyPatternInsightCallout insight={null} />);
    expect(nullContainer).toBeEmptyDOMElement();

    const { container: undefinedContainer } = render(
      <EnergyPatternInsightCallout insight={undefined} />
    );
    expect(undefinedContainer).toBeEmptyDOMElement();
  });

  it('formats and renders the dominant energy insight', () => {
    render(<EnergyPatternInsightCallout insight={sampleInsight} />);
    expect(screen.getByTestId('energy-pattern-insight-callout')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Your high-leverage work tends to be Deep Work energy — 7 of 10 tagged high-leverage completions over the last 4 weeks\./
      )
    ).toBeInTheDocument();
  });

  it('uses singular week label for 7-day lookback', () => {
    render(
      <EnergyPatternInsightCallout
        insight={{
          ...sampleInsight,
          lookbackDays: 7,
          taggedHighLeverageCount: 5,
          dominantCount: 3,
        }}
      />
    );
    expect(screen.getByText(/last 1 week\./)).toBeInTheDocument();
  });
});
