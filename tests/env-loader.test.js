import { describe, it, expect, beforeEach } from 'vitest';
import { EnvLoader, UsageTracker } from '../lib/env-loader.js';

describe('EnvLoader', () => {
  let envLoader;

  beforeEach(() => {
    envLoader = new EnvLoader();
  });

  describe('constructor', () => {
    it('should initialize with empty config and loaded=false', () => {
      expect(envLoader.config).toEqual({});
      expect(envLoader.loaded).toBe(false);
    });
  });

  describe('isTestEnvironment', () => {
    it('should return true for localhost', () => {
      globalThis.location.hostname = 'localhost';
      expect(envLoader.isTestEnvironment()).toBe(true);
    });

    it('should return true for 127.0.0.1', () => {
      globalThis.location.hostname = '127.0.0.1';
      expect(envLoader.isTestEnvironment()).toBe(true);
    });

    it('should return true when hostname includes localhost', () => {
      globalThis.location.hostname = 'localhost:3000';
      expect(envLoader.isTestEnvironment()).toBe(true);
    });

    it('should return true when debug=true in search params', () => {
      globalThis.location.hostname = 'example.com';
      globalThis.location.search = '?debug=true';
      expect(envLoader.isTestEnvironment()).toBe(true);
    });

    it('should return false for production hostname', () => {
      globalThis.location.hostname = 'example.com';
      globalThis.location.search = '';
      expect(envLoader.isTestEnvironment()).toBe(false);
    });
  });

  describe('parseEnvContent', () => {
    it('should parse basic key=value pairs', () => {
      envLoader.parseEnvContent('KEY1=value1\nKEY2=value2');
      expect(envLoader.config.KEY1).toBe('value1');
      expect(envLoader.config.KEY2).toBe('value2');
    });

    it('should ignore comments', () => {
      envLoader.parseEnvContent('# This is a comment\nKEY=value');
      expect(envLoader.config['# This is a comment']).toBeUndefined();
      expect(envLoader.config.KEY).toBe('value');
    });

    it('should ignore empty lines', () => {
      envLoader.parseEnvContent('KEY1=value1\n\n\nKEY2=value2');
      expect(envLoader.config.KEY1).toBe('value1');
      expect(envLoader.config.KEY2).toBe('value2');
    });

    it('should handle values with equals signs', () => {
      envLoader.parseEnvContent('KEY=value=with=equals');
      expect(envLoader.config.KEY).toBe('value=with=equals');
    });

    it('should trim whitespace from keys and values', () => {
      envLoader.parseEnvContent('  KEY  =  value  ');
      expect(envLoader.config.KEY).toBe('value');
    });
  });

  describe('get', () => {
    it('should return value for existing key', () => {
      envLoader.config.TEST_KEY = 'test_value';
      expect(envLoader.get('TEST_KEY')).toBe('test_value');
    });

    it('should return default value for missing key', () => {
      expect(envLoader.get('MISSING_KEY', 'default')).toBe('default');
    });

    it('should return null when key missing and no default', () => {
      expect(envLoader.get('MISSING_KEY')).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value and save to localStorage', () => {
      envLoader.set('NEW_KEY', 'new_value');
      expect(envLoader.config.NEW_KEY).toBe('new_value');
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getApiKey', () => {
    it('should not return API key when set', () => {
      envLoader.config.OPENROUTER_API_KEY = 'sk-test123';
      expect(envLoader.getApiKey()).toBe('');
    });

    it('should return empty string when not set', () => {
      expect(envLoader.getApiKey()).toBe('');
    });
  });

  describe('setApiKey', () => {
    it('should throw error when trying to set API key', () => {
      expect(() => envLoader.setApiKey('sk-test')).toThrow(
        'API 키는 .env.local 파일을 통해서만 설정할 수 있습니다.'
      );
    });
  });

  describe('hasApiKey', () => {
    it('should return true when server config is loaded', () => {
      envLoader.loaded = true;
      expect(envLoader.hasApiKey()).toBe(true);
    });

    it('should return false when API key is empty', () => {
      expect(envLoader.hasApiKey()).toBe(false);
    });
  });

  describe('getDailyLimit', () => {
    it('should return configured daily limit', () => {
      envLoader.config.DAILY_REQUEST_LIMIT = '100';
      expect(envLoader.getDailyLimit()).toBe(100);
    });

    it('should return default 50 when not configured', () => {
      expect(envLoader.getDailyLimit()).toBe(50);
    });
  });

  describe('getMonthlyLimit', () => {
    it('should return configured monthly limit', () => {
      envLoader.config.MONTHLY_REQUEST_LIMIT = '2000';
      expect(envLoader.getMonthlyLimit()).toBe(2000);
    });

    it('should return default 1000 when not configured', () => {
      expect(envLoader.getMonthlyLimit()).toBe(1000);
    });
  });

  describe('getModel', () => {
    it('should return configured model', () => {
      envLoader.config.OPENROUTER_MODEL = 'anthropic/claude-sonnet-4.5';
      expect(envLoader.getModel()).toBe('anthropic/claude-sonnet-4.5');
    });

    it('should return default model when not configured', () => {
      expect(envLoader.getModel()).toBe('openrouter/auto');
    });
  });

  describe('getMaxTokens', () => {
    it('should return configured max tokens', () => {
      envLoader.config.MAX_TOKENS = '4000';
      expect(envLoader.getMaxTokens()).toBe(4000);
    });

    it('should return default 1500 when not configured', () => {
      expect(envLoader.getMaxTokens()).toBe(1500);
    });
  });

  describe('getTemperature', () => {
    it('should return configured temperature', () => {
      envLoader.config.TEMPERATURE = '0.7';
      expect(envLoader.getTemperature()).toBe(0.7);
    });

    it('should return default 1 when not configured', () => {
      expect(envLoader.getTemperature()).toBe(1);
    });
  });

  describe('isAIQAEnabled', () => {
    it('should return true when enabled', () => {
      envLoader.config.ENABLE_AI_QA = 'true';
      expect(envLoader.isAIQAEnabled()).toBe(true);
    });

    it('should return false when disabled', () => {
      envLoader.config.ENABLE_AI_QA = 'false';
      expect(envLoader.isAIQAEnabled()).toBe(false);
    });

    it('should return true by default', () => {
      expect(envLoader.isAIQAEnabled()).toBe(true);
    });
  });

  describe('isDetailedAnalysisEnabled', () => {
    it('should return true when enabled', () => {
      envLoader.config.ENABLE_DETAILED_ANALYSIS = 'true';
      expect(envLoader.isDetailedAnalysisEnabled()).toBe(true);
    });

    it('should return false when disabled', () => {
      envLoader.config.ENABLE_DETAILED_ANALYSIS = 'false';
      expect(envLoader.isDetailedAnalysisEnabled()).toBe(false);
    });

    it('should return true by default', () => {
      expect(envLoader.isDetailedAnalysisEnabled()).toBe(true);
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should load config from localStorage', () => {
      const savedConfig = { DAILY_REQUEST_LIMIT: '75', OPENROUTER_MODEL: 'openrouter/auto' };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedConfig));

      envLoader.loadFromLocalStorage();

      expect(envLoader.config.DAILY_REQUEST_LIMIT).toBe('75');
      expect(envLoader.config.OPENROUTER_MODEL).toBe('openrouter/auto');
    });

    it('should not load API key from localStorage', () => {
      const savedConfig = { OPENROUTER_API_KEY: 'sk-secret', DAILY_REQUEST_LIMIT: '75' };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedConfig));

      envLoader.loadFromLocalStorage();

      expect(envLoader.config.OPENROUTER_API_KEY).toBeUndefined();
      expect(envLoader.config.DAILY_REQUEST_LIMIT).toBe('75');
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.getItem.mockReturnValue('invalid json');

      expect(() => envLoader.loadFromLocalStorage()).not.toThrow();
    });

    it('should handle null localStorage value', () => {
      localStorage.getItem.mockReturnValue(null);

      expect(() => envLoader.loadFromLocalStorage()).not.toThrow();
    });
  });

  describe('saveToLocalStorage', () => {
    it('should save config without API key', () => {
      envLoader.config = {
        OPENAI_API_KEY: 'sk-secret',
        OPENROUTER_API_KEY: 'sk-or-secret',
        DAILY_REQUEST_LIMIT: '75',
        OPENROUTER_MODEL: 'openrouter/auto'
      };

      envLoader.saveToLocalStorage();

      const savedCall = localStorage.setItem.mock.calls[0];
      const savedConfig = JSON.parse(savedCall[1]);

      expect(savedConfig.OPENAI_API_KEY).toBeUndefined();
      expect(savedConfig.OPENROUTER_API_KEY).toBeUndefined();
      expect(savedConfig.DAILY_REQUEST_LIMIT).toBe('75');
      expect(savedConfig.OPENROUTER_MODEL).toBe('openrouter/auto');
    });
  });

  describe('loadEnv', () => {
    it('should load from Vercel API first', async () => {
      const mockData = {
        OPENROUTER_MODEL: 'openrouter/auto',
        DAILY_LIMIT: 100
      };

      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData })
      });

      await envLoader.loadEnv();

      expect(envLoader.loaded).toBe(true);
      expect(envLoader.config.OPENROUTER_API_KEY).toBeUndefined();
    });

    it('should fallback to local server when Vercel fails', async () => {
      const mockConfig = { OPENROUTER_MODEL: 'openrouter/auto' };

      globalThis.fetch
        .mockRejectedValueOnce(new Error('Vercel failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockConfig)
        });

      await envLoader.loadEnv();

      expect(envLoader.config.OPENROUTER_MODEL).toBe('openrouter/auto');
    });

    it('should fallback to localStorage when both APIs fail', async () => {
      const savedConfig = { DAILY_REQUEST_LIMIT: '75' };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedConfig));

      globalThis.fetch
        .mockRejectedValueOnce(new Error('Vercel failed'))
        .mockRejectedValueOnce(new Error('Local failed'));

      await envLoader.loadEnv();

      expect(envLoader.config.DAILY_REQUEST_LIMIT).toBe('75');
    });
  });
});

