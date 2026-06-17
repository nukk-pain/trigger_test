// 부위 선택 2단계 UI 렌더 + 이벤트 (그룹 → 세부).
// 상태는 region-flow가, 세부 area 선택은 selection-state가, 요약 패널은 selection-renderer가 담당.

import { createRegionFlow } from './region-flow.js';
import { getGroups } from '../../lib/area-groups.js';
import {
    getSelectedAreas,
    toggleSelectedArea,
    resetAreaSelection
} from './selection-state.js';
import { renderSelectedAreas } from './selection-renderer.js';

const flow = createRegionFlow();

function el(id) {
    return document.getElementById(id);
}

function onActivate(node, handler) {
    node.addEventListener('click', handler);
    node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            handler(event);
        }
    });
}

function syncStepVisibility() {
    const { step } = flow.getState();
    const groupStep = el('region-step-group');
    const detailStep = el('region-step-detail');
    if (groupStep) groupStep.hidden = step !== 'group';
    if (detailStep) detailStep.hidden = step !== 'detail';
}

function removeSelectedArea(area) {
    toggleSelectedArea(area);
    renderSelectedAreas(getSelectedAreas(), removeSelectedArea);
    syncDetailButtons();
}

function syncDetailButtons() {
    const selected = getSelectedAreas();
    document.querySelectorAll('.region-detail-btn').forEach(btn => {
        const isSel = selected.includes(btn.dataset.area);
        btn.classList.toggle('selected', isSel);
        btn.setAttribute('aria-pressed', String(isSel));
    });
}

function renderGroupCards() {
    const container = el('region-group-cards');
    if (!container) return;
    container.replaceChildren();
    getGroups().forEach(group => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'region-group-card';
        card.dataset.group = group.id;
        card.textContent = group.label;
        card.addEventListener('click', () => enterGroup(group.id));
        container.appendChild(card);
    });
}

function renderDetailButtons() {
    const container = el('region-detail-buttons');
    if (!container) return;
    container.replaceChildren();
    const selected = getSelectedAreas();
    flow.getCurrentSubAreas().forEach(({ area, label }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'region-detail-btn';
        btn.dataset.area = area;
        btn.textContent = label;
        const isSel = selected.includes(area);
        btn.classList.toggle('selected', isSel);
        btn.setAttribute('aria-pressed', String(isSel));
        onActivate(btn, () => toggleArea(area));
        container.appendChild(btn);
    });
}

function enterGroup(groupId) {
    flow.selectGroup(groupId);
    if (flow.getState().step !== 'detail') return;
    const title = el('region-detail-title');
    if (title) {
        const group = getGroups().find(g => g.id === groupId);
        title.textContent = group ? `${group.label} — 아픈 곳을 모두 골라주세요` : '세부 위치를 골라주세요';
    }
    renderDetailButtons();
    syncStepVisibility();
}

function toggleArea(area) {
    toggleSelectedArea(area);
    renderSelectedAreas(getSelectedAreas(), removeSelectedArea);
    syncDetailButtons();
}

function goBack() {
    flow.back();
    syncStepVisibility();
}

export function resetRegionSelect() {
    flow.reset();
    resetAreaSelection();
    renderSelectedAreas(getSelectedAreas(), removeSelectedArea);
    syncStepVisibility();
}

export function initRegionSelect() {
    renderGroupCards();
    syncStepVisibility();

    // SVG 그룹 zone = 그룹 카드와 동일 동작
    document.querySelectorAll('.region-zone').forEach(zone => {
        zone.setAttribute('role', 'button');
        zone.setAttribute('tabindex', '0');
        onActivate(zone, () => enterGroup(zone.dataset.group));
    });

    const backBtn = el('region-back');
    if (backBtn) backBtn.addEventListener('click', goBack);

    const clearBtn = el('clear-selection');
    if (clearBtn) clearBtn.addEventListener('click', () => resetRegionSelect());

    const quickClear = el('quick-clear');
    if (quickClear) quickClear.addEventListener('click', () => resetRegionSelect());

    renderSelectedAreas(getSelectedAreas(), removeSelectedArea);
}
