import type { LLMProvider, ModelInfo } from './provider-types';

export const PROVIDER_MODELS: Record<LLMProvider, ModelInfo[]> = {
  anthropic: [
    {
      name: 'claude-sonnet-4-20250514',
      displayName: 'Claude Sonnet 4',
      contextLength: 200000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'claude-3-5-sonnet-20241022',
      displayName: 'Claude 3.5 Sonnet',
      contextLength: 200000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'claude-3-5-haiku-20241022',
      displayName: 'Claude 3.5 Haiku',
      contextLength: 200000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'claude-opus-4-20250514',
      displayName: 'Claude Opus 4',
      contextLength: 200000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
  ],
  openai: [
    {
      name: 'gpt-4o',
      displayName: 'GPT-4o',
      contextLength: 128000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'gpt-4o-mini',
      displayName: 'GPT-4o Mini',
      contextLength: 128000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      contextLength: 128000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'o1',
      displayName: 'o1',
      contextLength: 200000,
      supportsStreaming: false,
      supportsStructuredOutput: true,
    },
    {
      name: 'o1-mini',
      displayName: 'o1 Mini',
      contextLength: 128000,
      supportsStreaming: false,
      supportsStructuredOutput: true,
    },
  ],
  gemini: [
    {
      name: 'gemini-2.0-flash-exp',
      displayName: 'Gemini 2.0 Flash',
      contextLength: 1000000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'gemini-1.5-pro',
      displayName: 'Gemini 1.5 Pro',
      contextLength: 2000000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'gemini-1.5-flash',
      displayName: 'Gemini 1.5 Flash',
      contextLength: 1000000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
  ],
  groq: [
    {
      name: 'llama-3.3-70b-versatile',
      displayName: 'Llama 3.3 70B',
      contextLength: 32768,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'mixtral-8x7b-32768',
      displayName: 'Mixtral 8x7B',
      contextLength: 32768,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'gemma2-9b-it',
      displayName: 'Gemma 2 9B',
      contextLength: 8192,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
  ],
  grok: [
    {
      name: 'grok-2-1212',
      displayName: 'Grok 2',
      contextLength: 131072,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'grok-2-vision-1212',
      displayName: 'Grok 2 Vision',
      contextLength: 32768,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
  ],
  deepseek: [
    {
      name: 'deepseek-chat',
      displayName: 'DeepSeek Chat',
      contextLength: 64000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'deepseek-reasoner',
      displayName: 'DeepSeek Reasoner',
      contextLength: 64000,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
  ],
  cerebras: [
    {
      name: 'llama3.1-8b',
      displayName: 'Llama 3.1 8B',
      contextLength: 8192,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
    {
      name: 'llama3.1-70b',
      displayName: 'Llama 3.1 70B',
      contextLength: 8192,
      supportsStreaming: true,
      supportsStructuredOutput: true,
    },
  ],
};

export function getModelsForProvider(provider: LLMProvider): ModelInfo[] {
  return PROVIDER_MODELS[provider] || [];
}

export function getDefaultModel(provider: LLMProvider): string {
  const models = PROVIDER_MODELS[provider];
  return models.length > 0 ? models[0].name : '';
}

export function getModelInfo(provider: LLMProvider, modelName: string): ModelInfo | undefined {
  return PROVIDER_MODELS[provider]?.find((m) => m.name === modelName);
}
