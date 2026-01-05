import { ChatOpenAI } from '@langchain/openai';
import { BaseLLMProvider } from './base-provider';
import type { LLMProvider } from '../config/provider-types';

export class DeepSeekProvider extends BaseLLMProvider {
  getProviderName(): LLMProvider {
    return 'deepseek';
  }

  getEndpoint(): string {
    return 'https://api.deepseek.com';
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
