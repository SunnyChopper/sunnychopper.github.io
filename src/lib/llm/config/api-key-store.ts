import type { LLMProvider } from './provider-types';
import { apiClient } from '@/lib/api-client';

// Cache for API keys to avoid repeated API calls
let apiKeysCache: Record<LLMProvider, string> | null = null;
let cacheLoadPromise: Promise<Record<LLMProvider, string>> | null = null;

async function loadApiKeys(): Promise<Record<LLMProvider, string>> {
  if (apiKeysCache !== null) {
    return apiKeysCache;
  }

  // If already loading, return the existing promise
  if (cacheLoadPromise !== null) {
    return cacheLoadPromise;
  }

  cacheLoadPromise = (async () => {
    try {
      const response = await apiClient.getApiKeys();
      if (response.success && response.data) {
        apiKeysCache = response.data;
        return apiKeysCache;
      }
      return {} as Record<LLMProvider, string>;
    } catch (error) {
      console.error('Failed to load API keys from backend:', error);
      return {} as Record<LLMProvider, string>;
    } finally {
      cacheLoadPromise = null;
    }
  })();

  return cacheLoadPromise;
}

function invalidateCache(): void {
  apiKeysCache = null;
  cacheLoadPromise = null;
}

// Async version - always fetches from backend
export async function getApiKey(provider: LLMProvider): Promise<string | null> {
  try {
    const keys = await loadApiKeys();
    const key = keys[provider];
    return key && key.trim() !== '' ? key : null;
  } catch (error) {
    console.error(`Failed to get API key for ${provider}:`, error);
    return null;
  }
}

// Synchronous version for backward compatibility (returns cached value or null)
export function getApiKeySync(provider: LLMProvider): string | null {
  if (apiKeysCache === null) {
    // Try to trigger async load in background
    loadApiKeys().catch(() => {
      // Silently fail - will be retried on next access
    });
    return null;
  }
  const key = apiKeysCache[provider];
  return key && key.trim() !== '' ? key : null;
}

export async function setApiKey(provider: LLMProvider, key: string): Promise<void> {
  try {
    if (key.trim() === '') {
      await apiClient.deleteApiKey(provider);
    } else {
      const response = await apiClient.setApiKey(provider, key);
      if (!response.success) {
        throw new Error(response.error?.message || `Failed to save API key for ${provider}`);
      }
    }
    invalidateCache();
    // Reload cache after update
    await loadApiKeys();
  } catch (error) {
    console.error(`Failed to set API key for ${provider}:`, error);
    throw error instanceof Error ? error : new Error(`Failed to save API key for ${provider}`);
  }
}

export async function removeApiKey(provider: LLMProvider): Promise<void> {
  try {
    const response = await apiClient.deleteApiKey(provider);
    if (!response.success) {
      console.error(`Failed to remove API key for ${provider}:`, response.error);
    }
    invalidateCache();
    // Reload cache after update
    await loadApiKeys();
  } catch (error) {
    console.error(`Failed to remove API key for ${provider}:`, error);
  }
}

// Async version
export async function hasApiKey(provider: LLMProvider): Promise<boolean> {
  const key = await getApiKey(provider);
  return key !== null && key.trim() !== '';
}

// Synchronous version for backward compatibility
export function hasApiKeySync(provider: LLMProvider): boolean {
  const key = getApiKeySync(provider);
  return key !== null && key.trim() !== '';
}

export async function getConfiguredProviders(): Promise<LLMProvider[]> {
  const providers: LLMProvider[] = [
    'anthropic',
    'openai',
    'gemini',
    'groq',
    'grok',
    'deepseek',
    'cerebras',
  ];

  const keys = await loadApiKeys();
  return providers.filter((provider) => keys[provider] && keys[provider].trim() !== '');
}

// Synchronous version for backward compatibility
export function getConfiguredProvidersSync(): LLMProvider[] {
  if (apiKeysCache === null) {
    // Try to trigger async load in background
    loadApiKeys().catch(() => {
      // Silently fail - will be retried on next access
    });
    return [];
  }

  const providers: LLMProvider[] = [
    'anthropic',
    'openai',
    'gemini',
    'groq',
    'grok',
    'deepseek',
    'cerebras',
  ];

  return providers.filter(
    (provider) => apiKeysCache![provider] && apiKeysCache![provider].trim() !== ''
  );
}

export async function clearAllApiKeys(): Promise<void> {
  const providers: LLMProvider[] = [
    'anthropic',
    'openai',
    'gemini',
    'groq',
    'grok',
    'deepseek',
    'cerebras',
  ];

  await Promise.all(providers.map((provider) => removeApiKey(provider)));
}
