import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const MODE_STORAGE_KEY = 'leisure_mode_preference';

interface ModeContextType {
  isLeisureMode: boolean;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
};

interface ModeProviderProps {
  children: ReactNode;
}

export const ModeProvider = ({ children }: ModeProviderProps) => {
  const [isLeisureMode, setIsLeisureMode] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (storedMode === 'leisure') {
      setIsLeisureMode(true);
      document.documentElement.classList.add('leisure-mode');
    }
  }, []);

  const toggleMode = () => {
    setIsLeisureMode((prev) => {
      const newMode = !prev;
      localStorage.setItem(MODE_STORAGE_KEY, newMode ? 'leisure' : 'work');

      if (newMode) {
        document.documentElement.classList.add('leisure-mode');
      } else {
        document.documentElement.classList.remove('leisure-mode');
      }

      return newMode;
    });
  };

  const value = {
    isLeisureMode,
    toggleMode,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};
