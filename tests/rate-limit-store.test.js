import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  checkRateLimit,
  getClientKey,
  resetUsage
} = require('../lib/openrouter-proxy.cjs');

describe('durable rate limit store adapter', () => {
  beforeEach(() => {
    resetUsage();
  });

  it('normalizes forwarded client IPs before building limiter keys', () => {
    expect(getClientKey({
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' }
    })).toBe('203.0.113.10');

    expect(getClientKey({
      headers: { 'x-forwarded-for': '   ', 'x-real-ip': '198.51.100.8' },
      socket: { remoteAddress: '127.0.0.1' }
    })).toBe('198.51.100.8');
  });

  it('keeps local and test environments on the memory store without network access', async () => {
    const fetchImpl = vi.fn();
    const req = {
      headers: { 'x-forwarded-for': '203.0.113.20' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    };

    const first = await checkRateLimit({
      NODE_ENV: 'test',
      RATE_LIMIT_STORE: 'memory',
      SERVER_RATE_LIMIT_MAX: '1',
      MONTHLY_REQUEST_LIMIT: '10'
    }, req, new Date('2026-06-01T12:00:00.000Z'), fetchImpl);
    first.record();

    const second = await checkRateLimit({
      NODE_ENV: 'test',
      RATE_LIMIT_STORE: 'memory',
      SERVER_RATE_LIMIT_MAX: '1',
      MONTHLY_REQUEST_LIMIT: '10'
    }, req, new Date('2026-06-01T12:00:00.000Z'), fetchImpl);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(second.body).toMatchObject({ exhaustedWindow: 'daily', limit: 1 });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('uses Upstash REST counters without persisting API keys or prompt text', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ result: '0' }, { result: '0' }, { result: '0' }, { result: '0' }])
      })
    const req = {
      headers: { 'x-forwarded-for': '203.0.113.30, 10.0.0.1' },
      body: { messages: [{ role: 'user', content: '민감한 목 통증 설명' }] }
    };

    const result = await checkRateLimit({
      NODE_ENV: 'production',
      RATE_LIMIT_STORE: 'upstash',
      REQUIRE_DURABLE_RATE_LIMIT: 'true',
      UPSTASH_REDIS_REST_URL: 'https://redis.example',
      UPSTASH_REDIS_REST_TOKEN: 'redis-secret',
      OPENROUTER_API_KEY: 'sk-secret',
      SERVER_RATE_LIMIT_MAX: '20',
      MONTHLY_REQUEST_LIMIT: '200',
      MAX_TOKENS: '800'
    }, req, new Date('2026-06-01T12:00:00.000Z'), fetchImpl);
    await result.record();

    expect(result.allowed).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toBe('https://redis.example/pipeline');
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer redis-secret');
    const persistedPayload = JSON.stringify(fetchImpl.mock.calls.map(call => call[1].body));
    expect(persistedPayload).toContain('203.0.113.30');
    expect(persistedPayload).not.toContain('민감한 목 통증 설명');
    expect(persistedPayload).not.toContain('sk-secret');
    expect(persistedPayload).not.toContain('redis-secret');
  });

  it('returns 429 when real-shape Upstash counters are exhausted', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ result: '21' }, { result: '21' }, { result: '1' }, { result: '1' }])
    });

    const result = await checkRateLimit({
      NODE_ENV: 'production',
      RATE_LIMIT_STORE: 'upstash',
      REQUIRE_DURABLE_RATE_LIMIT: 'true',
      UPSTASH_REDIS_REST_URL: 'https://redis.example',
      UPSTASH_REDIS_REST_TOKEN: 'redis-secret',
      SERVER_RATE_LIMIT_MAX: '20',
      MONTHLY_REQUEST_LIMIT: '200'
    }, {
      headers: { 'x-forwarded-for': '203.0.113.31' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    }, new Date('2026-06-01T12:00:00.000Z'), fetchImpl);

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(429);
    expect(result.body).toMatchObject({
      code: 'RATE_LIMIT_EXCEEDED',
      exhaustedWindow: 'daily',
      limit: 20
    });
  });

  it('fails closed when the Upstash reservation write fails', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'unavailable' })
    });

    const result = await checkRateLimit({
      NODE_ENV: 'production',
      RATE_LIMIT_STORE: 'upstash',
      REQUIRE_DURABLE_RATE_LIMIT: 'true',
      UPSTASH_REDIS_REST_URL: 'https://redis.example',
      UPSTASH_REDIS_REST_TOKEN: 'redis-secret'
    }, {
      headers: { 'x-forwarded-for': '203.0.113.32' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    }, new Date('2026-06-01T12:00:00.000Z'), fetchImpl);

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(503);
    expect(result.body.code).toBe('RATE_LIMIT_STORE_UNAVAILABLE');
  });

  it.each([
    ['command error', [{ error: 'ERR command failed' }, { result: '1' }, { result: '1' }, { result: '1' }]],
    ['missing required result', [{ result: '1' }, {}, { result: '1' }, { result: '1' }]],
    ['non-numeric counter result', [{ result: 'not-a-number' }, { result: '1' }, { result: '1' }, { result: '1' }]],
    ['truncated counter results', [{ result: '1' }, { result: '1' }]]
  ])('fails closed when Upstash returns HTTP 200 with %s', async (_label, pipelineResult) => {
    const fetchImpl = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(pipelineResult)
    });

    const result = await checkRateLimit({
      NODE_ENV: 'production',
      RATE_LIMIT_STORE: 'upstash',
      REQUIRE_DURABLE_RATE_LIMIT: 'true',
      UPSTASH_REDIS_REST_URL: 'https://redis.example',
      UPSTASH_REDIS_REST_TOKEN: 'redis-secret'
    }, {
      headers: { 'x-forwarded-for': '203.0.113.33' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    }, new Date('2026-06-01T12:00:00.000Z'), fetchImpl);

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(503);
    expect(result.body.code).toBe('RATE_LIMIT_STORE_UNAVAILABLE');
  });

  it('fails closed in production when durable Upstash configuration is missing', async () => {
    const result = await checkRateLimit({
      NODE_ENV: 'production',
      RATE_LIMIT_STORE: 'upstash',
      REQUIRE_DURABLE_RATE_LIMIT: 'true'
    }, {
      headers: { 'x-forwarded-for': '203.0.113.40' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    }, new Date('2026-06-01T12:00:00.000Z'), vi.fn());

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({
      code: 'RATE_LIMIT_STORE_UNAVAILABLE'
    });
  });

  it('fails closed in production when durable store is omitted', async () => {
    const result = await checkRateLimit({
      NODE_ENV: 'production'
    }, {
      headers: { 'x-forwarded-for': '203.0.113.41' },
      body: { messages: [{ role: 'user', content: '목 통증' }] }
    }, new Date('2026-06-01T12:00:00.000Z'), vi.fn());

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(503);
    expect(result.body.code).toBe('RATE_LIMIT_STORE_UNAVAILABLE');
  });

  it('enforces estimated daily token budget before upstream calls', async () => {
    const req = {
      headers: { 'x-forwarded-for': '203.0.113.50' },
      body: { messages: [{ role: 'user', content: 'x'.repeat(80) }] }
    };

    const result = await checkRateLimit({
      NODE_ENV: 'test',
      RATE_LIMIT_STORE: 'memory',
      SERVER_RATE_LIMIT_MAX: '20',
      MONTHLY_REQUEST_LIMIT: '200',
      MAX_TOKENS: '80',
      DAILY_TOKEN_BUDGET: '99'
    }, req, new Date('2026-06-01T12:00:00.000Z'));

    expect(result.allowed).toBe(false);
    expect(result.body).toMatchObject({
      exhaustedWindow: 'dailyTokens',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  });
});
