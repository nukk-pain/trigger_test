// 트리거 포인트 및 근막 경선 데이터 (모듈화 버전)

// 트리거 포인트 데이터베이스 - 통증 부위별 실제 치료 포인트 매핑
export const triggerPointsDB = [
    // 승모근 상부섬유 - 목, 어깨, 두통의 주요 원인
    {
        name: '승모근 상부섬유',
        location: 'neck-shoulder-junction',
        anatomicalPosition: '목과 어깨 경계 부분',
        referredPain: ['목', '어깨', '머리', '관자놀이', '뒤통수'],
        painAreas: ['neck-front', 'neck-left', 'neck-right', 'neck-back-upper', 'neck-back-lower',
            'shoulder-left-front', 'shoulder-right-front', 'shoulder-top-left', 'shoulder-top-right',
            'head-temple-left', 'head-temple-right', 'head-back', 'occipital'],
        triggers: ['sitting', 'stress', 'poor-posture', 'computer-work'],
        massage: {
            method: '목과 어깨 경계 부분을 엄지손가락으로 5-10초간 지압',
            frequency: '하루 3-5회',
            duration: '각 부위 5-10초',
            precaution: '너무 강하게 누르지 말고, 혈관이나 신경 피하기'
        }
    },
    // 후두하근 - 두통과 목 통증의 주요 원인
    {
        name: '후두하근',
        location: 'skull-base',
        anatomicalPosition: '뒤통수와 목 경계선',
        referredPain: ['뒤통수', '목', '눈 주변', '이마'],
        painAreas: ['head-back', 'occipital', 'head-front', 'neck-back-upper', 'neck-back-lower'],
        triggers: ['computer-work', 'reading', 'forward-head-posture'],
        massage: {
            method: '뒤통수 아래 목 경계선을 부드럽게 원을 그리며 마사지',
            frequency: '하루 2-3회',
            duration: '5분',
            precaution: '경추 신경 주의, 부드럽게 마사지'
        }
    },
    // 흉쇄유돌근 - 목과 두통의 숨은 원인
    {
        name: '흉쇄유돌근',
        location: 'neck-side',
        anatomicalPosition: '목 옆쪽, 귀 아래에서 쇄골까지',
        referredPain: ['목 옆쪽', '귀', '관자놀이', '이마', '어깨'],
        painAreas: ['neck-left', 'neck-right', 'head-temple-left', 'head-temple-right', 'head-front'],
        triggers: ['neck-turning', 'stress', 'sleeping-position'],
        massage: {
            method: '목 옆쪽을 위에서 아래로 부드럽게 쓸어내리기',
            frequency: '하루 2-3회',
            duration: '3-5분',
            precaution: '경동맥 부위 피하고 부드럽게'
        }
    },
    // 승모근 중부섬유 - 어깨와 등 통증
    {
        name: '승모근 중부섬유',
        location: 'shoulder-blade-top',
        anatomicalPosition: '어깨 날개뼈 위쪽 가장자리',
        referredPain: ['어깨', '목', '팔', '등 위쪽'],
        painAreas: ['shoulder-blade-left', 'shoulder-blade-right', 'shoulder-top-left', 'shoulder-top-right',
            'upper-back-left', 'upper-back-right', 'upper-arm-left', 'upper-arm-right'],
        triggers: ['heavy-lifting', 'sleeping-position', 'stress'],
        massage: {
            method: '어깨 날개뼈 위쪽을 반대손으로 누르며 마사지',
            frequency: '하루 3회',
            duration: '5-10분',
            precaution: '관절 직접 압박 금지, 근육 부분만'
        }
    },
    // 능형근 - 어깨 날개뼈 사이 통증
    {
        name: '능형근',
        location: 'between-shoulder-blades',
        anatomicalPosition: '양쪽 어깨 날개뼈 사이',
        referredPain: ['등', '어깨 날개뼈', '어깨'],
        painAreas: ['upper-back-center', 'shoulder-blade-left', 'shoulder-blade-right', 'mid-back-center'],
        triggers: ['slouching', 'carrying-bags', 'computer-work'],
        massage: {
            method: '테니스공을 벽에 대고 어깨 날개뼈 사이 굴리기',
            frequency: '하루 2회',
            duration: '10분',
            precaution: '척추 직접 압박 금지, 근육 부분만'
        }
    },
    // 요방형근 - 허리 통증의 주요 원인
    {
        name: '요방형근',
        location: 'lower-back-sides',
        anatomicalPosition: '허리 양쪽 옆구리',
        referredPain: ['허리', '엉덩이', '사타구니'],
        painAreas: ['lower-back-left', 'lower-back-right', 'lower-back-center',
            'buttock-left-upper', 'buttock-right-upper', 'groin-left', 'groin-right'],
        triggers: ['prolonged-sitting', 'lifting', 'uneven-posture'],
        massage: {
            method: '옆으로 누워서 테니스공을 허리 옆구리에 대고 굴리기',
            frequency: '하루 2-3회',
            duration: '10-15분',
            precaution: '디스크 의심시 중단, 신장 부위 피하기'
        }
    },
    // 전거근 - 갈비뼈와 어깨 통증
    {
        name: '전거근',
        location: 'side-ribs',
        anatomicalPosition: '겨드랑이 아래 갈비뼈 옆면',
        referredPain: ['갈비뼈', '어깨', '팔', '등'],
        painAreas: ['chest-left', 'chest-right', 'upper-arm-left', 'upper-arm-right', 'upper-back-left', 'upper-back-right'],
        triggers: ['reaching-overhead', 'carrying-heavy', 'breathing-issues'],
        massage: {
            method: '겨드랑이 아래 갈비뼈를 손가락으로 부드럽게 마사지',
            frequency: '하루 2회',
            duration: '5분',
            precaution: '갈비뼈 골절 주의, 부드럽게'
        }
    },
    // 이상근 - 엉덩이와 다리 통증
    {
        name: '이상근',
        location: 'deep-buttock',
        anatomicalPosition: '엉덩이 깊숙한 부분',
        referredPain: ['엉덩이', '허벅지 뒤', '종아리'],
        painAreas: ['buttock-left-upper', 'buttock-right-upper', 'buttock-left-lower', 'buttock-right-lower',
            'thigh-back-left', 'thigh-back-right', 'hamstring-left', 'hamstring-right'],
        triggers: ['prolonged-sitting', 'running', 'hip-tightness'],
        massage: {
            method: '테니스공에 앉아서 엉덩이 압박, 다리 움직이기',
            frequency: '하루 2회',
            duration: '10분',
            precaution: '좌골신경 압박 주의'
        }
    }
];

