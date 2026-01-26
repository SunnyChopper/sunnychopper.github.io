import type { z } from 'zod';
import { getFeatureConfigSync } from '@/lib/llm/config/feature-config-store';
import type { AIFeature } from '@/lib/llm/config/feature-types';

/**
 * Abstract base class for all LangGraph agents.
 * Provides shared LLM provider access, error handling, and utilities.
 * Reusable across all LangGraph features (course generation, goal refinement, etc.)
 */
export abstract class BaseAgent {
  protected feature: AIFeature;

  constructor(feature: AIFeature) {
    this.feature = feature;
  }

  /**
   * LangGraph agents should use backend endpoints.
   * Direct provider access is no longer supported.
   */
  protected async getProvider(): Promise<never> {
    throw new Error(
      `Direct LLM provider access is not supported. ${this.constructor.name} should use backend endpoints.`
    );
  }

  /**
   * Invoke LLM with error handling.
   * LangGraph agents should use backend endpoints instead.
   */
  protected async invokeLLM(_messages: Array<{ role: string; content: string }>): Promise<never> {
    throw new Error(
      `Direct LLM invocation is not supported. ${this.constructor.name} should use backend endpoints.`
    );
  }

  /**
   * Invoke LLM with structured output using Zod schema.
   * LangGraph agents should use backend endpoints instead.
   */
  protected async invokeStructured<T extends z.ZodType>(
    _schema: T,
    _messages: Array<{ role: string; content: string }>
  ): Promise<never> {
    throw new Error(
      `Direct structured LLM invocation is not supported. ${this.constructor.name} should use backend endpoints.`
    );
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
   * Backend always handles API keys via Secrets Manager.
   */
  isConfigured(): boolean {
    const featureConfig = getFeatureConfigSync(this.feature);
    return featureConfig !== null;
  }
}
