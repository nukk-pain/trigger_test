import { describe, expect, it, beforeEach, vi } from 'vitest';
import { appState } from '../src/browser/app-state.js';
import { setupBodyMapEvents, switchBodyView } from '../src/browser/selection-ui.js';

vi.mock('../src/browser/notifications.js', () => ({
  showNotification: vi.fn()
}));

describe('selection accessibility (keyboard + ARIA)', () => {
  beforeEach(() => {
    appState.painData.selectedAreas = [];
    document.body.innerHTML = `
      <button class="view-tab active" data-view="front"></button>
      <button class="view-tab" data-view="back"></button>
      <svg>
        <g id="front-view" class="body-view active">
          <rect class="clickable-area" data-area="neck-front" title="목 앞쪽"></rect>
        </g>
        <g id="back-view" class="body-view">
          <rect class="clickable-area" data-area="lower-back-center" title="허리 중앙"></rect>
        </g>
      </svg>
      <span id="live-selection-text"></span>
      <button id="quick-clear" hidden></button>
      <ul id="selected-list"></ul>
      <span id="selection-count"></span>
    `;
  });

  it('assigns button role, aria-label, aria-pressed, and view-aware tabindex on setup', () => {
    setupBodyMapEvents();
    const front = document.querySelector('[data-area="neck-front"]');
    const back = document.querySelector('[data-area="lower-back-center"]');

    expect(front.getAttribute('role')).toBe('button');
    expect(front.getAttribute('aria-label')).toBe('목 앞쪽');
    expect(front.getAttribute('aria-pressed')).toBe('false');
    // 보이는 뷰만 포커스 가능, 숨은 뷰는 탭 순서에서 제외
    expect(front.getAttribute('tabindex')).toBe('0');
    expect(back.getAttribute('tabindex')).toBe('-1');
  });

  it('toggles selection via Enter key and syncs aria-pressed', () => {
    setupBodyMapEvents();
    const front = document.querySelector('[data-area="neck-front"]');

    front.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(appState.painData.selectedAreas).toEqual(['neck-front']);
    expect(front.getAttribute('aria-pressed')).toBe('true');
    expect(front.classList.contains('selected')).toBe(true);

    front.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(appState.painData.selectedAreas).toEqual([]);
    expect(front.getAttribute('aria-pressed')).toBe('false');
  });

  it('toggles via Space and prevents default scroll', () => {
    setupBodyMapEvents();
    const front = document.querySelector('[data-area="neck-front"]');
    const evt = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

    front.dispatchEvent(evt);
    expect(appState.painData.selectedAreas).toEqual(['neck-front']);
    expect(evt.defaultPrevented).toBe(true);
  });

  it('updates tabindex when body view switches', () => {
    setupBodyMapEvents();
    const front = document.querySelector('[data-area="neck-front"]');
    const back = document.querySelector('[data-area="lower-back-center"]');

    switchBodyView('back');
    expect(back.getAttribute('tabindex')).toBe('0');
    expect(front.getAttribute('tabindex')).toBe('-1');
  });
});
