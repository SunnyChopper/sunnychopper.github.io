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
  PriorityAdvisorOutput,
  EffortEstimationInput,
  EffortEstimationOutput,
  TaskCategorizationInput,
  TaskCategorizationOutput,
  DependencyDetectionInput,
  DependencyDetectionOutput,
  ProjectHealthInput,
  ProjectHealthOutput,
  ProjectTaskGenInput,
  ProjectTaskGenOutput,
  ProjectRiskInput,
  ProjectRiskOutput,
} from '../../types/llm';

const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL;

export class APILLMAdapter implements ILLMAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/functions/v1`;
  }

  isConfigured(): boolean {
    return !!API_BASE_URL;
  }

  private async callEndpoint<TInput, TOutput>(
    endpoint: string,
    input: TInput
  ): Promise<LLMResponse<TOutput>> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `API error: ${response.status} - ${errorText}`, success: false };
      }

      const result = await response.json();

      if (result.error) {
        return { data: null, error: result.error, success: false };
      }

      return {
        data: result.data || result,
        error: null,
        success: true,
        usage: result.usage,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: message, success: false };
    }
  }

  async parseNaturalLanguageTask(input: ParseTaskInput): Promise<LLMResponse<ParseTaskOutput>> {
    return this.callEndpoint<ParseTaskInput, ParseTaskOutput>('ai-parse-task', input);
  }

  async breakdownTask(input: TaskBreakdownInput): Promise<LLMResponse<TaskBreakdownOutput>> {
    return this.callEndpoint('ai-breakdown-task', {
      taskId: input.task.id,
      title: input.task.title,
      description: input.task.description,
      area: input.task.area,
    });
  }

  async resolveBlockers(input: BlockerResolutionInput): Promise<LLMResponse<BlockerResolutionOutput>> {
    return this.callEndpoint('ai-resolve-blockers', {
      taskId: input.task.id,
      title: input.task.title,
      blockers: input.blockers.map(b => ({ id: b.id, title: b.title, status: b.status })),
    });
  }

  async advisePriority(input: PriorityAdvisorInput): Promise<LLMResponse<PriorityAdvisorOutput>> {
    return this.callEndpoint('ai-advise-priority', {
      taskId: input.task.id,
      title: input.task.title,
      description: input.task.description,
      currentPriority: input.task.priority,
      otherTasks: input.allTasks
        .filter(t => t.id !== input.task.id && t.status !== 'Done' && t.status !== 'Cancelled')
        .slice(0, 10)
        .map(t => ({ title: t.title, priority: t.priority, dueDate: t.dueDate })),
    });
  }

  async estimateEffort(input: EffortEstimationInput): Promise<LLMResponse<EffortEstimationOutput>> {
    return this.callEndpoint('ai-estimate-effort', {
      title: input.task.title,
      description: input.task.description,
      similarTasks: (input.similarTasks || [])
        .filter(t => t.size !== null)
        .slice(0, 5)
        .map(t => ({ title: t.title, size: t.size })),
    });
  }

  async categorizeTask(input: TaskCategorizationInput): Promise<LLMResponse<TaskCategorizationOutput>> {
    return this.callEndpoint<TaskCategorizationInput, TaskCategorizationOutput>('ai-categorize-task', input);
  }

  async detectDependencies(input: DependencyDetectionInput): Promise<LLMResponse<DependencyDetectionOutput>> {
    return this.callEndpoint('ai-detect-dependencies', {
      title: input.task.title,
      description: input.task.description,
      existingTasks: input.existingTasks
        .filter(t => t.status !== 'Done' && t.status !== 'Cancelled')
        .slice(0, 20)
        .map(t => ({ id: t.id, title: t.title, status: t.status })),
    });
  }

  async analyzeProjectHealth(input: ProjectHealthInput): Promise<LLMResponse<ProjectHealthOutput>> {
    return this.callEndpoint('ai-project-health', {
      projectId: input.project.id,
      name: input.project.name,
      description: input.project.description,
      tasks: input.tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
      })),
    });
  }

  async generateProjectTasks(input: ProjectTaskGenInput): Promise<LLMResponse<ProjectTaskGenOutput>> {
    return this.callEndpoint('ai-generate-tasks', {
      projectId: input.project.id,
      name: input.project.name,
      description: input.project.description,
      area: input.project.area,
      existingTasks: input.existingTasks.map(t => ({ title: t.title })),
    });
  }

  async identifyProjectRisks(input: ProjectRiskInput): Promise<LLMResponse<ProjectRiskOutput>> {
    return this.callEndpoint('ai-identify-risks', {
      projectId: input.project.id,
      name: input.project.name,
      description: input.project.description,
      tasks: input.tasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
      })),
    });
  }
}
