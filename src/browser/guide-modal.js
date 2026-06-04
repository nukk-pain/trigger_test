import { appState } from './app-state.js';
import { setSafeHtml } from './safe-html.js';
import { showSuccessMessage } from './notifications.js';

export function configureGuideModal() {}

export function startInteractiveGuide(triggerPointName, location) {
    const guideData = getGuideSteps(triggerPointName, location);

    const modal = document.createElement('div');
    modal.className = 'interactive-guide-modal';
    setSafeHtml(modal, `
        <div class="guide-modal-content">
            <div class="guide-header">
                <h3>🔍 ${triggerPointName} 찾기 가이드</h3>
                <button class="close-guide" data-action="close-guide">✕</button>
            </div>
            <div class="guide-progress">
                <div class="progress-dots">
                    ${guideData.steps.map((_, index) =>
                        `<div class="progress-dot ${index === 0 ? 'active' : ''}" data-step="${index}"></div>`
                    ).join('')}
                </div>
            </div>
            <div class="guide-content" id="guide-content">
                <!-- 동적으로 단계별 내용 표시 -->
            </div>
            <div class="guide-navigation">
                <button id="prev-step" class="guide-nav-btn" disabled>이전</button>
                <button id="next-step" class="guide-nav-btn">다음</button>
                <button id="finish-guide" class="guide-finish-btn" style="display: none;">완료</button>
            </div>
        </div>
    `);

    document.body.appendChild(modal);
    modal.querySelector('[data-action="close-guide"]').addEventListener('click', closeInteractiveGuide);

    // 가이드 상태 초기화
    appState.currentGuide = {
        currentStep: 0,
        totalSteps: guideData.steps.length,
        steps: guideData.steps,
        triggerPointName: triggerPointName
    };

    updateGuideStep();
    setupGuideNavigation();
}

function getGuideSteps(triggerPointName, location) {
    const commonSteps = {
        'neck-shoulder-junction': {
            steps: [
                {
                    title: '위치 찾기',
                    content: '어깨와 목이 만나는 지점을 찾으세요. 어깨를 위아래로 움직여 확인하세요.',
                    image: '🫱',
                    tip: '어깨를 으쓱할 때 가장 높은 부분입니다.'
                },
                {
                    title: '손가락으로 찾기',
                    content: '반대편 손 2-3개 손가락으로 부드럽게 눌러보세요.',
                    image: '👆',
                    tip: '너무 세게 누르지 마세요.'
                },
                {
                    title: '확인하기',
                    content: '딱딱한 매듭을 찾았나요? 누르면 목이나 머리로 통증이 퍼지나요?',
                    image: '🎯',
                    tip: '맞는 지점을 누르면 익숙한 통증이 느껴집니다.'
                },
                {
                    title: '마사지하기',
                    content: '5-10초간 누른 후, 원을 그리며 마사지하세요.',
                    image: '🖐️',
                    tip: '깊게 숨쉬며 근육이 풀리는 걸 느껴보세요.'
                }
            ]
        },
        'skull-base': {
            steps: [
                {
                    title: '뒤통수 찾기',
                    content: '뒤통수와 목이 만나는 경계선을 찾으세요. 머리카락 바로 아래입니다.',
                    image: '🧠',
                    tip: '고개를 끄덕여보면 경계선을 쉽게 찾을 수 있어요.'
                },
                {
                    title: '양쪽 누르기',
                    content: '양손 엄지로 뒤통수 양쪽을 동시에 눌러보세요.',
                    image: '👍',
                    tip: '척추는 피하고 양쪽 근육만 누르세요.'
                },
                {
                    title: '아픈 점 확인',
                    content: '아픈 부분을 찾았나요? 누르면 머리 앞쪽으로 통증이 퍼지나요?',
                    image: '🎯',
                    tip: '이 부분은 두통을 자주 일으킵니다.'
                },
                {
                    title: '마사지하기',
                    content: '엄지로 작은 원을 그리며 5-10분간 마사지하세요.',
                    image: '🔄',
                    tip: '목 부위라 부드럽게, 절대 세게 누르지 마세요.'
                }
            ]
        }
    };

    return commonSteps[location] || {
        steps: [
            {
                title: '부위 찾기',
                content: `${triggerPointName} 부위를 찾으세요.`,
                image: '📍',
                tip: '정확한 위치를 찾아보세요.'
            },
            {
                title: '누르기',
                content: '손가락으로 부드럽게 눌러보세요.',
                image: '🔍',
                tip: '딱딱한 매듭이나 아픈 점을 찾으세요.'
            },
            {
                title: '마사지',
                content: '적절한 압력으로 마사지하세요.',
                image: '🖐️',
                tip: '아프면 약하게, 괜찮으면 조금 더 세게 누르세요.'
            }
        ]
    };
}

function updateGuideStep() {
    const guide = appState.currentGuide;
    const content = document.getElementById('guide-content');
    const step = guide.steps[guide.currentStep];

    setSafeHtml(content, `
        <div class="guide-step-content">
            <div class="step-header">
                <div class="step-emoji">${step.image}</div>
                <h4>단계 ${guide.currentStep + 1}: ${step.title}</h4>
            </div>
            <div class="step-body">
                <p class="step-description">${step.content}</p>
                <div class="step-tip">
                    <span class="tip-icon">💡</span>
                    <span class="tip-text">${step.tip}</span>
                </div>
            </div>
        </div>
    `);

    // 진행률 점 업데이트
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === guide.currentStep);
        dot.classList.toggle('completed', index < guide.currentStep);
    });

    // 네비게이션 버튼 상태 업데이트
    document.getElementById('prev-step').disabled = guide.currentStep === 0;

    const nextBtn = document.getElementById('next-step');
    const finishBtn = document.getElementById('finish-guide');

    if (guide.currentStep === guide.totalSteps - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
    }
}

function setupGuideNavigation() {
    document.getElementById('prev-step').addEventListener('click', () => {
        if (appState.currentGuide.currentStep > 0) {
            appState.currentGuide.currentStep--;
            updateGuideStep();
        }
    });

    document.getElementById('next-step').addEventListener('click', () => {
        if (appState.currentGuide.currentStep < appState.currentGuide.totalSteps - 1) {
            appState.currentGuide.currentStep++;
            updateGuideStep();
        }
    });

    document.getElementById('finish-guide').addEventListener('click', () => {
        const triggerPointName = appState.currentGuide.triggerPointName;
        closeInteractiveGuide();
        showSuccessMessage(`${triggerPointName} 가이드 완료! 꾸준히 하시면 좋아질 거예요.`);
    });
}

export function closeInteractiveGuide() {
    const modal = document.querySelector('.interactive-guide-modal');
    if (modal) {
        modal.remove();
    }
    appState.currentGuide = null;
}
