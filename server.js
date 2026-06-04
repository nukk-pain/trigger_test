const express = require('express');
const fs = require('fs');
const path = require('path');
const { handleChatRequest } = require('./lib/openrouter-proxy.cjs');

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

app.get('/api/status', (req, res) => {
    const proxyConfigured = Boolean(envConfig.OPENROUTER_API_KEY);
    res.json({
        success: true,
        data: {
            provider: 'openrouter',
            proxyConfigured,
            proxyReady: proxyConfigured,
            model: envConfig.OPENROUTER_MODEL || 'openrouter/auto',
            limits: {
                daily: parseInt(envConfig.DAILY_REQUEST_LIMIT || '50', 10),
                monthly: parseInt(envConfig.MONTHLY_REQUEST_LIMIT || '1000', 10)
            },
            rateLimit: {
                limit: parseInt(envConfig.SERVER_RATE_LIMIT_MAX || envConfig.DAILY_REQUEST_LIMIT || '50', 10),
                windowSeconds: parseInt(envConfig.SERVER_RATE_LIMIT_WINDOW_SECONDS || '86400', 10)
            },
            environment: envConfig.NODE_ENV || 'development'
        }
    });
});

app.post('/api/chat', async (req, res) => {
    const result = await handleChatRequest({ req, env: envConfig });
    Object.entries(result.headers || {}).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    res.status(result.status).json(result.body);
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
