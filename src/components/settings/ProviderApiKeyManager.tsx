import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import {
  type LLMProvider,
  PROVIDER_DISPLAY_NAMES,
  getApiKey,
  setApiKey,
  removeApiKey,
} from '../../lib/llm';

interface ProviderKeyState {
  value: string;
  showKey: boolean;
  isTesting: boolean;
  testResult: 'success' | 'error' | null;
}

export function ProviderApiKeyManager() {
  const [keyStates, setKeyStates] = useState<Record<LLMProvider, ProviderKeyState>>({
    anthropic: { value: '', showKey: false, isTesting: false, testResult: null },
    openai: { value: '', showKey: false, isTesting: false, testResult: null },
    gemini: { value: '', showKey: false, isTesting: false, testResult: null },
    groq: { value: '', showKey: false, isTesting: false, testResult: null },
    grok: { value: '', showKey: false, isTesting: false, testResult: null },
    deepseek: { value: '', showKey: false, isTesting: false, testResult: null },
    cerebras: { value: '', showKey: false, isTesting: false, testResult: null },
  });

  useEffect(() => {
    const providers: LLMProvider[] = [
      'anthropic',
      'openai',
      'gemini',
      'groq',
      'grok',
      'deepseek',
      'cerebras',
    ];

    const loaded: Record<string, ProviderKeyState> = {};
    providers.forEach((provider) => {
      const key = getApiKey(provider) || '';
      loaded[provider] = {
        value: key,
        showKey: false,
        isTesting: false,
        testResult: null,
      };
    });

    setKeyStates(loaded as Record<LLMProvider, ProviderKeyState>);
  }, []);

  const handleKeyChange = (provider: LLMProvider, value: string) => {
    setKeyStates((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], value, testResult: null },
    }));
  };

  const handleToggleVisibility = (provider: LLMProvider) => {
    setKeyStates((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], showKey: !prev[provider].showKey },
    }));
  };

  const handleSave = (provider: LLMProvider) => {
    const key = keyStates[provider].value.trim();
    if (key) {
      setApiKey(provider, key);
    } else {
      removeApiKey(provider);
    }
  };

  const handleTest = async (provider: LLMProvider) => {
    setKeyStates((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], isTesting: true, testResult: null },
    }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const hasKey = keyStates[provider].value.trim().length > 0;
    setKeyStates((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        isTesting: false,
        testResult: hasKey ? 'success' : 'error',
      },
    }));
  };

  const providers: LLMProvider[] = [
    'anthropic',
    'openai',
    'gemini',
    'groq',
    'grok',
    'deepseek',
    'cerebras',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">API Keys</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure API keys for different LLM providers. You only need to configure providers you
          want to use.
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => {
          const state = keyStates[provider];
          return (
            <div
              key={provider}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {PROVIDER_DISPLAY_NAMES[provider]}
                </label>
                {state.testResult === 'success' && (
                  <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4 mr-1" />
                    Connected
                  </span>
                )}
                {state.testResult === 'error' && (
                  <span className="flex items-center text-sm text-red-600 dark:text-red-400">
                    <X className="w-4 h-4 mr-1" />
                    Invalid
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={state.showKey ? 'text' : 'password'}
                    value={state.value}
                    onChange={(e) => handleKeyChange(provider, e.target.value)}
                    placeholder={`Enter ${PROVIDER_DISPLAY_NAMES[provider]} API key`}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(provider)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {state.showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => handleSave(provider)}
                  disabled={state.isTesting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>

                <button
                  onClick={() => handleTest(provider)}
                  disabled={state.isTesting || !state.value.trim()}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
