import { afterEach, describe, expect, it, vi } from 'vitest';

describe('getResolvedWsUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('prefers explicit VITE_WS_URL in production builds (ci-dev hosted SPA)', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);
    vi.stubEnv('MODE', 'ci-dev');
    vi.stubEnv('VITE_WS_URL', 'wss://vw7fod81p6.execute-api.us-east-1.amazonaws.com/dev');
    const { getResolvedWsUrl } = await import('./vite-public-env');
    expect(getResolvedWsUrl()).toBe('wss://vw7fod81p6.execute-api.us-east-1.amazonaws.com/dev');
  });

  it('falls back to CANONICAL_PROD_WS_URL when PROD and VITE_WS_URL unset', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_WS_URL', '');
    const { getResolvedWsUrl, CANONICAL_PROD_WS_URL } = await import('./vite-public-env');
    expect(getResolvedWsUrl()).toBe(CANONICAL_PROD_WS_URL);
  });

  it('falls back to HOSTED_DEV_WS_URL in local dev when VITE_WS_URL unset', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_WS_URL', '');
    const { getResolvedWsUrl, HOSTED_DEV_WS_URL } = await import('./vite-public-env');
    expect(getResolvedWsUrl()).toBe(HOSTED_DEV_WS_URL);
  });

  it('uses explicit VITE_WS_URL in local dev when set', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_WS_URL', 'ws://localhost:8000/assistant/ws');
    const { getResolvedWsUrl } = await import('./vite-public-env');
    expect(getResolvedWsUrl()).toBe('ws://localhost:8000/assistant/ws');
  });
});
