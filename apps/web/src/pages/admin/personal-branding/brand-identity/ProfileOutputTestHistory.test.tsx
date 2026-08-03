import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProfileOutputTestHistory from './ProfileOutputTestHistory';
import type { BrandProfileOutputTest } from '@/types/api/personal-branding.dto';

const savedTest: BrandProfileOutputTest = {
  id: 'test-1',
  profileId: 'profile-1',
  topic: 'Sample topic',
  contentType: 'DEEP_DIVE_BLOG',
  platform: 'linkedin',
  title: 'Preview title',
  body: 'Body text',
  cached: false,
  userId: 'u1',
  createdAt: '2026-07-14T12:00:00Z',
};

describe('ProfileOutputTestHistory', () => {
  it('shows list-row skeletons while loading', () => {
    render(<ProfileOutputTestHistory tests={[]} isLoading onSelect={vi.fn()} />);

    expect(screen.getByRole('status', { name: 'Loading saved tests' })).toBeInTheDocument();
    expect(screen.queryByText('Loading saved tests…')).not.toBeInTheDocument();
  });

  it('shows empty state CTA and invokes onGenerateFirst', async () => {
    const user = userEvent.setup();
    const onGenerateFirst = vi.fn();

    render(
      <ProfileOutputTestHistory
        tests={[]}
        isLoading={false}
        onSelect={vi.fn()}
        onGenerateFirst={onGenerateFirst}
      />
    );

    expect(screen.getByText('No saved previews yet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /generate your first preview/i }));
    expect(onGenerateFirst).toHaveBeenCalledTimes(1);
  });

  it('disables empty state CTA when generateDisabled', () => {
    render(
      <ProfileOutputTestHistory
        tests={[]}
        isLoading={false}
        onSelect={vi.fn()}
        onGenerateFirst={vi.fn()}
        generateDisabled
      />
    );

    expect(screen.getByRole('button', { name: /generate your first preview/i })).toBeDisabled();
  });

  it('renders saved tests list when data exists', () => {
    render(<ProfileOutputTestHistory tests={[savedTest]} isLoading={false} onSelect={vi.fn()} />);

    expect(screen.getByText('Sample topic')).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn/)).toBeInTheDocument();
  });
});
