import type { LLMProvider } from '../config/provider-types';
import type { BaseLLMProvider } from './base-provider';
import { AnthropicProvider } from './anthropic-provider';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { GroqProvider } from './groq-provider';
import { GrokProvider } from './grok-provider';
import { DeepSeekProvider } from './deepseek-provider';
import { CerebrasProvider } from './cerebras-provider';

export function createProvider(type: LLMProvider, apiKey: string, model: string): BaseLLMProvider {
  switch (type) {
    case 'anthropic':
      return new AnthropicProvider(apiKey, model);
    case 'openai':
      return new OpenAIProvider(apiKey, model);
    case 'gemini':
      return new GeminiProvider(apiKey, model);
    case 'groq':
      return new GroqProvider(apiKey, model);
    case 'grok':
      return new GrokProvider(apiKey, model);
    case 'deepseek':
      return new DeepSeekProvider(apiKey, model);
    case 'cerebras':
      return new CerebrasProvider(apiKey, model);
    default:
      throw new Error(`Unsupported provider: ${type}`);
  }
}

export function createProviderFromFeature(
  provider: LLMProvider,
  model: string,
  apiKey: string
): BaseLLMProvider {
  return createProvider(provider, apiKey, model);
}
