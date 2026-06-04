import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { handleChatRequest, resetUsage } = require('../lib/openrouter-proxy.cjs');

describe('chat proxy request validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: 'sk-or-secret',
      OPENROUTER_MODEL: 'openrouter/auto',
      OPENROUTER_BASE_URL: 'https://openrouter.test/api/v1',
      MAX_TOKENS: '800'
    };
    resetUsage();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('Given valid chat roles When proxying Then it forwards the request unchanged', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'ok' } }] })
    });
    const req = {
      body: {
        messages: [
          { role: 'system', content: 'safe' },
          { role: 'assistant', content: 'previous context' },
          { role: 'user', content: '목 통증' }
        ]
      },
      headers: { 'x-forwarded-for': '203.0.113.1' }
    };

    const result = await handleChatRequest({ req, env: process.env, fetchImpl });

    expect(result.status).toBe(200);
    const upstreamBody = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(upstreamBody.messages).toEqual(req.body.messages);
  });

  it.each([
    {
      name: 'invalid role',
      messages: [{ role: 'hacker', content: '목 통증' }]
    },
    {
      name: 'empty content',
      messages: [{ role: 'user', content: '   ' }]
    },
    {
      name: 'too many messages',
      messages: Array.from({ length: 7 }, (_, index) => ({
        role: 'user',
        content: `목 통증 ${index}`
      }))
    },
    {
      name: 'overlong content',
      messages: [{ role: 'user', content: 'x'.repeat(2001) }]
    }
  ])('Given $name When validating chat messages Then it rejects before upstream fetch', async ({ messages }) => {
    const fetchImpl = vi.fn();
    const req = {
      body: { messages },
      headers: { 'x-forwarded-for': '203.0.113.2' }
    };

    const result = await handleChatRequest({ req, env: process.env, fetchImpl });

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      code: 'CHAT_VALIDATION_FAILED'
    });
    expect(result.body.error).toContain('유효한 chat messages');
    expect(JSON.stringify(result.body)).not.toContain('sk-or-secret');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('Given upstream failure with sensitive text When proxying Then it returns a sanitized error contract', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({
        error: {
          message: 'upstream exploded with sk-or-secret and stack trace'
        }
      })
    });
    const req = {
      body: { messages: [{ role: 'user', content: '목 통증' }] },
      headers: { 'x-forwarded-for': '203.0.113.3' }
    };

    const result = await handleChatRequest({ req, env: process.env, fetchImpl });

    expect(result.status).toBe(502);
    expect(result.body).toEqual({
      error: 'AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.',
      code: 'UPSTREAM_CHAT_FAILED'
    });
    expect(JSON.stringify(result.body)).not.toContain('sk-or-secret');
    expect(JSON.stringify(result.body)).not.toContain('stack trace');
  });
});
