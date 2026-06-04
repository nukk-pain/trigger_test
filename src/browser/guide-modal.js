import {
    closeInteractiveGuide as closeGuide,
    startInteractiveGuide as startGuide
} from './guide-controller.js';

export function configureGuideModal() {}

export function startInteractiveGuide(triggerPointName, location) {
    startGuide(triggerPointName, location);
}

export function closeInteractiveGuide() {
    closeGuide();
}
