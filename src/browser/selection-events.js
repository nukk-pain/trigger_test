import { getSelectedAreas, toggleSelectedArea } from './selection-state.js';
import { isMvpSupportedArea } from './mvp-area-support.js';
import {
    clearUnsupportedAreaNotice,
    renderSelectedAreas,
    renderUnsupportedAreaNotice
} from './selection-renderer.js';

export function setupBodyMapEvents(onRemove) {
    document.querySelectorAll('.clickable-area').forEach(area => {
        area.addEventListener('click', () => {
            if (!isMvpSupportedArea(area.dataset.area)) {
                renderUnsupportedAreaNotice();
                renderSelectedAreas(getSelectedAreas(), onRemove);
                return;
            }

            clearUnsupportedAreaNotice();
            toggleSelectedArea(area.dataset.area);
            renderSelectedAreas(getSelectedAreas(), onRemove);
        });
    });

    renderSelectedAreas(getSelectedAreas(), onRemove);
}
