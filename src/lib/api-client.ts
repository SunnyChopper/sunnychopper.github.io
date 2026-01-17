import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from '../types/api-contracts';
import { authService } from './auth/auth.service';
import { ROUTES } from '../routes';
import type { z } from 'zod';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor(baseUrl: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: automatically attaches JWT to all API requests
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle 401 errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log(
            '[ApiClient] 401 error detected, attempting token refresh. URL:',
            originalRequest.url
          );
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshResponse = await authService.refreshToken();

            if (refreshResponse.success && refreshResponse.data) {
              this.authToken = refreshResponse.data.accessToken;

              // Update the original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${this.authToken}`;
              }

              // Process queued requests
              this.processQueue(null);

              // Retry the original request
              return this.client(originalRequest);
            } else {
              // Refresh failed, clear tokens and redirect to login
              console.log('[ApiClient] Token refresh failed, clearing auth state');
              this.processQueue(new Error('Token refresh failed'));
              authService.clearTokensOnly();
              this.authToken = null;

              // Only redirect if not already on login page to prevent infinite loops
              if (
                typeof window !== 'undefined' &&
                window.location.pathname !== ROUTES.admin.login
              ) {
                console.log('[ApiClient] Redirecting to login page');
                window.location.href = ROUTES.admin.login;
              } else {
                console.log('[ApiClient] Already on login page, skipping redirect');
              }

              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.log('[ApiClient] Token refresh exception, clearing auth state:', refreshError);
            this.processQueue(refreshError);
            authService.clearTokensOnly();
            this.authToken = null;

            // Only redirect if not already on login page to prevent infinite loops
            if (typeof window !== 'undefined' && window.location.pathname !== ROUTES.admin.login) {
              console.log('[ApiClient] Redirecting to login page');
              window.location.href = ROUTES.admin.login;
            } else {
              console.log('[ApiClient] Already on login page, skipping redirect');
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: Error | null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        message?: string;
        code?: string;
        details?: Record<string, unknown>;
      }>;

      if (axiosError.response) {
        return {
          message: axiosError.response.data?.message || axiosError.message || 'Request failed',
          code: axiosError.response.data?.code || `HTTP_${axiosError.response.status}`,
          details: axiosError.response.data?.details,
        };
      }

      if (axiosError.request) {
        // Check for specific network error codes
        const errorCode = axiosError.code || axiosError.message;
        let networkErrorCode = 'NETWORK_ERROR';
        let networkErrorMessage = 'No response received from server';

        // Detect connection refused errors
        if (
          errorCode === 'ERR_CONNECTION_REFUSED' ||
          errorCode === 'ECONNREFUSED' ||
          errorCode?.includes('CONNECTION_REFUSED') ||
          axiosError.message?.includes('CONNECTION_REFUSED')
        ) {
          networkErrorCode = 'ERR_CONNECTION_REFUSED';
          networkErrorMessage =
            'Backend server is not responding. Please check if the server is running.';
        }
        // Detect timeout errors
        else if (
          errorCode === 'ETIMEDOUT' ||
          errorCode === 'ERR_NETWORK' ||
          errorCode?.includes('TIMEDOUT') ||
          axiosError.message?.includes('timeout')
        ) {
          networkErrorCode = 'ETIMEDOUT';
          networkErrorMessage = 'Request timed out. The server may be slow or unavailable.';
        }
        // Detect network errors
        else if (
          errorCode === 'ERR_NETWORK' ||
          errorCode?.includes('NETWORK') ||
          axiosError.message?.includes('Network Error')
        ) {
          networkErrorCode = 'NETWORK_ERROR';
          networkErrorMessage = 'Network error. Please check your internet connection.';
        }

        return {
          message: networkErrorMessage,
          code: networkErrorCode,
        };
      }
    }

    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Validates response data against a Zod schema
   * Only runs in development mode to avoid performance impact in production
   */
  private validateResponse<T>(
    data: unknown,
    schema?: z.ZodSchema<T>
  ): { valid: boolean; data?: T; error?: string } {
    if (!schema) {
      return { valid: true, data: data as T };
    }

    // Only validate in development
    if (import.meta.env.DEV) {
      const result = schema.safeParse(data);
      if (!result.success) {
        const errorMessage = `API response validation failed: ${result.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`;
        console.error('[ApiClient] Validation Error:', errorMessage, {
          errors: result.error.errors,
          data,
        });
        return { valid: false, error: errorMessage };
      }
      return { valid: true, data: result.data };
    }

    return { valid: true, data: data as T };
  }

  async get<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(endpoint);
      const backendResponse = response.data;

      // Check if backend wrapped the response
      if (backendResponse && typeof backendResponse === 'object' && 'success' in backendResponse) {
        // Validate data if schema provided and response is successful
        if (backendResponse.success && backendResponse.data && schema) {
          const validation = this.validateResponse(backendResponse.data, schema);
          if (!validation.valid) {
            return {
              success: false,
              error: {
                message: validation.error || 'Response validation failed',
                code: 'VALIDATION_ERROR',
              },
            };
          }
          return {
            ...backendResponse,
            data: validation.data,
          };
        }
        return backendResponse;
      }

      // Fallback for non-wrapped responses
      const data = backendResponse as T;
      if (schema) {
        const validation = this.validateResponse(data, schema);
        if (!validation.valid) {
          return {
            success: false,
            error: {
              message: validation.error || 'Response validation failed',
              code: 'VALIDATION_ERROR',
            },
          };
        }
        return {
          success: true,
          data: validation.data,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      // Handle error responses from backend
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiResponse<T>;
        if (
          errorData &&
          typeof errorData === 'object' &&
          'success' in errorData &&
          !errorData.success
        ) {
          return errorData;
        }
      }

      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    schema?: z.ZodSchema<T>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(endpoint, body);
      const backendResponse = response.data;

      // Check if backend wrapped the response
      if (backendResponse && typeof backendResponse === 'object' && 'success' in backendResponse) {
        // Validate data if schema provided and response is successful
        if (backendResponse.success && backendResponse.data && schema) {
          const validation = this.validateResponse(backendResponse.data, schema);
          if (!validation.valid) {
            return {
              success: false,
              error: {
                message: validation.error || 'Response validation failed',
                code: 'VALIDATION_ERROR',
              },
            };
          }
          return {
            ...backendResponse,
            data: validation.data,
          };
        }
        return backendResponse;
      }

      // Fallback for non-wrapped responses
      const data = backendResponse as T;
      if (schema) {
        const validation = this.validateResponse(data, schema);
        if (!validation.valid) {
          return {
            success: false,
            error: {
              message: validation.error || 'Response validation failed',
              code: 'VALIDATION_ERROR',
            },
          };
        }
        return {
          success: true,
          data: validation.data,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      // Handle error responses from backend
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiResponse<T>;
        if (
          errorData &&
          typeof errorData === 'object' &&
          'success' in errorData &&
          !errorData.success
        ) {
          return errorData;
        }
      }

      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  async put<T>(endpoint: string, body?: unknown, schema?: z.ZodSchema<T>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(endpoint, body);
      const backendResponse = response.data;

      // Check if backend wrapped the response
      if (backendResponse && typeof backendResponse === 'object' && 'success' in backendResponse) {
        return backendResponse;
      }

      // Fallback for non-wrapped responses
      return {
        success: true,
        data: backendResponse as T,
      };
    } catch (error) {
      // Handle error responses from backend
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiResponse<T>;
        if (
          errorData &&
          typeof errorData === 'object' &&
          'success' in errorData &&
          !errorData.success
        ) {
          return errorData;
        }
      }

      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    schema?: z.ZodSchema<T>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(endpoint, body);
      const backendResponse = response.data;

      // Check if backend wrapped the response
      if (backendResponse && typeof backendResponse === 'object' && 'success' in backendResponse) {
        return backendResponse;
      }

      // Fallback for non-wrapped responses
      return {
        success: true,
        data: backendResponse as T,
      };
    } catch (error) {
      // Handle error responses from backend
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiResponse<T>;
        if (
          errorData &&
          typeof errorData === 'object' &&
          'success' in errorData &&
          !errorData.success
        ) {
          return errorData;
        }
      }

      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  async delete<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(endpoint);
      const backendResponse = response.data;

      // Check if backend wrapped the response
      if (backendResponse && typeof backendResponse === 'object' && 'success' in backendResponse) {
        return backendResponse;
      }

      // Fallback for non-wrapped responses
      return {
        success: true,
        data: backendResponse as T,
      };
    } catch (error) {
      // Handle error responses from backend
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiResponse<T>;
        if (
          errorData &&
          typeof errorData === 'object' &&
          'success' in errorData &&
          !errorData.success
        ) {
          return errorData;
        }
      }

      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }
}

export const apiClient = new ApiClient();
