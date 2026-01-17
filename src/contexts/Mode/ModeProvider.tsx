import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ModeContext } from './types';
import { apiClient } from '@/lib/api-client';

interface ModeProviderProps {
  children: ReactNode;
}

export const ModeProvider = ({ children }: ModeProviderProps) => {
  const [isLeisureMode, setIsLeisureMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load mode preference from backend
  useEffect(() => {
    const loadMode = async () => {
      try {
        const response = await apiClient.getModePreference();
        if (response.success && response.data) {
          setIsLeisureMode(response.data === 'leisure');
        } else {
          // Default to work mode if API fails
          setIsLeisureMode(false);
        }
      } catch (error) {
        console.error('Failed to load mode preference:', error);
        // Default to work mode on error
        setIsLeisureMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadMode();
  }, []);

  // Sync HTML class with current mode
  useEffect(() => {
    if (isLeisureMode) {
      document.documentElement.classList.add('leisure-mode');
    } else {
      document.documentElement.classList.remove('leisure-mode');
    }
  }, [isLeisureMode]);

  const toggleMode = async () => {
    const newMode = !isLeisureMode;
    setIsLeisureMode(newMode);

    try {
      await apiClient.setModePreference(newMode ? 'leisure' : 'work');
    } catch (error) {
      console.error('Failed to save mode preference:', error);
      // Revert on error
      setIsLeisureMode(!newMode);
    }
  };

  const value = {
    isLeisureMode,
    toggleMode,
  };

  // Don't render children until mode is loaded to avoid flash
  if (isLoading) {
    return null;
  }

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};
