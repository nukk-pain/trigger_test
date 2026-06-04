import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appState } from '../src/browser/app-state.js';
import { closeInteractiveGuide, startInteractiveGuide } from '../src/browser/guide-modal.js';

vi.mock('../src/browser/notifications.js', () => ({
  showSuccessMessage: vi.fn()
}));

describe('guide modal', () => {
  beforeEach(() => {
    appState.currentGuide = null;
    document.body.innerHTML = '';
  });

  it('opens, advances, and closes a known guide', () => {
    startInteractiveGuide('상부 승모근', 'neck-shoulder-junction');

    expect(document.querySelector('.interactive-guide-modal')).toBeTruthy();
    expect(appState.currentGuide.totalSteps).toBe(4);

    document.getElementById('next-step').click();
    expect(appState.currentGuide.currentStep).toBe(1);
    expect(document.getElementById('guide-content').textContent).toContain('단계 2');

    closeInteractiveGuide();
    expect(document.querySelector('.interactive-guide-modal')).toBeNull();
    expect(appState.currentGuide).toBeNull();
  });
});
