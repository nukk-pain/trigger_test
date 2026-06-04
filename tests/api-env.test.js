import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../api/env.js';
import statusHandler from '../api/status.js';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { getClientEnvPayload } = require('../lib/client-config.cjs');
const { getPublicEnvPayload } = require('../lib/public-env-config.cjs');

function createResponse() {
  const response = {
    headers: {},
    statusCode: null,
    body: null,
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
    end: vi.fn()
  };
  return response;
}

describe('api/env handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: 'sk-or-secret-value',
      OPENROUTER_MODEL: 'openrouter/auto',
      MAX_TOKENS: '1500',
      DAILY_REQUEST_LIMIT: '12',
      MONTHLY_REQUEST_LIMIT: '34'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('does not expose OpenRouter API keys when returning client config', () => {
    const req = { method: 'GET' };
    const res = createResponse();

    handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.OPENROUTER_API_KEY).toBeUndefined();
    expect(res.body.data.OPENROUTER_MODEL).toBe('openrouter/auto');
    expect(JSON.stringify(res.body)).not.toContain('sk-or-secret-value');
  });

  it('uses the shared public client config payload schema', () => {
    const req = { method: 'GET' };
    const res = createResponse();

    handler(req, res);

    expect(res.body.data).toEqual(getClientEnvPayload(process.env));
    expect(res.body.data).toMatchObject({
      DAILY_REQUEST_LIMIT: '12',
      MONTHLY_REQUEST_LIMIT: '34',
      DAILY_LIMIT: 12,
      MONTHLY_LIMIT: 34,
      MAX_TOKENS: 1500,
      TEMPERATURE: 1
    });
    expect(getPublicEnvPayload(process.env)).toEqual({
      success: true,
      data: getClientEnvPayload(process.env)
    });
  });

  it('documents the MVP runtime env contract without exposing server-only secrets', () => {
    process.env = {
      ...process.env,
      UPSTASH_REDIS_REST_URL: 'https://upstash.example',
      UPSTASH_REDIS_REST_TOKEN: 'redis-secret-value',
      OPENROUTER_API_KEY: 'sk-or-secret-value'
    };

    const envExample = readFileSync('.env.example', 'utf8');
    const requiredKeys = [
      'OPENROUTER_API_KEY',
      'OPENROUTER_MODEL',
      'MAX_TOKENS=800',
      'TEMPERATURE=1',
      'DAILY_REQUEST_LIMIT=20',
      'MONTHLY_REQUEST_LIMIT=200',
      'SERVER_RATE_LIMIT_MAX=20',
      'SERVER_RATE_LIMIT_WINDOW_SECONDS=86400',
      'MAX_CHAT_MESSAGES=6',
      'MAX_CHAT_MESSAGE_CHARS=2000',
      'MAX_CHAT_BODY_BYTES=16384',
      'ENABLE_AI_QA=false',
      'ENABLE_DETAILED_ANALYSIS=true',
      'ALLOWED_ORIGINS',
      'OPENROUTER_SITE_URL',
      'OPENROUTER_APP_NAME',
      'RATE_LIMIT_STORE=memory|upstash',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'REQUIRE_DURABLE_RATE_LIMIT=true'
    ];

    requiredKeys.forEach(key => {
      expect(envExample).toContain(key);
    });

    const publicPayload = getPublicEnvPayload(process.env);
    expect(JSON.stringify(publicPayload)).not.toContain('redis-secret-value');
    expect(JSON.stringify(publicPayload)).not.toContain('sk-or-secret-value');
    expect(publicPayload.data.UPSTASH_REDIS_REST_TOKEN).toBeUndefined();
    expect(publicPayload.data.OPENROUTER_API_KEY).toBeUndefined();
  });

  it('defaults public runtime config to MVP quota and feature values', () => {
    const payload = getClientEnvPayload({});

    expect(payload).toMatchObject({
      DAILY_REQUEST_LIMIT: '20',
      MONTHLY_REQUEST_LIMIT: '200',
      DAILY_LIMIT: 20,
      MONTHLY_LIMIT: 200,
      MAX_TOKENS: 800,
      ENABLE_AI_QA: 'false'
    });
  });
});

describe('api/status handler', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('reports server proxy readiness without exposing the OpenRouter key', () => {
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: 'sk-or-secret-value',
      OPENROUTER_MODEL: 'openrouter/auto',
      DAILY_REQUEST_LIMIT: '7',
      MONTHLY_REQUEST_LIMIT: '70',
      SERVER_RATE_LIMIT_MAX: '3',
      SERVER_RATE_LIMIT_WINDOW_SECONDS: '60',
      NODE_ENV: 'test'
    };

    const req = { method: 'GET' };
    const res = createResponse();

    statusHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.proxyReady).toBe(true);
    expect(res.body.data.proxyConfigured).toBe(true);
    expect(res.body.data.provider).toBe('openrouter');
    expect(res.body.data.limits).toEqual({ daily: 7, monthly: 70 });
    expect(res.body.data.rateLimit).toEqual({ limit: 3, windowSeconds: 60 });
    expect(res.body.data.environment).toBe('test');
    expect(JSON.stringify(res.body)).not.toContain('sk-or-secret-value');
  });
});
