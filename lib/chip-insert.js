/**
 * 입력 보조 칩 → textarea 텍스트 삽입 (순수 함수, DOM 무관).
 * - 빈 값이면 칩 그대로.
 * - 기존 값이 있으면 ", "로 자연스럽게 연결.
 * - 이미 들어간 칩은 중복 삽입하지 않음.
 * - maxLength를 넘기면 원본을 그대로 반환(미삽입).
 *
 * @param {string} current 현재 textarea 값
 * @param {string} chipText 칩 문구
 * @param {number} [maxLength=500] textarea maxlength
 * @returns {string} 갱신된 값
 */
export function appendChipText(current, chipText, maxLength = 500) {
    const base = current ?? '';
    const chip = (chipText ?? '').trim();

    if (!chip) {
        return base;
    }

    if (base.includes(chip)) {
        return base;
    }

    const trimmedBase = base.replace(/\s+$/, '');
    const next = trimmedBase ? `${trimmedBase}, ${chip}` : chip;

    if (next.length > maxLength) {
        return base;
    }

    return next;
}
