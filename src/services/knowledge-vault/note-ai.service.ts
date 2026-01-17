import type { ApiResponse } from '../../types/api-contracts';
import { getFeatureConfig, getApiKey, hasApiKey } from '../../lib/llm/config';
import { createProvider } from '../../lib/llm/providers';
import type { Area } from '../../types/growth-system';

const ERROR_LLM_NOT_CONFIGURED = 'LLM not configured. Please configure in Settings.';
const ERROR_API_KEY_NOT_FOUND = 'API key not found';
import {
  ExpandContentOutputSchema,
  SummarizeContentOutputSchema,
  ImproveClarityOutputSchema,
  TagSuggestionsOutputSchema,
  AreaSuggestionOutputSchema,
  GenerateContentOutputSchema,
  ContentAnalysisOutputSchema,
  type ExpandContentOutput,
  type SummarizeContentOutput,
  type ImproveClarityOutput,
  type TagSuggestionsOutput,
  type AreaSuggestionOutput,
  type GenerateContentOutput,
  type ContentAnalysisOutput,
} from '../../lib/llm/schemas/note-ai-schemas';

export const noteAIService = {
  /**
   * Expand and elaborate on note content
   */
  async expandContent(
    content: string,
    context?: { title?: string; area?: Area }
  ): Promise<ApiResponse<ExpandContentOutput>> {
    try {
      const featureConfig = getFeatureConfig('noteExpand');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error(ERROR_LLM_NOT_CONFIGURED);
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error(ERROR_API_KEY_NOT_FOUND);
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `Expand and elaborate on this note content. Add more detail, examples, and context while maintaining the original meaning and structure.

${context?.title ? `Title: ${context.title}\n` : ''}${context?.area ? `Area: ${context.area}\n` : ''}
Content:
${content}

Provide an expanded version that:
1. Adds more detail and depth
2. Includes relevant examples
3. Maintains the original structure
4. Preserves the author's voice and intent`;

      const result = await provider.invokeStructured(ExpandContentOutputSchema, [
        { role: 'user', content: prompt },
      ]);

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error expanding content:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to expand content',
        success: false,
      };
    }
  },

  /**
   * Summarize note content into key points
   */
  async summarizeContent(content: string): Promise<ApiResponse<SummarizeContentOutput>> {
    try {
      const featureConfig = getFeatureConfig('noteSummarize');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error(ERROR_LLM_NOT_CONFIGURED);
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error(ERROR_API_KEY_NOT_FOUND);
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `Summarize this note content into a concise summary with key points:

${content}

Provide:
1. A brief summary (2-3 sentences)
2. Key points as a bulleted list
3. Word count information`;

      const result = await provider.invokeStructured(SummarizeContentOutputSchema, [
        { role: 'user', content: prompt },
      ]);

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error summarizing content:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to summarize content',
        success: false,
      };
    }
  },

  /**
   * Improve clarity and readability of note content
   */
  async improveClarity(content: string): Promise<ApiResponse<ImproveClarityOutput>> {
    try {
      const featureConfig = getFeatureConfig('noteImprove');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error(ERROR_LLM_NOT_CONFIGURED);
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error(ERROR_API_KEY_NOT_FOUND);
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `Improve the clarity, grammar, and readability of this note content while preserving the original meaning:

${content}

Focus on:
1. Grammar and spelling corrections
2. Sentence structure and flow
3. Clarity of expression
4. Better organization if needed`;

      const result = await provider.invokeStructured(ImproveClarityOutputSchema, [
        { role: 'user', content: prompt },
      ]);

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error improving clarity:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to improve content',
        success: false,
      };
    }
  },

  /**
   * Suggest relevant tags based on content
   */
  async suggestTags(
    content: string,
    title: string,
    existingTags: string[] = []
  ): Promise<ApiResponse<TagSuggestionsOutput>> {
    try {
      const featureConfig = getFeatureConfig('noteTagSuggest');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error(ERROR_LLM_NOT_CONFIGURED);
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error(ERROR_API_KEY_NOT_FOUND);
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `Suggest relevant tags for this note. Provide tags that are:
- Specific and descriptive
- Lowercase with no spaces (use hyphens if needed)
- Relevant to the content
- Not already in the existing tags

Title: ${title}
${existingTags.length > 0 ? `Existing tags: ${existingTags.join(', ')}\n` : ''}
Content:
${content}

Suggest 5-10 relevant tags with relevance scores.`;

      const result = await provider.invokeStructured(TagSuggestionsOutputSchema, [
        { role: 'user', content: prompt },
      ]);

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error suggesting tags:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to suggest tags',
        success: false,
      };
    }
  },

  /**
   * Suggest appropriate area for the note
   */
  async suggestArea(content: string, title: string): Promise<ApiResponse<AreaSuggestionOutput>> {
    try {
      const featureConfig = getFeatureConfig('noteAreaSuggest');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error(ERROR_LLM_NOT_CONFIGURED);
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error(ERROR_API_KEY_NOT_FOUND);
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `Suggest the most appropriate area for this note. Available areas: Health, Wealth, Love, Happiness, Operations, DayJob.

Title: ${title}
Content:
${content}

Consider the main topic, theme, and purpose of the note.`;

      const result = await provider.invokeStructured(AreaSuggestionOutputSchema, [
        { role: 'user', content: prompt },
      ]);

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error suggesting area:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to suggest area',
        success: false,
      };
    }
  },

  /**
   * Generate content from title and area
   */
  async generateFromTitle(title: string, area: Area): Promise<ApiResponse<GenerateContentOutput>> {
    try {
      const featureConfig = getFeatureConfig('noteGenerate');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error(ERROR_LLM_NOT_CONFIGURED);
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error(ERROR_API_KEY_NOT_FOUND);
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `Generate comprehensive note content based on this title and area. Create well-structured, informative content.

Title: ${title}
Area: ${area}

Generate content that:
1. Is relevant to the title and area
2. Is well-structured with clear sections
3. Provides useful information
4. Uses markdown formatting appropriately`;

      const result = await provider.invokeStructured(GenerateContentOutputSchema, [
        { role: 'user', content: prompt },
      ]);

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error generating content:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate content',
        success: false,
      };
    }
  },

  /**
   * Analyze note content for key points, sentiment, and completeness
   */
  async analyzeContent(
    content: string,
    title: string
  ): Promise<ApiResponse<ContentAnalysisOutput>> {
    try {
      const featureConfig = getFeatureConfig('noteAnalyze');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error(ERROR_LLM_NOT_CONFIGURED);
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error(ERROR_API_KEY_NOT_FOUND);
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `Analyze this note content:

Title: ${title}
Content:
${content}

Provide:
1. Key points extracted
2. Sentiment analysis
3. Readability assessment
4. Completeness evaluation with suggestions`;

      const result = await provider.invokeStructured(ContentAnalysisOutputSchema, [
        { role: 'user', content: prompt },
      ]);

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to analyze content',
        success: false,
      };
    }
  },
};
