export class EnvLoader {
    constructor() {
        this.config = {};
        this.loaded = false;
    }

    isTestEnvironment() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('localhost') ||
            window.location.search.includes('debug=true');
    }

    async loadEnv() {
        try {
            const response = await fetch('/api/env');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.config = { ...this.config, ...this.removeSensitiveConfig(result.data) };
                    this.loaded = true;
                    if (this.isTestEnvironment()) {
                        console.log('✅ 서버 프록시 설정을 성공적으로 로드했습니다.');
                        console.log('📊 로드된 설정:', {
                            DAILY_LIMIT: result.data.DAILY_LIMIT,
                            MONTHLY_LIMIT: result.data.MONTHLY_LIMIT,
                            OPENROUTER_MODEL: result.data.OPENROUTER_MODEL
                        });
                    }
                    return this.loaded;
                }
            }
        } catch (error) {
            console.log('⚠️ Vercel 환경변수 로드 실패, 로컬 서버에서 시도합니다.');
        }

        // localStorage에서 설정 로드 (서버 설정보다 우선순위 낮음)
        this.loadFromLocalStorage();

        return this.loaded;
    }

    parseEnvContent(content) {
        const lines = content.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim();
                    this.config[key.trim()] = value;
                }
            }
        });
    }

    loadFromLocalStorage() {
        const savedConfig = localStorage.getItem('pain_guide_config');
        if (savedConfig) {
            try {
                this.config = { ...this.config, ...this.removeSensitiveConfig(JSON.parse(savedConfig)) };
            } catch (error) {
                console.error('localStorage 설정 파싱 오류:', error);
            }
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('pain_guide_config', JSON.stringify(this.removeSensitiveConfig(this.config)));
    }

    removeSensitiveConfig(config) {
        const safeConfig = { ...(config || {}) };
        delete safeConfig.OPENROUTER_API_KEY;
        delete safeConfig.OPENAI_API_KEY;
        delete safeConfig.GEMINI_API_KEY;
        return safeConfig;
    }

    get(key, defaultValue = null) {
        return this.config[key] || defaultValue;
    }

    set(key, value) {
        this.config[key] = value;
        this.saveToLocalStorage();
    }

    getApiKey() {
        return '';
    }

    setApiKey(_key) {
        console.error('🚫 보안 정책: 서버 프록시는 .env.local 파일에서만 설정할 수 있습니다.');
        throw new Error('서버 프록시는 .env.local 파일을 통해서만 설정할 수 있습니다.');
    }

    isServerProxyReady() {
        return this.loaded;
    }

    getDailyLimit() {
        return parseInt(this.get('DAILY_REQUEST_LIMIT', '50'));
    }

    getMonthlyLimit() {
        return parseInt(this.get('MONTHLY_REQUEST_LIMIT', '1000'));
    }

    // AI 모델 설정
    getModel() {
        return this.get('OPENROUTER_MODEL', 'openrouter/auto');
    }

    getMaxTokens() {
        return parseInt(this.get('MAX_TOKENS', '1500'));
    }

    getTemperature() {
        return parseFloat(this.get('TEMPERATURE', '1'));
    }

    // 기능 활성화 여부
    isAIQAEnabled() {
        return this.get('ENABLE_AI_QA', 'true') === 'true';
    }

    isDetailedAnalysisEnabled() {
        return this.get('ENABLE_DETAILED_ANALYSIS', 'true') === 'true';
    }
}

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
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    getThisMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
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

        // 일일 사용량 증가
        if (!this.usage.daily[today]) {
            this.usage.daily[today] = 0;
        }
        this.usage.daily[today]++;

        // 월간 사용량 증가
        if (!this.usage.monthly[thisMonth]) {
            this.usage.monthly[thisMonth] = 0;
        }
        this.usage.monthly[thisMonth]++;

        // 총 사용량 증가
        this.usage.total++;

        this.saveUsage();

        // 오래된 데이터 정리 (30일 이전 일일 데이터)
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
