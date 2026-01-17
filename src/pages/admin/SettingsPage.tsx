import { useState, useEffect } from 'react';
import { Monitor, Moon, Sun, Database, Cloud } from 'lucide-react';
import { AISettingsPanel } from '../../components/settings/AISettingsPanel';
import { storageConfig, type StorageType } from '../../lib/storage';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [storageType, setStorageType] = useState<StorageType>(() => {
    return storageConfig.getCurrentType();
  });

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

  useEffect(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }, [theme]);

  const handleStorageTypeChange = (type: StorageType) => {
    setStorageType(type);
    storageConfig.setStorageType(type);
    window.location.reload();
  };

  const themeOptions: {
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
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

  const storageOptions: {
    value: StorageType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your Personal OS preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Appearance</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Customize how Personal OS looks on your device
        </p>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Color Theme
          </label>
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
                  theme === option.value
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose where your data is stored
        </p>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Storage Type
          </label>
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
                  storageType === option.value
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
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

      <div className="mt-6">
        <AISettingsPanel />
      </div>
    </div>
  );
}
