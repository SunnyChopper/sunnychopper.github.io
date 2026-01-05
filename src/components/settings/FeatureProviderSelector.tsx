import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import {
  type AIFeature,
  type LLMProvider,
  AI_FEATURE_DISPLAY_NAMES,
  PROVIDER_DISPLAY_NAMES,
  getFeatureConfig,
  setFeatureConfig,
  getConfiguredProviders,
  getModelsForProvider,
} from '../../lib/llm';

export function FeatureProviderSelector() {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature>('parseTask');
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('anthropic');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableProviders, setAvailableProviders] = useState<LLMProvider[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const providers = getConfiguredProviders();
    setAvailableProviders(providers);

    if (providers.length > 0) {
      const config = getFeatureConfig(selectedFeature);
      if (providers.includes(config.provider)) {
        setSelectedProvider(config.provider);
        setSelectedModel(config.model);
      } else {
        setSelectedProvider(providers[0]);
        const models = getModelsForProvider(providers[0]);
        setSelectedModel(models.length > 0 ? models[0].name : '');
      }
    }
  }, [selectedFeature]);

  useEffect(() => {
    const models = getModelsForProvider(selectedProvider);
    if (models.length > 0 && !models.find((m) => m.name === selectedModel)) {
      setSelectedModel(models[0].name);
    }
  }, [selectedProvider]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      setFeatureConfig(selectedFeature, selectedProvider, selectedModel);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save feature config:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
    'goalRefinement',
    'successCriteriaGen',
    'metricSuggestions',
    'goalCascade',
    'achievementForecast',
    'goalConflict',
    'goalProgress',
    'metricPatterns',
    'metricAnomalies',
    'metricCorrelations',
    'metricTargets',
    'metricHealth',
    'habitDesign',
    'habitStack',
    'streakRecovery',
    'habitPatterns',
    'triggerOptimization',
    'habitGoalAlignment',
    'reflectionPrompts',
    'dailyDigest',
    'logbookPatterns',
    'sentimentAnalysis',
    'weeklyReview',
    'connectionSuggestions',
  ];

  const availableModels = getModelsForProvider(selectedProvider);

  if (availableProviders.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          No Providers Configured
        </h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Please configure at least one API key in the API Keys tab before setting up feature
          providers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Feature Provider Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure which LLM provider and model to use for each AI feature. This allows you to
          optimize for cost, performance, or specific capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Feature
          </label>
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value as AIFeature)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            {features.map((feature) => (
              <option key={feature} value={feature}>
                {AI_FEATURE_DISPLAY_NAMES[feature]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Provider
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as LLMProvider)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            {availableProviders.map((provider) => (
              <option key={provider} value={provider}>
                {PROVIDER_DISPLAY_NAMES[provider]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            {availableModels.map((model) => (
              <option key={model.name} value={model.name}>
                {model.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>

        {saveSuccess && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Configuration saved successfully!
          </span>
        )}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Current Configuration Summary
        </h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {features.map((feature) => {
            const config = getFeatureConfig(feature);
            return (
              <div key={feature} className="flex justify-between">
                <span>{AI_FEATURE_DISPLAY_NAMES[feature]}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {PROVIDER_DISPLAY_NAMES[config.provider]} - {config.model}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
