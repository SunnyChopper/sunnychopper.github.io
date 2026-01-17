import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';
import type { ApiError } from '../types/api-contracts';

interface BackendStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastError: ApiError | null;
  errorCount: number;
}

interface BackendStatusContextValue {
  status: BackendStatus;
  checkConnection: () => Promise<boolean>;
  resetErrorCount: () => void;
  recordError: (error: ApiError) => void;
  recordSuccess: () => void;
}

const BackendStatusContext = createContext<BackendStatusContextValue | undefined>(undefined);

export function useBackendStatus() {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error('useBackendStatus must be used within BackendStatusProvider');
  }
  return context;
}

interface BackendStatusProviderProps {
  children: ReactNode;
}

export function BackendStatusProvider({ children }: BackendStatusProviderProps) {
  const [status, setStatus] = useState<BackendStatus>({
    isOnline: true, // Optimistically assume online
    isChecking: false,
    lastError: null,
    errorCount: 0,
  });

  const recordError = useCallback((error: ApiError) => {
    setStatus((prev) => ({
      isOnline: false,
      isChecking: false,
      lastError: error,
      errorCount: prev.errorCount + 1,
    }));
  }, []);

  const recordSuccess = useCallback(() => {
    setStatus((prev) => ({
      isOnline: true,
      isChecking: false,
      lastError: null,
      errorCount: 0,
    }));
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setStatus((prev) => ({ ...prev, isChecking: true }));

    try {
      // Try a lightweight health check endpoint
      // If health endpoint doesn't exist, try a simple GET to a common endpoint
      const response = await apiClient.get('/health');

      if (response.success) {
        recordSuccess();
        return true;
      } else {
        const error: ApiError = response.error || {
          message: 'Health check failed',
          code: 'HEALTH_CHECK_FAILED',
        };
        recordError(error);
        return false;
      }
    } catch (error) {
      // If health endpoint doesn't exist, try a lightweight endpoint
      try {
        const fallbackResponse = await apiClient.get('/tasks?limit=1');
        if (fallbackResponse.success) {
          recordSuccess();
          return true;
        } else {
          const apiError: ApiError = fallbackResponse.error || {
            message: 'Connection check failed',
            code: 'CONNECTION_CHECK_FAILED',
          };
          recordError(apiError);
          return false;
        }
      } catch (fallbackError) {
        const apiError: ApiError = {
          message: 'Unable to reach backend server',
          code: 'NETWORK_ERROR',
        };
        recordError(apiError);
        return false;
      }
    }
  }, [recordError, recordSuccess]);

  const resetErrorCount = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      errorCount: 0,
    }));
  }, []);

  // Auto-check connection periodically when offline
  useEffect(() => {
    if (!status.isOnline && status.errorCount > 0) {
      const interval = setInterval(() => {
        checkConnection();
      }, 30000); // Check every 30 seconds when offline

      return () => clearInterval(interval);
    }
  }, [status.isOnline, status.errorCount, checkConnection]);

  const value: BackendStatusContextValue = {
    status,
    checkConnection,
    resetErrorCount,
    recordError,
    recordSuccess,
  };

  return <BackendStatusContext.Provider value={value}>{children}</BackendStatusContext.Provider>;
}
