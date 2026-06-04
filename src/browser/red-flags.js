export const redFlagTextPatterns = [
    '흉통',
    '가슴 통증',
    '가슴이 아',
    'chest pain',
    '숨이 차',
    '숨쉬기',
    '호흡곤란',
    '호흡 곤란',
    'breathing trouble',
    'trouble breathing',
    'shortness of breath',
    'fever',
    '열이 납',
    '고열',
    '발열',
    'trauma',
    '넘어진 뒤',
    '떨어진 뒤',
    '사고 후',
    '부딪힌 뒤',
    '심한 감각 저하',
    '감각이 없어',
    'severe numbness',
    'numbness',
    '힘이 빠',
    '마비',
    'paralysis',
    'weakness',
    '소변 조절',
    '대변 조절',
    '배뇨',
    'bowel',
    'bladder',
    '빠르게 악화',
    '급격히 악화',
    'rapidly worsening',
    'worsening pain'
];

export const redFlagMedicalConditions = [
    'chest-pain',
    'breathing',
    'severe-illness',
    'fever',
    'trauma',
    'severe-numbness',
    'weakness',
    'paralysis',
    'bladder',
    'bowel',
    'rapidly-worsening'
];

export function hasRedFlagText(description) {
    const normalized = String(description || '').toLowerCase();
    return redFlagTextPatterns.some(pattern => normalized.includes(pattern));
}

export function hasRedFlagCondition(conditions) {
    return Array.isArray(conditions) &&
        conditions.some(condition => redFlagMedicalConditions.includes(condition));
}
