export default function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Vercel 환경변수에서 로드
        const envData = {
            OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openrouter/auto',
            MAX_TOKENS: parseInt(process.env.MAX_TOKENS || '1500'),
            TEMPERATURE: parseFloat(process.env.TEMPERATURE || '1'),
            DAILY_LIMIT: parseInt(process.env.DAILY_REQUEST_LIMIT || '50'),
            MONTHLY_LIMIT: parseInt(process.env.MONTHLY_REQUEST_LIMIT || '1000'),
            ENABLE_AI_QA: process.env.ENABLE_AI_QA || 'true',
            ENABLE_DETAILED_ANALYSIS: process.env.ENABLE_DETAILED_ANALYSIS || 'true',
            OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL || '',
            OPENROUTER_APP_NAME: process.env.OPENROUTER_APP_NAME || ''
        };

        console.log('✅ Vercel에서 환경변수를 성공적으로 로드했습니다.');
        res.status(200).json({ success: true, data: envData });

    } catch (error) {
        console.error('❌ 환경변수 로드 실패:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load environment variables',
            message: error.message
        });
    }
}
