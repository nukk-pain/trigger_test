import { describe, expect, it, beforeEach } from 'vitest';
import { createRegionFlow } from '../src/browser/region-flow.js';

describe('region-flow (2-step state)', () => {
  let flow;
  beforeEach(() => {
    flow = createRegionFlow();
  });

  it('starts at the group step with no group selected', () => {
    expect(flow.getState()).toEqual({ step: 'group', groupId: null });
  });

  it('selectGroup moves to detail and exposes that group sub-areas', () => {
    flow.selectGroup('back-waist');
    expect(flow.getState()).toEqual({ step: 'detail', groupId: 'back-waist' });
    const subs = flow.getCurrentSubAreas();
    expect(subs.map(s => s.area)).toContain('lower-back-center');
    expect(subs.every(s => typeof s.label === 'string' && s.label.length > 0)).toBe(true);
  });

  it('ignores selectGroup with an unknown id (stays at group)', () => {
    flow.selectGroup('nope');
    expect(flow.getState()).toEqual({ step: 'group', groupId: null });
  });

  it('back returns from detail to group and clears groupId', () => {
    flow.selectGroup('neck-shoulder');
    flow.back();
    expect(flow.getState()).toEqual({ step: 'group', groupId: null });
  });

  it('reset returns to the initial group step', () => {
    flow.selectGroup('pelvis-hip');
    flow.reset();
    expect(flow.getState()).toEqual({ step: 'group', groupId: null });
  });

  it('getCurrentSubAreas is empty at the group step', () => {
    expect(flow.getCurrentSubAreas()).toEqual([]);
  });
});
