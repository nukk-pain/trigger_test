export const unsupportedAreaNotice =
    '이 부위는 현재 MVP에서 지원 준비 중입니다. 응급 증상이 있으면 의료기관에 문의하세요.';

const supportedPrefixes = [
    'neck-',
    'shoulder-',
    'shoulder-blade-',
    'shoulder-top-',
    'upper-back-',
    'mid-back-',
    'lower-back-',
    'pelvis-',
    'buttock-'
];

const supportedExactAreas = new Set([
    'sacral'
]);

export function isMvpSupportedArea(area) {
    if (supportedExactAreas.has(area)) {
        return true;
    }
    return supportedPrefixes.some(prefix => area.startsWith(prefix));
}
