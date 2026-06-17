import { describe, expect, it, beforeEach, vi } from 'vitest';
import { appState } from '../src/browser/app-state.js';
import { initRegionSelect } from '../src/browser/region-select.js';

vi.mock('../src/browser/notifications.js', () => ({
  showNotification: vi.fn()
}));

function setupDom() {
  document.body.innerHTML = `
    <div id="region-select">
      <svg>
        <g id="region-zones">
          <rect class="region-zone" data-group="neck-shoulder"></rect>
          <rect class="region-zone" data-group="back-waist"></rect>
          <rect class="region-zone" data-group="pelvis-hip"></rect>
        </g>
      </svg>
      <div class="region-step active" id="region-step-group">
        <div id="region-group-cards"></div>
      </div>
      <div class="region-step" id="region-step-detail" hidden>
        <button id="region-back"></button>
        <p id="region-detail-title"></p>
        <div id="region-detail-buttons"></div>
      </div>
      <span id="live-selection-text"></span>
      <button id="quick-clear" hidden></button>
      <ul id="selected-list"></ul>
      <span id="selection-count"></span>
    </div>
  `;
}

describe('region-select (2-step UI)', () => {
  beforeEach(() => {
    appState.painData.selectedAreas = [];
    setupDom();
    initRegionSelect();
  });

  it('renders 3 group cards at start', () => {
    const cards = document.querySelectorAll('#region-group-cards .region-group-card');
    expect(cards.length).toBe(3);
    expect([...cards].map(c => c.dataset.group)).toEqual(['neck-shoulder', 'back-waist', 'pelvis-hip']);
    expect(document.getElementById('region-step-detail').hidden).toBe(true);
  });

  it('selecting a group card shows detail step with that group sub-area buttons', () => {
    document.querySelector('[data-group="back-waist"].region-group-card')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.getElementById('region-step-detail').hidden).toBe(false);
    expect(document.getElementById('region-step-group').hidden).toBe(true);
    const btns = document.querySelectorAll('#region-detail-buttons .region-detail-btn');
    expect(btns.length).toBe(7); // back-waist has 7 areas
    expect([...btns].map(b => b.dataset.area)).toContain('lower-back-center');
  });

  it('clicking a detail button adds the exact data-area to selectedAreas', () => {
    document.querySelector('[data-group="back-waist"].region-group-card')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('[data-area="lower-back-center"].region-detail-btn')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(appState.painData.selectedAreas).toContain('lower-back-center');
    const btn = document.querySelector('[data-area="lower-back-center"].region-detail-btn');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.classList.contains('selected')).toBe(true);
  });

  it('supports multi-select of two detail buttons', () => {
    document.querySelector('[data-group="back-waist"].region-group-card')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('[data-area="lower-back-left"].region-detail-btn')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('[data-area="lower-back-right"].region-detail-btn')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(appState.painData.selectedAreas).toEqual(
      expect.arrayContaining(['lower-back-left', 'lower-back-right'])
    );
  });

  it('clicking a selected detail button again toggles it off', () => {
    document.querySelector('[data-group="back-waist"].region-group-card')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const btn = document.querySelector('[data-area="lower-back-center"].region-detail-btn');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(appState.painData.selectedAreas).not.toContain('lower-back-center');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('back button returns to group step', () => {
    document.querySelector('[data-group="pelvis-hip"].region-group-card')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.getElementById('region-back').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.getElementById('region-step-group').hidden).toBe(false);
    expect(document.getElementById('region-step-detail').hidden).toBe(true);
  });

  it('an SVG group zone behaves like the matching group card', () => {
    document.querySelector('.region-zone[data-group="neck-shoulder"]')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('region-step-detail').hidden).toBe(false);
    const btns = document.querySelectorAll('#region-detail-buttons .region-detail-btn');
    expect(btns.length).toBe(11); // neck-shoulder has 11 areas
  });

  it('keyboard Enter on a detail button selects it', () => {
    document.querySelector('[data-group="back-waist"].region-group-card')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const btn = document.querySelector('[data-area="mid-back-center"].region-detail-btn');
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(appState.painData.selectedAreas).toContain('mid-back-center');
  });
});
