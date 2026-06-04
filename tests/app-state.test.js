import { describe, expect, it } from 'vitest';
import { appState, resetPainData } from '../src/browser/app-state.js';

describe('appState', () => {
  it('resets pain data while preserving the shared object reference', () => {
    const reference = appState.painData;
    appState.painData.selectedAreas.push('neck-front');
    appState.painData.questionnaire.painDescription = '목 통증';
    appState.painData.analysis.aiEnhanced = true;

    resetPainData();

    expect(appState.painData).toBe(reference);
    expect(appState.painData).toEqual({
      questionnaire: {},
      selectedAreas: [],
      analysis: {}
    });
  });

  it('keeps guide navigation state out of window globals', () => {
    appState.currentGuide = { currentStep: 0, totalSteps: 1 };

    expect(window.currentGuide).toBeUndefined();
    expect(appState.currentGuide.currentStep).toBe(0);

    appState.currentGuide = null;
  });
});
