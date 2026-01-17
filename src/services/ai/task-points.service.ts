import type { Area, Priority } from '../../types/growth-system';
import { z } from 'zod';
import { getFeatureConfig } from '../../lib/llm/config/feature-config-store';
import { getApiKey } from '../../lib/llm/config/api-key-store';
import { createProvider } from '../../lib/llm/providers/provider-factory';

const pointCalculationSchema = z.object({
  pointValue: z.number().min(0),
  reasoning: z.string(),
  breakdown: z.object({
    basePoints: z.number(),
    complexityMultiplier: z.number(),
    priorityMultiplier: z.number(),
    skillMultiplier: z.number(),
  }),
});

type PointCalculation = z.infer<typeof pointCalculationSchema>;

export const taskPointsAIService = {
  async calculateTaskPoints(taskData: {
    title: string;
    description?: string;
    area: Area;
    priority: Priority;
    size?: number;
  }): Promise<PointCalculation> {
    const config = getFeatureConfig('effortEstimation');
    const apiKey = getApiKey(config.provider);

    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${config.provider}`);
    }

    const provider = createProvider(config.provider, apiKey, config.model);

    const systemPrompt = `You are an expert at calculating reward points for tasks in a personal productivity system.

Your job is to analyze a task and calculate an appropriate point value that:
1. Reflects the effort, complexity, and value of completing the task
2. Provides meaningful motivation (higher points = more rewarding)
3. Is fair and consistent with other tasks in the system

Base point calculation:
- Use size (story points/hours) as the primary factor
- Apply multipliers for priority (P1=2.0x, P2=1.5x, P3=1.2x, P4=1.0x)
- Apply multipliers for area importance (Health=1.3x, Wealth=1.2x, Love=1.2x, Happiness=1.1x, Operations=1.0x, DayJob=1.1x)
- Apply multipliers for complexity and skill requirements

Typical ranges:
- Small quick tasks (15min): 50-150 points
- Medium tasks (1-2 hours): 150-500 points
- Large tasks (half day): 500-1500 points
- Major projects (full day+): 1500-5000+ points

Return a JSON object with:
- pointValue: The calculated point value (number)
- reasoning: Brief explanation of how you calculated it
- breakdown: Object with basePoints, complexityMultiplier, priorityMultiplier, skillMultiplier`;

    const userPrompt = `Calculate the reward points for this task:

Title: ${taskData.title}
Description: ${taskData.description || 'No description provided'}
Area: ${taskData.area}
Priority: ${taskData.priority}
Size (Story Points/Hours): ${taskData.size || 'Not specified'}

Provide a fair and motivating point value that encourages completion.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await provider.invokeStructured(pointCalculationSchema, messages);
    return response;
  },

  async calculateRewardPointCost(rewardData: {
    title: string;
    description?: string;
    category: string;
    existingRewards?: Array<{ title: string; pointCost: number; category: string }>;
    typicalTaskPoints?: { min: number; max: number; average: number };
  }): Promise<{ pointCost: number; reasoning: string }> {
    const config = getFeatureConfig('effortEstimation');
    const apiKey = getApiKey(config.provider);

    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${config.provider}`);
    }

    const provider = createProvider(config.provider, apiKey, config.model);

    const rewardCostSchema = z.object({
      pointCost: z.number().min(1),
      reasoning: z.string(),
    });

    const systemPrompt = `You are an expert at pricing rewards in a gamified productivity system.

Your job is to suggest appropriate point costs for rewards that:
1. Are balanced with the effort required to earn points from tasks
2. Create meaningful goals and motivation
3. Are consistent with similar rewards in the system

Consider:
- Quick Treats (50-200 points): Small instant gratifications
- Daily Delights (200-600 points): Medium rewards for daily enjoyment
- Big Unlocks (600-5000+ points): Large rewards worth saving for

The user typically earns points by completing tasks. Use the existing reward prices and typical task point values to ensure fair pricing.

Return a JSON object with:
- pointCost: The suggested point cost (number)
- reasoning: Brief explanation of your pricing decision`;

    const existingRewardsContext = rewardData.existingRewards
      ? `\n\nExisting rewards for reference:\n${rewardData.existingRewards.map((r) => `- ${r.title} (${r.category}): ${r.pointCost} points`).join('\n')}`
      : '';

    const taskPointsContext = rewardData.typicalTaskPoints
      ? `\n\nTypical task points: ${rewardData.typicalTaskPoints.min}-${rewardData.typicalTaskPoints.max} points (average: ${rewardData.typicalTaskPoints.average} points)`
      : '';

    const userPrompt = `Suggest an appropriate point cost for this reward:

Title: ${rewardData.title}
Description: ${rewardData.description || 'No description provided'}
Category: ${rewardData.category}${existingRewardsContext}${taskPointsContext}

Provide a fair point cost that balances motivation and attainability.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await provider.invokeStructured(rewardCostSchema, messages);
    return response;
  },

  async brainstormRewards(context: {
    existingRewards: Array<{ title: string; category: string }>;
    userInterests?: string;
    count?: number;
  }): Promise<
    Array<{ title: string; description: string; category: string; suggestedPointCost: number }>
  > {
    const config = getFeatureConfig('effortEstimation');
    const apiKey = getApiKey(config.provider);

    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${config.provider}`);
    }

    const provider = createProvider(config.provider, apiKey, config.model);

    const count = context.count || 10;

    const brainstormSchema = z.object({
      rewards: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            category: z.enum(['Quick Treat', 'Daily Delight', 'Big Unlock']),
            suggestedPointCost: z.number().min(1),
          })
        )
        .min(count)
        .max(count),
    });

    const systemPrompt = `You are a creative expert at designing motivating rewards for a personal productivity system.

Your job is to brainstorm fresh, exciting reward ideas that:
1. Are personalized and appealing
2. Cover different categories (Quick Treats, Daily Delights, Big Unlocks)
3. Are distinct from existing rewards
4. Provide genuine motivation and enjoyment

Categories:
- Quick Treat (50-200 pts): Small instant rewards (5-30 min activities)
- Daily Delight (200-600 pts): Medium rewards for daily enjoyment (30min-2hr activities)
- Big Unlock (600-5000+ pts): Large rewards worth saving for (experiences, purchases, special treats)

Return creative, specific reward ideas with appropriate point costs.`;

    const existingContext = `Existing rewards (avoid duplicates):
${context.existingRewards.map((r) => `- ${r.title} (${r.category})`).join('\n')}`;

    const interestsContext = context.userInterests
      ? `\n\nUser interests/preferences: ${context.userInterests}`
      : '';

    const userPrompt = `Brainstorm ${count} new reward ideas that would be motivating and enjoyable.

${existingContext}${interestsContext}

Make the rewards specific, appealing, and well-priced for their category.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await provider.invokeStructured(brainstormSchema, messages);
    return response.rewards;
  },
};
