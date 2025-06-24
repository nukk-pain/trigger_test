// OpenAI API 설정 및 관리 (사용량 제한 포함)

class OpenAIConfig {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1';
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

        return this.hasApiKey();
    }

    setApiKey(key) {
        // API 키 설정 금지
        throw new Error('🚫 보안 정책: API 키는 .env.local 파일에서만 설정할 수 있습니다.');
    }

    getApiKey() {
        if (window.envLoader) {
            return window.envLoader.getApiKey();
        }
        return '';
    }

    hasApiKey() {
        const apiKey = this.getApiKey();
        return apiKey && apiKey.length > 0 && apiKey.startsWith('sk-');
    }

    async testApiKey() {
        if (!this.hasApiKey()) {
            throw new Error('API 키가 설정되지 않았습니다.');
        }

        try {
            const apiKey = this.getApiKey();
            console.log('🔍 API 키 테스트 중:', `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

            const response = await fetch(`${this.baseURL}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 API 응답 상태:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API 오류 상세:', errorData);

                if (response.status === 401) {
                    throw new Error(`API 키가 유효하지 않거나 만료되었습니다. OpenAI Platform에서 새 키를 발급받아주세요.`);
                } else if (response.status === 429) {
                    throw new Error('API 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나 결제 정보를 확인해주세요.');
                } else {
                    throw new Error(`API 오류 (${response.status}): ${errorData.error?.message || '알 수 없는 오류'}`);
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
            throw new Error('OpenAI 설정이 초기화되지 않았습니다.');
        }

        if (!this.hasApiKey()) {
            throw new Error('유효한 OpenAI API 키가 필요합니다.');
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
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getApiKey()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: requestMessages,
                    max_tokens: this.maxTokens,
                    temperature: this.temperature
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();

            // 성공적인 요청 기록
            window.usageTracker.recordRequest();

            return data.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('OpenAI API 요청 실패:', error);
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
    PAIN_ANALYSIS: `당신은 15년 경력의 물리치료사이자 트리거 포인트 치료 전문가입니다.
환자의 통증을 분석하고 안전한 셀프 마사지 방법을 제안해주세요.

중요 원칙:
1. 의학적 진단은 절대 하지 않음
2. 응급상황 의심 시 즉시 병원 방문 권고
3. 안전한 방법만 제시
4. 실용적이고 이해하기 쉽게 설명

응답 형식:
**🎯 추천 셀프 마사지**
- 구체적인 부위와 방법
- 압력과 시간
- 빈도

**⚠️ 주의사항**
- 금기사항
- 언제 중단해야 하는지

**🏥 병원 방문이 필요한 경우**
- 구체적인 증상들

간결하고 실용적으로 작성해주세요.`,

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

// 전역 OpenAI 설정 인스턴스
window.openaiConfig = new OpenAIConfig();
window.MEDICAL_PROMPTS = MEDICAL_PROMPTS;