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

const LLM_API_KEY_STORAGE = 'gs_llm_api_key';
const LLM_MODEL_STORAGE = 'gs_llm_model';

export class DirectLLMAdapter implements ILLMAdapter {
  private apiKey: string | null = null;
  private model: string = 'claude-sonnet-4-20250514';
  private apiUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = localStorage.getItem(LLM_API_KEY_STORAGE);
    this.model = localStorage.getItem(LLM_MODEL_STORAGE) || 'claude-sonnet-4-20250514';
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem(LLM_API_KEY_STORAGE, key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  setModel(model: string): void {
    this.model = model;
    localStorage.setItem(LLM_MODEL_STORAGE, model);
  }

  getModel(): string {
    return this.model;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async callLLM<T>(userPrompt: string): Promise<LLMResponse<T>> {
    if (!this.apiKey) {
      return { data: null, error: 'API key not configured', success: false };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `API error: ${response.status} - ${errorText}`, success: false };
      }

      const result = await response.json();
      const content = result.content?.[0]?.text || '';

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { data: null, error: 'Failed to parse JSON response', success: false };
      }

      const parsed = JSON.parse(jsonMatch[0]) as T;
      return {
        data: parsed,
        error: null,
        success: true,
        usage: {
          promptTokens: result.usage?.input_tokens || 0,
          completionTokens: result.usage?.output_tokens || 0,
          totalTokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: message, success: false };
    }
  }

  async parseNaturalLanguageTask(input: ParseTaskInput): Promise<LLMResponse<ParseTaskOutput>> {
    const prompt = getParseTaskPrompt(input.text);
    return this.callLLM<ParseTaskOutput>(prompt);
  }

  async breakdownTask(input: TaskBreakdownInput): Promise<LLMResponse<TaskBreakdownOutput>> {
    const prompt = getTaskBreakdownPrompt(input.task.title, input.task.description, input.task.area);
    return this.callLLM<TaskBreakdownOutput>(prompt);
  }

  async resolveBlockers(input: BlockerResolutionInput): Promise<LLMResponse<BlockerResolutionOutput>> {
    const blockers = input.blockers.map(b => ({ id: b.id, title: b.title, status: b.status }));
    const prompt = getBlockerResolutionPrompt(input.task.title, blockers);
    return this.callLLM<BlockerResolutionOutput>(prompt);
  }

  async advisePriority(input: PriorityAdvisorInput): Promise<LLMResponse<PriorityAdvisorOutput>> {
    const otherTasks = input.allTasks
      .filter(t => t.id !== input.task.id && t.status !== 'Done' && t.status !== 'Cancelled')
      .slice(0, 10)
      .map(t => ({ title: t.title, priority: t.priority, dueDate: t.dueDate }));
    const prompt = getPriorityAdvisorPrompt(input.task.title, input.task.description, input.task.priority, otherTasks);
    return this.callLLM<PriorityAdvisorOutput>(prompt);
  }

  async estimateEffort(input: EffortEstimationInput): Promise<LLMResponse<EffortEstimationOutput>> {
    const similarTasks = (input.similarTasks || [])
      .filter(t => t.size !== null)
      .slice(0, 5)
      .map(t => ({ title: t.title, size: t.size }));
    const prompt = getEffortEstimationPrompt(input.task.title || '', input.task.description || null, similarTasks);
    return this.callLLM<EffortEstimationOutput>(prompt);
  }

  async categorizeTask(input: TaskCategorizationInput): Promise<LLMResponse<TaskCategorizationOutput>> {
    const prompt = getTaskCategorizationPrompt(input.title, input.description);
    return this.callLLM<TaskCategorizationOutput>(prompt);
  }

  async detectDependencies(input: DependencyDetectionInput): Promise<LLMResponse<DependencyDetectionOutput>> {
    const existingTasks = input.existingTasks
      .filter(t => t.status !== 'Done' && t.status !== 'Cancelled')
      .slice(0, 20)
      .map(t => ({ id: t.id, title: t.title, status: t.status }));
    const prompt = getDependencyDetectionPrompt(input.task.title || '', input.task.description || null, existingTasks);
    return this.callLLM<DependencyDetectionOutput>(prompt);
  }

  async analyzeProjectHealth(input: ProjectHealthInput): Promise<LLMResponse<ProjectHealthOutput>> {
    const tasks = input.tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    }));
    const prompt = getProjectHealthPrompt(input.project.name, input.project.description, tasks);
    const response = await this.callLLM<{
      healthScore: number;
      issues: Array<{ type: string; title: string; content: string; severity: string }>;
      recommendations: string[];
      summary: string;
    }>(prompt);

    if (!response.success || !response.data) {
      return response as LLMResponse<ProjectHealthOutput>;
    }

    const mappedIssues = response.data.issues.map((issue, index) => ({
      id: `issue-${Date.now()}-${index}`,
      type: issue.type as 'progress_analysis' | 'health_analysis' | 'blocker_resolution',
      title: issue.title,
      content: issue.content,
      severity: issue.severity as 'info' | 'warning' | 'critical',
      relatedEntities: [{ type: 'project', id: input.project.id }],
      createdAt: new Date().toISOString(),
      viewedAt: null,
    }));

    return {
      ...response,
      data: {
        healthScore: response.data.healthScore,
        issues: mappedIssues,
        recommendations: response.data.recommendations,
        summary: response.data.summary,
      },
    };
  }

  async generateProjectTasks(input: ProjectTaskGenInput): Promise<LLMResponse<ProjectTaskGenOutput>> {
    const existingTasks = input.existingTasks.map(t => ({ title: t.title }));
    const prompt = getProjectTaskGenPrompt(
      input.project.name,
      input.project.description,
      input.project.area,
      existingTasks
    );
    return this.callLLM<ProjectTaskGenOutput>(prompt);
  }

  async identifyProjectRisks(input: ProjectRiskInput): Promise<LLMResponse<ProjectRiskOutput>> {
    const tasks = input.tasks.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    }));
    const prompt = getProjectRiskPrompt(input.project.name, input.project.description, tasks);
    return this.callLLM<ProjectRiskOutput>(prompt);
  }
}
