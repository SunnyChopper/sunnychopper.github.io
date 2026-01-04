import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from '../types/api-contracts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

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
    // TODO: This interceptor automatically attaches Cognito JWT to all API requests
    // The backend API Gateway will validate this JWT before forwarding to your backend
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; code?: string; details?: Record<string, unknown> }>;

      if (axiosError.response) {
        return {
          message: axiosError.response.data?.message || axiosError.message || 'Request failed',
          code: axiosError.response.data?.code || `HTTP_${axiosError.response.status}`,
          details: axiosError.response.data?.details,
        };
      }

      if (axiosError.request) {
        return {
          message: 'No response received from server',
          code: 'NETWORK_ERROR',
        };
      }
    }

    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(endpoint);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(endpoint, body);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(endpoint, body);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(endpoint, body);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(endpoint);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }
}

export const apiClient = new ApiClient();
