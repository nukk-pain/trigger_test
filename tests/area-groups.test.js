import { describe, expect, it } from 'vitest';
import { getGroups, getSubAreas } from '../lib/area-groups.js';
import { isMvpSupportedArea } from '../src/browser/mvp-area-support.js';
import { getAreaDisplayName } from '../lib/area-display.js';
import { triggerPointsDB } from '../lib/data.js';

// 분석 적중 헬퍼: 트리거포인트 painAreas에 등장하면 비어있지 않은 결과 보장
function hasTriggerCoverage(area) {
  return triggerPointsDB.some(tp => tp.painAreas.includes(area));
}

const ALL_AREAS = () => getGroups().flatMap(g => getSubAreas(g.id).map(s => s.area));

// 레거시 호환키 (area-display.js:128-149) — 그룹에 들어가면 안 됨
const LEGACY_KEYS = [
  'neck', 'neck-back', 'shoulder-left', 'shoulder-right',
  'shoulder-back-left', 'shoulder-back-right', 'upper-back', 'lower-back',
  'buttocks'
];

describe('REGION_GROUPS contract', () => {
  it('exposes exactly 3 groups with labels and ids', () => {
    const groups = getGroups();
    expect(groups.map(g => g.id).sort()).toEqual(['back-waist', 'neck-shoulder', 'pelvis-hip']);
    groups.forEach(g => {
      expect(typeof g.label).toBe('string');
      expect(g.label.length).toBeGreaterThan(0);
    });
  });

  it('(C1) every area is MVP-supported', () => {
    ALL_AREAS().forEach(area => {
      expect(isMvpSupportedArea(area), `${area} should be MVP-supported`).toBe(true);
    });
  });

  it('(C2) every area has a Korean display name (not the raw key)', () => {
    ALL_AREAS().forEach(area => {
      const label = getAreaDisplayName(area);
      expect(label, `${area} has no display name`).not.toBe(area);
      expect(label.length).toBeGreaterThan(0);
    });
  });

  it('(C2b) sub-item label matches getAreaDisplayName', () => {
    getGroups().forEach(g => {
      getSubAreas(g.id).forEach(s => {
        expect(s.label).toBe(getAreaDisplayName(s.area));
      });
    });
  });

  it('(C3) every area yields non-empty analysis (trigger coverage > 0)', () => {
    ALL_AREAS().forEach(area => {
      expect(hasTriggerCoverage(area), `${area} has no trigger-point coverage → empty result`).toBe(true);
    });
  });

  it('(C4) no legacy compat keys appear in any group', () => {
    const areas = ALL_AREAS();
    LEGACY_KEYS.forEach(k => {
      expect(areas, `legacy key ${k} must not be a selectable area`).not.toContain(k);
    });
  });

  it('(C5) no dead trigger points: every supported+trigger-covered area is reachable', () => {
    // 모든 트리거포인트 painAreas 중 MVP 지원이면서 trigger 적중인 area는 어떤 그룹엔가 있어야 함.
    const reachable = new Set(ALL_AREAS());
    const supportedTriggerAreas = new Set();
    triggerPointsDB.forEach(tp => tp.painAreas.forEach(a => {
      if (isMvpSupportedArea(a)) supportedTriggerAreas.add(a);
    }));
    supportedTriggerAreas.forEach(a => {
      expect(reachable.has(a), `${a} is supported & trigger-covered but unreachable from groups`).toBe(true);
    });
  });

  it('excludes the empty-analysis areas decided by doubt (sacral etc.)', () => {
    const areas = ALL_AREAS();
    ['sacral', 'neck-side-left-back', 'neck-side-right-back', 'lower-back-upper'].forEach(a => {
      expect(areas, `${a} has no trigger coverage and must be excluded`).not.toContain(a);
    });
  });

  it('getSubAreas returns [] for unknown group', () => {
    expect(getSubAreas('nonexistent')).toEqual([]);
  });
});
