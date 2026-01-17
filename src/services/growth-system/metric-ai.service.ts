import { apiClient } from '../../lib/api-client';
import type { Metric, MetricLog, Goal } from '../../types/growth-system';
import type { ApiResponse } from '../../types/api-contracts';
import { getLLMAdapter } from '../../lib/llm';
import { getFeatureConfig, getApiKey, hasApiKey } from '../../lib/llm/config';
import { createProvider } from '../../lib/llm/providers';
import { z } from 'zod';

interface AIResponse<T> {
  result: T;
  confidence: number;
  reasoning?: string;
  provider?: string;
  model?: string;
  cached?: boolean;
}

// Zod schemas for structured outputs
const PatternSchema = z.object({
  type: z.enum(['trend', 'cycle', 'seasonal', 'spike', 'plateau']),
  description: z.string(),
  significance: z.enum(['low', 'medium', 'high']),
  insights: z.string(),
  recommendations: z.array(z.string()),
});

const PatternsResponseSchema = z.object({
  patterns: z.array(PatternSchema),
  overallTrend: z.enum(['improving', 'declining', 'stable']),
  confidence: z.number().min(0).max(1),
});

const AnomalyResponseSchema = z.object({
  isAnomaly: z.boolean(),
  anomalyType: z.enum(['spike', 'drop', 'outlier']).optional(),
  severity: z.enum(['low', 'medium', 'high']),
  possibleCauses: z.array(z.string()),
  recommendations: z.array(z.string()),
  requiresAttention: z.boolean(),
  confidence: z.number().min(0).max(1),
});

const CorrelationResponseSchema = z.object({
  correlations: z.array(
    z.object({
      metricName: z.string(),
      correlationType: z.enum(['positive', 'negative']),
      strength: z.enum(['weak', 'moderate', 'strong']),
      description: z.string(),
      insights: z.string(),
      actionable: z.boolean(),
    })
  ),
  overallInsights: z.string(),
  confidence: z.number().min(0).max(1),
});

