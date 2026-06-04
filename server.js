const express = require('express');
const fs = require('fs');
const path = require('path');
const { handleChatRequest } = require('./lib/openrouter-proxy.cjs');
const { getPublicEnvPayload } = require('./lib/public-env-config.cjs');
const { getStatusPayload } = require('./lib/server-status.cjs');

const app = express();
const port = process.env.PORT || 3000;

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
                    if (isSensitiveEnvKey(key)) {
                        console.log(`   ${key}: [REDACTED]`);
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

function isSensitiveEnvKey(key) {
    return /(?:API_KEY|TOKEN|SECRET|PASSWORD)$/i.test(key);
}

// Load environment variables
const envConfig = { ...process.env, ...loadEnvFile() };

function parsePositiveInteger(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// Parse JSON body
app.use(express.json({ limit: parsePositiveInteger(envConfig.MAX_CHAT_BODY_BYTES, 16384) }));

app.use((error, req, res, next) => {
    if (error?.type === 'entity.too.large' || error?.status === 413) {
        res.status(413).json({
            error: '요청 본문이 너무 큽니다.',
            code: 'PAYLOAD_TOO_LARGE'
        });
        return;
    }
    next(error);
});

// Serve static files
app.use(express.static(__dirname));

function getAllowedOrigins(env) {
    return new Set([
        ...(env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean),
        env.OPENROUTER_SITE_URL
    ].filter(Boolean));
}

function isSameOriginRequest(origin, headers = {}) {
    const host = headers.host || headers['x-forwarded-host'];
    if (!host) return false;

    try {
        return new URL(origin).host === host;
    } catch (_error) {
        return false;
    }
}

function isChatOriginAllowed(req) {
    const origin = req.headers?.origin;
    if (!origin) return true;
    return getAllowedOrigins(envConfig).has(origin) || isSameOriginRequest(origin, req.headers);
}

app.use('/api/chat', (req, res, next) => {
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (!isChatOriginAllowed(req)) {
        res.status(403).json({ error: 'Origin not allowed' });
        return;
    }

    const origin = req.headers?.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    next();
});

app.get('/api/env', (req, res) => {
    res.json(getPublicEnvPayload(envConfig));
});

app.get('/api/status', (req, res) => {
    res.json(getStatusPayload(envConfig));
});

app.options('/api/chat', (req, res) => {
    res.status(200).end();
});

app.post('/api/chat', async (req, res) => {
    const result = await handleChatRequest({ req, env: envConfig });
    Object.entries(result.headers || {}).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    res.status(result.status).json(result.body);
});

app.all('/api/chat', (req, res) => {
    res.status(405).json({ error: 'Method not allowed' });
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
