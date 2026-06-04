const MAX_RAW_LENGTH = 8000;
const MAX_FIELD_LENGTH = 800;
const MAX_STEPS = 4;

const fallbackGuidance = {
    targetMuscles: [],
    summary: 'AI 응답을 안전하게 형식화할 수 없습니다. 일반적인 자가 관리 기준만 확인하세요.',
    steps: [],
    stopIf: [
        '통증이 심해지거나 저림, 마비, 어지러움, 숨참이 생기면 즉시 중단하세요.'
    ],
    seekCareIf: [
        '통증이 빠르게 악화되거나 발열, 외상, 감각 저하, 배뇨/배변 변화가 있으면 의료기관에 문의하세요.'
    ],
    disclaimer: '이 도구는 진단이 아니며 응급 증상이 있으면 즉시 119 또는 의료기관에 문의하세요.'
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isSafeText(value) {
    return typeof value === 'string' &&
        value.trim().length > 0 &&
        value.length <= MAX_FIELD_LENGTH;
}

function parseRawGuidance(rawValue) {
    if (typeof rawValue !== 'string') {
        return rawValue && typeof rawValue === 'object' ? rawValue : null;
    }

    const raw = rawValue.trim();
    if (!raw || raw.length > MAX_RAW_LENGTH) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (_error) {
        return null;
    }
}

function validateStringArray(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return null;
    }

    const items = value.map(item => typeof item === 'string' ? item.trim() : '');
    return items.every(isSafeText) ? items : null;
}

function validateSteps(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > MAX_STEPS) {
        return null;
    }

    const steps = value.map(step => {
        if (!step || typeof step !== 'object') {
            return null;
        }

        const normalized = {
            title: typeof step.title === 'string' ? step.title.trim() : '',
            method: typeof step.method === 'string' ? step.method.trim() : '',
            duration: typeof step.duration === 'string' ? step.duration.trim() : '',
            caution: typeof step.caution === 'string' ? step.caution.trim() : ''
        };

        return Object.values(normalized).every(isSafeText) ? normalized : null;
    });

    return steps.every(Boolean) ? steps : null;
}

export function parseStructuredGuidance(rawValue) {
    const parsed = parseRawGuidance(rawValue);
    if (!parsed || typeof parsed !== 'object') {
        return null;
    }

    const guidance = {
        targetMuscles: validateStringArray(parsed.targetMuscles),
        summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
        steps: validateSteps(parsed.steps),
        stopIf: validateStringArray(parsed.stopIf),
        seekCareIf: validateStringArray(parsed.seekCareIf),
        disclaimer: typeof parsed.disclaimer === 'string' ? parsed.disclaimer.trim() : ''
    };

    if (!guidance.targetMuscles ||
        !isSafeText(guidance.summary) ||
        !guidance.steps ||
        !guidance.stopIf ||
        !guidance.seekCareIf ||
        !isSafeText(guidance.disclaimer)) {
        return null;
    }

    return guidance;
}

function renderList(items, className) {
    return `
        <ul class="${className}">
            ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
    `;
}

function renderSteps(steps) {
    return `
        <div class="structured-steps">
            ${steps.map((step, index) => `
                <div class="structured-step-card">
                    <div class="step-number">단계 ${index + 1}</div>
                    <h4>${escapeHtml(step.title)}</h4>
                    <p><strong>방법:</strong> ${escapeHtml(step.method)}</p>
                    <p><strong>시간:</strong> ${escapeHtml(step.duration)}</p>
                    <p><strong>주의:</strong> ${escapeHtml(step.caution)}</p>
                </div>
            `).join('')}
        </div>
    `;
}

export function renderStructuredGuidance(rawValue) {
    const guidance = parseStructuredGuidance(rawValue);
    if (!guidance) {
        return renderFallbackGuidance();
    }

    return `
        <div class="ai-analysis-result structured-guidance">
            <h3>AI 셀프 마사지 가이드</h3>
            <div class="structured-section">
                <h4>대상 근육</h4>
                ${renderList(guidance.targetMuscles, 'target-muscle-list')}
            </div>
            <div class="structured-section">
                <h4>요약</h4>
                <p>${escapeHtml(guidance.summary)}</p>
            </div>
            <div class="structured-section">
                <h4>단계</h4>
                ${renderSteps(guidance.steps)}
            </div>
            <div class="structured-section">
                <h4>중단 기준</h4>
                ${renderList(guidance.stopIf, 'stop-if-list')}
            </div>
            <div class="structured-section">
                <h4>진료 기준</h4>
                ${renderList(guidance.seekCareIf, 'seek-care-if-list')}
            </div>
            <p class="structured-disclaimer">${escapeHtml(guidance.disclaimer)}</p>
        </div>
    `;
}

export function renderFallbackGuidance() {
    return `
        <div class="ai-analysis-result structured-guidance fallback-guidance">
            <h3>AI 셀프 마사지 가이드</h3>
            <p>${escapeHtml(fallbackGuidance.summary)}</p>
            <h4>중단 기준</h4>
            ${renderList(fallbackGuidance.stopIf, 'stop-if-list')}
            <h4>진료 기준</h4>
            ${renderList(fallbackGuidance.seekCareIf, 'seek-care-if-list')}
            <p class="structured-disclaimer">${escapeHtml(fallbackGuidance.disclaimer)}</p>
        </div>
    `;
}
