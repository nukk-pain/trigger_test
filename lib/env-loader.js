// Environment 변수 로더 및 설정 관리 (모듈화 버전)

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
            // Vercel API 엔드포인트에서 환경변수 로드 시도
            const response = await fetch('/api/env');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.config = { ...this.config, ...result.data };
                    this.loaded = true;
                    if (this.isTestEnvironment()) {
                        console.log('✅ Vercel에서 환경변수를 성공적으로 로드했습니다.');
                        console.log('📊 로드된 설정:', {
                            OPENAI_API_KEY: result.data.OPENAI_API_KEY ? `${result.data.OPENAI_API_KEY.substring(0, 10)}...` : '없음',
                            DAILY_LIMIT: result.data.DAILY_LIMIT,
                            MONTHLY_LIMIT: result.data.MONTHLY_LIMIT,
                            OPENAI_MODEL: result.data.OPENAI_MODEL
                        });
                    }
                    return this.loaded || this.hasApiKey();
                }
            }
        } catch (error) {
            console.log('⚠️ Vercel 환경변수 로드 실패, 로컬 서버에서 시도합니다.');
        }

        try {
            // 로컬 개발 서버에서 환경변수 로드 시도
            const response = await fetch('/api/config');
            if (response.ok) {
                const serverConfig = await response.json();
                this.config = { ...this.config, ...serverConfig };
                this.loaded = true;
                if (this.isTestEnvironment()) {
                    console.log('✅ 로컬 서버에서 환경변수를 성공적으로 로드했습니다.');
                    console.log('📊 로드된 설정:', {
                        OPENAI_API_KEY: serverConfig.OPENAI_API_KEY ? `${serverConfig.OPENAI_API_KEY.substring(0, 10)}...` : '없음',
                        DAILY_REQUEST_LIMIT: serverConfig.DAILY_REQUEST_LIMIT,
                        MONTHLY_REQUEST_LIMIT: serverConfig.MONTHLY_REQUEST_LIMIT,
                        OPENAI_MODEL: serverConfig.OPENAI_MODEL
                    });
                }
            } else {
                console.warn('⚠️ 서버 환경변수를 로드할 수 없습니다. 로컬 설정을 사용합니다.');
            }
        } catch (error) {
            console.warn('⚠️ 서버 환경변수 로드 실패:', error.message);
            console.log('💡 정적 파일 서버를 사용 중입니다. Node.js 서버를 사용하려면 "npm start"를 실행하세요.');
        }

        // localStorage에서 설정 로드 (서버 설정보다 우선순위 낮음)
        this.loadFromLocalStorage();

        return this.loaded || this.hasApiKey();
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
        // 비API 키 설정만 localStorage에서 로드
        const savedConfig = localStorage.getItem('pain_guide_config');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                // API 키는 제외하고 다른 설정만 로드
                delete parsed.OPENAI_API_KEY;
                this.config = { ...this.config, ...parsed };
            } catch (error) {
                console.error('localStorage 설정 파싱 오류:', error);
            }
        }
    }

    saveToLocalStorage() {
        // API 키는 절대 저장하지 않음
        const safeConfig = { ...this.config };
        delete safeConfig.OPENAI_API_KEY;

        localStorage.setItem('pain_guide_config', JSON.stringify(safeConfig));
    }

    get(key, defaultValue = null) {
        return this.config[key] || defaultValue;
    }

    set(key, value) {
        this.config[key] = value;
        this.saveToLocalStorage();
    }

    getApiKey() {
        // .env.local에서만 API 키 로드
        return this.config.OPENAI_API_KEY || '';
    }

    setApiKey(_key) {
        // API 키 설정 금지 - .env.local에서만 로드
        console.error('🚫 보안 정책: API 키는 .env.local 파일에서만 설정할 수 있습니다.');
        throw new Error('API 키는 .env.local 파일을 통해서만 설정할 수 있습니다.');
    }

    hasApiKey() {
        return !!this.getApiKey();
    }

    // 사용량 제한 관련
    getDailyLimit() {
        return parseInt(this.get('DAILY_REQUEST_LIMIT', '50'));
    }

    getMonthlyLimit() {
        return parseInt(this.get('MONTHLY_REQUEST_LIMIT', '1000'));
    }

    // AI 모델 설정
    getModel() {
        return this.get('OPENAI_MODEL', 'o4-mini-2025-04-16');
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

// 사용량 추적 및 제한 관리
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
