import { useState, useEffect } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }, [theme]);

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your Personal OS preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Appearance</h2>
        <p className="text-sm text-gray-600 mb-6">Customize how Personal OS looks on your device</p>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 mb-3">Color Theme</label>
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                theme === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  theme === option.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
              {theme === option.value && (
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
