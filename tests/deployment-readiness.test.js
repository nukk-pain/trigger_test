import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

describe('deployment readiness files', () => {
  it('defines GitHub Actions CI on Node 22 with test, e2e, browser install, and audit gates', () => {
    const workflow = read('.github/workflows/ci.yml');

    expect(workflow).toContain('node-version: 22');
    expect(workflow).toContain('npm ci');
    expect(workflow).toContain('npx playwright install --with-deps chromium');
    expect(workflow).toContain('npm test');
    expect(workflow).toContain('npm run test:e2e');
    expect(workflow).toContain('npm audit --audit-level=high');
  });

  it('keeps Vercel config minimal without alternate route rewrites or secrets', () => {
    const config = JSON.parse(read('vercel.json'));
    const serialized = JSON.stringify(config);

    expect(config.version).toBe(2);
    expect(config.rewrites).toBeUndefined();
    expect(config.env).toBeUndefined();
    expect(serialized).not.toContain('OPENROUTER_API_KEY');
    expect(serialized).not.toContain('UPSTASH_REDIS_REST_TOKEN');
  });

  it('documents production Upstash requirements and scoped deployment target', () => {
    const readme = read('README.md');

    expect(readme).toContain('Vercel 단일 경로');
    expect(readme).toContain('RATE_LIMIT_STORE=upstash');
    expect(readme).toContain('UPSTASH_REDIS_REST_URL');
    expect(readme).toContain('UPSTASH_REDIS_REST_TOKEN');
    expect(readme).toContain('Netlify, Railway, Render, Fly');
  });
});
