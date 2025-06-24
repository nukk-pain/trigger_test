// Vercel Serverless Function for environment variables
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
            OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
            OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            MAX_TOKENS: parseInt(process.env.MAX_TOKENS || '2000'),
            TEMPERATURE: parseFloat(process.env.TEMPERATURE || '0.7'),
            DAILY_LIMIT: parseInt(process.env.DAILY_LIMIT || '20'),
            MONTHLY_LIMIT: parseInt(process.env.MONTHLY_LIMIT || '200')
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