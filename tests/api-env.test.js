import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../api/env.js';

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
});
