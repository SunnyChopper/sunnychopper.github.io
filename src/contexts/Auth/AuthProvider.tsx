import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type User } from './types';
import { authService } from '@/lib/auth/auth.service';
import { apiClient } from '@/lib/api-client';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('[AuthProvider] Component mounted, calling checkUser');
    // Clear any invalid stored users (with UUID emails) before checking
    authService.clearInvalidStoredUser();
    checkUser();

    // Set up periodic token validation and proactive refresh
    // Check every minute to see if tokens need refreshing
    refreshIntervalRef.current = setInterval(async () => {
      const tokens = authService.getStoredTokens();
      if (!tokens?.accessToken) {
        return;
      }

      // Check if token is expired
      if (authService.areStoredTokensExpired()) {
        console.log('[AuthProvider] Periodic check: Token expired, refreshing');
        try {
          const refreshResponse = await authService.refreshToken();
          if (refreshResponse.success && refreshResponse.data) {
            console.log('[AuthProvider] Periodic check: Token refresh successful');
            apiClient.setAuthToken(refreshResponse.data.accessToken);
          } else {
            console.warn('[AuthProvider] Periodic check: Token refresh failed');
            authService.clearTokensOnly();
            apiClient.setAuthToken(null);
            setUser(null);
          }
        } catch (err) {
          console.warn('[AuthProvider] Periodic token refresh exception:', err);
          authService.clearTokensOnly();
          apiClient.setAuthToken(null);
          setUser(null);
        }
        return;
      }

      // Check if token should be refreshed proactively (within 5 minutes of expiration)
      if (authService.shouldRefreshTokenProactively(300)) {
        const timeUntilExpiration = authService.getTimeUntilExpiration(tokens.accessToken);
        console.log(
          `[AuthProvider] Periodic check: Token expires in ${timeUntilExpiration}s, refreshing proactively`
        );
        try {
          const refreshResponse = await authService.refreshToken();
          if (refreshResponse.success && refreshResponse.data) {
            console.log('[AuthProvider] Periodic check: Proactive token refresh successful');
            apiClient.setAuthToken(refreshResponse.data.accessToken);
          } else {
            console.warn('[AuthProvider] Periodic check: Proactive token refresh failed');
          }
        } catch (err) {
          console.warn('[AuthProvider] Proactive token refresh exception:', err);
        }
      }
    }, 60000); // Check every 60 seconds

    return () => {
      console.log('[AuthProvider] Component unmounting, clearing token check interval');
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTokenRefresh = async (): Promise<boolean> => {
    console.log('[AuthProvider] checkUser: Tokens expired, attempting refresh');
    try {
      const refreshResponse = await authService.refreshToken();
      if (refreshResponse.success && refreshResponse.data) {
        console.log('[AuthProvider] checkUser: Token refresh successful');
        apiClient.setAuthToken(refreshResponse.data.accessToken);
        return true;
      }
      console.warn('[AuthProvider] checkUser: Token refresh failed, clearing auth state');
      authService.clearTokensOnly();
      apiClient.setAuthToken(null);
      setUser(null);
      return false;
    } catch (refreshError) {
      console.warn(
        '[AuthProvider] checkUser: Token refresh exception, clearing auth state:',
        refreshError
      );
      authService.clearTokensOnly();
      apiClient.setAuthToken(null);
      setUser(null);
      return false;
    }
  };

  const handleGetCurrentUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      console.log('[AuthProvider] checkUser: getCurrentUser response:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
      });
      if (response.success && response.data) {
        console.log('[AuthProvider] checkUser: Setting user:', response.data.email);
        setUser(response.data);
      } else {
        console.warn('[AuthProvider] checkUser: Failed to fetch current user, clearing auth state');
        authService.clearTokensOnly();
        apiClient.setAuthToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn(
        '[AuthProvider] checkUser: Exception fetching current user, clearing auth state:',
        err
      );
      authService.clearTokensOnly();
      apiClient.setAuthToken(null);
      setUser(null);
    }
  };

  const checkUser = async () => {
    // Prevent multiple simultaneous checks
    if (isChecking) {
      console.log('[AuthProvider] checkUser: Already checking, skipping');
      return;
    }

    console.log('[AuthProvider] checkUser: Starting user check');
    try {
      setIsChecking(true);
      setLoading(true);
      console.log('[AuthProvider] checkUser: Set loading=true, isChecking=true');

      // Check if we have stored tokens
      const tokens = authService.getStoredTokens();
      console.log('[AuthProvider] checkUser: Tokens found?', !!tokens?.accessToken);

      if (tokens?.accessToken) {
        // Check if tokens are expired and attempt refresh if needed
        const tokensExpired = authService.areStoredTokensExpired();
        console.log('[AuthProvider] checkUser: Tokens expired?', tokensExpired);

        if (tokensExpired) {
          const refreshSuccess = await handleTokenRefresh();
          if (!refreshSuccess) {
            return;
          }
        } else {
          // Tokens are still valid, set them in API client
          console.log('[AuthProvider] checkUser: Tokens still valid, setting in API client', {
            tokenLength: tokens.accessToken.length,
            tokenPreview: `${tokens.accessToken.substring(0, 20)}...`,
          });
          apiClient.setAuthToken(tokens.accessToken);
        }

        console.log('[AuthProvider] checkUser: Token set in API client, calling getCurrentUser');
        await handleGetCurrentUser();
      } else {
        // No tokens, clear user
        console.log('[AuthProvider] checkUser: No tokens found, setting user=null');
        setUser(null);
      }
    } catch (err) {
      console.error('[AuthProvider] checkUser: Error in checkUser:', err);
      setUser(null);
    } finally {
      console.log('[AuthProvider] checkUser: Setting loading=false, isChecking=false');
      setLoading(false);
      setIsChecking(false);
    }
  };

  const handleSignIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      console.log('[AuthProvider] Calling authService.signIn');
      const response = await authService.signIn({ email, password });

      console.log('[AuthProvider] signIn response:', {
        success: response.success,
        hasData: !!response.data,
        hasError: !!response.error,
        errorMessage: response.error?.message,
      });

      if (response.success && response.data) {
        console.log('[AuthProvider] Sign in successful, setting user:', response.data.user.email);
        setUser(response.data.user);
        // Ensure token is set in API client
        if (response.data.tokens?.accessToken) {
          console.log('[AuthProvider] Setting token in API client after sign-in', {
            tokenLength: response.data.tokens.accessToken.length,
            tokenPreview: `${response.data.tokens.accessToken.substring(0, 20)}...`,
          });
          apiClient.setAuthToken(response.data.tokens.accessToken);
          console.log('[AuthProvider] Token set in API client after sign-in');
        } else {
          console.error('[AuthProvider] No access token in sign-in response!', response.data);
        }
      } else {
        const errorMessage = response.error?.message || 'Failed to sign in';
        console.error('[AuthProvider] Sign in failed:', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      console.error('[AuthProvider] Sign in exception:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.signUp({ email, password });

      if (response.success && response.data) {
        // After signup, automatically sign in
        await handleSignIn(email, password);
      } else {
        const errorMessage = response.error?.message || 'Failed to sign up';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      setLoading(true);

      await authService.signOut();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut,
    signUp: handleSignUp,
  };

  // Log state changes
  useEffect(() => {
    console.log('[AuthProvider] State changed:', {
      hasUser: !!user,
      userEmail: user?.email,
      loading,
      error,
    });
  }, [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
