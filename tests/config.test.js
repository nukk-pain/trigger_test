import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterConfig, MEDICAL_PROMPTS } from '../lib/config.js';

describe('OpenRouterConfig', () => {
  let config;

  beforeEach(() => {
    config = new OpenRouterConfig();
    // Mock window.envLoader
    window.envLoader = {
      loadEnv: vi.fn().mockResolvedValue(true),
      getModel: vi.fn().mockReturnValue('openrouter/auto'),
      getMaxTokens: vi.fn().mockReturnValue(1500),
      getTemperature: vi.fn().mockReturnValue(1),
      getApiKey: vi.fn().mockReturnValue('')
    };
    window.usageTracker = null;
  });

  describe('constructor', () => {
    it('should initialize with correct default values', () => {
      expect(config.baseURL).toBe('/api');
      expect(config.initialized).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should throw error if envLoader not available', async () => {
      window.envLoader = null;

      await expect(config.initialize()).rejects.toThrow(
        'Environment loader가 초기화되지 않았습니다.'
      );
    });

    it('should load env and set model parameters', async () => {
      await config.initialize();

      expect(config.initialized).toBe(true);
      expect(config.model).toBe('openrouter/auto');
      expect(config.maxTokens).toBe(1500);
      expect(config.temperature).toBe(1);
    });

    it('should keep configured token limits for routed models', async () => {
      window.envLoader.getMaxTokens.mockReturnValue(4000);

      await config.initialize();

      expect(config.maxTokens).toBe(4000);
    });
  });

  describe('setApiKey', () => {
    it('should throw error when trying to set API key', () => {
      expect(() => config.setApiKey()).toThrow(
        '🚫 보안 정책: API 키는 .env.local 파일에서만 설정할 수 있습니다.'
      );
    });
  });

  describe('getApiKey', () => {
    it('should not return API key from envLoader', () => {
      window.envLoader.getApiKey.mockReturnValue('sk-test123');

      expect(config.getApiKey()).toBe('');
    });

    it('should return empty string when envLoader not available', () => {
      window.envLoader = null;

      expect(config.getApiKey()).toBe('');
    });
  });

  describe('hasApiKey', () => {
    it('should return true after server config initialization', async () => {
      await config.initialize();

      expect(config.hasApiKey()).toBe(true);
    });

    it('should return false for empty API key', () => {
      window.envLoader.getApiKey.mockReturnValue('');

      expect(config.hasApiKey()).toBeFalsy();
    });

    it('should return false for invalid API key format', () => {
      window.envLoader.getApiKey.mockReturnValue('invalid-key');

      expect(config.hasApiKey()).toBe(false);
    });
  });

  describe('testApiKey', () => {
    it('should return true when server proxy accepts a test request', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ output: 'OK' })
      });

      const result = await config.testApiKey();

      expect(result).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
    });

    it('should throw error for 401 response', async () => {
      window.envLoader.getApiKey.mockReturnValue('sk-test123');
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({})
      });

      await expect(config.testApiKey()).rejects.toThrow(
        'OpenRouter API 키가 서버에 설정되지 않았거나 유효하지 않습니다.'
      );
    });

    it('should throw error for 429 response', async () => {
      window.envLoader.getApiKey.mockReturnValue('sk-test123');
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({})
      });

      await expect(config.testApiKey()).rejects.toThrow(
        'API 사용량 한도를 초과했습니다.'
      );
    });
  });

  describe('getUsageStats', () => {
    it('should return null when usageTracker not available', () => {
      expect(config.getUsageStats()).toBeNull();
    });

    it('should return stats from usageTracker', () => {
      const mockStats = { daily: { used: 10 } };
      window.usageTracker = {
        getUsageStats: vi.fn().mockReturnValue(mockStats)
      };

      expect(config.getUsageStats()).toEqual(mockStats);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return 0 when usageTracker not available', () => {
      expect(config.getRemainingRequests()).toBe(0);
    });

    it('should return remaining from usageTracker', () => {
      window.usageTracker = {
        getRemainingRequests: vi.fn().mockReturnValue(40)
      };

      expect(config.getRemainingRequests()).toBe(40);
    });
  });
});

describe('OpenRouterConfig makeRequest', () => {
  let config;

  beforeEach(async () => {
    config = new OpenRouterConfig();
    window.envLoader = {
      loadEnv: vi.fn().mockResolvedValue(true),
      getModel: vi.fn().mockReturnValue('openrouter/auto'),
      getMaxTokens: vi.fn().mockReturnValue(1500),
      getTemperature: vi.fn().mockReturnValue(1),
      getApiKey: vi.fn().mockReturnValue('sk-test123'),
      getDailyLimit: vi.fn().mockReturnValue(50),
      getMonthlyLimit: vi.fn().mockReturnValue(1000)
    };
    window.usageTracker = {
      canMakeRequest: vi.fn().mockReturnValue(true),
      getRemainingRequests: vi.fn().mockReturnValue(40),
      recordRequest: vi.fn()
    };
    await config.initialize();
  });

  it('should throw error if not initialized', async () => {
    const newConfig = new OpenRouterConfig();
    await expect(newConfig.makeRequest([])).rejects.toThrow('OpenRouter 설정이 초기화되지 않았습니다.');
  });

  it('should throw error if usage limit reached', async () => {
    window.usageTracker.canMakeRequest.mockReturnValue(false);
    await expect(config.makeRequest([])).rejects.toThrow('일일 또는 월간 사용량 한도에 도달했습니다.');
  });

  it('should make successful request', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ output: 'Response' })
    });

    const result = await config.makeRequest([{ role: 'user', content: 'test' }]);
    expect(result).toBe('Response');
    expect(window.usageTracker.recordRequest).toHaveBeenCalled();
  });

  it('should handle API error', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Bad request' } })
    });

    await expect(config.makeRequest([{ role: 'user', content: 'test' }])).rejects.toThrow('Bad request');
  });

  it('should include system prompt for non-o4 models', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ output: 'Response' })
    });

    await config.makeRequest([{ role: 'user', content: 'test' }], 'System prompt');

    const fetchCall = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages[0].role).toBe('system');
  });

  it('should keep system prompt as a standard system message for routed models', async () => {
    window.envLoader.getModel.mockReturnValue('openrouter/auto');
    await config.initialize();

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ output: 'Response' })
    });

    await config.makeRequest([{ role: 'user', content: 'test' }], 'System prompt');

    const fetchCall = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages).toEqual([
      { role: 'system', content: 'System prompt' },
      { role: 'user', content: 'test' }
    ]);
  });

  it('should handle empty response', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ output: '' })
    });

    await expect(config.makeRequest([{ role: 'user', content: 'test' }])).resolves.toBe('');
  });
});

describe('MEDICAL_PROMPTS', () => {
  it('should have PAIN_ANALYSIS prompt', () => {
    expect(MEDICAL_PROMPTS.PAIN_ANALYSIS).toBeDefined();
    expect(MEDICAL_PROMPTS.PAIN_ANALYSIS).toContain('근골격계');
  });

  it('should have MASSAGE_GUIDE prompt', () => {
    expect(MEDICAL_PROMPTS.MASSAGE_GUIDE).toBeDefined();
    expect(MEDICAL_PROMPTS.MASSAGE_GUIDE).toContain('트리거 포인트');
  });

  it('should have RED_FLAG_CHECK prompt', () => {
    expect(MEDICAL_PROMPTS.RED_FLAG_CHECK).toBeDefined();
    expect(MEDICAL_PROMPTS.RED_FLAG_CHECK).toContain('응급상황');
  });
});
