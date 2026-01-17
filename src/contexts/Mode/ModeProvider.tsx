import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ModeContext, MODE_STORAGE_KEY } from './types';

interface ModeProviderProps {
  children: ReactNode;
}

export const ModeProvider = ({ children }: ModeProviderProps) => {
  const [isLeisureMode, setIsLeisureMode] = useState(() => {
    const storedMode = typeof window !== 'undefined' ? localStorage.getItem(MODE_STORAGE_KEY) : null;
    return storedMode === 'leisure';
  });

  // Sync HTML class with current mode
  useEffect(() => {
    if (isLeisureMode) {
      document.documentElement.classList.add('leisure-mode');
    } else {
      document.documentElement.classList.remove('leisure-mode');
    }
  }, [isLeisureMode]);

  const toggleMode = () => {
    setIsLeisureMode((prev) => {
      const newMode = !prev;
      localStorage.setItem(MODE_STORAGE_KEY, newMode ? 'leisure' : 'work');
      return newMode;
    });
  };

  const value = {
    isLeisureMode,
    toggleMode,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};
