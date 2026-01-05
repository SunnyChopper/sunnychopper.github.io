import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { z } from 'zod';
import type { LLMProvider } from '../config/provider-types';

export abstract class BaseLLMProvider {
  protected apiKey: string;
  protected model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  abstract getProviderName(): LLMProvider;
  abstract getEndpoint(): string;
  abstract createModel(): BaseChatModel;

  async invoke(messages: Array<{ role: string; content: string }>): Promise<string> {
    const model = this.createModel();
    const response = await model.invoke(
      messages.map((msg) => [msg.role, msg.content])
    );
    return response.content.toString();
  }

  async stream(
    messages: Array<{ role: string; content: string }>,
    onToken: (token: string) => void
  ): Promise<string> {
    const model = this.createModel();
    let fullContent = '';

    const stream = await model.stream(
      messages.map((msg) => [msg.role, msg.content])
    );

    for await (const chunk of stream) {
      const content = chunk.content.toString();
      fullContent += content;
      onToken(content);
    }

    return fullContent;
  }

  withStructuredOutput<T extends z.ZodType>(schema: T) {
    const model = this.createModel();
    return model.withStructuredOutput(schema);
  }

  async invokeStructured<T extends z.ZodType>(
    schema: T,
    messages: Array<{ role: string; content: string }>
  ): Promise<z.infer<T>> {
    const structuredModel = this.withStructuredOutput(schema);
    const response = await structuredModel.invoke(
      messages.map((msg) => [msg.role, msg.content])
    );
    return response as z.infer<T>;
  }
}
