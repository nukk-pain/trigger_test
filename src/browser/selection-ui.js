import { validateStep1 as validateStep1Pure } from '../../lib/utils.js';
import { showNotification } from './notifications.js';
import {
    getSelectedAreas,
    removeAreaSelection,
    resetAreaSelection,
    setPainQuestionnaire,
} from './selection-state.js';
import { renderSelectedAreas, syncBodyMapSelection } from './selection-renderer.js';
import { setupBodyMapEvents as setupSelectionEvents } from './selection-events.js';

export function setupBodyMapEvents() {
    setupSelectionEvents(removeSelectedArea);
}

export function validateStep1() {
    const painDescription = document.getElementById('pain-description').value.trim();
    const result = validateStep1Pure(getSelectedAreas(), painDescription);

    if (!result.valid) {
        showNotification(result.message, 'warning');
        return false;
    }

    return true;
}

export function collectActionData() {
    const painDescription = document.getElementById('pain-description').value.trim();
    setPainQuestionnaire(painDescription);
}

function removeSelectedArea(areaToRemove) {
    removeAreaSelection(areaToRemove);
    renderSelectedAreas(getSelectedAreas(), removeSelectedArea);
}

export function clearSelection() {
    resetAreaSelection();
    renderSelectedAreas(getSelectedAreas(), removeSelectedArea);
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
    syncBodyMapSelection(getSelectedAreas());
}
