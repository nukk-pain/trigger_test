import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzePain, analysisFallbacks } from '../src/browser/analysis-flow.js';
import { appState, resetPainData } from '../src/browser/app-state.js';
import { collectActionData } from '../src/browser/selection-ui.js';

describe('analysis flow safety handling', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="red-flag-warning" class="hidden">
        <div class="emergency-notice"></div>
      </div>
      <div id="massage-guide">
        <div id="ai-analysis-result"></div>
        <div id="massage-steps"></div>
      </div>
      <div id="loading-indicator"></div>
      <textarea id="pain-description"></textarea>
    `;
    resetPainData();
    window.openRouterConfig = {
      getRemainingRequests: vi.fn(() => 1),
      getUsageStats: vi.fn(() => ({
        daily: { used: 0, limit: 50 },
        monthly: { used: 0, limit: 1000 }
      })),
      makeRequest: vi.fn()
    };
    window.MEDICAL_PROMPTS = {
      PAIN_ANALYSIS: 'self care prompt'
    };
  });

  it('shows red flag warning before any AI request for emergency conditions', async () => {
    document.getElementById('pain-description').value = '컴퓨터 작업 중 목도 아프지만 갑자기 가슴 통증과 숨이 차는 느낌이 있습니다.';
    appState.painData.selectedAreas = ['neck-front'];

    collectActionData();
    await analyzePain();

    expect(document.getElementById('red-flag-warning').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('massage-guide').style.display).toBe('none');
    expect(appState.painData.analysis.hasRedFlags).toBe(true);
    expect(window.openRouterConfig.makeRequest).not.toHaveBeenCalled();
    expect(window.openRouterConfig.getRemainingRequests).not.toHaveBeenCalled();
  });

  it.each([
    ['chest pain', '목이 아프고 chest pain이 있습니다.'],
    ['breathing trouble', '어깨 통증과 함께 breathing trouble이 있습니다.'],
    ['fever', '허리가 아프고 열이 납니다.'],
    ['trauma', '넘어진 뒤 hip pain이 빠르게 심해졌습니다.'],
    ['severe numbness', '다리 저림이 아니라 심한 감각 저하가 있습니다.'],
    ['weakness/paralysis', '팔에 힘이 빠지고 마비되는 느낌입니다.'],
    ['bowel/bladder changes', '허리 통증 후 소변 조절이 어렵습니다.'],
    ['rapidly worsening pain', '통증이 빠르게 악화되고 있습니다.']
  ])('detects deterministic red flag text: %s', (_label, description) => {
    appState.painData.questionnaire.painDescription = description;

    expect(analysisFallbacks.hasQuestionnaireRedFlags()).toBe(true);
  });

  it('shows non-diagnosis, stop, and care-seeking copy on safe AI results', async () => {
    document.getElementById('pain-description').value = '컴퓨터 작업을 오래 하면 목 뒤가 뻐근합니다.';
    appState.painData.selectedAreas = ['neck-front'];
    window.openRouterConfig.makeRequest.mockResolvedValue('상부 승모근을 부드럽게 이완하세요.');

    collectActionData();
    await analyzePain();

    const resultText = document.getElementById('massage-guide').textContent;
    expect(resultText).toContain('이 도구는 진단이 아니며');
    expect(resultText).toContain('중단');
    expect(resultText).toContain('의료기관');
    expect(document.getElementById('red-flag-warning').classList.contains('hidden')).toBe(true);
    expect(window.openRouterConfig.makeRequest).toHaveBeenCalledTimes(1);
  });
});
