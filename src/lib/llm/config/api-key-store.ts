import type { LLMProvider } from './provider-types';

const API_KEY_PREFIX = 'gs_api_key_';

export function getApiKey(provider: LLMProvider): string | null {
  try {
    const key = localStorage.getItem(`${API_KEY_PREFIX}${provider}`);
    return key;
  } catch (error) {
    console.error(`Failed to get API key for ${provider}:`, error);
    return null;
  }
}

export function setApiKey(provider: LLMProvider, key: string): void {
  try {
    if (key.trim() === '') {
      localStorage.removeItem(`${API_KEY_PREFIX}${provider}`);
    } else {
      localStorage.setItem(`${API_KEY_PREFIX}${provider}`, key);
    }
  } catch (error) {
    console.error(`Failed to set API key for ${provider}:`, error);
    throw new Error(`Failed to save API key for ${provider}`);
  }
}

export function removeApiKey(provider: LLMProvider): void {
  try {
    localStorage.removeItem(`${API_KEY_PREFIX}${provider}`);
  } catch (error) {
    console.error(`Failed to remove API key for ${provider}:`, error);
  }
}

export function hasApiKey(provider: LLMProvider): boolean {
  const key = getApiKey(provider);
  return key !== null && key.trim() !== '';
}

export function getConfiguredProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [
    'anthropic',
    'openai',
    'gemini',
    'groq',
    'grok',
    'deepseek',
    'cerebras',
  ];

  return providers.filter((provider) => hasApiKey(provider));
}

export function clearAllApiKeys(): void {
  const providers: LLMProvider[] = [
    'anthropic',
    'openai',
    'gemini',
    'groq',
    'grok',
    'deepseek',
    'cerebras',
  ];

  providers.forEach((provider) => removeApiKey(provider));
}
