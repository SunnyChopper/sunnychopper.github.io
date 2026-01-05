import { useState, useEffect } from 'react';
import { Monitor, Moon, Sun, Database, Cloud, Sparkles, Key, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { storageConfig, type StorageType } from '../../lib/storage';
import { llmConfig } from '../../lib/llm';
import type { LLMAdapterType } from '../../types/llm';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [storageType, setStorageType] = useState<StorageType>(() => {
    return storageConfig.getCurrentType();
  });

  const [llmAdapterType, setLlmAdapterType] = useState<LLMAdapterType>(() => {
    return llmConfig.getCurrentType();
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return llmConfig.getDirectAdapter().getApiKey() || '';
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }, [theme]);

  const handleStorageTypeChange = (type: StorageType) => {
    setStorageType(type);
    storageConfig.setStorageType(type);
    window.location.reload();
  };

  const handleLLMAdapterChange = (type: LLMAdapterType) => {
    setLlmAdapterType(type);
    llmConfig.setAdapterType(type);
  };

  const handleSaveApiKey = () => {
    llmConfig.getDirectAdapter().setApiKey(apiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const applyTheme = (selectedTheme: Theme) => {
    let effectiveTheme = selectedTheme;

    if (selectedTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun size={20} />,
      description: 'Use light theme',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon size={20} />,
      description: 'Use dark theme',
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor size={20} />,
      description: 'Follow system preference',
    },
  ];

  const storageOptions: { value: StorageType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'local',
      label: 'Local Storage',
      icon: <Database size={20} />,
      description: 'Store data in browser (no server needed)',
    },
    {
      value: 'api',
      label: 'API Backend',
      icon: <Cloud size={20} />,
      description: 'Sync data with backend server',
    },
  ];

  const llmOptions: { value: LLMAdapterType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'direct',
      label: 'Direct (Prototyping)',
      icon: <Key size={20} />,
      description: 'Connect directly to LLM API (requires API key)',
    },
    {
      value: 'api',
      label: 'Backend API',
      icon: <Cloud size={20} />,
      description: 'Use backend service for LLM calls (production)',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your Personal OS preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Appearance</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Customize how Personal OS looks on your device</p>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Color Theme</label>
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                theme === option.value
                  ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700/50'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  theme === option.value ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
              </div>
              {theme === option.value && (
                <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Data Storage</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Choose where your data is stored</p>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Storage Type</label>
          {storageOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStorageTypeChange(option.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                storageType === option.value
                  ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700/50'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  storageType === option.value ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
              </div>
              {storageType === option.value && (
                <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-amber-500" />
          AI Assistant
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Configure AI-powered features</p>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">LLM Connection</label>
            {llmOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleLLMAdapterChange(option.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                  llmAdapterType === option.value
                    ? 'border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700/50'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                    llmAdapterType === option.value ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                </div>
                {llmAdapterType === option.value && (
                  <div className="w-5 h-5 rounded-full bg-amber-600 dark:bg-amber-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {llmAdapterType === 'direct' && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Cost Warning:</strong> Direct mode makes API calls from your browser. Each AI action incurs API costs. Use deliberately.
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Anthropic API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveApiKey}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      apiKeySaved
                        ? 'bg-green-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {apiKeySaved ? 'Saved!' : 'Save'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
