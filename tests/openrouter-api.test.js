import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import chatHandler from '../api/chat.js';
import envHandler from '../api/env.js';

function createResponse() {
  const response = {
    headers: {},
    statusCode: null,
    body: null,
    ended: false,
    setHeader: vi.fn((key, value) => {
      response.headers[key] = value;
    }),
    status: vi.fn(function status(code) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn(function json(payload) {
      this.body = payload;
      return this;
    }),
    end: vi.fn(function end() {
      this.ended = true;
      return this;
    })
  };
  return response;
}

describe('OpenRouter chat API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: 'sk-or-secret',
      OPENROUTER_MODEL: 'openrouter/auto',
      OPENROUTER_BASE_URL: 'https://openrouter.test/api/v1',
      OPENROUTER_SITE_URL: 'https://pain-guide.test',
      OPENROUTER_APP_NAME: 'Pain Guide Test',
      MAX_TOKENS: '1234',
      TEMPERATURE: '0.25',
      DAILY_REQUEST_LIMIT: '12',
      MONTHLY_REQUEST_LIMIT: '34'
    };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('proxies chat messages to OpenRouter without exposing the key', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'mock OpenRouter answer' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
      })
    });

    const req = {
      method: 'POST',
      body: {
        messages: [
          { role: 'system', content: 'safe' },
          { role: 'user', content: '목 통증' }
        ]
      }
    };
    const res = createResponse();

    await chatHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      output: 'mock OpenRouter answer',
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://openrouter.test/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-or-secret',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://pain-guide.test',
          'X-Title': 'Pain Guide Test'
        }),
        body: expect.any(String)
      })
    );

    const upstreamBody = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(upstreamBody).toMatchObject({
      model: 'openrouter/auto',
      messages: [
        { role: 'system', content: 'safe' },
        { role: 'user', content: '목 통증' }
      ],
      max_tokens: 1234,
      temperature: 0.25,
      stream: false
    });
    expect(JSON.stringify(res.body)).not.toContain('sk-or-secret');
  });

  it('rejects invalid messages and never exposes OpenRouter keys', async () => {
    const malformedReq = { method: 'POST', body: { messages: [] } };
    const malformedRes = createResponse();

    await chatHandler(malformedReq, malformedRes);

    expect(malformedRes.statusCode).toBe(400);
    expect(JSON.stringify(malformedRes.body)).not.toContain('sk-or-secret');
    expect(globalThis.fetch).not.toHaveBeenCalled();

    delete process.env.OPENROUTER_API_KEY;
    const missingKeyReq = {
      method: 'POST',
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    };
    const missingKeyRes = createResponse();

    await chatHandler(missingKeyReq, missingKeyRes);

    expect(missingKeyRes.statusCode).toBe(401);
    expect(JSON.stringify(missingKeyRes.body)).not.toContain('sk-or-secret');

    const envRes = createResponse();
    envHandler({ method: 'GET' }, envRes);
    expect(envRes.statusCode).toBe(200);
    expect(envRes.body.data.OPENROUTER_API_KEY).toBeUndefined();
    expect(JSON.stringify(envRes.body)).not.toContain('sk-or-secret');
  });
});
