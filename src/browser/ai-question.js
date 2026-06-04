import { formatAIResponse } from '../../lib/utils.js';
import { appState } from './app-state.js';
import { showErrorMessage } from './notifications.js';
import { setSafeHtml } from './safe-html.js';

const painData = appState.painData;

export function setupAIEventListeners() {
    // AI 질문하기 버튼 (존재하는 경우에만)
    const askAIBtn = document.getElementById('ask-ai-btn');
    if (askAIBtn) {
        askAIBtn.addEventListener('click', handleAIQuestion);
    }

    // Enter 키로 질문하기 (존재하는 경우에만)
    const aiQuestionInput = document.getElementById('ai-question-input');
    if (aiQuestionInput) {
        aiQuestionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleAIQuestion();
            }
        });
    }

    // AI 상태 업데이트
    updateAIStatus();
}

export function updateAIStatus() {
    const indicator = document.getElementById('ai-indicator');
    const text = document.getElementById('ai-text');

    // Only update if elements exist (footer present)
    if (!indicator || !text) return;

    if (window.openRouterConfig && window.openRouterConfig.isReady && window.openRouterConfig.isReady()) {
        indicator.textContent = '🤖✅';
        text.textContent = 'AI 분석 활성화';
    } else {
        indicator.textContent = '🤖❌';
        text.textContent = 'AI 서버 설정 확인 필요';
    }
}

export function setupDynamicFormEvents() {
    // 텍스트 입력 글자 수 카운터
    const painDescriptionTextarea = document.getElementById('pain-description');
    const charCountElement = document.getElementById('char-count');

    if (painDescriptionTextarea && charCountElement) {
        painDescriptionTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            const maxLength = this.getAttribute('maxlength') || 500;

            charCountElement.textContent = currentLength;

            // 글자 수에 따른 스타일 변경
            const counter = charCountElement.parentElement;
            if (currentLength > maxLength * 0.8) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        });
    }
}

async function handleAIQuestion() {
    const questionInput = document.getElementById('ai-question-input');
    if (!questionInput) {
        console.warn('AI 질문 입력창을 찾을 수 없습니다.');
        return;
    }

    const question = questionInput.value.trim();

    if (!question) {
        showErrorMessage('질문을 입력해주세요.');
        return;
    }

    const answerContainer = document.getElementById('ai-answer-container');
    const answerContent = document.getElementById('ai-answer-content');

    if (!answerContainer || !answerContent) {
        console.warn('AI 답변 컨테이너를 찾을 수 없습니다.');
        return;
    }

    // 로딩 표시
    answerContainer.classList.remove('hidden');
    setSafeHtml(answerContent, '<div class="ai-thinking">🤔 AI가 생각 중입니다...</div>');

    try {
        const answer = await askAIQuestion(question);
        setSafeHtml(answerContent, `<div class="ai-answer">${formatAIResponse(answer)}</div>`);

        // 질문 입력창 비우기
        questionInput.value = '';
    } catch (error) {
        setSafeHtml(answerContent, `<div class="ai-error">❌ 질문 처리 중 오류가 발생했습니다: ${error.message}</div>`);
    }
}

async function askAIQuestion(question) {
    if (window.openRouterConfig.isReady && !window.openRouterConfig.isReady()) {
        showErrorMessage('AI 질문 기능을 사용하려면 서버 설정이 필요합니다.');
        return;
    }

    const context = painData.analysis.aiAnalysis ?
        `현재 분석 결과: ${painData.analysis.aiAnalysis}\n\n` : '';

    const prompt = `${context}질문: ${question}`;

    try {
        const response = await window.openRouterConfig.makeRequest(
            [{ role: 'user', content: prompt }],
            window.MEDICAL_PROMPTS.AI_QUESTION
        );

        return response;
    } catch (error) {
        console.error('AI 질문 처리 실패:', error);
        throw error;
    }
}
