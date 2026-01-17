import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type User } from './Auth/types';
import { authService } from '../lib/auth/auth.service';
import { apiClient } from '../lib/api-client';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    console.log('[AuthProvider] Component mounted, calling checkUser');
    checkUser();
    
    return () => {
      console.log('[AuthProvider] Component unmounting');
    };
  }, []);

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
        // Set token in API client
        apiClient.setAuthToken(tokens.accessToken);
        console.log('[AuthProvider] checkUser: Token set in API client, calling getCurrentUser');

        // Try to get current user from backend
        try {
          const response = await authService.getCurrentUser();
          console.log('[AuthProvider] checkUser: getCurrentUser response:', {
            success: response.success,
            hasData: !!response.data,
            error: response.error,
          });
          if (response.success && response.data) {
            console.log('[AuthProvider] checkUser: Setting user from backend:', response.data.email);
            setUser(response.data);
          } else {
            // If backend call fails, tokens are invalid - clear everything directly
            // Don't call signOut() as it makes an API call that could fail and cause loops
            console.warn('[AuthProvider] checkUser: Failed to fetch current user, clearing auth state');
            authService.clearTokensOnly();
            apiClient.setAuthToken(null);
            console.log('[AuthProvider] checkUser: Cleared tokens, setting user=null');
            setUser(null);
          }
        } catch (err) {
          // If API call fails, tokens are invalid - clear everything directly
          // Don't call signOut() as it makes an API call that could fail and cause loops
          console.warn('[AuthProvider] checkUser: Exception fetching current user, clearing auth state:', err);
          authService.clearTokensOnly();
          apiClient.setAuthToken(null);
          console.log('[AuthProvider] checkUser: Cleared tokens (exception), setting user=null');
          setUser(null);
        }
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

      const response = await authService.signIn({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        const errorMessage = response.error?.message || 'Failed to sign in';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
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
