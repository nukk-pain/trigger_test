import { describe, expect, it } from 'vitest';
import {
  buildChatMessages,
  buildChatRequestBody
} from '../lib/openrouter-config/request-messages.js';
import { normalizeProxyError } from '../lib/openrouter-config/proxy-errors.js';
import { assertUsageAllowance } from '../lib/openrouter-config/usage-allowance.js';

describe('OpenRouterConfig helper modules', () => {
  it('builds standard chat messages with an optional system prompt', () => {
    const messages = [{ role: 'user', content: 'test' }];

    expect(buildChatMessages(messages, 'system')).toEqual([
      { role: 'system', content: 'system' },
      { role: 'user', content: 'test' }
    ]);
    expect(buildChatRequestBody(messages)).toEqual({ messages });
  });

  it('normalizes proxy errors by status', () => {
    expect(normalizeProxyError(401, {}).message).toContain('서버 프록시');
    expect(normalizeProxyError(429, {}).message).toContain('사용량 한도');
    expect(normalizeProxyError(400, { error: { message: 'bad' } }).message).toBe('bad');
  });

  it('throws when the visible client usage allowance is exhausted', () => {
    const usageTracker = {
      canShowClientRequestAllowance: () => false,
      getRemainingRequests: () => 0
    };

    expect(() => assertUsageAllowance(usageTracker, {})).toThrow('남은 요청: 0회');
  });
});