// 근막 경선 데이터 (Thomas Myers Anatomy Trains 기반)
export const fascialLinesDB = {
    'superficial-back-line': {
        name: '표재후선(Superficial Back Line)',
        path: ['발바닥', '종아리', '햄스트링', '천골', '척추기립근', '후두골'],
        commonIssues: ['허리통증', '목통증', '자세불량'],
        relatedAreas: ['lower-back', 'upper-back', 'neck'],
        treatment: '전체 라인을 따라 순차적 이완'
    },
    'deep-front-line': {
        name: '심층전선(Deep Front Line)',
        path: ['발등', '정강이', '골반저근', '대요근', '횡격막', '목'],
        commonIssues: ['골반통증', '호흡장애', '목긴장'],
        relatedAreas: ['abdomen', 'chest', 'neck'],
        treatment: '호흡과 함께 심층근 이완'
    },
    'lateral-line': {
        name: '측면선(Lateral Line)',
        path: ['발외측', '종아리외측', '대퇴외측', '골반', '늑간근', '목측면'],
        commonIssues: ['측면통증', '균형장애'],
        relatedAreas: ['thigh', 'abdomen', 'neck'],
        treatment: '측면 스트레칭과 마사지'
    }
};

// 레드 플래그 조건
export const redFlagConditions = [
    'fever', 'severe-numbness', 'weakness', 'bladder', 'chest-pain', 'breathing'
];
