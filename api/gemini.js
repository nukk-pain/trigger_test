// Vercel Serverless Function for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `근골격계 물리치료 전문가로서 통증 부위와 악화 상황을 분석해 셀프 마사지 방법을 안내하세요.

규칙:
- 질문은 환자가 이해하기 쉽게 작성
- 신체 부위는 구체적으로 설명
- 안전 우선 원칙 적용
- 응급 상황 시 즉시 병원 방문 권고`;

function getModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI API key is not configured');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL,
        systemInstruction: SYSTEM_INSTRUCTION,
    });
}

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { prompt, history = [] } = req.body;
        console.log('API 요청 받음. 프롬프트:', prompt?.substring(0, 50) + '...');
        console.log('히스토리 메시지 수:', history.length);

        const generationConfig = {
            temperature: parseFloat(process.env.TEMPERATURE || '1'),
            topP: parseFloat(process.env.TOP_P || '0.95'),
            topK: parseInt(process.env.TOP_K || '40'),
            maxOutputTokens: parseInt(process.env.MAX_OUTPUT_TOKENS || '8192'),
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

        res.status(200).json({ output: responseText });

    } catch (error) {
        console.error('Gemini API 호출 오류:', error);
        console.error('오류 세부 정보:', error.message);

        // API 키 유효성 여부 확인 메시지
        if (error.message?.includes('API key')) {
            console.error('API 키 관련 오류가 발생했습니다. 키가 유효한지 확인하세요.');
            return res.status(401).json({
                error: 'API 키 관련 오류가 발생했습니다. 관리자에게 문의하세요.'
            });
        }

        res.status(500).json({
            error: 'Gemini API 호출 중 오류 발생',
            details: error.message || '알 수 없는 오류'
        });
    }
}
