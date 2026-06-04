import { appState } from './app-state.js';
import { getGuideSteps } from './guide-data.js';
import { setSafeHtml } from './safe-html.js';
import { showSuccessMessage } from './notifications.js';

export function startInteractiveGuide(triggerPointName, location) {
    const guideData = getGuideSteps(triggerPointName, location);
    const modal = document.createElement('div');
    modal.className = 'interactive-guide-modal';
    setSafeHtml(modal, renderGuideModal(triggerPointName, guideData.steps));

    document.body.appendChild(modal);
    modal.querySelector('[data-action="close-guide"]').addEventListener('click', closeInteractiveGuide);
    appState.currentGuide = {
        currentStep: 0,
        totalSteps: guideData.steps.length,
        steps: guideData.steps,
        triggerPointName
    };
    updateGuideStep();
    setupGuideNavigation();
}

function renderGuideModal(triggerPointName, steps) {
    return `
        <div class="guide-modal-content">
            <div class="guide-header">
                <h3>🔍 ${triggerPointName} 찾기 가이드</h3>
                <button class="close-guide" data-action="close-guide">✕</button>
            </div>
            <div class="guide-progress"><div class="progress-dots">
                ${steps.map((_, index) => `<div class="progress-dot ${index === 0 ? 'active' : ''}" data-step="${index}"></div>`).join('')}
            </div></div>
            <div class="guide-content" id="guide-content"></div>
            <div class="guide-navigation">
                <button id="prev-step" class="guide-nav-btn" disabled>이전</button>
                <button id="next-step" class="guide-nav-btn">다음</button>
                <button id="finish-guide" class="guide-finish-btn" hidden>완료</button>
            </div>
        </div>
    `;
}

function updateGuideStep() {
    const guide = appState.currentGuide;
    const step = guide.steps[guide.currentStep];
    setSafeHtml(document.getElementById('guide-content'), `
        <div class="guide-step-content">
            <div class="step-header"><div class="step-emoji">${step.image}</div><h4>단계 ${guide.currentStep + 1}: ${step.title}</h4></div>
            <div class="step-body"><p class="step-description">${step.content}</p><div class="step-tip"><span class="tip-icon">💡</span><span class="tip-text">${step.tip}</span></div></div>
        </div>
    `);
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === guide.currentStep);
        dot.classList.toggle('completed', index < guide.currentStep);
    });
    const isFinalStep = guide.currentStep === guide.totalSteps - 1;
    document.getElementById('prev-step').disabled = guide.currentStep === 0;
    document.getElementById('next-step').hidden = isFinalStep;
    document.getElementById('finish-guide').hidden = !isFinalStep;
}

function setupGuideNavigation() {
    document.getElementById('prev-step').addEventListener('click', () => moveGuideStep(-1));
    document.getElementById('next-step').addEventListener('click', () => moveGuideStep(1));
    document.getElementById('finish-guide').addEventListener('click', finishGuide);
}

function moveGuideStep(direction) {
    const guide = appState.currentGuide;
    const nextStep = guide.currentStep + direction;
    if (nextStep >= 0 && nextStep < guide.totalSteps) {
        guide.currentStep = nextStep;
        updateGuideStep();
    }
}

function finishGuide() {
    const triggerPointName = appState.currentGuide.triggerPointName;
    closeInteractiveGuide();
    showSuccessMessage(`${triggerPointName} 가이드 완료! 꾸준히 하시면 좋아질 거예요.`);
}

export function closeInteractiveGuide() {
    document.querySelector('.interactive-guide-modal')?.remove();
    appState.currentGuide = null;
}
