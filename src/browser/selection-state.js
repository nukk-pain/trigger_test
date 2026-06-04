import { appState } from './app-state.js';

const painData = appState.painData;

export function getSelectedAreas() {
    return painData.selectedAreas;
}

export function toggleSelectedArea(area) {
    const index = painData.selectedAreas.indexOf(area);
    if (index > -1) {
        painData.selectedAreas.splice(index, 1);
    } else {
        painData.selectedAreas.push(area);
    }
    return painData.selectedAreas;
}

export function removeAreaSelection(areaToRemove) {
    painData.selectedAreas = painData.selectedAreas.filter(area => area !== areaToRemove);
    return painData.selectedAreas;
}

export function resetAreaSelection() {
    painData.selectedAreas = [];
    return painData.selectedAreas;
}

export function setPainQuestionnaire(painDescription) {
    painData.questionnaire = {
        painDescription,
        aggravatingActions: []
    };
}
