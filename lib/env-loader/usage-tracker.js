export class UsageTracker {
    constructor() {
        this.storageKey = 'pain_guide_usage';
        this.loadUsage();
    }

    loadUsage() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.usage = JSON.parse(saved);
        } else {
            this.usage = {
                daily: {},
                monthly: {},
                total: 0
            };
        }
    }

    saveUsage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.usage));
    }

    getToday() {
        return new Date().toISOString().split('T')[0];
    }

    getThisMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    getDailyUsage() {
        const today = this.getToday();
        return this.usage.daily[today] || 0;
    }

    getMonthlyUsage() {
        const thisMonth = this.getThisMonth();
        return this.usage.monthly[thisMonth] || 0;
    }

    canMakeRequest(envLoader) {
        const dailyUsage = this.getDailyUsage();
        const monthlyUsage = this.getMonthlyUsage();

        const dailyLimit = envLoader.getDailyLimit();
        const monthlyLimit = envLoader.getMonthlyLimit();

        return dailyUsage < dailyLimit && monthlyUsage < monthlyLimit;
    }

    canShowClientRequestAllowance(envLoader) {
        return this.canMakeRequest(envLoader);
    }

    recordRequest() {
        const today = this.getToday();
        const thisMonth = this.getThisMonth();

        if (!this.usage.daily[today]) {
            this.usage.daily[today] = 0;
        }
        this.usage.daily[today]++;

        if (!this.usage.monthly[thisMonth]) {
            this.usage.monthly[thisMonth] = 0;
        }
        this.usage.monthly[thisMonth]++;

        this.usage.total++;

        this.saveUsage();
        this.cleanupOldData();
    }

    cleanupOldData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

        for (const date in this.usage.daily) {
            if (date < cutoffDate) {
                delete this.usage.daily[date];
            }
        }
    }

    getUsageStats(envLoader) {
        return {
            daily: {
                used: this.getDailyUsage(),
                limit: envLoader.getDailyLimit(),
                remaining: Math.max(0, envLoader.getDailyLimit() - this.getDailyUsage())
            },
            monthly: {
                used: this.getMonthlyUsage(),
                limit: envLoader.getMonthlyLimit(),
                remaining: Math.max(0, envLoader.getMonthlyLimit() - this.getMonthlyUsage())
            },
            total: this.usage.total
        };
    }

    getRemainingRequests(envLoader) {
        const dailyRemaining = Math.max(0, envLoader.getDailyLimit() - this.getDailyUsage());
        const monthlyRemaining = Math.max(0, envLoader.getMonthlyLimit() - this.getMonthlyUsage());

        return Math.min(dailyRemaining, monthlyRemaining);
    }
}
