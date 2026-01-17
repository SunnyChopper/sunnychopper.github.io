import { apiClient } from '../../lib/api-client';
import type { Goal, Task, GoalProgressBreakdown } from '../../types/growth-system';
import type { ApiResponse } from '../../types/api-contracts';
import { getFeatureConfig, getApiKey, hasApiKey } from '../../lib/llm/config';
import { createProvider } from '../../lib/llm/providers';
import {
  ProgressCoachingOutputSchema,
  GoalHealthScoreOutputSchema,
  GoalDecompositionOutputSchema,
  ConflictDetectionOutputSchema,
  type ProgressCoachingOutput,
  type GoalHealthScoreOutput,
  type GoalDecompositionOutput,
  type ConflictDetectionOutput,
} from '../../lib/llm/schemas/goal-ai-schemas';

interface AIResponse<T> {
  result: T;
  confidence: number;
  reasoning?: string;
  provider?: string;
  model?: string;
  cached?: boolean;
}

export const goalAIService = {
  /**
   * Get AI-powered progress coaching for a specific goal
   */
  async getProgressCoaching(
    goal: Goal,
    progress: GoalProgressBreakdown,
    linkedTasks: Task[]
  ): Promise<ApiResponse<ProgressCoachingOutput>> {
    try {
      const featureConfig = getFeatureConfig('goalHealth');
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

      const tasksSummary = linkedTasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
      }));

      const prompt = `Provide personalized progress coaching for this goal:

Goal: ${goal.title}
Description: ${goal.description || 'N/A'}
Time Horizon: ${goal.timeHorizon}
Target Date: ${goal.targetDate || 'Not set'}
Current Status: ${goal.status}

Progress Breakdown:
- Overall: ${progress.overall}%
- Criteria: ${progress.criteria.completed}/${progress.criteria.total} (${progress.criteria.percentage}%)
- Tasks: ${progress.tasks.completed}/${progress.tasks.total} (${progress.tasks.percentage}%)
- Metrics: ${progress.metrics.atTarget}/${progress.metrics.total} (${progress.metrics.percentage}%)
- Habits: ${progress.habits.consistency}% consistency

Linked Tasks:
${JSON.stringify(tasksSummary, null, 2)}

Provide:
1. Overall assessment of progress
2. Specific advice for improving each area (tasks, metrics, habits, criteria)
3. A motivational message appropriate to current progress
4. Concrete next steps to take

Be encouraging but honest about areas needing attention.`;

      const result = await provider.invokeStructured(
        ProgressCoachingOutputSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      console.error('Error getting progress coaching:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get coaching',
        success: false,
      };
    }
  },

  /**
   * Calculate AI-powered goal health score
   */
  async calculateHealthScore(
    goal: Goal,
    allGoals: Goal[],
    progress: GoalProgressBreakdown
  ): Promise<ApiResponse<GoalHealthScoreOutput>> {
    try {
      const featureConfig = getFeatureConfig('goalHealth');
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

      const now = new Date();
      const createdDate = new Date(goal.createdAt);
      const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
      const lastActivity = goal.lastActivityAt ? new Date(goal.lastActivityAt) : createdDate;

      const daysElapsed = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = targetDate ? Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      const daysSinceActivity = Math.ceil((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      const relatedGoalsContext = allGoals
        .filter(g => g.id !== goal.id && g.area === goal.area && g.status === 'Active')
        .slice(0, 5)
        .map(g => ({ title: g.title, status: g.status, priority: g.priority }));

      const prompt = `Analyze the health of this goal and provide a comprehensive health score:

Goal: ${goal.title}
Time Horizon: ${goal.timeHorizon}
Priority: ${goal.priority}
Status: ${goal.status}

Timeline:
- Created: ${daysElapsed} days ago
- Days Remaining: ${daysRemaining !== null ? daysRemaining : 'No deadline'}
- Last Activity: ${daysSinceActivity} days ago

Progress:
- Overall: ${progress.overall}%
- Criteria: ${progress.criteria.percentage}%
- Tasks: ${progress.tasks.percentage}%
- Metrics: ${progress.metrics.percentage}%
- Habits: ${progress.habits.consistency}%

Related Goals in Same Area: ${relatedGoalsContext.length}
${JSON.stringify(relatedGoalsContext, null, 2)}

Calculate a health score (0-100) based on:
1. Progress Velocity: Are they making progress fast enough?
2. Activity Level: Is there recent activity or is it dormant?
3. Resource Balance: Do they have the right mix of tasks/metrics/habits?
4. Time Alignment: Is progress aligned with time remaining?

Provide:
- Overall health score (0-100)
- Rating (excellent, good, fair, poor, critical)
- Factor breakdown scores
- Strengths and concerns
- Recommendations to improve health`;

      const result = await provider.invokeStructured(
        GoalHealthScoreOutputSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      console.error('Error calculating health score:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to calculate health score',
        success: false,
      };
    }
  },

  /**
   * Decompose a goal into sub-goals, tasks, metrics, and habits
   */
  async decomposeGoal(
    goal: Goal
  ): Promise<ApiResponse<GoalDecompositionOutput>> {
    try {
      // Try backend endpoint first
      const backendResponse = await apiClient.post<{ data: AIResponse<GoalDecompositionOutput> }>(
        '/ai/goals/cascade',
        {
          goalId: goal.id,
          goalTitle: goal.title,
          goalDescription: goal.description,
        }
      );

      if (backendResponse.success && backendResponse.data) {
        return {
          data: backendResponse.data.data.result,
          success: true,
        };
      }

      // Fallback to direct LLM if backend fails
      const featureConfig = getFeatureConfig('goalRefinement');
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

      const prompt = `Break down this goal into actionable components:

Goal: ${goal.title}
Description: ${goal.description || 'N/A'}
Time Horizon: ${goal.timeHorizon}
Area: ${goal.area}
Target Date: ${goal.targetDate || 'Not set'}

Success Criteria:
${Array.isArray(goal.successCriteria) ? goal.successCriteria.map((c: any) => 
  typeof c === 'string' ? `- ${c}` : `- ${c.text}`
).join('\n') : 'None defined'}

Provide a complete decomposition:

1. Sub-Goals: Break this into 2-4 smaller goals with shorter time horizons
2. Initial Tasks: 5-10 concrete tasks to start working on
3. Metrics: 2-4 metrics to track progress quantitatively
4. Habits: 1-3 daily/weekly habits that support this goal
5. Implementation Plan: High-level roadmap

Make it actionable and specific to the goal's area (${goal.area}).`;

      const result = await provider.invokeStructured(
        GoalDecompositionOutputSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      console.error('Error decomposing goal:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to decompose goal',
        success: false,
      };
    }
  },

  /**
   * Detect conflicts and overcommitment across all goals
   */
  async detectConflicts(
    goals: Goal[]
  ): Promise<ApiResponse<ConflictDetectionOutput>> {
    try {
      const featureConfig = getFeatureConfig('goalHealth');
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

      const activeGoals = goals.filter(g => 
        g.status === 'Active' || g.status === 'OnTrack' || g.status === 'AtRisk'
      );

      const goalsSummary = activeGoals.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        timeHorizon: g.timeHorizon,
        priority: g.priority,
        status: g.status,
        area: g.area,
        targetDate: g.targetDate,
      }));

      const prompt = `Analyze these active goals for conflicts and overcommitment:

Active Goals (${activeGoals.length}):
${JSON.stringify(goalsSummary, null, 2)}

Detect:
1. Time Conflicts: Goals competing for the same time windows
2. Resource Conflicts: Goals requiring similar resources or focus
3. Priority Conflicts: Too many high-priority goals
4. Value Conflicts: Goals that may contradict each other
5. Dependency Issues: Goals that block each other

Analyze:
- Is the user overcommitted? (Too many goals for realistic achievement)
- What is the overcommitment severity score (0-100)?
- Are there specific goal pairs that conflict?
- What is the estimated weekly time commitment?
- Is this sustainable?

Provide specific conflict details and actionable resolution strategies.`;

      const result = await provider.invokeStructured(
        ConflictDetectionOutputSchema,
        [{ role: 'user', content: prompt }]
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to detect conflicts',
        success: false,
      };
    }
  },
};
