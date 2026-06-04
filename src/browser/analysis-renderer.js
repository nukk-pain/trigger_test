import { formatAIResponse } from '../../lib/utils.js';
import { appState } from './app-state.js';
import { startInteractiveGuide } from './guide-modal.js';
import { setSafeHtml } from './safe-html.js';

const painData = appState.painData;
export function displayGPTResults(aiAnalysis) {
    const massageGuide = document.getElementById('massage-guide');
    const container = document.getElementById('massage-steps');

    // 컨테이너가 존재하는지 확인
    if (!container) {
        console.error('massage-steps container not found');
        return;
    }

    // 컨테이너 초기화
    setSafeHtml(container, '');

    // GPT 결과를 HTML로 변환하여 표시
    const rawResult = aiAnalysis.aiAnalysis || aiAnalysis.analysis || aiAnalysis.text || aiAnalysis;
    const formattedResult = formatAIResponse(rawResult);

    setSafeHtml(container, `
        <div class="ai-analysis-result">
            <h3>🤖 AI 전문가 분석</h3>
            <div class="analysis-content">
                ${formattedResult}
            </div>
        </div>
    `);

    // 마사지 가이드 표시
    if (massageGuide) {
        massageGuide.style.display = 'block';
    }
}

export function showRedFlagWarning(aiReason = null) {
    const warningElement = document.getElementById('red-flag-warning');
    warningElement.classList.remove('hidden');
    document.getElementById('massage-guide').style.display = 'none';

    // AI 분석 결과가 있으면 추가 정보 표시
    if (aiReason) {
        const emergencyNotice = warningElement.querySelector('.emergency-notice');
        const aiAnalysisDiv = document.createElement('div');
        aiAnalysisDiv.className = 'ai-analysis';
        setSafeHtml(aiAnalysisDiv, `
            <h4>🤖 AI 분석 결과</h4>
            <p>${aiReason}</p>
        `);
        emergencyNotice.appendChild(aiAnalysisDiv);
    }

    painData.analysis.hasRedFlags = true;
}

export function displayAnalysisResults() {
    if (painData.analysis.hasRedFlags) return;

    // AI 분석 결과만 표시
    if (painData.analysis.aiEnhanced && painData.analysis.aiAnalysis) {
        const resultContainer = document.getElementById('ai-analysis-result');
        if (!resultContainer) {
            console.error('ai-analysis-result container not found');
            return;
        }
        setSafeHtml(resultContainer, `
            <div class="ai-result-content">
                ${formatAIResponse(painData.analysis.aiAnalysis)}
            </div>
        `);
    }
}

export function displayAIAnalysis() {
    const analysisContainer = document.getElementById('trigger-points-analysis');

    if (!analysisContainer) {
        console.error('trigger-points-analysis container not found');
        return;
    }

    // AI 분석 결과 섹션 추가
    const aiSection = document.createElement('div');
    aiSection.className = 'ai-analysis-section';
    setSafeHtml(aiSection, `
        <div class="ai-badge">🤖 AI 강화 분석</div>
        <div class="ai-analysis-content">
            <h4>전문 AI 분석 결과</h4>
            <div class="ai-response">${formatAIResponse(painData.analysis.aiAnalysis)}</div>
        </div>
    `);

    analysisContainer.insertBefore(aiSection, analysisContainer.firstChild);
}

export function createTriggerPointElement(tp) {
    const div = document.createElement('div');
    div.className = 'trigger-point-card';

    const confidenceText = {
        'high': '높은 일치도',
        'medium': '중간 일치도',
        'low': '낮은 일치도'
    };

    const matchReasonText = {
        'trigger-action-match': '행동 패턴 일치',
        'pain-area-match': '통증 부위 일치'
    };

    setSafeHtml(div, `
        <h4>🎯 ${tp.name}</h4>
        <p><strong>치료 위치:</strong> ${tp.anatomicalPosition}</p>
        <p><strong>연관 통증:</strong> ${tp.referredPain.join(', ')}</p>

        <div class="trigger-explanation">
            <p><strong>❓ 왜 여기를 치료하나요?</strong></p>
            <p class="explanation-text">아픈 곳의 원인이 <strong>${tp.anatomicalPosition}</strong>에 있을 수 있습니다.</p>
        </div>

        <!-- 트리거 포인트 찾기 가이드 -->
        <div class="find-trigger-guide">
            <h5>🔍 찾는 방법</h5>
            <div class="guide-steps">
                <div class="guide-step">
                    <span class="step-number">1</span>
                    <div class="step-content">
                        <strong>위치:</strong> ${tp.anatomicalPosition}을 찾으세요
                    </div>
                </div>
                <div class="guide-step">
                    <span class="step-number">2</span>
                    <div class="step-content">
                        <strong>누르기:</strong> 딱딱한 매듭을 찾으세요
                    </div>
                </div>
                <div class="guide-step">
                    <span class="step-number">3</span>
                    <div class="step-content">
                        <strong>확인:</strong> 누르면 ${tp.referredPain.join(', ')}에 통증이 느껴지나요?
                    </div>
                </div>
            </div>
            <button class="interactive-guide-btn" data-trigger-point="${tp.name}" data-location="${tp.location}">
                📱 상세 가이드
            </button>
        </div>

        <div class="massage-method">
            <h5>🖐️ 마사지</h5>
            <p><strong>방법:</strong> ${tp.massage.method}</p>
            <p><strong>빈도:</strong> ${tp.massage.frequency}</p>
            <p><strong>시간:</strong> ${tp.massage.duration}</p>
            <p class="precaution">⚠️ ${tp.massage.precaution}</p>
        </div>

        <div class="confidence-badge ${tp.confidence}">
            ${confidenceText[tp.confidence]}
        </div>
    `);

    const guideButton = div.querySelector('.interactive-guide-btn');
    guideButton.addEventListener('click', () => {
        startInteractiveGuide(guideButton.dataset.triggerPoint, guideButton.dataset.location);
    });

    return div;
}

export function createFascialLineElement(line) {
    const div = document.createElement('div');
    div.className = 'fascial-line-card';

    setSafeHtml(div, `
        <h4>🔗 ${line.name}</h4>
        <p><strong>경로:</strong> ${line.path.join(' → ')}</p>
        <p><strong>관련 문제:</strong> ${line.commonIssues.join(', ')}</p>
        <p><strong>치료법:</strong> ${line.treatment}</p>
    `);

    return div;
}

export function displayMassageInstructions() {
    const container = document.getElementById('massage-steps');
    setSafeHtml(container, '');

    const generalSteps = `
        <div class="massage-instruction">
            <h4>📋 일반적인 마사지 순서</h4>
            <ol>
                <li><strong>준비:</strong> 편안한 자세로 긴장을 푸세요</li>
                <li><strong>찾기:</strong> 위에서 추천한 트리거 포인트를 찾아보세요</li>
                <li><strong>압박:</strong> 엄지손가락이나 손가락으로 5-10초간 압박</li>
                <li><strong>이완:</strong> 압박 후 부드럽게 마사지</li>
                <li><strong>스트레칭:</strong> 해당 근육을 천천히 늘려주세요</li>
                <li><strong>휴식:</strong> 마사지 후 충분한 휴식</li>
            </ol>
        </div>

        <div class="massage-timing">
            <h4>⏰ 권장 타이밍</h4>
            <ul>
                <li>하루 2-3회, 각 세션 10-15분</li>
                <li>샤워 후 근육이 이완된 상태에서</li>
                <li>통증이 심할 때는 빈도를 늘리되 강도는 줄이세요</li>
            </ul>
        </div>
    `;

    setSafeHtml(container, generalSteps);
}
