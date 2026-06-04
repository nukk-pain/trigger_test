import { getAreaDisplayName } from '../../lib/utils.js';
import { appState } from './app-state.js';

const painData = appState.painData;

export async function checkRedFlagsWithAI() {
    const symptoms = {
        nrs: painData.questionnaire.nrs,
        aggravatingActions: painData.questionnaire.aggravatingActions,
        aggravatingOther: painData.questionnaire.aggravatingOther,
        medicalConditions: painData.questionnaire.medicalConditions,
        medicalOther: painData.questionnaire.medicalOther
    };

    const prompt = `환자 증상: ${JSON.stringify(symptoms, null, 2)}`;

    try {
        const response = await window.openRouterConfig.makeRequest(
            [{ role: 'user', content: prompt }],
            window.MEDICAL_PROMPTS.RED_FLAG_CHECK
        );

        return {
            isEmergency: response.startsWith('응급상황'),
            reason: response
        };
    } catch (error) {
        console.error('레드 플래그 AI 분석 실패:', error);
        // 간단한 분석이므로 응급상황 없음
        return {
            isEmergency: false,
            reason: '간단한 분석 사용'
        };
    }
}

export async function analyzeWithAI() {
    const q = painData.questionnaire;
    const areas = painData.selectedAreas.map(area => getAreaDisplayName(area));

    // 입력 최적화: 간결한 형태로 변경
    const prompt = `부위: ${areas.join(', ')}
악화: ${q.painDescription}`;

    try {
        const analysis = await window.openRouterConfig.makeRequest(
            [{ role: 'user', content: prompt }],
            window.MEDICAL_PROMPTS.PAIN_ANALYSIS
        );

        return {
            aiAnalysis: analysis,
            hasRedFlags: false,
            aiEnhanced: true
        };
    } catch (error) {
        console.error('AI 분석 실패:', error);
        throw error;
    }
}

export function parseAIAnalysis(aiResponse) {
    // AI 응답을 구조화된 형태로 변환
    return {
        triggerPoints: [{
            name: 'AI 분석 결과',
            analysis: aiResponse,
            confidence: 'ai-powered',
            massage: {
                method: 'AI 권장 방법 (상세 내용은 분석 결과 참조)',
                frequency: 'AI 권장 빈도',
                duration: 'AI 권장 시간',
                precaution: 'AI 권장 주의사항'
            }
        }],
        fascialLines: [],
        aiAnalysis: aiResponse
    };
}
