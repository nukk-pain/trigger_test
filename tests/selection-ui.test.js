import { describe, expect, it, beforeEach, vi } from 'vitest';
import { appState } from '../src/browser/app-state.js';
import { clearSelection, setupBodyMapEvents, switchBodyView } from '../src/browser/selection-ui.js';

vi.mock('../src/browser/notifications.js', () => ({
  showNotification: vi.fn()
}));

describe('selection UI', () => {
  beforeEach(() => {
    appState.painData.selectedAreas = [];
    document.body.innerHTML = `
      <button class="view-tab active" data-view="front"></button>
      <button class="view-tab" data-view="back"></button>
      <svg>
        <g id="front-view" class="body-view active"></g>
        <g id="back-view" class="body-view"></g>
        <rect class="clickable-area" data-area="neck-front"></rect>
        <rect class="clickable-area" data-area="wrist-left"></rect>
      </svg>
      <span id="live-selection-text"></span>
      <button id="quick-clear" hidden></button>
      <ul id="selected-list"></ul>
      <span id="selection-count"></span>
    `;
  });

  it('clicks, renders, clears, and preserves body-view state', () => {
    setupBodyMapEvents();
    document.querySelector('[data-area="neck-front"]').dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    expect(appState.painData.selectedAreas).toEqual(['neck-front']);
    expect(document.querySelector('[data-area="neck-front"]').classList.contains('selected')).toBe(true);
    expect(document.getElementById('live-selection-text').textContent).toBe('1개 선택');
    expect(document.getElementById('quick-clear').hidden).toBe(false);

    switchBodyView('back');
    expect(document.getElementById('back-view').classList.contains('active')).toBe(true);

    clearSelection();
    expect(appState.painData.selectedAreas).toEqual([]);
    expect(document.querySelector('[data-area="neck-front"]').classList.contains('selected')).toBe(false);
  });

  it('keeps unsupported MVP areas out of selection and shows a notice', () => {
    setupBodyMapEvents();
    document.querySelector('[data-area="wrist-left"]').dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    expect(appState.painData.selectedAreas).toEqual([]);
    expect(document.querySelector('[data-area="wrist-left"]').classList.contains('selected')).toBe(false);
    expect(document.getElementById('mvp-area-notice').textContent).toContain('현재 MVP에서 지원 준비 중입니다');

    document.querySelector('[data-area="neck-front"]').dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    expect(appState.painData.selectedAreas).toEqual(['neck-front']);
    expect(document.getElementById('mvp-area-notice')).toBeNull();
  });
});
