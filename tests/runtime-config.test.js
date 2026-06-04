import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function loadBrowserScript(relativePath) {
  const source = fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
  window.eval(source);
}

describe('runtime OpenRouter config', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete window.envLoader;
    delete window.usageTracker;
    delete window.geminiConfig;
    delete window.openaiConfig;
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

    loadBrowserScript('env-loader.js');
    loadBrowserScript('config.js');

    await expect(window.openaiConfig.initialize()).resolves.toBe(true);

    expect(window.envLoader.config.OPENROUTER_API_KEY).toBeUndefined();
    expect(window.openaiConfig.hasApiKey()).toBe(true);
    expect(window.openaiConfig.model).toBe('openrouter/auto');
    expect(window.MEDICAL_PROMPTS.RED_FLAG_CHECK).toContain('응급상황');

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ output: '응급상황 아님' })
    });

    await expect(
      window.openaiConfig.makeRequest(
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
