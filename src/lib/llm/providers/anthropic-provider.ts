import { ChatAnthropic } from '@langchain/anthropic';
import { BaseLLMProvider } from './base-provider';
import type { LLMProvider } from '../config/provider-types';

export class AnthropicProvider extends BaseLLMProvider {
  getProviderName(): LLMProvider {
    return 'anthropic';
  }

  getEndpoint(): string {
    return 'https://api.anthropic.com';
  }

  createModel() {
    return new ChatAnthropic({
      apiKey: this.apiKey,
      model: this.model,
      temperature: 0.7,
      maxTokens: 4096,
    });
  }
}
