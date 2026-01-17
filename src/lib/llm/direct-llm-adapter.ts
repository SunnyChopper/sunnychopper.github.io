import type { z } from 'zod';
import type { AIFeature } from './config/feature-types';
import type {
  ILLMAdapter,
  LLMResponse,
  ParseTaskInput,
  ParseTaskOutput,
  TaskBreakdownInput,
  TaskBreakdownOutput,
  BlockerResolutionInput,
  BlockerResolutionOutput,
  PriorityAdvisorInput,
  PriorityAdvisorOutput as LegacyPriorityAdvisorOutput,
  EffortEstimationInput,
  EffortEstimationOutput as LegacyEffortEstimationOutput,
  TaskCategorizationInput,
  TaskCategorizationOutput as LegacyTaskCategorizationOutput,
  DependencyDetectionInput,
  DependencyDetectionOutput,
  ProjectHealthInput,
  ProjectHealthOutput,
  ProjectTaskGenInput,
  ProjectTaskGenOutput,
  ProjectRiskInput,
  ProjectRiskOutput,
} from '@/types/llm';

import { getFeatureConfig } from './config/feature-config-store';
import { getApiKey, hasApiKeySync } from './config/api-key-store';
import { createProvider } from './providers/provider-factory';

import {
  ParseTaskOutputSchema,
  TaskBreakdownOutputSchema,
  BlockerResolutionOutputSchema,
  PriorityAdvisorOutputSchema,
  EffortEstimationOutputSchema,
  TaskCategorizationOutputSchema,
  DependencyDetectionOutputSchema,
} from './schemas/task-schemas';

import {
  ProjectHealthOutputSchema,
  ProjectTaskGenOutputSchema,
  ProjectRiskOutputSchema,
} from './schemas/project-schemas';

import {
  SYSTEM_PROMPT,
  getParseTaskPrompt,
  getTaskBreakdownPrompt,
  getBlockerResolutionPrompt,
  getPriorityAdvisorPrompt,
  getEffortEstimationPrompt,
  getTaskCategorizationPrompt,
  getDependencyDetectionPrompt,
  getProjectHealthPrompt,
  getProjectTaskGenPrompt,
  getProjectRiskPrompt,
} from './llm-prompts';

