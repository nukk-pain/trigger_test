import { normalizeProxyError } from './openrouter-config/proxy-errors.js';

export class OpenRouterClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    async postChat(body) {
        const response = await fetch(`${this.baseURL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw normalizeProxyError(response.status, data);
        }

        return data;
    }
}
