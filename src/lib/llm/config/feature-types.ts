import type { LLMProvider } from './provider-types';

export type AIFeature =
  | 'parseTask'
  | 'breakdownTask'
  | 'priorityAdvisor'
  | 'effortEstimation'
  | 'taskCategorization'
  | 'dependencyDetection'
  | 'projectHealth'
  | 'projectTaskGen'
  | 'projectRisk';

export interface FeatureProviderConfig {
  provider: LLMProvider;
  model: string;
}

export const AI_FEATURE_DISPLAY_NAMES: Record<AIFeature, string> = {
  parseTask: 'Task Parsing',
  breakdownTask: 'Task Breakdown',
  priorityAdvisor: 'Priority Advisor',
  effortEstimation: 'Effort Estimation',
  taskCategorization: 'Task Categorization',
  dependencyDetection: 'Dependency Detection',
  projectHealth: 'Project Health Analysis',
  projectTaskGen: 'Project Task Generation',
  projectRisk: 'Project Risk Assessment',
};

export const DEFAULT_FEATURE_PROVIDERS: Record<AIFeature, FeatureProviderConfig> = {
  parseTask: { provider: 'anthropic', model: 'claude-3-5-haiku-20241022' },
  breakdownTask: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  priorityAdvisor: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  effortEstimation: { provider: 'anthropic', model: 'claude-3-5-haiku-20241022' },
  taskCategorization: { provider: 'anthropic', model: 'claude-3-5-haiku-20241022' },
  dependencyDetection: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  projectHealth: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  projectTaskGen: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  projectRisk: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
};
