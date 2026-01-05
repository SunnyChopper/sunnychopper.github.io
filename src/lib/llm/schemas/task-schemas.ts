import { z } from 'zod';
import {
  AreaSchema,
  SubCategorySchema,
  PrioritySchema,
  ConfidenceSchema,
} from './common-schemas';

export const ParseTaskOutputSchema = z.object({
  title: z.string().describe('The task title extracted from natural language'),
  description: z.string().optional().describe('Optional task description'),
  area: AreaSchema.describe('The life area this task belongs to'),
  subCategory: SubCategorySchema.optional().describe('Optional subcategory within the area'),
  priority: PrioritySchema.default('P3').describe('Suggested priority level'),
  dueDate: z.string().optional().describe('ISO date string if a deadline was mentioned'),
  scheduledDate: z.string().optional().describe('ISO date string if a specific date was mentioned'),
  size: z.number().min(1).max(5).optional().describe('Effort estimate (1-5 scale)'),
  confidence: ConfidenceSchema.describe('Confidence in the parsing accuracy'),
});

export type ParseTaskOutput = z.infer<typeof ParseTaskOutputSchema>;

export const SubtaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  estimatedSize: z.number().min(1).max(5).optional(),
  order: z.number(),
});

export const TaskBreakdownOutputSchema = z.object({
  subtasks: z.array(SubtaskSchema).describe('List of subtasks in logical order'),
  reasoning: z.string().describe('Explanation of how the task was broken down'),
  confidence: ConfidenceSchema.describe('Confidence in the breakdown quality'),
  totalEstimatedEffort: z.number().optional().describe('Total estimated effort across all subtasks'),
});

export type TaskBreakdownOutput = z.infer<typeof TaskBreakdownOutputSchema>;

export const PriorityAdvisorOutputSchema = z.object({
  recommendedPriority: PrioritySchema.describe('Recommended priority level'),
  reasoning: z.string().describe('Detailed explanation for the recommendation'),
  urgencyScore: z.number().min(0).max(10).describe('Urgency rating (0-10)'),
  impactScore: z.number().min(0).max(10).describe('Impact rating (0-10)'),
  confidence: ConfidenceSchema.describe('Confidence in the recommendation'),
  factors: z.array(z.string()).describe('Key factors considered in the decision'),
});

export type PriorityAdvisorOutput = z.infer<typeof PriorityAdvisorOutputSchema>;

export const EffortEstimationOutputSchema = z.object({
  estimatedSize: z.number().min(1).max(5).describe('Size estimate on 1-5 scale'),
  reasoning: z.string().describe('Explanation for the estimate'),
  confidence: ConfidenceSchema.describe('Confidence in the estimate'),
  factors: z.array(z.string()).describe('Factors affecting the estimate'),
  breakdown: z
    .object({
      research: z.number().min(0).max(5).optional(),
      implementation: z.number().min(0).max(5).optional(),
      testing: z.number().min(0).max(5).optional(),
      documentation: z.number().min(0).max(5).optional(),
    })
    .optional()
    .describe('Optional breakdown by work type'),
});

export type EffortEstimationOutput = z.infer<typeof EffortEstimationOutputSchema>;

export const TaskCategorizationOutputSchema = z.object({
  area: AreaSchema.describe('Recommended life area'),
  subCategory: SubCategorySchema.optional().describe('Recommended subcategory'),
  reasoning: z.string().describe('Explanation for the categorization'),
  confidence: ConfidenceSchema.describe('Confidence in the categorization'),
  alternativeCategories: z
    .array(
      z.object({
        area: AreaSchema,
        subCategory: SubCategorySchema.optional(),
        reasoning: z.string(),
      })
    )
    .optional()
    .describe('Alternative categorizations with lower confidence'),
});

export type TaskCategorizationOutput = z.infer<typeof TaskCategorizationOutputSchema>;

export const DependencySuggestionSchema = z.object({
  taskId: z.string().describe('ID of the task that should be a dependency'),
  taskTitle: z.string().describe('Title of the dependency task'),
  reasoning: z.string().describe('Why this dependency makes sense'),
  isBlocking: z.boolean().describe('Whether this is a blocking dependency'),
});

export const DependencyDetectionOutputSchema = z.object({
  suggestions: z.array(DependencySuggestionSchema).describe('Suggested dependencies'),
  reasoning: z.string().describe('Overall analysis of task dependencies'),
  confidence: ConfidenceSchema.describe('Confidence in the suggestions'),
  newTasksSuggested: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        reasoning: z.string(),
      })
    )
    .optional()
    .describe('New tasks that should be created as prerequisites'),
});

export type DependencyDetectionOutput = z.infer<typeof DependencyDetectionOutputSchema>;

export const BlockerResolutionOutputSchema = z.object({
  blockerAnalysis: z.string().describe('Analysis of what is blocking the task'),
  suggestedActions: z.array(z.string()).describe('Concrete steps to unblock'),
  newTasks: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: PrioritySchema,
      })
    )
    .optional()
    .describe('New tasks to create to resolve the blocker'),
  estimatedTimeToResolve: z.string().optional().describe('Estimate of how long to unblock'),
  confidence: ConfidenceSchema.describe('Confidence in the resolution plan'),
});

export type BlockerResolutionOutput = z.infer<typeof BlockerResolutionOutputSchema>;
