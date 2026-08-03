import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PlatformRuleSetPreviewPanel from '@/components/molecules/personal-branding/PlatformRuleSetPreviewPanel';

describe('PlatformRuleSetPreviewPanel', () => {
  it('highlights active influence excerpt in preview body', async () => {
    const user = userEvent.setup();
    const onSelectExcerpt = vi.fn();

    render(
      <PlatformRuleSetPreviewPanel
        sampleText="Original sample"
        onSampleTextChange={() => undefined}
        preview={{
          sampleText: 'Original sample',
          body: 'First step. Second step. Third step.',
          appliedPolicy: {
            rhetoricalModes: [],
            rhetoricalDevices: [],
            requirements: '',
            appliedRuleIds: [],
          },
        }}
        isLoading={false}
        error={null}
        isStale={false}
        influences={[
          {
            kind: 'device',
            id: 'ruleOfThree',
            summary: 'Rule of three used in steps',
            previewExcerpt: 'Second step.',
          },
        ]}
        influenceLoading={false}
        influenceError={null}
        activeExcerpt="Second step."
        onSelectExcerpt={onSelectExcerpt}
      />
    );

    expect(screen.getByText('Second step.')).toBeInTheDocument();
    expect(screen.getByText('Second step.').tagName).toBe('MARK');

    await user.click(screen.getByRole('button', { name: /rule of three used in steps/i }));
    expect(onSelectExcerpt).toHaveBeenCalledWith(null);
  });
});
