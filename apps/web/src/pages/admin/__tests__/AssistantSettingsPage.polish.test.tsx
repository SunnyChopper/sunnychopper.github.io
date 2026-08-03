import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssistantSettingsPage from '@/pages/admin/AssistantSettingsPage';
import { apiClient } from '@/lib/api-client';
import type { AssistantSettingsConfig } from '@/types/api-contracts';
import type { AssistantModelCatalogData } from '@/types/chatbot';

const motionMocks = vi.hoisted(() => ({
  reduceMotion: false,
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => motionMocks.reduceMotion,
  };
});

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

describe('AssistantSettingsPage polish', () => {
  beforeEach(() => {
    motionMocks.reduceMotion = false;
    vi.mocked(apiClient.getAssistantSettings).mockResolvedValue({
      success: true,
      data: baseSettings,
    });
    vi.mocked(apiClient.getAssistantToolRegistry).mockResolvedValue({
      success: true,
      data: [
        {
          name: 'create_goal',
          description: 'Create a goal',
          category: 'Goals',
          safeRead: false,
        },
      ],
    });
    vi.mocked(apiClient.getAssistantModelCatalog).mockResolvedValue({
      success: true,
      data: catalog,
    });
  });

  it('uses animated card stack when reduced motion is off', async () => {
    render(<AssistantSettingsPage />);
    await screen.findByRole('heading', { name: 'Tool safety' });
    expect(screen.getByTestId('assistant-settings-card-stack-animated')).toBeInTheDocument();
  });

  it('uses static card stack when reduced motion is on', async () => {
    motionMocks.reduceMotion = true;
    render(<AssistantSettingsPage />);
    await screen.findByRole('heading', { name: 'Tool safety' });
    expect(screen.getByTestId('assistant-settings-card-stack-static')).toBeInTheDocument();
  });

  it('exposes accessible labels on dirty bar actions', async () => {
    render(<AssistantSettingsPage />);
    await screen.findByRole('heading', { name: 'Tool safety' });

    fireEvent.click(screen.getByRole('radio', { name: /Confirm all write actions/i }));

    expect(
      screen.getByRole('button', { name: 'Discard unsaved assistant settings changes' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save all assistant settings' })).toBeInTheDocument();
  });

  it('keeps both tool filter inputs reachable with a descriptive label', async () => {
    render(<AssistantSettingsPage />);
    await screen.findByRole('heading', { name: 'Tool safety' });

    expect(
      screen.getAllByRole('searchbox', { name: 'Filter tools by name or description' })
    ).toHaveLength(2);
  });
});
