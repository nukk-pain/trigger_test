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

        // o1 모델은 system prompt를 지원하지 않으므로 user message에 포함
        let requestMessages;
        if (this.model.startsWith('o1-')) {
            if (systemPrompt && messages.length > 0) {
                // system prompt를 첫 번째 user message에 포함
                const firstMessage = messages[0];
                const combinedContent = `${systemPrompt}\n\n${firstMessage.content}`;
                requestMessages = [
                    { role: 'user', content: combinedContent },
                    ...messages.slice(1)
                ];
            } else if (systemPrompt) {
                requestMessages = [{ role: 'user', content: systemPrompt }];
            } else {
                requestMessages = messages;
            }
        } else {
            requestMessages = systemPrompt ?
                [{ role: 'system', content: systemPrompt }, ...messages] :
                messages;
        }

        // o1 모델용 request body
        const requestBody = this.model.startsWith('o1-') ? {
            model: this.model,
            messages: requestMessages
        } : {
            model: this.model,
            messages: requestMessages,
            max_tokens: this.maxTokens,
            temperature: this.temperature
        };

        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getApiKey()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
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

**⚠️ 매우 중요: 통증 부위와 트리거 포인트는 다릅니다!**
- 환자가 선택한 부위는 "통증을 느끼는 곳"입니다
- 하지만 마사지해야 할 곳은 "그 통증을 유발하는 트리거 포인트"입니다
- 트리거 포인트는 통증 부위와 다른 곳에 위치하는 경우가 매우 많습니다

예시:
- 목 앞쪽 통증 → 승모근 상부섬유(목 뒤쪽)를 마사지
- 어깨 통증 → 승모근 중부섬유(어깨 날개뼈 위)를 마사지  
- 두통 → 후두하근(뒤통수 아래)을 마사지

중요 원칙:
1. 의학적 진단은 절대 하지 않음
2. 응급상황 의심 시 즉시 병원 방문 권고
3. 안전한 방법만 제시
4. 실용적이고 이해하기 쉽게 설명

**필수 응답 형식:**

**🎯 트리거 포인트 위치**
- 통증을 유발하는 근육과 트리거 포인트의 정확한 해부학적 위치 (통증 부위와 다를 수 있음)
- 왜 이 트리거 포인트가 해당 부위에 통증을 유발하는지 (연관통 설명)
- 트리거 포인트가 생기는 주요 원인들

**🎯 추천 셀프 마사지**
- 트리거 포인트 위치에서의 구체적인 마사지 방법 (통증 부위가 아님!)
- 압력과 시간, 빈도
- 마사지 도구나 자세

**⚠️ 주의사항**
- 금기사항과 중단 시점

**🏥 병원 방문이 필요한 경우**
- 구체적인 위험 신호들

반드시 트리거 포인트의 정확한 위치를 명시하고, 그곳을 마사지하도록 안내하세요.`,

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