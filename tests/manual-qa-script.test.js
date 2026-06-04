import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('manual HTTP QA script', () => {
  it('documents the required API route matrix curl commands', () => {
    const script = fs.readFileSync('scripts/manual-qa-http.sh', 'utf8');

    for (const route of ['/api/env', '/api/status', '/api/chat']) {
      expect(script).toContain(route);
    }
    for (const marker of ['OPTIONS', 'GET', 'Origin: https://evil.example', 'CHAT_VALIDATION_FAILED', 'RATE_LIMIT']) {
      expect(script).toContain(marker);
    }
    expect(script).toContain('EVIDENCE_DIR="${EVIDENCE_DIR:-.omo/evidence}"');
    expect(script).toContain('task-11-env-http.txt');
    expect(script).toContain('task-11-rate-second-http.txt');
  });
});
