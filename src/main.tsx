import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureAmplify } from './lib/aws-config';
import { AuthProvider } from './contexts/Auth';
import { BackendStatusProvider } from './contexts/BackendStatusContext';
import { WalletProvider } from './contexts/Wallet';
import { RewardsProvider } from './contexts/Rewards';
import './index.css';
import App from './App.tsx';

// Initialize theme synchronously before React renders
// This ensures the loader respects dark mode immediately
(function initializeTheme() {
  const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  const theme = storedTheme || 'system';

  let effectiveTheme = theme;

  if (theme === 'system') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

configureAmplify();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        // Don't retry network errors (connection refused, timeout, etc.)
        // Don't retry 4xx client errors (404, 400, etc.) - these won't succeed on retry
        if (error) {
          // Check for error code in object
          if (typeof error === 'object') {
            const errorObj = error as {
              code?: string;
              error?: { code?: string };
              message?: string;
            };
            const errorCode = errorObj.code || errorObj.error?.code;
            const errorMessage = (errorObj.message || '').toLowerCase();

            // Don't retry network errors
            if (
              errorCode === 'NETWORK_ERROR' ||
              errorCode === 'ERR_CONNECTION_REFUSED' ||
              errorCode === 'ECONNREFUSED' ||
              errorCode === 'ETIMEDOUT' ||
              errorCode === 'ERR_NETWORK' ||
              errorMessage.includes('connection refused') ||
              errorMessage.includes('econnrefused') ||
              errorMessage.includes('network error') ||
              errorMessage.includes('failed to fetch')
            ) {
              return false;
            }

            // Don't retry 4xx client errors (404, 400, 403, etc.)
            if (errorCode && /^HTTP_4\d{2}$/.test(errorCode)) {
              return false;
            }
          }

          // Check for Error object with network-related messages
          if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (
              message.includes('connection refused') ||
              message.includes('econnrefused') ||
              message.includes('network error') ||
              message.includes('failed to fetch') ||
              message.includes('timeout')
            ) {
              return false;
            }
          }

          // Check for AxiosError with 4xx status codes
          if (
            typeof error === 'object' &&
            'response' in error &&
            error.response &&
            typeof error.response === 'object' &&
            'status' in error.response
          ) {
            const status = (error.response as { status: number }).status;
            if (status >= 400 && status < 500) {
              return false; // Don't retry 4xx client errors
            }
          }
        }
        // Retry other errors once
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BackendStatusProvider>
        <AuthProvider>
          <WalletProvider>
            <RewardsProvider>
              <App />
            </RewardsProvider>
          </WalletProvider>
        </AuthProvider>
      </BackendStatusProvider>
    </QueryClientProvider>
  </StrictMode>
);
