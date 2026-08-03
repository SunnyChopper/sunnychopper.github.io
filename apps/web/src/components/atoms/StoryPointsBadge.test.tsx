import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StoryPointsBadge } from '@/components/atoms/StoryPointsBadge';

describe('StoryPointsBadge', () => {
  it('renders nothing for zero or invalid values', () => {
    const { container: zero } = render(<StoryPointsBadge size={0} />);
    expect(zero.firstChild).toBeNull();

    const { container: missing } = render(<StoryPointsBadge size={null} />);
    expect(missing.firstChild).toBeNull();
  });

  it('shows formatted story points label', () => {
    render(<StoryPointsBadge size={3} />);
    expect(screen.getByText('3pts')).toBeInTheDocument();
  });
});
