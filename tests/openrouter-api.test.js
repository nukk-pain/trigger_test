import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import chatHandler from '../api/chat.js';
import envHandler from '../api/env.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { checkRateLimit, getUsageBucket, resetUsage } = require('../lib/openrouter-proxy.cjs');

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
    resetUsage();
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

  it('rejects invalid messages without contacting OpenRouter and never exposes OpenRouter keys', async () => {
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

  it('rejects untrusted browser origins before proxying to OpenRouter', async () => {
    const req = {
      method: 'POST',
      headers: { origin: 'https://evil.example' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    };
    const res = createResponse();

    await chatHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Origin not allowed');
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('allows configured browser origins without wildcard CORS', async () => {
    process.env.ALLOWED_ORIGINS = 'https://pain-guide.test';
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'ok' } }] })
    });

    const req = {
      method: 'POST',
      headers: { origin: 'https://pain-guide.test' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    };
    const res = createResponse();

    await chatHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://pain-guide.test');
  });

  it('allows default same-origin browser requests without explicit origin config', async () => {
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.OPENROUTER_SITE_URL;
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'ok' } }] })
    });

    const req = {
      method: 'POST',
      headers: {
        origin: 'https://pain-guide.test',
        host: 'pain-guide.test'
      },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    };
    const res = createResponse();

    await chatHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://pain-guide.test');
  });

  it('enforces server-side daily request limit', async () => {
    process.env.DAILY_REQUEST_LIMIT = '1';
    process.env.SERVER_RATE_LIMIT_MAX = '1';
    process.env.SERVER_RATE_LIMIT_WINDOW_SECONDS = '60';
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'ok' } }],
        usage: { total_tokens: 1 }
      })
    });

    const req = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.10' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    };

    const first = createResponse();
    await chatHandler(req, first);

    const second = createResponse();
    await chatHandler(req, second);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(429);
    expect(second.body.error).toContain('서버 사용량 한도');
    expect(second.body).toMatchObject({
      exhaustedWindow: 'daily',
      retryAfterSeconds: 60,
      limit: 1,
      windowSeconds: 60
    });
    expect(second.headers['Retry-After']).toBe('60');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('tracks daily and monthly request windows independently', () => {
    const clientKey = '203.0.113.42';
    const juneFirst = new Date('2026-06-01T12:00:00.000Z');
    const juneSecond = new Date('2026-06-02T12:00:00.000Z');
    const julyFirst = new Date('2026-07-01T12:00:00.000Z');

    const firstDay = getUsageBucket(clientKey, juneFirst);
    firstDay.record();
    firstDay.record();

    const secondDay = getUsageBucket(clientKey, juneSecond);
    expect(secondDay.daily).toBe(0);
    expect(secondDay.monthly).toBe(2);
    secondDay.record();

    const nextMonth = getUsageBucket(clientKey, julyFirst);
    expect(nextMonth.daily).toBe(0);
    expect(nextMonth.monthly).toBe(0);
  });

  it('names daily and monthly rate-limit exhaustion windows', async () => {
    const req = { headers: { 'x-forwarded-for': '203.0.113.43' } };
    const juneFirst = new Date('2026-06-01T12:00:00.000Z');
    const juneSecond = new Date('2026-06-02T12:00:00.000Z');

    const dailyEnv = { SERVER_RATE_LIMIT_MAX: '1', MONTHLY_REQUEST_LIMIT: '10' };
    const firstDaily = await checkRateLimit(dailyEnv, req, juneFirst);
    await firstDaily.record();
    const secondDaily = await checkRateLimit(dailyEnv, req, juneFirst);
    expect(secondDaily.allowed).toBe(false);
    expect(secondDaily.body).toMatchObject({
      exhaustedWindow: 'daily',
      limit: 1
    });

    resetUsage();
    const monthlyEnv = { SERVER_RATE_LIMIT_MAX: '10', MONTHLY_REQUEST_LIMIT: '2' };
    await (await checkRateLimit(monthlyEnv, req, juneFirst)).record();
    await (await checkRateLimit(monthlyEnv, req, juneFirst)).record();
    const thirdMonthly = await checkRateLimit(monthlyEnv, req, juneSecond);
    expect(thirdMonthly.allowed).toBe(false);
    expect(thirdMonthly.body).toMatchObject({
      exhaustedWindow: 'monthly',
      limit: 2
    });
  });

  it('falls back to sane server rate-limit defaults for malformed env values', async () => {
    const req = { headers: { 'x-forwarded-for': '203.0.113.44' } };
    const result = await checkRateLimit({
      SERVER_RATE_LIMIT_MAX: 'not-a-number',
      DAILY_REQUEST_LIMIT: 'also-bad',
      MONTHLY_REQUEST_LIMIT: 'bad',
      SERVER_RATE_LIMIT_WINDOW_SECONDS: 'bad'
    }, req, new Date('2026-06-01T12:00:00.000Z'));

    expect(result.allowed).toBe(true);
    for (let i = 0; i < 20; i += 1) {
      await (await checkRateLimit({}, req, new Date('2026-06-01T12:00:00.000Z'))).record();
    }

    const exhausted = await checkRateLimit({
      SERVER_RATE_LIMIT_MAX: 'not-a-number',
      MONTHLY_REQUEST_LIMIT: 'bad',
      SERVER_RATE_LIMIT_WINDOW_SECONDS: 'bad'
    }, req, new Date('2026-06-01T12:00:00.000Z'));
    expect(exhausted.allowed).toBe(false);
    expect(exhausted.body).toMatchObject({
      exhaustedWindow: 'daily',
      limit: 20,
      retryAfterSeconds: 86400
    });
  });
});
