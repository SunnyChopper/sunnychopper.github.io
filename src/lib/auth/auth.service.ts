import {
  signIn,
  signUp,
  signOut,
  fetchAuthSession,
  getCurrentUser as amplifyGetCurrentUser,
} from 'aws-amplify/auth';
import type { SignUpOutput, AuthSession } from 'aws-amplify/auth';
import { apiClient } from '../api-client';
import type { ApiResponse } from '../../types/api-contracts';
import { isCognitoConfigured } from './cognito-config';

// Extended AuthTokens type that includes refreshToken for Cognito
interface CognitoAuthTokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
}

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
  refreshToken?: string; // Optional - Amplify v6 manages refresh tokens internally
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

/**
 * Decode JWT token to extract user information
 */
function decodeJWT(token: string): { sub: string; email: string; [key: string]: unknown } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
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

/**
 * Extract email from ID token, access token, or fallback to credentials
 */
function extractEmailFromTokens(
  idToken: string | undefined,
  accessToken: string,
  fallbackEmail: string
): string {
  // Try ID token first (typically contains email)
  if (idToken) {
    const decodedIdToken = decodeJWT(idToken);
    if (decodedIdToken?.email) {
      return decodedIdToken.email;
    }
  }

  // Try access token (usually doesn't have email)
  const decodedAccessToken = decodeJWT(accessToken);
  if (decodedAccessToken?.email) {
    return decodedAccessToken.email;
  }

  // Fallback to credentials email
  return fallbackEmail;
}

/**
 * Process tokens from Cognito session and create user/auth response
 */
function processSignInTokens(
  session: AuthSession,
  credentials: LoginCredentials
): { user: User; tokens: AuthTokens } | null {
  if (!session.tokens?.accessToken) {
    return null;
  }

  const accessToken = session.tokens.accessToken.toString();
  const cognitoTokens = session.tokens as unknown as CognitoAuthTokens;
  const refreshToken = cognitoTokens.refreshToken;
  const idToken = cognitoTokens.idToken;

  // Get existing refresh token from storage if not available in session
  const existingTokens = getStoredTokens();
  const storedRefreshToken = refreshToken || existingTokens?.refreshToken;

  // Decode access token to get user ID
  const decodedAccessToken = decodeJWT(accessToken);
  if (!decodedAccessToken) {
    return null;
  }

  // Extract email from tokens
  const email = extractEmailFromTokens(idToken, accessToken, credentials.email);

  // Get expiration time from token
  const exp = typeof decodedAccessToken.exp === 'number' ? decodedAccessToken.exp : null;
  const expiresIn = exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 3600;

  const tokens: AuthTokens = {
    accessToken,
    refreshToken: storedRefreshToken,
    expiresIn,
  };

  const user: User = {
    id: decodedAccessToken.sub,
    email,
    displayName: decodedAccessToken.name as string | undefined,
  };

  return { user, tokens };
}

/**
 * Check if email is valid (not a UUID/sub ID)
 */
function isValidEmail(email: string | undefined): boolean {
  if (!email || !email.includes('@')) {
    return false;
  }

  // UUIDs typically have the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(email);
  return !isUUID;
}

/**
 * Validate if stored user is still valid (token not expired, email is valid)
 */
function validateStoredUser(storedUser: User): boolean {
  const tokens = getStoredTokens();
  if (!tokens?.accessToken) {
    return false;
  }

  const decodedToken = decodeJWT(tokens.accessToken);
  if (!decodedToken) {
    return false;
  }

  const exp = decodedToken.exp;
  const isExpired = exp && typeof exp === 'number' && exp < Math.floor(Date.now() / 1000);
  if (isExpired) {
    return false;
  }

  // Check if stored user has a valid email (not a UUID/sub ID)
  if (!isValidEmail(storedUser.email)) {
    // Clear invalid stored user
    console.warn('[authService] Stored user has invalid email (UUID), clearing it');
    localStorage.removeItem(USER_STORAGE_KEY);
    return false;
  }

  return true;
}

