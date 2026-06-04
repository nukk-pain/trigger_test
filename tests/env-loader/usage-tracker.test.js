import { describe, it, expect, beforeEach } from 'vitest';
import { UsageTracker } from '../../lib/env-loader.js';

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

    it('exposes client allowance as a local display check, not the server rate limit', () => {
      expect(tracker.canShowClientRequestAllowance(mockEnvLoader)).toBe(true);
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
