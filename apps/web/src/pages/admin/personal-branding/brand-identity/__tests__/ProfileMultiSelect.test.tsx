import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProfileMultiSelect from '../ProfileMultiSelect';
import type { BrandProfile } from '@/types/api/personal-branding.dto';
import { EXTRACTING_PROFILE_RULE_TOOLTIP } from '../brand-profile-selectability';

function makeProfile(overrides: Partial<BrandProfile> = {}): BrandProfile {
  return {
    id: 'p1',
    name: 'Extracted profile',
    userId: 'u',
    createdAt: '',
    updatedAt: '',
    status: 'active',
    pillars: [],
    platforms: [],
    toneMetrics: {},
    bannedPhrases: [],
    ...overrides,
  };
}

describe('ProfileMultiSelect', () => {
  it('disables extracting profiles and shows Extraction in progress', () => {
    render(
      <ProfileMultiSelect
        profiles={[makeProfile({ id: 'extracting', status: 'extracting' })]}
        selectedIds={[]}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /extracted profile/i });
    expect(checkbox).toBeDisabled();
    expect(screen.getByText('Extraction in progress')).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('title', EXTRACTING_PROFILE_RULE_TOOLTIP);
  });

  it('allows draft and active profiles to be selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileMultiSelect
        profiles={[
          makeProfile({ id: 'draft', status: 'draft', name: 'Draft profile' }),
          makeProfile({ id: 'active', status: 'active', name: 'Active profile' }),
        ]}
        selectedIds={[]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /draft profile/i }));
    expect(onChange).toHaveBeenCalledWith(['draft']);

    await user.click(screen.getByRole('checkbox', { name: /active profile/i }));
    expect(onChange).toHaveBeenLastCalledWith(['active']);
  });

  it('does not add extracting profile when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileMultiSelect
        profiles={[makeProfile({ id: 'extracting', status: 'extracting' })]}
        selectedIds={[]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByLabelText(/extracted profile/i));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows unchecking an already-selected extracting profile', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfileMultiSelect
        profiles={[makeProfile({ id: 'extracting', status: 'extracting' })]}
        selectedIds={['extracting']}
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /extracted profile/i });
    expect(checkbox).toBeEnabled();
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('enables checkbox after profile status changes from extracting to active', () => {
    const profiles = [makeProfile({ id: 'p1', status: 'extracting' })];
    const { rerender } = render(
      <ProfileMultiSelect profiles={profiles} selectedIds={[]} onChange={vi.fn()} />
    );

    expect(screen.getByRole('checkbox', { name: /extracted profile/i })).toBeDisabled();

    rerender(
      <ProfileMultiSelect
        profiles={[makeProfile({ id: 'p1', status: 'active' })]}
        selectedIds={[]}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole('checkbox', { name: /extracted profile/i })).toBeEnabled();
    expect(screen.queryByText('Extraction in progress')).not.toBeInTheDocument();
  });
});
