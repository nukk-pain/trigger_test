import { getSelectedAreas, toggleSelectedArea } from './selection-state.js';
import { isMvpSupportedArea } from './mvp-area-support.js';
import {
    clearUnsupportedAreaNotice,
    renderSelectedAreas,
    renderUnsupportedAreaNotice
} from './selection-renderer.js';

function activateArea(area, onRemove) {
    if (!isMvpSupportedArea(area.dataset.area)) {
        renderUnsupportedAreaNotice();
        renderSelectedAreas(getSelectedAreas(), onRemove);
        return;
    }

    clearUnsupportedAreaNotice();
    toggleSelectedArea(area.dataset.area);
    renderSelectedAreas(getSelectedAreas(), onRemove);
}

// 보이는 뷰(.body-view.active)의 영역만 키보드 탭 순서에 포함.
// 숨은 뷰는 tabindex=-1로 빼서 96개 탭 폭주를 막는다.
export function updateAreaTabindex() {
    document.querySelectorAll('.clickable-area').forEach(area => {
        const view = area.closest('.body-view');
        const isActive = view ? view.classList.contains('active') : true;
        area.setAttribute('tabindex', isActive ? '0' : '-1');
    });
}

export function setupBodyMapEvents(onRemove) {
    document.querySelectorAll('.clickable-area').forEach(area => {
        const label = area.getAttribute('title') || area.dataset.area;
        area.setAttribute('role', 'button');
        area.setAttribute('aria-label', label);
        if (!area.hasAttribute('aria-pressed')) {
            area.setAttribute('aria-pressed', String(getSelectedAreas().includes(area.dataset.area)));
        }

        area.addEventListener('click', () => activateArea(area, onRemove));
        area.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                activateArea(area, onRemove);
            }
        });
    });

    updateAreaTabindex();
    renderSelectedAreas(getSelectedAreas(), onRemove);
}
