import { MEDICAL_PROMPTS } from './prompts.js';
import { OpenRouterClient } from './openrouter-client.js';
import { buildChatRequestBody } from './chat-request-builder.js';
import { loadRuntimeOptions } from './openrouter-config/runtime-options.js';
import { assertUsageAllowance } from './openrouter-config/usage-allowance.js';

export class OpenRouterConfig {
    constructor() {
        this.baseURL = '/api';
        this.initialized = false;
        this.model = null;
        this.maxTokens = null;
        this.temperature = null;
        this.client = new OpenRouterClient(this.baseURL);
    }
    async initialize() {
        if (!window.envLoader) {
            throw new Error('Environment loader가 초기화되지 않았습니다.');
        }
        const options = await loadRuntimeOptions(window.envLoader);
        this.initialized = true;
        this.model = options.model;
        this.maxTokens = options.maxTokens;
        this.temperature = options.temperature;
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
            await this.client.postChat({
                messages: [{ role: 'user', content: '테스트입니다. "OK"라고만 응답해주세요.' }]
            });
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
        assertUsageAllowance(window.usageTracker, window.envLoader);
        try {
            const data = await this.client.postChat(buildChatRequestBody(messages, systemPrompt));
            window.usageTracker.recordRequest();
            return data.output || '';
        } catch (error) {
            console.error('OpenRouter API 요청 실패:', error);
            throw error;
        }
    }
    getUsageStats() {
        if (!window.usageTracker || !window.envLoader) {
            return null;
        }
        return window.usageTracker.getUsageStats(window.envLoader);
    }
    getRemainingRequests() {
        if (!window.usageTracker || !window.envLoader) {
            return 0;
        }
        return window.usageTracker.getRemainingRequests(window.envLoader);
    }
}

export { MEDICAL_PROMPTS };
