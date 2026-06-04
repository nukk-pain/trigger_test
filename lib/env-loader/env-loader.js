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
        Object.keys(safeConfig).forEach(key => {
            if (/(?:API_KEY|TOKEN|SECRET|PASSWORD)$/i.test(key)) {
                delete safeConfig[key];
            }
        });
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
        return parseInt(this.get('DAILY_REQUEST_LIMIT', this.get('DAILY_LIMIT', '20')));
    }

    getMonthlyLimit() {
        return parseInt(this.get('MONTHLY_REQUEST_LIMIT', this.get('MONTHLY_LIMIT', '200')));
    }

    getModel() {
        return this.get('OPENROUTER_MODEL', '');
    }

    getMaxTokens() {
        return parseInt(this.get('MAX_TOKENS', '800'));
    }

    getTemperature() {
        return parseFloat(this.get('TEMPERATURE', '1'));
    }

    isAIQAEnabled() {
        return this.get('ENABLE_AI_QA', 'false') === 'true';
    }

    isDetailedAnalysisEnabled() {
        return this.get('ENABLE_DETAILED_ANALYSIS', 'true') === 'true';
    }
}
