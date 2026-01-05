import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    setTheme(storedTheme || 'system');
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    let effectiveTheme = newTheme;
    if (newTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setIsOpen(false);
  };

  const getCurrentIcon = () => {
    if (theme === 'light') return <Sun size={18} />;
    if (theme === 'dark') return <Moon size={18} />;
    return <Monitor size={18} />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        aria-label="Toggle theme"
      >
        {getCurrentIcon()}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
            <button
              onClick={() => applyTheme('light')}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                theme === 'light' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Sun size={16} />
              Light
            </button>
            <button
              onClick={() => applyTheme('dark')}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                theme === 'dark' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Moon size={16} />
              Dark
            </button>
            <button
              onClick={() => applyTheme('system')}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                theme === 'system' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Monitor size={16} />
              System
            </button>
          </div>
        </>
      )}
    </div>
  );
}
