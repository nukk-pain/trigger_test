// Simple Node.js server to serve the app with Gemini API
const express = require('express');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
                    if (key === 'GEMINI_API_KEY') {
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
const envConfig = loadEnvFile();

// System instruction for medical consultation
const SYSTEM_INSTRUCTION = `근골격계 물리치료 전문가로서 통증 부위와 악화 상황을 분석해 셀프 마사지 방법을 안내하세요.

규칙:
- 질문은 환자가 이해하기 쉽게 작성
- 신체 부위는 구체적으로 설명
- 안전 우선 원칙 적용
- 응급 상황 시 즉시 병원 방문 권고`;

// Get Gemini model
function getModel() {
    const apiKey = envConfig.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI API key is not configured');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: envConfig.GEMINI_MODEL,
        systemInstruction: SYSTEM_INSTRUCTION,
    });
}

// Serve static files
app.use(express.static(__dirname));

// API endpoint to get environment config
app.get('/api/config', (req, res) => {
    const clientConfig = {
        GEMINI_API_KEY: envConfig.GEMINI_API_KEY || '',
        DAILY_REQUEST_LIMIT: envConfig.DAILY_REQUEST_LIMIT || '50',
        MONTHLY_REQUEST_LIMIT: envConfig.MONTHLY_REQUEST_LIMIT || '1000',
        GEMINI_MODEL: envConfig.GEMINI_MODEL,
        MAX_OUTPUT_TOKENS: envConfig.MAX_OUTPUT_TOKENS || '8192',
        TEMPERATURE: envConfig.TEMPERATURE || '1',
        TOP_P: envConfig.TOP_P || '0.95',
        TOP_K: envConfig.TOP_K || '40',
        ENABLE_AI_QA: envConfig.ENABLE_AI_QA || 'true',
        ENABLE_DETAILED_ANALYSIS: envConfig.ENABLE_DETAILED_ANALYSIS || 'true'
    };

    res.json(clientConfig);
});

// Gemini API endpoint
app.post('/api/gemini', async (req, res) => {
    try {
        const { prompt, history = [] } = req.body;
        console.log('API 요청 받음. 프롬프트:', prompt?.substring(0, 50) + '...');
        console.log('히스토리 메시지 수:', history.length);

        const generationConfig = {
            temperature: parseFloat(envConfig.TEMPERATURE || '1'),
            topP: parseFloat(envConfig.TOP_P || '0.95'),
            topK: parseInt(envConfig.TOP_K || '40'),
            maxOutputTokens: parseInt(envConfig.MAX_OUTPUT_TOKENS || '8192'),
            responseMimeType: 'text/plain',
        };

        const model = getModel();
        const chatSession = model.startChat({ generationConfig, history });
        const result = await chatSession.sendMessage(prompt);
        const responseText = result.response.text();

        // 토큰 사용량 로깅
        const usage = result.response.usageMetadata;
        if (usage) {
            console.log('━━━━━━━━ 토큰 사용량 ━━━━━━━━');
            console.log(`  입력 토큰: ${usage.promptTokenCount}`);
            console.log(`  출력 토큰: ${usage.candidatesTokenCount}`);
            console.log(`  총 토큰: ${usage.totalTokenCount}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        console.log('API 응답:', responseText.substring(0, 100) + '...');

        res.json({ output: responseText });
    } catch (error) {
        console.error('Gemini API 호출 오류:', error);
        console.error('오류 세부 정보:', error.message);

        // API 키 유효성 여부 확인 메시지
        if (error.message?.includes('API key')) {
            console.error('API 키 관련 오류가 발생했습니다. 키가 유효한지 확인하세요.');
            return res.status(401).json({
                error: 'API 키 관련 오류가 발생했습니다. .env.local 파일을 확인하세요.'
            });
        }

        res.status(500).json({
            error: 'Gemini API 호출 중 오류 발생',
            details: error.message || '알 수 없는 오류'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 통증 가이드 도우미가 http://localhost:${port} 에서 실행 중입니다.`);

    if (envConfig.GEMINI_API_KEY) {
        console.log('✅ Gemini API 키가 설정되었습니다.');
    } else {
        console.log('⚠️ Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
    }
});

module.exports = app;
