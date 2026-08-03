import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AutomationFormModal from '@/components/organisms/proactive/AutomationFormModal';
import type { ProactiveAutomation } from '@/types/api-contracts';
import type { AssistantModelCatalogData } from '@/types/chatbot';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

vi.mock('@/lib/iana-time-zones', () => ({
  detectBrowserTimeZone: () => 'America/New_York',
}));

const catalog: AssistantModelCatalogData = {
  providersConfigured: { openai: true },
  models: [
    {
      id: 'openai:a',
      provider: 'openai',
      apiModelId: 'a',
      label: 'Model A',
      supportsReasoningStream: true,
      speedScore: 5,
      costScore: 5,
      qualityScore: 5,
    },
    {
      id: 'openai:b',
      provider: 'openai',
      apiModelId: 'b',
      label: 'Model B',
      supportsReasoningStream: false,
      speedScore: 8,
      costScore: 3,
      qualityScore: 7,
    },
  ],
  defaults: { defaultReasoningModelId: 'openai:a', defaultResponseModelId: 'openai:b' },
};

const automation: ProactiveAutomation = {
  id: 'auto-1',
  kind: 'dailyBriefing',
  enabled: true,
  localTime: '08:00',
  timeZone: 'America/Chicago',
  threadStrategy: 'reuseFixedThread',
  channelEmailEnabled: true,
  channelWebhookEnabled: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('AutomationFormModal', () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onSubmit.mockReset();
  });

  it('renders section headings for scanability', async () => {
    render(
      <AutomationFormModal
        isOpen
        onClose={onClose}
        mode="edit"
        initialAutomation={automation}
        suggestionPayload={null}
        zoneOptions={['America/Chicago', 'America/New_York']}
        defaultTimeZone="America/Chicago"
        formKey={1}
        modelCatalog={catalog}
        isModelCatalogLoading={false}
        saving={false}
        onSubmit={onSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Identity' })).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Thread strategy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Models' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('disables Save changes in edit mode until dirty', async () => {
    const user = userEvent.setup();
    render(
      <AutomationFormModal
        isOpen
        onClose={onClose}
        mode="edit"
        initialAutomation={automation}
        suggestionPayload={null}
        zoneOptions={['America/Chicago', 'America/New_York']}
        defaultTimeZone="America/Chicago"
        formKey={2}
        modelCatalog={catalog}
        isModelCatalogLoading={false}
        saving={false}
        onSubmit={onSubmit}
      />
    );

    const saveButton = await screen.findByRole('button', { name: 'Save changes' });
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('e.g. Morning briefing'), 'Updated title');
    await waitFor(() => {
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
    expect(saveButton).toBeEnabled();
  });

  it('shows timezone mismatch CTA and applies browser zone', async () => {
    const user = userEvent.setup();
    render(
      <AutomationFormModal
        isOpen
        onClose={onClose}
        mode="edit"
        initialAutomation={automation}
        suggestionPayload={null}
        zoneOptions={['America/Chicago', 'America/New_York']}
        defaultTimeZone="America/Chicago"
        formKey={3}
        modelCatalog={catalog}
        isModelCatalogLoading={false}
        saving={false}
        onSubmit={onSubmit}
      />
    );

    expect(await screen.findByRole('status')).toHaveTextContent(/This automation uses/);
    await user.click(screen.getByRole('button', { name: 'Use browser time zone' }));
    expect(screen.queryByRole('button', { name: 'Use browser time zone' })).not.toBeInTheDocument();
  });

  it('shows inline validation for custom kind required fields', async () => {
    const user = userEvent.setup();
    render(
      <AutomationFormModal
        isOpen
        onClose={onClose}
        mode="create"
        initialAutomation={null}
        suggestionPayload={null}
        zoneOptions={['America/Chicago']}
        defaultTimeZone="America/Chicago"
        formKey={4}
        modelCatalog={catalog}
        isModelCatalogLoading={false}
        saving={false}
        onSubmit={onSubmit}
      />
    );

    const kindSelect = await screen.findByDisplayValue('Daily Briefing');
    await user.selectOptions(kindSelect, 'custom');
    const titleInput = screen.getByPlaceholderText('e.g. Weekly project review');
    await user.click(titleInput);
    await user.tab();

    expect(
      await screen.findByText('Title is required for custom automations.')
    ).toBeInTheDocument();

    const customPromptLabel = screen.getByText('Custom prompt').closest('label');
    expect(customPromptLabel).toBeTruthy();
    const promptField = within(customPromptLabel as HTMLElement).getByRole('textbox');
    await user.click(promptField);
    await user.tab();
    expect(screen.getByText('Custom prompt is required.')).toBeInTheDocument();
  });

  it('pins Cancel and Save in dialog footer', async () => {
    render(
      <AutomationFormModal
        isOpen
        onClose={onClose}
        mode="create"
        initialAutomation={null}
        suggestionPayload={null}
        zoneOptions={['America/Chicago']}
        defaultTimeZone="America/Chicago"
        formKey={5}
        modelCatalog={catalog}
        isModelCatalogLoading={false}
        saving={false}
        onSubmit={onSubmit}
      />
    );

    expect(await screen.findByTestId('dialog-footer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});
