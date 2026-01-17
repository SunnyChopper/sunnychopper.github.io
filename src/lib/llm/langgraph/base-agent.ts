import type { z } from 'zod';
import { getFeatureConfig, getFeatureConfigSync } from '@/lib/llm/config/feature-config-store';
import { getApiKey, hasApiKey, hasApiKeySync } from '@/lib/llm/config/api-key-store';
import { createProvider } from '@/lib/llm/providers/provider-factory';
import type { BaseLLMProvider } from '@/lib/llm/providers/base-provider';
import type { AIFeature } from '@/lib/llm/config/feature-types';

/**
 * Abstract base class for all LangGraph agents.
 * Provides shared LLM provider access, error handling, and utilities.
 * Reusable across all LangGraph features (course generation, goal refinement, etc.)
 */
export abstract class BaseAgent {
  protected feature: AIFeature;
  protected provider: BaseLLMProvider | null = null;

  constructor(feature: AIFeature) {
    this.feature = feature;
  }

  /**
   * Get or create the LLM provider instance.
   * Uses existing feature configuration and provider factory pattern.
   */
  protected async getProvider(): Promise<BaseLLMProvider> {
    if (this.provider) {
      return this.provider;
    }

    const featureConfig = await getFeatureConfig(this.feature);
    if (!featureConfig || !hasApiKey(featureConfig.provider)) {
      throw new Error(
        `LLM not configured for feature: ${this.feature}. Please configure in Settings.`
      );
    }

    const apiKey = await getApiKey(featureConfig.provider);
    if (!apiKey) {
      throw new Error('API key not found');
    }

    this.provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);
    return this.provider;
  }

  /**
   * Invoke LLM with error handling.
   */
  protected async invokeLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const provider = await this.getProvider();
      return await provider.invoke(messages);
    } catch (error) {
      console.error(`[${this.constructor.name}] Error invoking LLM:`, error);
      throw error instanceof Error ? error : new Error('Failed to invoke LLM');
    }
  }

  /**
   * Invoke LLM with structured output using Zod schema.
   */
  protected async invokeStructured<T extends z.ZodType>(
    schema: T,
    messages: Array<{ role: string; content: string }>
  ): Promise<z.infer<T>> {
    try {
      const provider = await this.getProvider();
      return await provider.invokeStructured(schema, messages);
    } catch (error) {
      console.error(`[${this.constructor.name}] Error invoking structured LLM:`, error);
      throw error instanceof Error ? error : new Error('Failed to invoke structured LLM');
    }
  }

  /**
   * Build a prompt with consistent formatting.
   * Override in subclasses for custom prompt construction.
   */
  protected buildPrompt(
    systemMessage: string,
    userMessage: string
  ): Array<{ role: string; content: string }> {
    return [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ];
  }

  /**
   * Check if the agent is properly configured.
   * Uses sync versions for synchronous check.
   */
  isConfigured(): boolean {
    const featureConfig = getFeatureConfigSync(this.feature);
    return featureConfig !== null && hasApiKeySync(featureConfig.provider);
  }
}