export class DirectLLMAdapter implements ILLMAdapter {
  private async callLLMForFeature<TSchema extends z.ZodType, TOutput>(
    feature: AIFeature,
    schema: TSchema,
    userPrompt: string,
    converter: (schemaOutput: z.infer<TSchema>) => TOutput
  ): Promise<LLMResponse<TOutput>> {
    try {
      const config = await getFeatureConfig(feature);
      const apiKey = await getApiKey(config.provider);

      if (!apiKey) {
        return {
          data: null,
          error: `API key not configured for provider: ${config.provider}`,
          success: false,
        };
      }

      const provider = createProvider(config.provider, apiKey, config.model);

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ];

      const result = await provider.invokeStructured(schema, messages);
      const converted = converter(result);

      return {
        data: converted,
        error: null,
        success: true,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: message, success: false };
    }
  }

  isConfigured(): boolean {
    return hasApiKeySync('anthropic') || hasApiKeySync('openai') || hasApiKeySync('gemini');
  }

  async parseNaturalLanguageTask(input: ParseTaskInput): Promise<LLMResponse<ParseTaskOutput>> {
    const prompt = getParseTaskPrompt(input.text);

    return this.callLLMForFeature('parseTask', ParseTaskOutputSchema, prompt, (schemaOutput) => ({
      task: {
        title: schemaOutput.title,
        description: schemaOutput.description,
        area: schemaOutput.area,
        subCategory: schemaOutput.subCategory,
        priority: schemaOutput.priority,
        dueDate: schemaOutput.dueDate,
        scheduledDate: schemaOutput.scheduledDate,
        size: schemaOutput.size,
      },
      confidence: schemaOutput.confidence,
      extractedEntities: [],
    }));
  }

  async breakdownTask(input: TaskBreakdownInput): Promise<LLMResponse<TaskBreakdownOutput>> {
    const prompt = getTaskBreakdownPrompt(
      input.task.title,
      input.task.description,
      input.task.area
    );

    return this.callLLMForFeature(
      'breakdownTask',
      TaskBreakdownOutputSchema,
      prompt,
      (schemaOutput) => ({
        subtasks: schemaOutput.subtasks.map((sub) => ({
          title: sub.title,
          description: sub.description,
          area: input.task.area,
          size: sub.estimatedSize,
        })),
        reasoning: schemaOutput.reasoning,
      })
    );
  }

  async resolveBlockers(
    input: BlockerResolutionInput
  ): Promise<LLMResponse<BlockerResolutionOutput>> {
    const blockers = input.blockers.map((b) => ({ id: b.id, title: b.title, status: b.status }));
    const prompt = getBlockerResolutionPrompt(input.task.title, blockers);

    return this.callLLMForFeature(
      'dependencyDetection',
      BlockerResolutionOutputSchema,
      prompt,
      (schemaOutput) => ({
        suggestions: schemaOutput.suggestedActions,
        recommendedActions:
          schemaOutput.newTasks?.map((task) => ({
            action: task.title,
            targetTaskId: '',
            reason: task.description,
          })) || [],
      })
    );
  }

  async advisePriority(
    input: PriorityAdvisorInput
  ): Promise<LLMResponse<LegacyPriorityAdvisorOutput>> {
    const otherTasks = input.allTasks
      .filter((t) => t.id !== input.task.id && t.status !== 'Done' && t.status !== 'Cancelled')
      .slice(0, 10)
      .map((t) => ({ title: t.title, priority: t.priority, dueDate: t.dueDate }));
    const prompt = getPriorityAdvisorPrompt(
      input.task.title,
      input.task.description,
      input.task.priority,
      otherTasks
    );

    return this.callLLMForFeature(
      'priorityAdvisor',
      PriorityAdvisorOutputSchema,
      prompt,
      (schemaOutput) => ({
        recommendedPriority: schemaOutput.recommendedPriority,
        reasoning: schemaOutput.reasoning,
        factors: schemaOutput.factors,
      })
    );
  }

  async estimateEffort(
    input: EffortEstimationInput
  ): Promise<LLMResponse<LegacyEffortEstimationOutput>> {
    const similarTasks = (input.similarTasks || [])
      .filter((t) => t.size !== null)
      .slice(0, 5)
      .map((t) => ({ title: t.title, size: t.size }));
    const prompt = getEffortEstimationPrompt(
      input.task.title || '',
      input.task.description || null,
      similarTasks
    );

    return this.callLLMForFeature(
      'effortEstimation',
      EffortEstimationOutputSchema,
      prompt,
      (schemaOutput) => ({
        estimatedSize: schemaOutput.estimatedSize,
        confidence: schemaOutput.confidence,
        comparisons: schemaOutput.factors,
      })
    );
  }

  async categorizeTask(
    input: TaskCategorizationInput
  ): Promise<LLMResponse<LegacyTaskCategorizationOutput>> {
    const prompt = getTaskCategorizationPrompt(input.title, input.description);

    return this.callLLMForFeature(
      'taskCategorization',
      TaskCategorizationOutputSchema,
      prompt,
      (schemaOutput) => ({
        area: schemaOutput.area,
        subCategory: schemaOutput.subCategory,
        confidence: schemaOutput.confidence,
        reasoning: schemaOutput.reasoning,
      })
    );
  }

  async detectDependencies(
    input: DependencyDetectionInput
  ): Promise<LLMResponse<DependencyDetectionOutput>> {
    const existingTasks = input.existingTasks
      .filter((t) => t.status !== 'Done' && t.status !== 'Cancelled')
      .slice(0, 20)
      .map((t) => ({ id: t.id, title: t.title, status: t.status }));
    const prompt = getDependencyDetectionPrompt(
      input.task.title || '',
      input.task.description || null,
      existingTasks
    );

    return this.callLLMForFeature(
      'dependencyDetection',
      DependencyDetectionOutputSchema,
      prompt,
      (schemaOutput) => ({
        suggestedDependencies: schemaOutput.suggestions.map((dep) => ({
          taskId: dep.taskId,
          taskTitle: dep.taskTitle,
          reason: dep.reasoning,
          confidence: schemaOutput.confidence,
        })),
      })
    );
  }

  async analyzeProjectHealth(input: ProjectHealthInput): Promise<LLMResponse<ProjectHealthOutput>> {
    const tasks = input.tasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    }));
    const prompt = getProjectHealthPrompt(input.project.name, input.project.description, tasks);

    return this.callLLMForFeature(
      'projectHealth',
      ProjectHealthOutputSchema,
      prompt,
      (schemaOutput) => {
        const mappedIssues = schemaOutput.issues.map((issue, index) => ({
          id: `issue-${Date.now()}-${index}`,
          type: 'health_analysis' as const,
          title: issue.description,
          content: `${issue.impact}\n\nRecommendation: ${issue.recommendation}`,
          severity:
            issue.severity === 'critical' || issue.severity === 'high'
              ? 'critical'
              : issue.severity === 'medium'
                ? 'warning'
                : ('info' as 'info' | 'warning' | 'critical'),
          relatedEntities: [{ type: 'project', id: input.project.id }],
          createdAt: new Date().toISOString(),
          viewedAt: null,
        }));

        return {
          healthScore: schemaOutput.overallHealth,
          issues: mappedIssues,
          recommendations: schemaOutput.recommendations,
          summary: schemaOutput.summary,
        };
      }
    );
  }

  async generateProjectTasks(
    input: ProjectTaskGenInput
  ): Promise<LLMResponse<ProjectTaskGenOutput>> {
    const existingTasks = input.existingTasks.map((t) => ({ title: t.title }));
    const prompt = getProjectTaskGenPrompt(
      input.project.name,
      input.project.description,
      input.project.area,
      existingTasks
    );

    return this.callLLMForFeature(
      'projectTaskGen',
      ProjectTaskGenOutputSchema,
      prompt,
      (schemaOutput) => ({
        suggestedTasks: schemaOutput.tasks.map((task) => ({
          title: task.title,
          description: task.description,
          area: task.area,
          subCategory: task.subCategory,
          priority: task.priority,
          size: task.size,
        })),
        reasoning: schemaOutput.overallStrategy,
      })
    );
  }

  async identifyProjectRisks(input: ProjectRiskInput): Promise<LLMResponse<ProjectRiskOutput>> {
    const tasks = input.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    }));
    const prompt = getProjectRiskPrompt(input.project.name, input.project.description, tasks);

    return this.callLLMForFeature(
      'projectRisk',
      ProjectRiskOutputSchema,
      prompt,
      (schemaOutput) => ({
        risks: schemaOutput.risks.map((risk) => ({
          severity: risk.impact === 'critical' ? 'high' : risk.impact,
          description: risk.description,
          mitigation: risk.mitigation,
          affectedTasks: [],
        })),
        overallRiskLevel:
          schemaOutput.overallRiskLevel === 'critical' ? 'high' : schemaOutput.overallRiskLevel,
        summary: schemaOutput.summary,
      })
    );
  }
}
