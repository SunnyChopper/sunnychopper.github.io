import type { AIFeature, FeatureProviderConfig } from './feature-types';
import type { LLMProvider } from './provider-types';
import { DEFAULT_FEATURE_PROVIDERS } from './feature-types';
import { getDefaultModel } from './model-catalog';

const FEATURE_PROVIDER_PREFIX = 'gs_feature_provider_';
const FEATURE_MODEL_PREFIX = 'gs_feature_model_';

export function getFeatureConfig(feature: AIFeature): FeatureProviderConfig {
  try {
    const providerKey = `${FEATURE_PROVIDER_PREFIX}${feature}`;
    const modelKey = `${FEATURE_MODEL_PREFIX}${feature}`;

    const savedProvider = localStorage.getItem(providerKey) as LLMProvider | null;
    const savedModel = localStorage.getItem(modelKey);

    if (savedProvider && savedModel) {
      return {
        provider: savedProvider,
        model: savedModel,
      };
    }

    return DEFAULT_FEATURE_PROVIDERS[feature];
  } catch (error) {
    console.error(`Failed to get feature config for ${feature}:`, error);
    return DEFAULT_FEATURE_PROVIDERS[feature];
  }
}

export function setFeatureConfig(
  feature: AIFeature,
  provider: LLMProvider,
  model: string
): void {
  try {
    const providerKey = `${FEATURE_PROVIDER_PREFIX}${feature}`;
    const modelKey = `${FEATURE_MODEL_PREFIX}${feature}`;

    localStorage.setItem(providerKey, provider);
    localStorage.setItem(modelKey, model);
  } catch (error) {
    console.error(`Failed to set feature config for ${feature}:`, error);
    throw new Error(`Failed to save configuration for ${feature}`);
  }
}

export function resetFeatureConfig(feature: AIFeature): void {
  try {
    const providerKey = `${FEATURE_PROVIDER_PREFIX}${feature}`;
    const modelKey = `${FEATURE_MODEL_PREFIX}${feature}`;

    localStorage.removeItem(providerKey);
    localStorage.removeItem(modelKey);
  } catch (error) {
    console.error(`Failed to reset feature config for ${feature}:`, error);
  }
}

export function resetAllFeatureConfigs(): void {
  const features: AIFeature[] = [
    'parseTask',
    'breakdownTask',
    'priorityAdvisor',
    'effortEstimation',
    'taskCategorization',
    'dependencyDetection',
    'projectHealth',
    'projectTaskGen',
    'projectRisk',
  ];

  features.forEach((feature) => resetFeatureConfig(feature));
}

export function setAllFeaturesToProvider(provider: LLMProvider): void {
  const features: AIFeature[] = [
    'parseTask',
    'breakdownTask',
    'priorityAdvisor',
    'effortEstimation',
    'taskCategorization',
    'dependencyDetection',
    'projectHealth',
    'projectTaskGen',
    'projectRisk',
  ];

  const defaultModel = getDefaultModel(provider);

  features.forEach((feature) => {
    setFeatureConfig(feature, provider, defaultModel);
  });
}

export function setCostOptimizedMix(): void {
  setFeatureConfig('parseTask', 'anthropic', 'claude-3-5-haiku-20241022');
  setFeatureConfig('breakdownTask', 'anthropic', 'claude-3-5-sonnet-20241022');
  setFeatureConfig('priorityAdvisor', 'anthropic', 'claude-3-5-haiku-20241022');
  setFeatureConfig('effortEstimation', 'anthropic', 'claude-3-5-haiku-20241022');
  setFeatureConfig('taskCategorization', 'anthropic', 'claude-3-5-haiku-20241022');
  setFeatureConfig('dependencyDetection', 'anthropic', 'claude-3-5-sonnet-20241022');
  setFeatureConfig('projectHealth', 'anthropic', 'claude-3-5-sonnet-20241022');
  setFeatureConfig('projectTaskGen', 'anthropic', 'claude-3-5-sonnet-20241022');
  setFeatureConfig('projectRisk', 'anthropic', 'claude-3-5-sonnet-20241022');
}
