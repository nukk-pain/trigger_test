import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getPublicEnvPayload } = require('../lib/public-env-config.cjs');

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
        console.log('✅ Vercel에서 환경변수를 성공적으로 로드했습니다.');
        res.status(200).json(getPublicEnvPayload(process.env));

    } catch (error) {
        console.error('❌ 환경변수 로드 실패:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load environment variables',
            message: error.message
        });
    }
}
