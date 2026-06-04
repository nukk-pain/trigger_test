import { describe, it, expect, beforeEach, vi } from 'vitest';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function loadBrowserModule(relativePath) {
  const url = pathToFileURL(path.join(process.cwd(), relativePath));
  url.search = `?t=${Date.now()}-${Math.random()}`;
  await import(url.href);
}

describe('runtime OpenRouter config', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete window.envLoader;
    delete window.usageTracker;
    delete window.openRouterConfig;
    delete window.MEDICAL_PROMPTS;
    globalThis.fetch = vi.fn();
  });

  it('runtime config initializes without client API key and posts standard messages to /api/chat', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          OPENROUTER_MODEL: 'openrouter/auto',
          MAX_TOKENS: 1500,
          TEMPERATURE: 0.25,
          DAILY_LIMIT: 50,
          MONTHLY_LIMIT: 1000
        }
      })
    });

    await loadBrowserModule('env-loader.js');
    await loadBrowserModule('config.js');

    await expect(window.openRouterConfig.initialize()).resolves.toBe(true);

    expect(window.envLoader.config.OPENROUTER_API_KEY).toBeUndefined();
    expect(window.openRouterConfig.isServerProxyReady()).toBe(true);
    expect(window.openRouterConfig.model).toBe('openrouter/auto');
    expect(window.MEDICAL_PROMPTS.RED_FLAG_CHECK).toContain('응급상황');

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ output: '응급상황 아님' })
    });

    await expect(
      window.openRouterConfig.makeRequest(
        [{ role: 'user', content: '통증' }],
        window.MEDICAL_PROMPTS.RED_FLAG_CHECK
      )
    ).resolves.toBe('응급상황 아님');

    const request = globalThis.fetch.mock.calls[1];
    expect(request[0]).toBe('/api/chat');
    const body = JSON.parse(request[1].body);
    expect(body.messages).toEqual([
      { role: 'system', content: window.MEDICAL_PROMPTS.RED_FLAG_CHECK },
      { role: 'user', content: '통증' }
    ]);
    expect(JSON.stringify(body)).not.toContain('OPENROUTER_API_KEY');
  });
});
