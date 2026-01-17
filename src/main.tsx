import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureAmplify } from './lib/aws-config';
import { AuthProvider } from './contexts/Auth';
import { WalletProvider } from './contexts/Wallet';
import { RewardsProvider } from './contexts/Rewards';
import { initializeMockData } from './mocks/seed-data';
import './index.css';
import App from './App.tsx';

configureAmplify();
initializeMockData();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        // Don't retry network errors (connection refused, timeout, etc.)
        if (error) {
          // Check for error code in object
          if (typeof error === 'object') {
            const errorObj = error as { code?: string; error?: { code?: string }; message?: string };
            const errorCode = errorObj.code || errorObj.error?.code;
            const errorMessage = (errorObj.message || '').toLowerCase();
            
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
      <AuthProvider>
        <WalletProvider>
          <RewardsProvider>
            <App />
          </RewardsProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
