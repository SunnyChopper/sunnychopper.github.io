import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { initializeMockData } from '../mocks/seed-data';

const AUTH_STORAGE_KEY = 'gs_auth_user';

interface User {
  id: string;
  email: string;
  attributes?: Record<string, string>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, _password: string) => {
    try {
      setError(null);
      setLoading(true);

      const mockUser: User = {
        id: 'user-1',
        email,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);

      initializeMockData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, _password: string) => {
    try {
      setError(null);
      setLoading(true);

      const mockUser: User = {
        id: 'user-1',
        email,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);

      initializeMockData();
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
      localStorage.removeItem(AUTH_STORAGE_KEY);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
