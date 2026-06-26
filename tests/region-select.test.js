import { describe, expect, it, beforeEach, vi } from 'vitest';
import { appState } from '../src/browser/app-state.js';
import { initRegionSelect, resetRegionSelect } from '../src/browser/region-select.js';

vi.mock('../src/browser/notifications.js', () => ({
  showNotification: vi.fn()
}));

function setupDom() {
  document.body.innerHTML = `
    <div id="region-select">
      <div class="view-toggle">
        <button class="view-btn active" data-view="front">앞면</button>
        <button class="view-btn" data-view="back">뒷면</button>
      </div>
      <div id="body-map">
        <svg id="body-svg">
          <g id="front-view" class="body-view active">
            <ellipse class="clickable-area" data-area="head-front" data-group="head" aria-label="이마/앞머리" tabindex="0" role="button" aria-pressed="false" />
            <rect class="clickable-area" data-area="lower-back-center" data-group="back-waist" aria-label="허리 중앙" tabindex="0" role="button" aria-pressed="false" />
            <rect class="clickable-area" data-area="lower-back-left" data-group="back-waist" aria-label="허리 왼쪽" tabindex="0" role="button" aria-pressed="false" />
            <rect class="clickable-area" data-area="lower-back-right" data-group="back-waist" aria-label="허리 오른쪽" tabindex="0" role="button" aria-pressed="false" />
            <rect class="clickable-area" data-area="mid-back-center" data-group="back-waist" aria-label="등 중간" tabindex="0" role="button" aria-pressed="false" />
          </g>
          <g id="back-view" class="body-view">
            <ellipse class="clickable-area" data-area="head-back" data-group="head" aria-label="뒷머리" tabindex="0" role="button" aria-pressed="false" />
            <ellipse class="clickable-area" data-area="shoulder-blade-left" data-group="neck-shoulder" aria-label="왼쪽 어깨뼈" tabindex="0" role="button" aria-pressed="false" />
          </g>
        </svg>
        <div id="area-tooltip" class="area-tooltip" aria-hidden="true"></div>
      </div>
      <span id="live-selection-text"></span>
      <button id="quick-clear" hidden></button>
      <ul id="selected-list"></ul>
      <span id="selection-count"></span>
    </div>
  `;
}

describe('region-select (SVG 직접 선택)', () => {
  beforeEach(() => {
    appState.painData.selectedAreas = [];
    setupDom();
    initRegionSelect();
  });

  it('초기 상태: 앞면이 활성화되어 있음', () => {
    expect(document.getElementById('front-view').classList.contains('active')).toBe(true);
    expect(document.getElementById('back-view').classList.contains('active')).toBe(false);
  });

  it('뒷면 버튼 클릭 시 뷰 전환', () => {
    document.querySelector('.view-btn[data-view="back"]')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.getElementById('back-view').classList.contains('active')).toBe(true);
    expect(document.getElementById('front-view').classList.contains('active')).toBe(false);
  });

  it('SVG 영역 클릭 시 selectedAreas에 area 추가', () => {
    document.querySelector('[data-area="lower-back-center"]')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(appState.painData.selectedAreas).toContain('lower-back-center');
  });

  it('선택된 영역은 selected 클래스 + aria-pressed=true', () => {
    const area = document.querySelector('[data-area="lower-back-center"]');
    area.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(area.classList.contains('selected')).toBe(true);
    expect(area.getAttribute('aria-pressed')).toBe('true');
  });

  it('다시 클릭하면 선택 해제 (토글)', () => {
    const area = document.querySelector('[data-area="lower-back-center"]');
    area.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    area.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(appState.painData.selectedAreas).not.toContain('lower-back-center');
    expect(area.getAttribute('aria-pressed')).toBe('false');
  });

  it('다중 선택 가능', () => {
    document.querySelector('[data-area="lower-back-left"]')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('[data-area="lower-back-right"]')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(appState.painData.selectedAreas).toEqual(
      expect.arrayContaining(['lower-back-left', 'lower-back-right'])
    );
  });

  it('키보드 Enter로 선택 가능', () => {
    const area = document.querySelector('[data-area="mid-back-center"]');
    area.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(appState.painData.selectedAreas).toContain('mid-back-center');
  });

  it('키보드 Space로 선택 가능', () => {
    const area = document.querySelector('[data-area="head-front"]');
    area.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(appState.painData.selectedAreas).toContain('head-front');
  });

  it('resetRegionSelect 호출 시 선택 초기화', () => {
    document.querySelector('[data-area="lower-back-center"]')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    resetRegionSelect();

    expect(appState.painData.selectedAreas).toHaveLength(0);
  });
});
