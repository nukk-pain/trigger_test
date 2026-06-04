import { analyzeTriggerPoints as analyzeTriggerPointsLib, analyzeFascialLines as analyzeFascialLinesLib } from '../../lib/analysis.js';
import { analyzeWithAI } from './analysis-ai.js';
import { appState } from './app-state.js';
import {
    hideLoadingIndicator,
    showErrorMessage,
    showLoadingIndicator,
    showServerProxyDialog,
    updateUsageDisplay
} from './notifications.js';
import {
    displayAnalysisResults,
    displayGPTResults,
    showRedFlagWarning
} from './analysis-renderer.js';
import { hasRedFlagCondition, hasRedFlagText } from './red-flags.js';

const painData = appState.painData;

export async function analyzePain() {
    if (hasQuestionnaireRedFlags()) {
        painData.analysis = { hasRedFlags: true };
        showRedFlagWarning();
        return;
    }

    if (!window.openRouterConfig.getRemainingRequests()) {
        const stats = window.openRouterConfig.getUsageStats();
        showErrorMessage(`사용량 한도에 도달했습니다. 일일: ${stats.daily.used}/${stats.daily.limit}, 월간: ${stats.monthly.used}/${stats.monthly.limit}`);
        return;
    }

    showLoadingIndicator();

    try {
        await performAIAnalysis();
        updateUsageDisplay();
    } catch (error) {
        console.error('분석 중 오류:', error);

        if (error.message.includes('사용량 한도')) {
            showErrorMessage(error.message);
        } else if (error.message.includes('서버 프록시')) {
            showErrorMessage('서버 프록시 문제가 발생했습니다. 설정을 확인해주세요.');
            showServerProxyDialog();
        } else {
            showErrorMessage(`분석 중 오류가 발생했습니다: ${error.message}`);
        }
    } finally {
        hideLoadingIndicator();
    }
}

function performBasicAnalysis() {
    const hasRedFlags = hasQuestionnaireRedFlags();

    if (hasRedFlags) {
        showRedFlagWarning();
        return;
    }

    painData.analysis = {
        triggerPoints: analyzeTriggerPoints(),
        fascialLines: analyzeFascialLines(),
        hasRedFlags,
        aiEnhanced: false
    };

    displayAnalysisResults();
}

async function performAIAnalysis() {
    const aiAnalysis = await analyzeWithAI();

    painData.analysis = {
        ...aiAnalysis,
        hasRedFlags: false,
        aiEnhanced: true
    };

    displayGPTResults(aiAnalysis);
}

function analyzeTriggerPoints() {
    return analyzeTriggerPointsLib(painData.selectedAreas, painData.questionnaire);
}

function analyzeFascialLines() {
    return analyzeFascialLinesLib(painData.selectedAreas);
}

function hasQuestionnaireRedFlags() {
    return hasRedFlagText(painData.questionnaire.painDescription) ||
        hasRedFlagCondition(painData.questionnaire.medicalConditions);
}

export const analysisFallbacks = {
    performBasicAnalysis,
    analyzeTriggerPoints,
    analyzeFascialLines,
    hasQuestionnaireRedFlags
};
