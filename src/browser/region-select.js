// SVG 인체 지도 직접 선택 UI.
// 앞/뒷면 전환 + clickable-area 클릭 → 선택 상태 토글.

import { getSelectedAreas, toggleSelectedArea, resetAreaSelection } from './selection-state.js';
import { renderSelectedAreas } from './selection-renderer.js';

let tooltipEl = null;

function el(id) {
    return document.getElementById(id);
}

function showTooltip(label, clientX, clientY) {
    if (!tooltipEl) return;
    tooltipEl.textContent = label;
    tooltipEl.style.left = (clientX + 14) + 'px';
    tooltipEl.style.top = (clientY - 38) + 'px';
    tooltipEl.removeAttribute('aria-hidden');
    tooltipEl.classList.add('visible');
}

function hideTooltip() {
    if (!tooltipEl) return;
    tooltipEl.classList.remove('visible');
    tooltipEl.setAttribute('aria-hidden', 'true');
}

function removeArea(area) {
    toggleSelectedArea(area);
    renderSelectedAreas(getSelectedAreas(), removeArea);
}

function handleAreaClick(area) {
    toggleSelectedArea(area.dataset.area);
    renderSelectedAreas(getSelectedAreas(), removeArea);
}

function switchView(view) {
    el('front-view')?.classList.toggle('active', view === 'front');
    el('back-view')?.classList.toggle('active', view === 'back');
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
        btn.setAttribute('aria-pressed', String(btn.dataset.view === view));
    });
}

export function resetRegionSelect() {
    resetAreaSelection();
    renderSelectedAreas(getSelectedAreas(), removeArea);
}

export function initRegionSelect() {
    tooltipEl = el('area-tooltip');

    document.querySelectorAll('.clickable-area').forEach(area => {
        area.addEventListener('click', () => handleAreaClick(area));
        area.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAreaClick(area);
            }
        });
        area.addEventListener('mousemove', e => {
            showTooltip(area.getAttribute('aria-label') || area.dataset.area, e.clientX, e.clientY);
        });
        area.addEventListener('mouseleave', hideTooltip);
        area.addEventListener('focus', () => {
            const label = area.getAttribute('aria-label') || area.dataset.area;
            const rect = area.getBoundingClientRect();
            showTooltip(label, rect.left + rect.width / 2, rect.top);
        });
        area.addEventListener('blur', hideTooltip);
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    el('clear-selection')?.addEventListener('click', () => resetRegionSelect());
    el('quick-clear')?.addEventListener('click', () => resetRegionSelect());

    renderSelectedAreas(getSelectedAreas(), removeArea);
}
