import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BaseLLMProvider } from './base-provider';
import type { LLMProvider } from '../config/provider-types';

export class GeminiProvider extends BaseLLMProvider {
  getProviderName(): LLMProvider {
    return 'gemini';
  }

  getEndpoint(): string {
    return 'https://generativelanguage.googleapis.com';
  }

  createModel() {
    return new ChatGoogleGenerativeAI({
      apiKey: this.apiKey,
      model: this.model,
      temperature: 0.7,
      maxOutputTokens: 4096,
    });
  }
}
