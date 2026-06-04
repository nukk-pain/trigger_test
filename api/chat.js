function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getOpenRouterBaseUrl() {
    return (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
}

function getPublicConfig() {
    return {
        model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
        maxTokens: parseInt(process.env.MAX_TOKENS || '1500'),
        temperature: parseFloat(process.env.TEMPERATURE || '1')
    };
}

function isValidMessage(message) {
    return message &&
        ['system', 'user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0;
}

function validateMessages(messages) {
    return Array.isArray(messages) && messages.length > 0 && messages.every(isValidMessage);
}

function buildHeaders(apiKey) {
    const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    if (process.env.OPENROUTER_SITE_URL) {
        headers['HTTP-Referer'] = process.env.OPENROUTER_SITE_URL;
    }

    if (process.env.OPENROUTER_APP_NAME) {
        headers['X-Title'] = process.env.OPENROUTER_APP_NAME;
    }

    return headers;
}

function buildRequestBody(messages) {
    const config = getPublicConfig();
    return {
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: false
    };
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { messages } = req.body || {};
    if (!validateMessages(messages)) {
        res.status(400).json({ error: '유효한 messages 배열이 필요합니다.' });
        return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        res.status(401).json({ error: 'OpenRouter API 키가 서버에 설정되지 않았습니다.' });
        return;
    }

    try {
        const response = await fetch(`${getOpenRouterBaseUrl()}/chat/completions`, {
            method: 'POST',
            headers: buildHeaders(apiKey),
            body: JSON.stringify(buildRequestBody(messages))
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const message = data.error?.message || data.error || `HTTP ${response.status}`;
            res.status(response.status).json({ error: message });
            return;
        }

        const output = data.choices?.[0]?.message?.content || '';
        res.status(200).json({ output, usage: data.usage });
    } catch (error) {
        console.error('OpenRouter API 호출 오류:', error);
        res.status(500).json({
            error: 'OpenRouter API 호출 중 오류 발생',
            details: error.message || '알 수 없는 오류'
        });
    }
}
