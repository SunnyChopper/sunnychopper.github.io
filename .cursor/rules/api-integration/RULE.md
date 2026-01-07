---
description: "USE WHEN integrating with REST APIs, handling requests, and managing responses."
globs: ""
alwaysApply: false
---

# API Integration

Standards for API calls, error handling, and response processing.

## API Client Setup

```tsx
// lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    url += '?' + new URLSearchParams(params).toString();
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, params?: Record<string, string>) =>
    apiClient<T>(url, { method: 'GET', params }),

  post: <T>(url: string, data: unknown) =>
    apiClient<T>(url, { method: 'POST', body: JSON.stringify(data) }),

  put: <T>(url: string, data: unknown) =>
    apiClient<T>(url, { method: 'PUT', body: JSON.stringify(data) }),

  patch: <T>(url: string, data: unknown) =>
    apiClient<T>(url, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(url: string) =>
    apiClient<T>(url, { method: 'DELETE' }),
};
```

## Error Class

```tsx
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isServerError() {
    return this.status >= 500;
  }
}
```

## Service with API Client

```tsx
// services/tasks.service.ts
import { api } from '@/lib/api-client';
import type { Task, CreateTaskInput } from '@/types';

export const tasksService = {
  getAll: () => api.get<Task[]>('/tasks'),

  getById: (id: string) => api.get<Task>(`/tasks/${id}`),

  create: (data: CreateTaskInput) => api.post<Task>('/tasks', data),

  update: (id: string, data: Partial<Task>) =>
    api.patch<Task>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete<void>(`/tasks/${id}`),

  getByProject: (projectId: string) =>
    api.get<Task[]>('/tasks', { projectId }),
};
```

## Request with Authentication

```tsx
async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  // ... rest of handling
}
```

## Error Handling in Components

```tsx
function TaskList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAll,
  });

  if (error) {
    if (error instanceof ApiError) {
      if (error.isNotFound) {
        return <EmptyState message="No tasks found" />;
      }
      if (error.isServerError) {
        return <ErrorState message="Server error. Please try again." />;
      }
    }
    return <ErrorState message="Failed to load tasks" />;
  }

  // ...
}
```

## Retry Logic

```tsx
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error instanceof ApiError && error.isServerError) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
```

## Request Cancellation

```tsx
function useSearchTasks(query: string) {
  return useQuery({
    queryKey: ['tasks', 'search', query],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/tasks/search?q=${query}`, { signal });
      return response.json();
    },
    enabled: query.length >= 2,
  });
}
```

## Environment Variables

```tsx
// Always prefix with VITE_ for client-side access
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
```
