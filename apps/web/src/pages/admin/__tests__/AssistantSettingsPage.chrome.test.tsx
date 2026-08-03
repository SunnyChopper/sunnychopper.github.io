import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssistantSettingsPage from '@/pages/admin/AssistantSettingsPage';
import { apiClient } from '@/lib/api-client';
import type { AssistantSettingsConfig } from '@/types/api-contracts';
import type { AssistantModelCatalogData } from '@/types/chatbot';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getAssistantSettings: vi.fn(),
    getAssistantToolRegistry: vi.fn(),
    getAssistantModelCatalog: vi.fn(),
    setAssistantSettings: vi.fn(),
    resetAssistantMemoryIngestion: vi.fn(),
    resetAssistantDefaultModels: vi.fn(),
  },
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
  ],
  defaults: { defaultReasoningModelId: 'openai:a', defaultResponseModelId: 'openai:a' },
};

const baseSettings: AssistantSettingsConfig = {
  toolApproval: { mode: 'dangerousOnly', dangerousTools: [], deniedReadTools: [] },
  memoryIngestion: {
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    factCriteria: { alwaysCapture: [], neverCapture: [] },
  },
  memoryIngestionIsCustom: false,
  defaultModels: { mode: 'auto', auto: { optimizeFor: 'intelligence' } },
  defaultModelsIsCustom: false,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('AssistantSettingsPage chrome', () => {
  beforeEach(() => {
    vi.mocked(apiClient.getAssistantSettings).mockResolvedValue({
      success: true,
      data: baseSettings,
    });
    vi.mocked(apiClient.getAssistantToolRegistry).mockResolvedValue({
      success: true,
      data: [],
    });
    vi.mocked(apiClient.getAssistantModelCatalog).mockResolvedValue({
      success: true,
      data: catalog,
    });
    vi.mocked(apiClient.setAssistantSettings).mockResolvedValue({
      success: true,
      data: baseSettings,
    });
  });

  it('shows page header and skeleton while loading', async () => {
    const settingsDeferred = deferred<{
      success: true;
      data: AssistantSettingsConfig;
    }>();
    vi.mocked(apiClient.getAssistantSettings).mockReturnValue(settingsDeferred.promise);

    render(<AssistantSettingsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Assistant Settings' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('assistant-settings-skeleton')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Save all assistant settings' })
    ).not.toBeInTheDocument();

    settingsDeferred.resolve({ success: true, data: baseSettings });
    await screen.findByRole('heading', { name: 'Tool safety' });
    expect(screen.queryByTestId('assistant-settings-skeleton')).not.toBeInTheDocument();
  });

  it('hides save bar until the form is dirty', async () => {
    render(<AssistantSettingsPage />);
    await screen.findByRole('heading', { name: 'Tool safety' });
    expect(screen.queryByTestId('assistant-settings-dirty-bar')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Confirm all write actions/i }));

    const bar = screen.getByTestId('assistant-settings-dirty-bar');
    expect(bar).toBeInTheDocument();
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Discard unsaved assistant settings changes' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save all assistant settings' })).toBeInTheDocument();
  });

  it('discard restores baseline and hides the dirty bar', async () => {
    render(<AssistantSettingsPage />);
    await screen.findByRole('heading', { name: 'Tool safety' });

    fireEvent.click(screen.getByRole('radio', { name: /Confirm all write actions/i }));
    expect(screen.getByTestId('assistant-settings-dirty-bar')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Discard unsaved assistant settings changes' })
    );

    await waitFor(() => {
      expect(screen.queryByTestId('assistant-settings-dirty-bar')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('radio', { name: /Confirm dangerous tools only/i })).toBeChecked();
  });

  it('save success clears dirty bar', async () => {
    render(<AssistantSettingsPage />);
    await screen.findByRole('heading', { name: 'Tool safety' });

    fireEvent.click(screen.getByRole('radio', { name: /Confirm all write actions/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Save all assistant settings' }));

    await waitFor(() => {
      expect(apiClient.setAssistantSettings).toHaveBeenCalled();
    });
    expect(await screen.findByText('Settings saved.')).toBeInTheDocument();
    expect(screen.queryByTestId('assistant-settings-dirty-bar')).not.toBeInTheDocument();
  });

  it('orders Discard before Save in the dirty bar', async () => {
    render(<AssistantSettingsPage />);
    await screen.findByRole('heading', { name: 'Tool safety' });
    fireEvent.click(screen.getByRole('radio', { name: /Confirm all write actions/i }));

    const bar = screen.getByTestId('assistant-settings-dirty-bar');
    const buttons = bar.querySelectorAll('button');
    expect(buttons[0]).toHaveAccessibleName('Discard unsaved assistant settings changes');
    expect(buttons[1]).toHaveAccessibleName('Save all assistant settings');
  });
});
