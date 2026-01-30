// Vercel Serverless Function for environment variables (Gemini API)
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
            GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
            GEMINI_MODEL: process.env.GEMINI_MODEL,
            MAX_OUTPUT_TOKENS: parseInt(process.env.MAX_OUTPUT_TOKENS || '8192'),
            TEMPERATURE: parseFloat(process.env.TEMPERATURE || '1'),
            TOP_P: parseFloat(process.env.TOP_P || '0.95'),
            TOP_K: parseInt(process.env.TOP_K || '40'),
            DAILY_LIMIT: parseInt(process.env.DAILY_REQUEST_LIMIT || '50'),
            MONTHLY_LIMIT: parseInt(process.env.MONTHLY_REQUEST_LIMIT || '1000')
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
