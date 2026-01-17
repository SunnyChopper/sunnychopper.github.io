import { apiClient } from '../api-client';
import type { ApiResponse } from '../../types/api-contracts';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

const TOKEN_STORAGE_KEY = 'gs_auth_tokens';
const USER_STORAGE_KEY = 'gs_auth_user';

/**
 * Store tokens securely in localStorage
 * In production, consider using httpOnly cookies or secure storage
 */
function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

/**
 * Retrieve stored tokens
 */
function getStoredTokens(): AuthTokens | null {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear stored tokens
 */
function clearTokens(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Store user information
 */
function storeUser(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Retrieve stored user
 */
function getStoredUser(): User | null {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(
    credentials: SignUpCredentials
  ): Promise<ApiResponse<{ userId: string; email: string; message: string }>> {
    const response = await apiClient.post<{ userId: string; email: string; message: string }>(
      '/auth/signup',
      {
        email: credentials.email,
        password: credentials.password,
      }
    );

    return response;
  },

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: User;
    }>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.success && response.data) {
      const tokens: AuthTokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      };

      storeTokens(tokens);
      storeUser(response.data.user);
      apiClient.setAuthToken(tokens.accessToken);
    }

    return response as ApiResponse<AuthResponse>;
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<ApiResponse<void>> {
    const tokens = getStoredTokens();

    // Call backend logout endpoint if we have a token
    if (tokens?.accessToken) {
      try {
        await apiClient.post<void>('/auth/logout');
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }

    // Clear local storage
    clearTokens();
    apiClient.setAuthToken(null);

    return { success: true, data: undefined };
  },

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const tokens = getStoredTokens();

    if (!tokens?.refreshToken) {
      return {
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'No refresh token available',
        },
      };
    }

    const response = await apiClient.post<{
      accessToken: string;
      refreshToken?: string;
      expiresIn: number;
    }>('/auth/refresh', {
      refreshToken: tokens.refreshToken,
    });

    if (response.success && response.data) {
      const newTokens: AuthTokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || tokens.refreshToken,
        expiresIn: response.data.expiresIn,
      };

      storeTokens(newTokens);
      apiClient.setAuthToken(newTokens.accessToken);

      return { success: true, data: newTokens };
    }

    // If refresh fails, clear tokens
    clearTokens();
    apiClient.setAuthToken(null);

    return response as ApiResponse<AuthTokens>;
  },

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<User>('/auth/me');

    if (response.success && response.data) {
      storeUser(response.data);
    }

    return response;
  },

  /**
   * Get stored tokens
   */
  getStoredTokens,

  /**
   * Get stored user
   */
  getStoredUser,

  /**
   * Check if user is authenticated (has valid tokens)
   */
  isAuthenticated(): boolean {
    const tokens = getStoredTokens();
    return !!tokens?.accessToken;
  },

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    const tokens = getStoredTokens();
    return tokens?.accessToken || null;
  },

  /**
   * Clear tokens without making an API call
   * Use this when you need to clear auth state without calling the backend
   */
  clearTokensOnly(): void {
    clearTokens();
  },
};
