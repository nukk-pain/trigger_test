import { describe, it, expect, beforeEach } from 'vitest';
import { EnvLoader } from '../../lib/env-loader.js';

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
    it('should not return server proxy when set', () => {
      envLoader.config.OPENROUTER_API_KEY = 'sk-test123';
      expect(envLoader.getApiKey()).toBe('');
    });

    it('should return empty string when not set', () => {
      expect(envLoader.getApiKey()).toBe('');
    });
  });

  describe('setApiKey', () => {
    it('should throw error when trying to set server proxy', () => {
      expect(() => envLoader.setApiKey('sk-test')).toThrow(
        '서버 프록시는 .env.local 파일을 통해서만 설정할 수 있습니다.'
      );
    });
  });

  describe('isServerProxyReady', () => {
    it('should return true when server config is loaded', () => {
      envLoader.loaded = true;
      expect(envLoader.isServerProxyReady()).toBe(true);
    });

    it('should return false when server proxy is empty', () => {
      expect(envLoader.isServerProxyReady()).toBe(false);
    });
  });

  describe('getDailyLimit', () => {
    it('should return configured daily limit', () => {
      envLoader.config.DAILY_REQUEST_LIMIT = '100';
      expect(envLoader.getDailyLimit()).toBe(100);
    });

    it('should return default 20 when not configured', () => {
      expect(envLoader.getDailyLimit()).toBe(20);
    });
  });

  describe('getMonthlyLimit', () => {
    it('should return configured monthly limit', () => {
      envLoader.config.MONTHLY_REQUEST_LIMIT = '2000';
      expect(envLoader.getMonthlyLimit()).toBe(2000);
    });

    it('should return default 200 when not configured', () => {
      expect(envLoader.getMonthlyLimit()).toBe(200);
    });
  });

  describe('getModel', () => {
    it('should return configured model', () => {
      envLoader.config.OPENROUTER_MODEL = 'anthropic/claude-sonnet-4.5';
      expect(envLoader.getModel()).toBe('anthropic/claude-sonnet-4.5');
    });

    it('should return empty model when not configured', () => {
      expect(envLoader.getModel()).toBe('');
    });
  });

  describe('getMaxTokens', () => {
    it('should return configured max tokens', () => {
      envLoader.config.MAX_TOKENS = '4000';
      expect(envLoader.getMaxTokens()).toBe(4000);
    });

    it('should return default 800 when not configured', () => {
      expect(envLoader.getMaxTokens()).toBe(800);
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

    it('should return false by default', () => {
      expect(envLoader.isAIQAEnabled()).toBe(false);
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

    it('should not load server-only secrets from localStorage', () => {
      const savedConfig = {
        OPENROUTER_API_KEY: 'sk-secret',
        UPSTASH_REDIS_REST_TOKEN: 'redis-secret',
        PRIVATE_SECRET: 'secret',
        DB_PASSWORD: 'password',
        DAILY_REQUEST_LIMIT: '75'
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedConfig));

      envLoader.loadFromLocalStorage();

      expect(envLoader.config.OPENROUTER_API_KEY).toBeUndefined();
      expect(envLoader.config.UPSTASH_REDIS_REST_TOKEN).toBeUndefined();
      expect(envLoader.config.PRIVATE_SECRET).toBeUndefined();
      expect(envLoader.config.DB_PASSWORD).toBeUndefined();
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
    it('should save config without server-only secrets', () => {
      envLoader.config = {
        OPENAI_API_KEY: 'sk-secret',
        OPENROUTER_API_KEY: 'sk-or-secret',
        UPSTASH_REDIS_REST_TOKEN: 'redis-secret',
        PRIVATE_SECRET: 'secret',
        DB_PASSWORD: 'password',
        DAILY_REQUEST_LIMIT: '75',
        OPENROUTER_MODEL: 'openrouter/auto'
      };

      envLoader.saveToLocalStorage();

      const savedCall = localStorage.setItem.mock.calls[0];
      const savedConfig = JSON.parse(savedCall[1]);

      expect(savedConfig.OPENAI_API_KEY).toBeUndefined();
      expect(savedConfig.OPENROUTER_API_KEY).toBeUndefined();
      expect(savedConfig.UPSTASH_REDIS_REST_TOKEN).toBeUndefined();
      expect(savedConfig.PRIVATE_SECRET).toBeUndefined();
      expect(savedConfig.DB_PASSWORD).toBeUndefined();
      expect(savedConfig.DAILY_REQUEST_LIMIT).toBe('75');
      expect(savedConfig.OPENROUTER_MODEL).toBe('openrouter/auto');
    });
  });

  describe('loadEnv', () => {
    it('should load from Vercel API first', async () => {
      const mockData = {
        OPENROUTER_MODEL: 'openrouter/auto',
        DAILY_LIMIT: 100,
        OPENROUTER_API_KEY: 'sk-or-regression',
        OPENAI_API_KEY: 'sk-openai-regression',
        GEMINI_API_KEY: 'gemini-regression'
      };

      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData })
      });

      await envLoader.loadEnv();

      expect(envLoader.loaded).toBe(true);
      expect(envLoader.config.OPENROUTER_API_KEY).toBeUndefined();
      expect(envLoader.config.OPENAI_API_KEY).toBeUndefined();
      expect(envLoader.config.GEMINI_API_KEY).toBeUndefined();
    });

    it('should not call legacy /api/config when /api/env fails', async () => {
      const savedConfig = { DAILY_REQUEST_LIMIT: '75' };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedConfig));

      globalThis.fetch.mockRejectedValueOnce(new Error('Server failed'));

      await envLoader.loadEnv();

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/env');
      expect(envLoader.config.DAILY_REQUEST_LIMIT).toBe('75');
    });
  });
});
