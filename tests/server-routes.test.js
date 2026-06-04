import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = require('../server.js');

let server;
let baseUrl;

function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, response => {
      let body = '';
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ status: response.statusCode, body });
      });
    }).on('error', reject);
  });
}

function post(path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const url = new URL(`${baseUrl}${path}`);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...extraHeaders
      }
    }, response => {
      let responseBody = '';
      response.on('data', chunk => {
        responseBody += chunk;
      });
      response.on('end', () => {
        resolve({ status: response.statusCode, body: responseBody });
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function options(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}${path}`);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'OPTIONS'
    }, response => {
      let body = '';
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ status: response.statusCode, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function method(path, httpMethod, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}${path}`);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: httpMethod,
      headers
    }, response => {
      let body = '';
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ status: response.statusCode, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

describe('local server API routes', () => {
  beforeAll(async () => {
    await new Promise(resolve => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  it('serves status from the shared payload contract without exposing secrets', async () => {
    const response = await request('/api/status');
    const payload = JSON.parse(response.body);

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.provider).toBe('openrouter');
    expect(JSON.stringify(payload)).not.toContain('OPENROUTER_API_KEY');
  });

  it('does not expose the removed /api/config route', async () => {
    const response = await request('/api/config');

    expect(response.status).toBe(404);
  });

  it('handles local chat preflight consistently with the serverless API', async () => {
    const response = await options('/api/chat');

    expect(response.status).toBe(200);
  });

  it('rejects unsupported local chat methods with 405', async () => {
    const response = await method('/api/chat', 'GET');
    const payload = JSON.parse(response.body);

    expect(response.status).toBe(405);
    expect(payload.error).toBe('Method not allowed');
  });

  it('rejects untrusted local chat origins before proxy handling', async () => {
    const response = await post('/api/chat', {
      messages: [{ role: 'user', content: '목 통증' }]
    }, { origin: 'https://evil.example' });
    const payload = JSON.parse(response.body);

    expect(response.status).toBe(403);
    expect(payload.error).toBe('Origin not allowed');
  });

  it('rejects oversized local chat JSON before proxy handling', async () => {
    const response = await post('/api/chat', {
      messages: [{ role: 'user', content: 'x'.repeat(20000) }]
    });
    const payload = JSON.parse(response.body);

    expect(response.status).toBe(413);
    expect(payload).toEqual({
      error: '요청 본문이 너무 큽니다.',
      code: 'PAYLOAD_TOO_LARGE'
    });
  });
});
