import { getAreaDisplayName } from '../../lib/utils.js';
import { unsupportedAreaNotice } from './mvp-area-support.js';
import { setSafeHtml } from './safe-html.js';

export function renderSelectedAreas(selectedAreas, onRemove) {
    syncBodyMapSelection(selectedAreas);
    updateLiveSelectionDisplay(selectedAreas, onRemove);
    updateSelectedAreasList(selectedAreas, onRemove);
}

export function syncBodyMapSelection(selectedAreas) {
    document.querySelectorAll('.clickable-area').forEach(element => {
        element.classList.toggle('selected', selectedAreas.includes(element.dataset.area));
    });
}

export function renderUnsupportedAreaNotice() {
    const list = document.getElementById('selected-list');
    const parent = list?.parentElement || document.body;
    let notice = document.getElementById('mvp-area-notice');

    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'mvp-area-notice';
        notice.className = 'mvp-area-notice';
        parent.insertBefore(notice, list || parent.firstChild);
    }

    setSafeHtml(notice, `<p>${unsupportedAreaNotice}</p>`);
}

export function clearUnsupportedAreaNotice() {
    document.getElementById('mvp-area-notice')?.remove();
}

function updateSelectedAreasList(selectedAreas, onRemove) {
    const list = document.getElementById('selected-list');
    const countElement = document.getElementById('selection-count');

    if (countElement) {
        countElement.textContent = `${selectedAreas.length}개 선택됨`;
    }

    if (!list) {
        return;
    }

    setSafeHtml(list, '');

    if (selectedAreas.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-selection';
        setSafeHtml(emptyDiv, `
            <div class="empty-selection-icon">🎯</div>
            <div>아픈 부위를 클릭해서 선택해주세요</div>
        `);
        list.appendChild(emptyDiv);
        return;
    }

    selectedAreas.forEach(area => {
        const li = document.createElement('li');
        const areaName = document.createElement('span');
        const removeBtn = document.createElement('button');

        areaName.className = 'area-name';
        areaName.textContent = getAreaDisplayName(area);
        removeBtn.className = 'remove-area';
        removeBtn.textContent = '×';
        removeBtn.title = '제거';
        removeBtn.addEventListener('click', event => {
            event.stopPropagation();
            onRemove(area);
        });

        li.appendChild(areaName);
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

function updateLiveSelectionDisplay(selectedAreas, onRemove) {
    const liveText = document.getElementById('live-selection-text');
    const badgesContainer = document.getElementById('live-selection-badges');
    const quickClearBtn = document.getElementById('quick-clear');

    if (liveText) {
        if (selectedAreas.length === 0) {
            liveText.textContent = '아픈 곳을 클릭하세요';
        } else if (selectedAreas.length === 1) {
            liveText.textContent = '1개 선택';
        } else {
            liveText.textContent = `${selectedAreas.length}개 선택`;
        }
    }

    if (quickClearBtn) {
        quickClearBtn.hidden = selectedAreas.length === 0;
    }

    if (!badgesContainer) {
        return;
    }

    setSafeHtml(badgesContainer, '');
    selectedAreas.forEach(area => {
        const badge = document.createElement('div');
        const label = document.createElement('span');
        const removeBtn = document.createElement('button');

        badge.className = 'selection-badge';
        label.textContent = getAreaDisplayName(area);
        removeBtn.className = 'remove-btn';
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.dataset.area = area;
        removeBtn.addEventListener('click', event => {
            event.stopPropagation();
            onRemove(area);
        });

        badge.appendChild(label);
        badge.appendChild(removeBtn);
        badgesContainer.appendChild(badge);
    });
}
