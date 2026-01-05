import { useState } from 'react';
import { ProviderApiKeyManager } from './ProviderApiKeyManager';
import { FeatureProviderSelector } from './FeatureProviderSelector';
import {
  setAllFeaturesToProvider,
  setCostOptimizedMix,
  PROVIDER_DISPLAY_NAMES,
  getConfiguredProviders,
} from '../../lib/llm';

type Tab = 'api-keys' | 'features';

export function AISettingsPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('api-keys');

  const handleQuickPreset = (preset: 'anthropic' | 'openai' | 'cost-optimized') => {
    if (preset === 'cost-optimized') {
      setCostOptimizedMix();
    } else {
      const configuredProviders = getConfiguredProviders();
      if (configuredProviders.includes(preset)) {
        setAllFeaturesToProvider(preset);
      } else {
        alert(`Please configure ${PROVIDER_DISPLAY_NAMES[preset]} API key first.`);
        return;
      }
    }
    alert('Preset applied successfully! Check the Feature Configuration tab to see changes.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          AI Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage API keys and configure which AI providers to use for different features.
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'api-keys'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'features'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Feature Configuration
          </button>
        </nav>
      </div>

      {activeTab === 'features' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Quick Presets
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            Apply a preset configuration to all features:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickPreset('anthropic')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm"
            >
              All Anthropic
            </button>
            <button
              onClick={() => handleQuickPreset('openai')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm"
            >
              All OpenAI
            </button>
            <button
              onClick={() => handleQuickPreset('cost-optimized')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm"
            >
              Cost-Optimized Mix
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'api-keys' && <ProviderApiKeyManager />}
        {activeTab === 'features' && <FeatureProviderSelector />}
      </div>
    </div>
  );
}
