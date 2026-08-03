import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PlatformRuleSetPreviewPanel from '@/components/molecules/personal-branding/PlatformRuleSetPreviewPanel';

describe('PlatformRuleSetPreviewPanel', () => {
  it('renders validation issues when present', () => {
    render(
      <PlatformRuleSetPreviewPanel
        sampleText="Sample"
        onSampleTextChange={() => undefined}
        preview={{
          sampleText: 'Sample',
          body: 'Preview body with issues.',
          appliedPolicy: {
            rhetoricalModes: [],
            rhetoricalDevices: [],
            requirements: '',
            appliedRuleIds: [],
          },
          validationIssues: [
            {
              id: 'emDashPresent:abc',
              code: 'emDashPresent',
              severity: 'warning',
              message: 'Preview still contains an em-dash.',
            },
          ],
        }}
        isLoading={false}
        error={null}
        isStale={false}
        influences={[]}
        influenceLoading={false}
        influenceError={null}
        activeExcerpt={null}
        onSelectExcerpt={() => undefined}
      />
    );

    expect(screen.getByText('Preview may still violate:')).toBeInTheDocument();
    expect(screen.getByText('Preview still contains an em-dash.')).toBeInTheDocument();
  });

  it('hides validation issues section when list is empty', () => {
    render(
      <PlatformRuleSetPreviewPanel
        sampleText="Sample"
        onSampleTextChange={() => undefined}
        preview={{
          sampleText: 'Sample',
          body: 'Clean preview body.',
          appliedPolicy: {
            rhetoricalModes: [],
            rhetoricalDevices: [],
            requirements: '',
            appliedRuleIds: [],
          },
          validationIssues: [],
        }}
        isLoading={false}
        error={null}
        isStale={false}
        influences={[]}
        influenceLoading={false}
        influenceError={null}
        activeExcerpt={null}
        onSelectExcerpt={() => undefined}
      />
    );

    expect(screen.queryByText('Preview may still violate:')).not.toBeInTheDocument();
  });
});
