import { ChatGroq } from '@langchain/groq';
import { BaseLLMProvider } from './base-provider';
import type { LLMProvider } from '@/lib/llm/config/provider-types';

export class GroqProvider extends BaseLLMProvider {
  getProviderName(): LLMProvider {
    return 'groq';
  }

  getEndpoint(): string {
    return 'https://api.groq.com/openai/v1';
  }

  createModel() {
    return new ChatGroq({
      apiKey: this.apiKey,
      model: this.model,
      temperature: 0.7,
      maxTokens: 4096,
    });
  }
}
