// 부위 선택 2단계 상태머신 (순수 상태, DOM 무관).
// step: 'group'(그룹 3개 중 선택) → 'detail'(그 그룹의 세부 부위 버튼).
// 세부 area의 실제 토글/선택은 selection-state가 담당하고, 여기서는 단계만 관리한다.

import { getSubAreas } from '../../lib/area-groups.js';

export function createRegionFlow() {
    let step = 'group';
    let groupId = null;

    return {
        getState() {
            return { step, groupId };
        },

        getCurrentSubAreas() {
            return step === 'detail' && groupId ? getSubAreas(groupId) : [];
        },

        selectGroup(id) {
            // 알 수 없는 그룹은 무시(getSubAreas가 빈 배열이면 유효하지 않은 그룹)
            if (getSubAreas(id).length === 0) {
                return;
            }
            step = 'detail';
            groupId = id;
        },

        back() {
            step = 'group';
            groupId = null;
        },

        reset() {
            step = 'group';
            groupId = null;
        }
    };
}