const NarrativeResponseSchema = z.object({
  summary: z.string(),
  keyInsights: z.array(z.string()),
  trends: z.string(),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

const PredictionResponseSchema = z.object({
  projectedValue: z.number(),
  projectedDate: z.string(),
  confidence: z.number().min(0).max(1),
  riskFactors: z.array(z.string()),
  milestones: z.array(
    z.object({
      value: z.number(),
      date: z.string(),
      description: z.string(),
    })
  ),
});

const RecommendationResponseSchema = z.object({
  recommendations: z.array(
    z.object({
      type: z.enum(['logging', 'target', 'frequency', 'intervention']),
      title: z.string(),
      description: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      actionable: z.boolean(),
    })
  ),
  confidence: z.number().min(0).max(1),
});

const CoachingResponseSchema = z.object({
  message: z.string(),
  tone: z.enum(['celebration', 'encouragement', 'warning', 'guidance']),
  tips: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const metricAIService = {
  /**
   * Analyze patterns in metric data
   */
  async analyzePatterns(
    metric: Metric,
    logs: MetricLog[]
  ): Promise<ApiResponse<z.infer<typeof PatternsResponseSchema>>> {
    try {
      // Try backend endpoint first
      const backendResponse = await apiClient.post<{ data: AIResponse<z.infer<typeof PatternsResponseSchema>> }>(
        '/ai/metrics/patterns',
        {
          metricId: metric.id,
        }
      );

      if (backendResponse.success && backendResponse.data) {
        return {
          data: backendResponse.data.data.result,
          error: null,
          success: true,
        };
      }

      // Fallback to direct LLM
      const featureConfig = getFeatureConfig('metricPatterns');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(
        featureConfig.provider,
        apiKey,
        featureConfig.model
      );

      const logSummary = logs
        .slice(-20)
        .map((log) => ({
          date: log.loggedAt,
          value: log.value,
        }))
        .reverse();

      const prompt = `Analyze patterns in this metric data:

Metric: ${metric.name}
Description: ${metric.description || 'N/A'}
Direction: ${metric.direction}
Target: ${metric.targetValue || 'None'}
Unit: ${metric.unit === 'custom' ? metric.customUnit : metric.unit}

Recent data points (last 20):
${JSON.stringify(logSummary, null, 2)}

Identify:
1. Trends (improving, declining, stable)
2. Cycles (weekly, monthly patterns)
3. Seasonality (if applicable)
4. Spikes or plateaus
5. Overall trajectory

Provide insights and actionable recommendations.`;

      const result = await provider.invokeStructured(
        PatternsResponseSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to analyze patterns',
        success: false,
      };
    }
  },

  /**
   * Detect anomalies in metric data
   */
  async detectAnomalies(
    metric: Metric,
    logs: MetricLog[]
  ): Promise<ApiResponse<z.infer<typeof AnomalyResponseSchema>>> {
    try {
      // Try backend endpoint first
      const backendResponse = await apiClient.post<{ data: AIResponse<z.infer<typeof AnomalyResponseSchema>> }>(
        '/ai/metrics/anomalies',
        {
          metricId: metric.id,
        }
      );

      if (backendResponse.success && backendResponse.data) {
        return {
          data: backendResponse.data.data.result,
          error: null,
          success: true,
        };
      }

      // Fallback to direct LLM
      const featureConfig = getFeatureConfig('metricAnomalies');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(
        featureConfig.provider,
        apiKey,
        featureConfig.model
      );

      const logSummary = logs
        .slice(-30)
        .map((log) => ({
          date: log.loggedAt,
          value: log.value,
        }))
        .reverse();

      const prompt = `Detect anomalies in this metric data:

Metric: ${metric.name}
Direction: ${metric.direction}
Target: ${metric.targetValue || 'None'}

Recent data points:
${JSON.stringify(logSummary, null, 2)}

Identify:
1. Unusual spikes or drops
2. Outliers that deviate significantly from the trend
3. Possible causes for anomalies
4. Whether attention is required
5. Recommendations for handling anomalies`;

      const result = await provider.invokeStructured(
        AnomalyResponseSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to detect anomalies',
        success: false,
      };
    }
  },

  /**
   * Find correlations with other metrics
   */
  async findCorrelations(
    metric: Metric,
    allMetrics: Metric[],
    allLogs: Map<string, MetricLog[]>
  ): Promise<ApiResponse<z.infer<typeof CorrelationResponseSchema>>> {
    try {
      // Try backend endpoint first
      const backendResponse = await apiClient.post<{ data: AIResponse<z.infer<typeof CorrelationResponseSchema>> }>(
        '/ai/metrics/correlations',
        {
          metricId: metric.id,
        }
      );

      if (backendResponse.success && backendResponse.data) {
        return {
          data: backendResponse.data.data.result,
          error: null,
          success: true,
        };
      }

      // Fallback to direct LLM
      const featureConfig = getFeatureConfig('metricCorrelations');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(
        featureConfig.provider,
        apiKey,
        featureConfig.model
      );

      const metricLogs = allLogs.get(metric.id) || [];
      const otherMetricsData = allMetrics
        .filter((m) => m.id !== metric.id)
        .slice(0, 5)
        .map((m) => ({
          name: m.name,
          logs: (allLogs.get(m.id) || []).slice(-20),
        }));

      const prompt = `Find correlations between this metric and others:

Primary Metric: ${metric.name}
Data: ${JSON.stringify(metricLogs.slice(-20).map(l => ({ date: l.loggedAt, value: l.value })), null, 2)}

Other Metrics:
${JSON.stringify(otherMetricsData, null, 2)}

Identify:
1. Positive or negative correlations
2. Strength of relationships
3. Actionable insights
4. Whether correlations are meaningful`;

      const result = await provider.invokeStructured(
        CorrelationResponseSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error finding correlations:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to find correlations',
        success: false,
      };
    }
  },

  /**
   * Generate natural language narrative insights
   */
  async generateNarrative(
    metric: Metric,
    logs: MetricLog[],
    insights?: any
  ): Promise<ApiResponse<z.infer<typeof NarrativeResponseSchema>>> {
    try {
      const featureConfig = getFeatureConfig('metricPatterns');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(
        featureConfig.provider,
        apiKey,
        featureConfig.model
      );

      const recentLogs = logs.slice(-10).map((l) => ({
        date: l.loggedAt,
        value: l.value,
      }));

      const prompt = `Generate a natural language narrative summary for this metric:

Metric: ${metric.name}
Description: ${metric.description || 'N/A'}
Target: ${metric.targetValue || 'None'}
Direction: ${metric.direction}

Recent values:
${JSON.stringify(recentLogs, null, 2)}

${insights ? `Additional insights: ${JSON.stringify(insights, null, 2)}` : ''}

Create a conversational summary that:
1. Describes the current state
2. Highlights key trends
3. Provides actionable recommendations
4. Uses natural, encouraging language`;

      const result = await provider.invokeStructured(
        NarrativeResponseSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error generating narrative:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate narrative',
        success: false,
      };
    }
  },

  /**
   * Predict future trajectory
   */
  async predictTrajectory(
    metric: Metric,
    logs: MetricLog[]
  ): Promise<ApiResponse<z.infer<typeof PredictionResponseSchema>>> {
    try {
      // Try backend endpoint first
      const backendResponse = await apiClient.post<{ data: AIResponse<z.infer<typeof PredictionResponseSchema>> }>(
        '/ai/metrics/predict',
        {
          metricId: metric.id,
        }
      );

      if (backendResponse.success && backendResponse.data) {
        return {
          data: backendResponse.data.data.result,
          error: null,
          success: true,
        };
      }

      // Fallback to direct LLM
      const featureConfig = getFeatureConfig('metricTargets');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(
        featureConfig.provider,
        apiKey,
        featureConfig.model
      );

      const logSummary = logs.map((l) => ({
        date: l.loggedAt,
        value: l.value,
      }));

      const prompt = `Predict the future trajectory for this metric:

Metric: ${metric.name}
Target: ${metric.targetValue || 'None'}
Direction: ${metric.direction}

Historical data:
${JSON.stringify(logSummary, null, 2)}

Predict:
1. Projected value in 30 days
2. When target will be reached (if applicable)
3. Risk factors
4. Key milestones along the way`;

      const result = await provider.invokeStructured(
        PredictionResponseSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error predicting trajectory:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to predict trajectory',
        success: false,
      };
    }
  },

  /**
   * Generate smart recommendations
   */
  async generateRecommendations(
    metric: Metric,
    logs: MetricLog[],
    goals: Goal[]
  ): Promise<ApiResponse<z.infer<typeof RecommendationResponseSchema>>> {
    try {
      const featureConfig = getFeatureConfig('metricTargets');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(
        featureConfig.provider,
        apiKey,
        featureConfig.model
      );

      const recentLogs = logs.slice(-20).map((l) => ({
        date: l.loggedAt,
        value: l.value,
      }));

      const prompt = `Generate actionable recommendations for this metric:

Metric: ${metric.name}
Target: ${metric.targetValue || 'None'}
Direction: ${metric.direction}

Recent data:
${JSON.stringify(recentLogs, null, 2)}

Related goals: ${goals.map(g => g.title).join(', ') || 'None'}

Provide recommendations for:
1. Optimal logging frequency
2. Target adjustments
3. Intervention strategies if off-track
4. Best practices for tracking`;

      const result = await provider.invokeStructured(
        RecommendationResponseSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
        success: false,
      };
    }
  },

  /**
   * Generate contextual coaching messages
   */
  async generateCoaching(
    metric: Metric,
    logs: MetricLog[],
    context?: Record<string, any>
  ): Promise<ApiResponse<z.infer<typeof CoachingResponseSchema>>> {
    try {
      const featureConfig = getFeatureConfig('metricHealth');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(
        featureConfig.provider,
        apiKey,
        featureConfig.model
      );

      const recentLogs = logs.slice(-10).map((l) => ({
        date: l.loggedAt,
        value: l.value,
      }));

      const prompt = `Generate a contextual coaching message for this metric:

Metric: ${metric.name}
Target: ${metric.targetValue || 'None'}
Direction: ${metric.direction}

Recent progress:
${JSON.stringify(recentLogs, null, 2)}

${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}

Create a personalized coaching message that:
1. Celebrates wins or provides encouragement
2. Addresses plateaus or declining trends
3. Offers context-aware tips
4. Uses an appropriate tone (celebration, encouragement, warning, or guidance)`;

      const result = await provider.invokeStructured(
        CoachingResponseSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error generating coaching:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate coaching',
        success: false,
      };
    }
  },
};
