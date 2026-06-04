class OpenRouterConfig {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        if (!window.envLoader) {
            throw new Error('Environment loader가 초기화되지 않았습니다.');
        }

        await window.envLoader.loadEnv();
        this.initialized = true;

        // 환경 설정에서 값 로드
        this.model = window.envLoader.getModel();
        this.maxTokens = window.envLoader.getMaxTokens();
        this.temperature = window.envLoader.getTemperature();

        return this.isReady();
    }

    setApiKey(key) {
        // API 키 설정 금지
        throw new Error('🚫 보안 정책: API 키는 .env.local 파일에서만 설정할 수 있습니다.');
    }

    getApiKey() {
        return '';
    }

    hasApiKey() {
        return this.isReady();
    }

    isReady() {
        return this.initialized && !!this.model;
    }

    async testApiKey() {
        try {
            const response = await fetch('/api/chat', {
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
                    throw new Error('OpenRouter API 키가 서버에 설정되지 않았거나 유효하지 않습니다.');
                } else if (response.status === 429) {
                    throw new Error('API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
                } else {
                    throw new Error(`API 오류 (${response.status}): ${errorData.error || '알 수 없는 오류'}`);
                }
            }

            console.log('✅ API 키 검증 성공');
            return true;
        } catch (error) {
            console.error('🚫 API 키 테스트 실패:', error);
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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: requestMessages })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();

            // 성공적인 요청 기록
            window.usageTracker.recordRequest();

            if (data.error) {
                throw new Error(data.error);
            }

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

// 의료 전문 프롬프트 템플릿
const MEDICAL_PROMPTS = {
    PAIN_ANALYSIS: `근골격계 물리치료 전문가로서 통증 부위와 악화 상황을 분석해 셀프 마사지 방법을 안내하세요.

출력 형식:
## 타겟 근육
**주요 치료 대상:** 근육명들을 명시 (예: 승모근 상부섬유, 흉쇄유돌근, 후두하근)

## 마사지 방법
**1단계: [근육명]**
- 방법: 구체적인 마사지 방법
- 시간: 권장 시간
- 주의: 안전 주의사항

**2단계: [근육명]**
- 방법: 구체적인 마사지 방법
- 시간: 권장 시간
- 주의: 안전 주의사항

최대 4단계까지 작성

## 주의사항
⚠️ 중단 기준 및 의사 전문 진료 권유

존댓말 사용, 간결하게 작성하세요.`,

    MASSAGE_GUIDE: `트리거 포인트 마사지 전문가로서 다음 부위에 대한 구체적인 셀프 마사지 가이드를 제공해주세요.

안전 우선 원칙:
1. 과도한 압력 금지
2. 통증이 심해지면 즉시 중단
3. 관절 직접 압박 금지
4. 일반인이 안전하게 할 수 있는 방법만 제시

응답 형식:
- 단계별 마사지 방법
- 적절한 압력과 시간
- 주의해야 할 부위
- 효과를 높이는 팁`,

    RED_FLAG_CHECK: `의료 응급상황 판단 전문가로서 다음 증상들을 분석해주세요.

다음 증상 중 하나라도 해당되면 즉시 병원 방문을 권고해야 합니다:
- 발열과 함께하는 통증
- 심한 신경학적 증상 (저림, 마비, 근력약화)
- 배뇨/배변 장애
- 가슴 통증이나 호흡곤란
- 외상 후 지속되는 심한 통증

응답은 '응급상황' 또는 '일반관리' 중 하나로 시작하고, 간단한 이유를 제시해주세요.`
};

window.openRouterConfig = new OpenRouterConfig();
window.MEDICAL_PROMPTS = MEDICAL_PROMPTS;
window.openaiConfig = window.openRouterConfig;
window.geminiConfig = window.openRouterConfig;
