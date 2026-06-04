// 모듈에서 필요한 함수 import
import { appState, resetPainData } from './app-state.js';
import { analyzePain } from './analysis-flow.js';
import { setupAIEventListeners, setupDynamicFormEvents, updateAIStatus } from './ai-question.js';
import { configureGuideModal } from './guide-modal.js';
import {
    showServerProxyDialog,
    updateUsageDisplay
} from './notifications.js';
import { setSafeHtml } from './safe-html.js';
import {
    clearSelection,
    collectActionData,
    setupBodyMapEvents,
    switchBodyView,
    validateStep1
} from './selection-ui.js';

const painData = appState.painData;
configureGuideModal();

// DOM 요소들
const steps = document.querySelectorAll('.step-section');
const progressSteps = document.querySelectorAll('.progress-step');

// 초기화
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
});

async function initializeApp() {
    try {
        // 환경 설정 및 API 초기화
        await initializeAPI();

        // 이벤트 리스너 설정
        setupEventListeners();

        // 진행률 표시 업데이트
        updateProgressBar();

        // 강도 슬라이더 초기화 (존재하는 경우에만)
        const intensitySlider = document.getElementById('intensity');
        const intensityValue = document.getElementById('intensity-value');

        if (intensitySlider && intensityValue) {
            intensitySlider.addEventListener('input', function() {
                intensityValue.textContent = this.value;
            });
        }

        // 사용량 표시 업데이트
        updateUsageDisplay();

    } catch (error) {
        console.error('앱 초기화 실패:', error);
        showStartupError(error.message);
    }
}

async function initializeAPI() {
    if (!window.openRouterConfig) {
        throw new Error('OpenRouter 설정이 로드되지 않았습니다.');
    }

    const ready = await window.openRouterConfig.initialize();

    if (!ready) {
        throw new Error('AI 서버 설정을 로드할 수 없습니다.');
    }

    console.log('✅ OpenRouter API 설정 완료');
}

function showStartupError(message) {
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'startup-error-overlay';
    setSafeHtml(errorOverlay, `
        <div class="startup-error">
            <h2>🚫 앱 실행 실패</h2>
            <p>${message}</p>
            <div class="startup-error-actions">
                <button data-action="reload" class="primary-btn">다시 시도</button>
                <button data-action="server-status" class="secondary-btn">서버 프록시 상태</button>
            </div>
        </div>
    `);
    errorOverlay.querySelector('[data-action="reload"]').addEventListener('click', () => location.reload());
    errorOverlay.querySelector('[data-action="server-status"]').addEventListener('click', () => showServerProxyDialog());
    document.body.appendChild(errorOverlay);
}

function setupEventListeners() {
    // 1단계 (부위 선택 + 동작 선택) -> 3단계 (분석)
    document.getElementById('analyze-pain').addEventListener('click', function() {
        if (validateStep1()) {
            collectActionData();
            analyzePain();
            goToStep(2);
        }
    });

    // 인체 지도 이벤트
    setupBodyMapEvents();

    // 뷰 전환 (앞면/뒷면)
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchBodyView(this.dataset.view);
        });
    });

    // 선택 초기화
    document.getElementById('clear-selection').addEventListener('click', clearSelection);

    // 상단 빠른 지우기 버튼
    const quickClearBtn = document.getElementById('quick-clear');
    if (quickClearBtn) {
        quickClearBtn.addEventListener('click', clearSelection);
    }

    // 처음부터 다시
    document.getElementById('start-over').addEventListener('click', function() {
        resetApp();
        goToStep(1);
    });

    // AI 관련 이벤트 리스너들
    setupAIEventListeners();

    // 동적 폼 이벤트 리스너들
    setupDynamicFormEvents();
}

function goToStep(stepNumber) {
    // 현재 단계 숨기기
    steps.forEach(step => step.classList.remove('active'));
    if (progressSteps.length > 0) {
        progressSteps.forEach(step => step.classList.remove('active'));
    }

    // 새 단계 보이기
    document.getElementById(`step${stepNumber}`).classList.add('active');
    const progressStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (progressStep) {
        progressStep.classList.add('active');
    }

    appState.currentStep = stepNumber;
    updateProgressBar();
}

function updateProgressBar() {
    // Only update if progress steps exist
    if (progressSteps.length === 0) return;

    progressSteps.forEach((step, index) => {
        if (index < appState.currentStep) {
            step.classList.add('completed');
        } else if (index === appState.currentStep - 1) {
            step.classList.add('active');
        } else {
            step.classList.remove('completed', 'active');
        }
    });
}

function resetApp() {
    resetPainData();

    // 텍스트 영역 초기화
    const painDescription = document.getElementById('pain-description');
    if (painDescription) {
        painDescription.value = '';
    }

    // 글자 수 카운터 초기화
    const charCount = document.getElementById('char-count');
    if (charCount) {
        charCount.textContent = '0';
    }

    // 선택 영역 초기화
    clearSelection();

    // 경고 숨기기
    const redFlagWarning = document.getElementById('red-flag-warning');
    if (redFlagWarning) {
        redFlagWarning.classList.add('hidden');
    }

    const massageGuide = document.getElementById('massage-guide');
    if (massageGuide) {
        massageGuide.style.display = 'block';
    }

    appState.currentStep = 1;
}
