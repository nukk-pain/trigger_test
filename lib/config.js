import { MEDICAL_PROMPTS } from './prompts.js';

export class OpenRouterConfig {
  constructor() {
    this.baseURL = '/api';
    this.initialized = false;
        this.model = null;
        this.maxTokens = null;
        this.temperature = null;
    }

    async initialize() {
        if (!window.envLoader) {
            throw new Error('Environment loader가 초기화되지 않았습니다.');
        }

        await window.envLoader.loadEnv();
        this.initialized = true;

        this.model = window.envLoader.getModel();
        this.maxTokens = window.envLoader.getMaxTokens();
        this.temperature = window.envLoader.getTemperature();

        return this.isReady();
    }

    setApiKey(_key) {
        throw new Error('🚫 보안 정책: 서버 프록시는 .env.local 파일에서만 설정할 수 있습니다.');
    }

    getApiKey() {
        return '';
    }

    isServerProxyReady() {
        return this.isReady();
    }

    isReady() {
        return this.initialized && !!this.model;
    }

    async testServerProxy() {
        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: '테스트입니다. "OK"라고만 응답해주세요.' }]
                })
            });

            console.log('📡 API 응답 상태:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API 오류 상세:', errorData);

                if (response.status === 401) {
                    throw new Error('OpenRouter 서버 프록시가 서버에 설정되지 않았거나 유효하지 않습니다.');
                } else if (response.status === 429) {
                    throw new Error('API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
                } else {
                    throw new Error(`API 오류 (${response.status}): ${errorData.error?.message || '알 수 없는 오류'}`);
                }
            }

            console.log('✅ OpenRouter 서버 프록시 검증 성공');
      return true;
        } catch (error) {
      console.error('🚫 OpenRouter 서버 프록시 테스트 실패:', error);
      throw error;
        }
    }

    async makeRequest(messages, systemPrompt = '') {
        if (!this.initialized) {
            throw new Error('OpenRouter 설정이 초기화되지 않았습니다.');
        }

        // 사용량 제한 확인
        if (!window.usageTracker.canMakeRequest(window.envLoader)) {
            const remaining = window.usageTracker.getRemainingRequests(window.envLoader);
            throw new Error(`일일 또는 월간 사용량 한도에 도달했습니다. 남은 요청: ${remaining}회`);
        }

        const requestMessages = systemPrompt ?
            [{ role: 'system', content: systemPrompt }, ...messages] :
            messages;

        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: requestMessages })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();

            // 성공적인 요청 기록
            window.usageTracker.recordRequest();

            return data.output || '';
        } catch (error) {
            console.error('OpenRouter API 요청 실패:', error);
            throw error;
        }
    }

    // 사용량 통계 가져오기
    getUsageStats() {
        if (!window.usageTracker || !window.envLoader) {
            return null;
        }
        return window.usageTracker.getUsageStats(window.envLoader);
    }

    // 남은 요청 수 확인
    getRemainingRequests() {
        if (!window.usageTracker || !window.envLoader) {
            return 0;
        }
        return window.usageTracker.getRemainingRequests(window.envLoader);
    }
}

export { MEDICAL_PROMPTS };
