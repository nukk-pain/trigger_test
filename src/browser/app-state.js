export const appState = {
  currentStep: 1,
  painData: {
    questionnaire: {},
    selectedAreas: [],
    analysis: {}
  },
  currentGuide: null
};

export function resetPainData() {
  appState.painData.questionnaire = {};
  appState.painData.selectedAreas = [];
  appState.painData.analysis = {};
}
