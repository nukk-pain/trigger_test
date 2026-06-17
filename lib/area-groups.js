// 부위 선택 2단계 UI의 그룹 정의 (정적 데이터).
//
// 원칙 (doubt 검증 반영):
// - 여기 들어가는 모든 data-area는 MVP 지원(isMvpSupportedArea=true)이면서,
//   trigger-points.js painAreas에 실제로 등장해 비어있지 않은 분석을 산출하는 것만 포함한다.
// - 트리거 적중이 0인 부위(sacral, neck-side-*-back, lower-back-upper)는 제외 —
//   선택해도 빈 가이드가 나오는 false affordance를 막기 위함.
// - 레거시 호환키('neck','shoulder-left' 등)는 포함하지 않는다.
// - label은 lib/area-display.js getAreaDisplayName의 한글명을 그대로 사용(SSOT 일원화).

import { getAreaDisplayName } from './area-display.js';

const GROUP_AREAS = {
    'neck-shoulder': [
        'neck-front', 'neck-left', 'neck-right', 'neck-back-upper', 'neck-back-lower',
        'shoulder-left-front', 'shoulder-right-front',
        'shoulder-blade-left', 'shoulder-blade-right',
        'shoulder-top-left', 'shoulder-top-right'
    ],
    'back-waist': [
        'upper-back-center', 'upper-back-left', 'upper-back-right',
        'mid-back-center',
        'lower-back-left', 'lower-back-right', 'lower-back-center'
    ],
    'pelvis-hip': [
        'pelvis-left', 'pelvis-right',
        'buttock-left-upper', 'buttock-right-upper',
        'buttock-left-lower', 'buttock-right-lower'
    ]
};

const GROUP_LABELS = {
    'neck-shoulder': '목·어깨',
    'back-waist': '등·허리',
    'pelvis-hip': '골반·엉덩이'
};

const GROUP_ORDER = ['neck-shoulder', 'back-waist', 'pelvis-hip'];

export const REGION_GROUPS = GROUP_ORDER.map(id => ({
    id,
    label: GROUP_LABELS[id],
    areas: GROUP_AREAS[id].map(area => ({ area, label: getAreaDisplayName(area) }))
}));

export function getGroups() {
    return REGION_GROUPS.map(({ id, label }) => ({ id, label }));
}

export function getSubAreas(groupId) {
    const group = REGION_GROUPS.find(g => g.id === groupId);
    return group ? group.areas : [];
}
