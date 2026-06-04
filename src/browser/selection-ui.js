import { getAreaDisplayName, validateStep1 as validateStep1Pure } from '../../lib/utils.js';
import { appState } from './app-state.js';
import { showNotification } from './notifications.js';
import { setSafeHtml } from './safe-html.js';

const painData = appState.painData;

export function setupBodyMapEvents() {
    const clickableAreas = document.querySelectorAll('.clickable-area');

    clickableAreas.forEach(area => {
        area.addEventListener('click', function() {
            toggleAreaSelection(this.dataset.area);
        });

        // 호버 효과
        area.addEventListener('mouseover', function() {
            if (!this.classList.contains('selected')) {
                this.style.fill = 'rgba(255, 165, 0, 0.3)';
            }
        });

        area.addEventListener('mouseout', function() {
            if (!this.classList.contains('selected')) {
                this.style.fill = 'rgba(255, 0, 0, 0.1)';
            }
        });
    });
}

export function validateStep1() {
    // lib/utils.js의 순수 함수 사용
    const painDescription = document.getElementById('pain-description').value.trim();
    const result = validateStep1Pure(painData.selectedAreas, painDescription);

    if (!result.valid) {
        showNotification(result.message, 'warning');
        return false;
    }

    return true;
}


export function collectActionData() {
    const painDescription = document.getElementById('pain-description').value.trim();
    painData.questionnaire = {
        painDescription: painDescription,
        aggravatingActions: [] // 기존 체크박스 방식 제거
    };
}

function toggleAreaSelection(area) {
    const element = document.querySelector(`[data-area="${area}"]`);
    const index = painData.selectedAreas.indexOf(area);

    if (index > -1) {
        // 선택 해제
        painData.selectedAreas.splice(index, 1);
        element.classList.remove('selected');
        // 인라인 스타일 완전히 제거하여 원래 상태로 복원
        element.style.fill = '';
        element.style.stroke = '';
        element.style.strokeWidth = '';
        element.style.opacity = '';
    } else {
        // 선택 추가
        painData.selectedAreas.push(area);
        element.classList.add('selected');
        element.style.fill = 'rgba(255, 0, 0, 0.7)';
    }

    updateSelectedAreasList();
}

function updateSelectedAreasList() {
    const list = document.getElementById('selected-list');
    const countElement = document.getElementById('selection-count');

    // 실시간 상단 표시 업데이트
    updateLiveSelectionDisplay();

    if (list) {
        setSafeHtml(list, '');

        // 개수 업데이트
        if (countElement) {
            countElement.textContent = `${painData.selectedAreas.length}개 선택됨`;
        }

        if (painData.selectedAreas.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-selection';
            setSafeHtml(emptyDiv, `
                <div class="empty-selection-icon">🎯</div>
                <div>아픈 부위를 클릭해서 선택해주세요</div>
            `);
            list.appendChild(emptyDiv);
            return;
        }

        painData.selectedAreas.forEach(area => {
            const li = document.createElement('li');

            const areaName = document.createElement('span');
            areaName.className = 'area-name';
            areaName.textContent = getAreaDisplayName(area);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-area';
            setSafeHtml(removeBtn, '×');
            removeBtn.title = '제거';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeSelectedArea(area);
            });

            li.appendChild(areaName);
            li.appendChild(removeBtn);
            list.appendChild(li);
        });
    }
}

function updateLiveSelectionDisplay() {
    const liveText = document.getElementById('live-selection-text');
    const badgesContainer = document.getElementById('live-selection-badges');
    const quickClearBtn = document.getElementById('quick-clear');

    if (!liveText || !badgesContainer) return;

    // 텍스트 업데이트
    if (painData.selectedAreas.length === 0) {
        liveText.textContent = '아픈 곳을 클릭하세요';
    } else if (painData.selectedAreas.length === 1) {
        liveText.textContent = '1개 선택';
    } else {
        liveText.textContent = `${painData.selectedAreas.length}개 선택`;
    }

    // 배지 업데이트
    setSafeHtml(badgesContainer, '');
    painData.selectedAreas.forEach(area => {
        const badge = document.createElement('div');
        badge.className = 'selection-badge';
        setSafeHtml(badge, `
            <span>${getAreaDisplayName(area)}</span>
            <span class="remove-btn" data-area="${area}">×</span>
        `);

        // 개별 제거 이벤트
        const removeBtn = badge.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSelectedArea(area);
        });

        badgesContainer.appendChild(badge);
    });

    // 전체 지우기 버튼 표시/숨김
    if (quickClearBtn) {
        if (painData.selectedAreas.length > 0) {
            quickClearBtn.style.display = 'block';
        } else {
            quickClearBtn.style.display = 'none';
        }
    }
}

function removeSelectedArea(areaToRemove) {
    painData.selectedAreas = painData.selectedAreas.filter(area => area !== areaToRemove);

    // SVG에서 선택 표시 제거
    const areaElement = document.querySelector(`[data-area="${areaToRemove}"]`);
    if (areaElement) {
        areaElement.classList.remove('selected');
        // 인라인 스타일도 제거하여 완전히 원래 상태로 복원
        areaElement.style.fill = '';
        areaElement.style.stroke = '';
        areaElement.style.strokeWidth = '';
        areaElement.style.opacity = '';
    }

    updateSelectedAreasList();
}

// getAreaDisplayName는 lib/utils.js에서 import됨

export function clearSelection() {
    painData.selectedAreas.forEach(area => {
        const element = document.querySelector(`[data-area="${area}"]`);
        if (element) {
            element.classList.remove('selected');
            // 인라인 스타일 완전히 제거하여 원래 상태로 복원
            element.style.fill = '';
            element.style.stroke = '';
            element.style.strokeWidth = '';
            element.style.opacity = '';
            element.style.fillOpacity = '';
            // Force style recalculation
            element.offsetHeight;
        }
    });

    painData.selectedAreas = [];
    updateSelectedAreasList();
    updateLiveSelectionDisplay();
}

export function switchBodyView(view) {
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    document.querySelectorAll('.body-view').forEach(bodyView => {
        bodyView.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');
}
