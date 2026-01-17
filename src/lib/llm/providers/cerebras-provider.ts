import { ChatOpenAI } from '@langchain/openai';
import { BaseLLMProvider } from './base-provider';
import type { LLMProvider } from '@/lib/llm/config/provider-types';

export class CerebrasProvider extends BaseLLMProvider {
  getProviderName(): LLMProvider {
    return 'cerebras';
  }

  getEndpoint(): string {
    return 'https://api.cerebras.ai/v1';
  }

  createModel() {
    return new ChatOpenAI({
      apiKey: this.apiKey,
      model: this.model,
      temperature: 0.7,
      maxTokens: 4096,
      configuration: {
        baseURL: this.getEndpoint(),
      },
    });
  }
}