describe('UsageTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new UsageTracker();
  });

  describe('constructor', () => {
    it('should initialize with default usage structure', () => {
      expect(tracker.usage).toEqual({
        daily: {},
        monthly: {},
        total: 0
      });
    });

    it('should load existing usage from localStorage', () => {
      const existingUsage = {
        daily: { '2024-01-15': 5 },
        monthly: { '2024-01': 50 },
        total: 100
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(existingUsage));

      const newTracker = new UsageTracker();

      expect(newTracker.usage).toEqual(existingUsage);
    });
  });

  describe('getToday', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const today = tracker.getToday();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getThisMonth', () => {
    it('should return month in YYYY-MM format', () => {
      const thisMonth = tracker.getThisMonth();
      expect(thisMonth).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getDailyUsage', () => {
    it('should return 0 when no usage today', () => {
      expect(tracker.getDailyUsage()).toBe(0);
    });

    it('should return correct usage for today', () => {
      const today = tracker.getToday();
      tracker.usage.daily[today] = 10;

      expect(tracker.getDailyUsage()).toBe(10);
    });
  });

  describe('getMonthlyUsage', () => {
    it('should return 0 when no usage this month', () => {
      expect(tracker.getMonthlyUsage()).toBe(0);
    });

    it('should return correct usage for this month', () => {
      const thisMonth = tracker.getThisMonth();
      tracker.usage.monthly[thisMonth] = 100;

      expect(tracker.getMonthlyUsage()).toBe(100);
    });
  });

  describe('canMakeRequest', () => {
    const mockEnvLoader = {
      getDailyLimit: () => 50,
      getMonthlyLimit: () => 1000
    };

    it('should return true when under both limits', () => {
      expect(tracker.canMakeRequest(mockEnvLoader)).toBe(true);
    });

    it('should return false when daily limit reached', () => {
      const today = tracker.getToday();
      tracker.usage.daily[today] = 50;

      expect(tracker.canMakeRequest(mockEnvLoader)).toBe(false);
    });

    it('should return false when monthly limit reached', () => {
      const thisMonth = tracker.getThisMonth();
      tracker.usage.monthly[thisMonth] = 1000;

      expect(tracker.canMakeRequest(mockEnvLoader)).toBe(false);
    });
  });

  describe('recordRequest', () => {
    it('should increment daily usage', () => {
      const today = tracker.getToday();
      tracker.recordRequest();

      expect(tracker.usage.daily[today]).toBe(1);
    });

    it('should increment monthly usage', () => {
      const thisMonth = tracker.getThisMonth();
      tracker.recordRequest();

      expect(tracker.usage.monthly[thisMonth]).toBe(1);
    });

    it('should save to localStorage', () => {
      tracker.recordRequest();

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('cleanupOldData', () => {
    it('should remove data older than 30 days', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);
      const oldDateStr = oldDate.toISOString().split('T')[0];

      tracker.usage.daily[oldDateStr] = 10;
      tracker.cleanupOldData();

      expect(tracker.usage.daily[oldDateStr]).toBeUndefined();
    });

    it('should keep data within 30 days', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);
      const recentDateStr = recentDate.toISOString().split('T')[0];

      tracker.usage.daily[recentDateStr] = 10;
      tracker.cleanupOldData();

      expect(tracker.usage.daily[recentDateStr]).toBe(10);
    });
  });

  describe('getUsageStats', () => {
    const mockEnvLoader = {
      getDailyLimit: () => 50,
      getMonthlyLimit: () => 1000
    };

    it('should return correct usage stats', () => {
      const today = tracker.getToday();
      const thisMonth = tracker.getThisMonth();
      tracker.usage.daily[today] = 10;
      tracker.usage.monthly[thisMonth] = 100;
      tracker.usage.total = 500;

      const stats = tracker.getUsageStats(mockEnvLoader);

      expect(stats.daily.used).toBe(10);
      expect(stats.daily.limit).toBe(50);
      expect(stats.daily.remaining).toBe(40);
      expect(stats.monthly.used).toBe(100);
      expect(stats.monthly.limit).toBe(1000);
      expect(stats.monthly.remaining).toBe(900);
      expect(stats.total).toBe(500);
    });
  });

  describe('getRemainingRequests', () => {
    const mockEnvLoader = {
      getDailyLimit: () => 50,
      getMonthlyLimit: () => 1000
    };

    it('should return minimum of daily and monthly remaining', () => {
      const today = tracker.getToday();
      const thisMonth = tracker.getThisMonth();
      tracker.usage.daily[today] = 30;
      tracker.usage.monthly[thisMonth] = 900;

      const remaining = tracker.getRemainingRequests(mockEnvLoader);

      expect(remaining).toBe(20);
    });
  });
});
