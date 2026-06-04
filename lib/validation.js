export function mapAreaToGroup(area) {
    if (area.includes('lower-back') || area.includes('lumbar')) {
        return 'lower-back';
    }
    if (area.includes('upper-back') || area.includes('thoracic')) {
        return 'upper-back';
    }
    if (area.includes('neck')) {
        return 'neck';
    }
    if (area.includes('abdomen') || area.includes('belly')) {
        return 'abdomen';
    }
    if (area.includes('chest') || area.includes('sternum')) {
        return 'chest';
    }
    if (area.includes('thigh')) {
        return 'thigh';
    }
    return area;
}

// 1단계 입력 검증
export function validateStep1(selectedAreas, painDescription) {
    if (selectedAreas.length === 0) {
        return { valid: false, message: '아픈 곳을 선택해 주세요.' };
    }

    if (!painDescription || painDescription.trim().length === 0) {
        return { valid: false, message: '통증이 심해지는 상황을 설명해 주세요.' };
    }

    if (painDescription.trim().length < 10) {
        return { valid: false, message: '조금 더 자세히 설명해 주세요. (최소 10자)' };
    }

    return { valid: true };
}
