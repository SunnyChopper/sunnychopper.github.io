import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('always renders svg with track and progress circles', () => {
    const { container } = render(<ProgressRing progress={0} />);

    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('shows 0% label at zero progress when showLabel is true', () => {
    render(<ProgressRing progress={0} showLabel />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('uses a visible track token at zero progress', () => {
    const { container } = render(<ProgressRing progress={0} showLabel={false} />);

    const track = container.querySelectorAll('circle')[0];
    expect(track?.getAttribute('class')).toContain('text-gray-300');
    expect(track?.getAttribute('class')).toContain('dark:text-gray-600');
  });

  it('renders colored progress stroke when progress is greater than zero', () => {
    const { container } = render(<ProgressRing progress={42} color="green" showLabel={false} />);

    const progressStroke = container.querySelectorAll('circle')[1];
    expect(progressStroke?.getAttribute('class')).toContain('text-green-600');
  });
});