/**
 * Fetch user from Cognito session and extract user information
 */
async function fetchUserFromCognito(): Promise<User | null> {
  // Use AWS Amplify's getCurrentUser (imported as amplifyGetCurrentUser to avoid naming conflict)
  const cognitoUser = await amplifyGetCurrentUser();
  const session: AuthSession = await fetchAuthSession({ forceRefresh: false });

  if (!session.tokens?.accessToken) {
    return null;
  }

  const accessToken = session.tokens.accessToken.toString();
  const decodedAccessToken = decodeJWT(accessToken);

  if (!decodedAccessToken) {
    return null;
  }

  // Try to get email from ID token (which typically contains email)
  const cognitoTokens = session.tokens as unknown as CognitoAuthTokens;
  const idToken = cognitoTokens.idToken;
  const fallbackEmail = cognitoUser.username; // Usually the email when email is used as username

  const email = extractEmailFromTokens(idToken, accessToken, fallbackEmail);

  return {
    id: decodedAccessToken.sub,
    email,
    displayName: decodedAccessToken.name as string | undefined,
  };
}

/**
 * Handle Cognito sign-in errors and return user-friendly messages
 */
function handleSignInError(error: unknown): { code: string; message: string } {
  if (!(error instanceof Error)) {
    return {
      code: 'SIGNIN_FAILED',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  const errorName = error.name || '';
  const errorMsg = error.message || '';

  console.log('[authService] Error details:', {
    name: errorName,
    message: errorMsg,
    stack: error.stack,
  });

  // Check for common Cognito error patterns
  if (
    errorName.includes('NotAuthorizedException') ||
    errorMsg.includes('Incorrect username or password') ||
    errorMsg.includes('not authorized') ||
    errorMsg.toLowerCase().includes('authentication failed')
  ) {
    return {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password. Please check your credentials and try again.',
    };
  }

  if (
    errorName.includes('UserNotConfirmedException') ||
    errorMsg.includes('not confirmed') ||
    errorMsg.includes('User is not confirmed')
  ) {
    return {
      code: 'USER_NOT_CONFIRMED',
      message:
        'Your email address has not been verified. Please check your inbox for a verification email.',
    };
  }

  if (
    errorName.includes('UserNotFoundException') ||
    errorMsg.includes('does not exist') ||
    errorMsg.includes('User does not exist')
  ) {
    return {
      code: 'USER_NOT_FOUND',
      message: 'No account found with this email address.',
    };
  }

  if (
    errorName.includes('TooManyRequestsException') ||
    errorMsg.includes('too many requests') ||
    errorMsg.includes('Attempt limit exceeded')
  ) {
    return {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts. Please wait a few minutes and try again.',
    };
  }

  if (errorName.includes('InvalidParameterException') || errorMsg.includes('Invalid parameter')) {
    return {
      code: 'INVALID_PARAMETER',
      message: 'Invalid email or password format. Please check your input.',
    };
  }

  if (
    errorMsg.includes('already a signed in user') ||
    errorMsg.includes('already signed in') ||
    errorMsg.includes('User is already signed in')
  ) {
    return {
      code: 'ALREADY_SIGNED_IN',
      message: 'You are already signed in. Redirecting to dashboard...',
    };
  }

  // Default error
  return {
    code: 'SIGNIN_FAILED',
    message: errorMsg || 'Failed to sign in. Please check your credentials.',
  };
}

export const authService = {
  /**
   * Sign up a new user with AWS Cognito
   */
  async signUp(
    credentials: SignUpCredentials
  ): Promise<ApiResponse<{ userId: string; email: string; message: string }>> {
    if (!isCognitoConfigured()) {
      return {
        success: false,
        error: {
          code: 'COGNITO_NOT_CONFIGURED',
          message: 'Cognito is not configured. Please check your environment variables.',
        },
      };
    }

    try {
      const result: SignUpOutput = await signUp({
        username: credentials.email,
        password: credentials.password,
        options: {
          userAttributes: {
            email: credentials.email,
          },
        },
      });

      // Cognito returns userId in the result
      return {
        success: true,
        data: {
          userId: result.userId || 'unknown',
          email: credentials.email,
          message: result.isSignUpComplete
            ? 'Account created successfully'
            : 'Account created. Please verify your email.',
        },
      };
    } catch (error) {
      // Handle Cognito-specific errors with user-friendly messages
      let errorMessage = 'Failed to sign up';
      let errorCode = 'SIGNUP_FAILED';

      if (error instanceof Error) {
        const errorName = error.name || '';
        const errorMsg = error.message || '';

        // Check for common Cognito error patterns
        if (
          errorName.includes('UsernameExistsException') ||
          errorMsg.includes('already exists') ||
          errorMsg.includes('An account with the given email already exists')
        ) {
          errorMessage =
            'An account with this email address already exists. Please sign in instead.';
          errorCode = 'USER_ALREADY_EXISTS';
        } else if (
          errorName.includes('InvalidPasswordException') ||
          errorMsg.includes('Password did not conform')
        ) {
          errorMessage =
            'Password does not meet requirements. Please use at least 8 characters with uppercase, lowercase, and numbers.';
          errorCode = 'INVALID_PASSWORD';
        } else if (
          errorName.includes('InvalidParameterException') ||
          errorMsg.includes('Invalid parameter')
        ) {
          errorMessage = 'Invalid email format. Please enter a valid email address.';
          errorCode = 'INVALID_PARAMETER';
        } else if (
          errorName.includes('TooManyRequestsException') ||
          errorMsg.includes('too many requests')
        ) {
          errorMessage = 'Too many sign-up attempts. Please wait a few minutes and try again.';
          errorCode = 'TOO_MANY_REQUESTS';
        } else {
          // Use the original error message for other errors
          errorMessage = errorMsg || 'Failed to sign up';
        }
      }

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };
    }
  },

  /**
   * Sign in with email and password using AWS Cognito
   */
  async signIn(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    if (!isCognitoConfigured()) {
      return {
        success: false,
        error: {
          code: 'COGNITO_NOT_CONFIGURED',
          message: 'Cognito is not configured. Please check your environment variables.',
        },
      };
    }

    try {
      console.log('[authService] Attempting Cognito signIn for:', credentials.email);
      await signIn({
        username: credentials.email,
        password: credentials.password,
      });

      // Fetch the auth session to get tokens
      console.log('[authService] Fetching auth session...');
      const session: AuthSession = await fetchAuthSession({ forceRefresh: false });
      console.log('[authService] Auth session:', {
        hasTokens: !!session.tokens,
        hasAccessToken: !!session.tokens?.accessToken,
      });

      // Process tokens and create user/auth response
      const result = processSignInTokens(session, credentials);
      if (!result) {
        return {
          success: false,
          error: {
            code: 'TOKEN_PROCESSING_FAILED',
            message: 'Failed to process authentication tokens',
          },
        };
      }

      const { user, tokens } = result;

      // Store tokens and user
      storeTokens(tokens);
      storeUser(user);
      apiClient.setAuthToken(tokens.accessToken);

      return {
        success: true,
        data: {
          user,
          tokens,
        },
      };
    } catch (error) {
      console.error('[authService] SignIn error:', error);
      const { code, message } = handleSignInError(error);

      return {
        success: false,
        error: {
          code,
          message,
        },
      };
    }
  },

  /**
   * Sign out the current user from AWS Cognito
   */
  async signOut(): Promise<ApiResponse<void>> {
    try {
      // Sign out from Cognito
      await signOut();
    } catch (error) {
      console.warn('Cognito sign out failed:', error);
      // Continue with local cleanup even if Cognito sign out fails
    }

    // Clear local storage
    clearTokens();
    apiClient.setAuthToken(null);

    return { success: true, data: undefined };
  },

  /**
   * Refresh the access token using AWS Cognito
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    if (!isCognitoConfigured()) {
      return {
        success: false,
        error: {
          code: 'COGNITO_NOT_CONFIGURED',
          message: 'Cognito is not configured. Please check your environment variables.',
        },
      };
    }

    try {
      // Force refresh to get new tokens
      const session: AuthSession = await fetchAuthSession({ forceRefresh: true });

      if (!session.tokens?.accessToken) {
        // If refresh fails, clear tokens
        clearTokens();
        apiClient.setAuthToken(null);
        return {
          success: false,
          error: {
            code: 'NO_ACCESS_TOKEN',
            message: 'Failed to refresh access token',
          },
        };
      }

      const accessToken = session.tokens.accessToken.toString();
      // Access refreshToken from Cognito tokens (it exists but isn't in the base AuthTokens type)
      // Note: Amplify v6 manages refresh tokens internally, so it may not be directly accessible
      const cognitoTokens = session.tokens as unknown as CognitoAuthTokens;
      const refreshToken = cognitoTokens.refreshToken;

      // Get existing refresh token from storage if not available in session
      // (Amplify manages it internally, but we store it for reference)
      const existingTokens = getStoredTokens();
      const storedRefreshToken = refreshToken || existingTokens?.refreshToken;

      // Decode JWT to get expiration time
      const decodedToken = decodeJWT(accessToken);
      const exp = decodedToken?.exp;
      const expiresIn =
        exp && typeof exp === 'number' ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 3600;

      const newTokens: AuthTokens = {
        accessToken,
        refreshToken: storedRefreshToken,
        expiresIn,
      };

      storeTokens(newTokens);
      apiClient.setAuthToken(accessToken);

      return { success: true, data: newTokens };
    } catch (error) {
      // If refresh fails, clear tokens
      clearTokens();
      apiClient.setAuthToken(null);

      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh token';
      return {
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: errorMessage,
        },
      };
    }
  },

  /**
   * Get current user from Cognito session or stored user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!isCognitoConfigured()) {
      return {
        success: false,
        error: {
          code: 'COGNITO_NOT_CONFIGURED',
          message: 'Cognito is not configured. Please check your environment variables.',
        },
      };
    }

    try {
      // First, try to get stored user (faster and more reliable)
      const storedUser = getStoredUser();
      if (storedUser && validateStoredUser(storedUser)) {
        return {
          success: true,
          data: storedUser,
        };
      }

      // If no stored user or token expired, get from Cognito
      const user = await fetchUserFromCognito();
      if (!user) {
        return {
          success: false,
          error: {
            code: 'NO_ACCESS_TOKEN',
            message: 'No access token available',
          },
        };
      }

      storeUser(user);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      // If Cognito call fails, try to return stored user as fallback (only if valid)
      const storedUser = getStoredUser();
      if (storedUser && validateStoredUser(storedUser)) {
        console.warn('[authService] getCurrentUser: Cognito call failed, using stored user');
        return {
          success: true,
          data: storedUser,
        };
      }

      // If stored user is invalid, clear it
      if (storedUser && !isValidEmail(storedUser.email)) {
        console.warn('[authService] getCurrentUser: Stored user has invalid email, clearing it');
        localStorage.removeItem(USER_STORAGE_KEY);
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to get current user';
      return {
        success: false,
        error: {
          code: 'GET_USER_FAILED',
          message: errorMessage,
        },
      };
    }
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

  /**
   * Clear stored user if it has an invalid email (UUID)
   * This forces a fresh fetch from Cognito on next getCurrentUser call
   */
  clearInvalidStoredUser(): void {
    const storedUser = getStoredUser();
    if (storedUser && !isValidEmail(storedUser.email)) {
      console.warn('[authService] Clearing stored user with invalid email:', storedUser.email);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },
};
