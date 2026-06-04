const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON body
app.use(express.json());

// Parse .env.local file
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env.local');
    const envConfig = {};

    try {
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');

            lines.forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    if (key && valueParts.length > 0) {
                        const value = valueParts.join('=').trim();
                        envConfig[key.trim()] = value;
                    }
                }
            });

            console.log('✅ .env.local 파일을 성공적으로 로드했습니다.');
            if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
                console.log('📊 설정된 환경변수:');
                Object.keys(envConfig).forEach(key => {
                    if (key === 'OPENROUTER_API_KEY') {
                        console.log(`   ${key}: ${envConfig[key].substring(0, 10)}...`);
                    } else {
                        console.log(`   ${key}: ${envConfig[key]}`);
                    }
                });
            }
        } else {
            console.log('⚠️ .env.local 파일이 없습니다.');
        }
    } catch (error) {
        console.error('❌ .env.local 파일 로드 실패:', error.message);
    }

    return envConfig;
}

// Load environment variables
const envConfig = { ...process.env, ...loadEnvFile() };

function getOpenRouterBaseUrl() {
    return (envConfig.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
}

function getClientConfig() {
    return {
        DAILY_REQUEST_LIMIT: envConfig.DAILY_REQUEST_LIMIT || '50',
        MONTHLY_REQUEST_LIMIT: envConfig.MONTHLY_REQUEST_LIMIT || '1000',
        OPENROUTER_MODEL: envConfig.OPENROUTER_MODEL || 'openrouter/auto',
        MAX_TOKENS: envConfig.MAX_TOKENS || '1500',
        TEMPERATURE: envConfig.TEMPERATURE || '1',
        ENABLE_AI_QA: envConfig.ENABLE_AI_QA || 'true',
        ENABLE_DETAILED_ANALYSIS: envConfig.ENABLE_DETAILED_ANALYSIS || 'true',
        OPENROUTER_SITE_URL: envConfig.OPENROUTER_SITE_URL || '',
        OPENROUTER_APP_NAME: envConfig.OPENROUTER_APP_NAME || ''
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

function buildOpenRouterHeaders() {
    const headers = {
        Authorization: `Bearer ${envConfig.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
    };

    if (envConfig.OPENROUTER_SITE_URL) {
        headers['HTTP-Referer'] = envConfig.OPENROUTER_SITE_URL;
    }

    if (envConfig.OPENROUTER_APP_NAME) {
        headers['X-Title'] = envConfig.OPENROUTER_APP_NAME;
    }

    return headers;
}

function buildOpenRouterBody(messages) {
    return {
        model: envConfig.OPENROUTER_MODEL || 'openrouter/auto',
        messages,
        max_tokens: parseInt(envConfig.MAX_TOKENS || '1500'),
        temperature: parseFloat(envConfig.TEMPERATURE || '1'),
        stream: false
    };
}

// Serve static files
app.use(express.static(__dirname));

app.get('/api/config', (req, res) => {
    res.json(getClientConfig());
});

app.get('/api/env', (req, res) => {
    const config = getClientConfig();
    res.json({
        success: true,
        data: {
            ...config,
            MAX_TOKENS: parseInt(config.MAX_TOKENS),
            TEMPERATURE: parseFloat(config.TEMPERATURE),
            DAILY_LIMIT: parseInt(config.DAILY_REQUEST_LIMIT),
            MONTHLY_LIMIT: parseInt(config.MONTHLY_REQUEST_LIMIT)
        }
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body || {};
        if (!validateMessages(messages)) {
            return res.status(400).json({ error: '유효한 messages 배열이 필요합니다.' });
        }

        if (!envConfig.OPENROUTER_API_KEY) {
            return res.status(401).json({ error: 'OpenRouter API 키가 서버에 설정되지 않았습니다.' });
        }

        const upstreamResponse = await fetch(`${getOpenRouterBaseUrl()}/chat/completions`, {
            method: 'POST',
            headers: buildOpenRouterHeaders(),
            body: JSON.stringify(buildOpenRouterBody(messages))
        });
        const data = await upstreamResponse.json().catch(() => ({}));

        if (!upstreamResponse.ok) {
            const message = data.error?.message || data.error || `HTTP ${upstreamResponse.status}`;
            return res.status(upstreamResponse.status).json({ error: message });
        }

        const responseText = data.choices?.[0]?.message?.content || '';
        if (data.usage) {
            console.log('━━━━━━━━ 토큰 사용량 ━━━━━━━━');
            console.log(`  입력 토큰: ${data.usage.prompt_tokens}`);
            console.log(`  출력 토큰: ${data.usage.completion_tokens}`);
            console.log(`  총 토큰: ${data.usage.total_tokens}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        console.log('API 응답:', responseText.substring(0, 100) + '...');
        res.json({ output: responseText, usage: data.usage });
    } catch (error) {
        console.error('OpenRouter API 호출 오류:', error);
        console.error('오류 세부 정보:', error.message);
        res.status(500).json({
            error: 'OpenRouter API 호출 중 오류 발생',
            details: error.message || '알 수 없는 오류'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 통증 가이드 도우미가 http://localhost:${port} 에서 실행 중입니다.`);

        if (envConfig.OPENROUTER_API_KEY) {
            console.log('✅ OpenRouter API 키가 설정되었습니다.');
        } else {
            console.log('⚠️ OpenRouter API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
        }
    });
}

module.exports = app;
