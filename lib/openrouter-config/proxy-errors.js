export function normalizeProxyError(status, data) {
    if (status === 401) {
        return new Error('OpenRouter 서버 프록시가 서버에 설정되지 않았거나 유효하지 않습니다.');
    }
    if (status === 429) {
        return new Error('API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    }
    return new Error(data.error?.message || data.error || `HTTP ${status}`);
}
