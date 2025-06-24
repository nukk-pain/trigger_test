// Simple Node.js server to serve the app with environment variables
const express = require('express');
const fs = require('fs');
const path = require('path');
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
                    if (key === 'OPENAI_API_KEY') {
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

// Serve static files
app.use(express.static(__dirname));

// API endpoint to get environment config (excluding sensitive data)
app.get('/api/config', (req, res) => {
    const clientConfig = {
        OPENAI_API_KEY: envConfig.OPENAI_API_KEY || '',
        DAILY_REQUEST_LIMIT: envConfig.DAILY_REQUEST_LIMIT || '50',
        MONTHLY_REQUEST_LIMIT: envConfig.MONTHLY_REQUEST_LIMIT || '1000',
        OPENAI_MODEL: envConfig.OPENAI_MODEL || 'gpt-4o-mini',
        MAX_TOKENS: envConfig.MAX_TOKENS || '1500',
        TEMPERATURE: envConfig.TEMPERATURE || '0.3',
        ENABLE_AI_QA: envConfig.ENABLE_AI_QA || 'true',
        ENABLE_DETAILED_ANALYSIS: envConfig.ENABLE_DETAILED_ANALYSIS || 'true'
    };
    
    res.json(clientConfig);
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 통증 가이드 도우미가 http://localhost:${port} 에서 실행 중입니다.`);
    
    if (envConfig.OPENAI_API_KEY) {
        console.log('✅ OpenAI API 키가 설정되었습니다.');
    } else {
        console.log('⚠️ OpenAI API 키가 설정되지 않았습니다. 웹에서 수동으로 설정해주세요.');
    }
});

module.exports = app;