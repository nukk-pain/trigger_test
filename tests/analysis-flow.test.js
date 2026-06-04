import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzePain } from '../src/browser/analysis-flow.js';
import { appState, resetPainData } from '../src/browser/app-state.js';
import { collectActionData } from '../src/browser/selection-ui.js';

describe('analysis flow safety handling', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="red-flag-warning" class="hidden">
        <div class="emergency-notice"></div>
      </div>
      <div id="massage-guide"></div>
      <div id="massage-steps"></div>
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
});
