import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AIProjectAssistLoadingSkeleton } from '@/components/molecules/AIProjectAssistLoadingSkeleton';

describe('AIProjectAssistLoadingSkeleton', () => {
  it('renders six health factor placeholders', () => {
    render(<AIProjectAssistLoadingSkeleton mode="health" />);

    expect(screen.getByTestId('ai-project-assist-skeleton-health')).toBeInTheDocument();
    expect(screen.getAllByTestId('health-factor-skeleton')).toHaveLength(6);
  });

  it('renders generate task card placeholders', () => {
    render(<AIProjectAssistLoadingSkeleton mode="generate" />);

    expect(screen.getByTestId('ai-project-assist-skeleton-generate')).toBeInTheDocument();
    expect(screen.getAllByTestId('generate-task-skeleton')).toHaveLength(4);
  });

  it('renders risk card placeholders', () => {
    render(<AIProjectAssistLoadingSkeleton mode="risks" />);

    expect(screen.getByTestId('ai-project-assist-skeleton-risks')).toBeInTheDocument();
    expect(screen.getAllByTestId('risk-card-skeleton')).toHaveLength(4);
  });
});
