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
});
