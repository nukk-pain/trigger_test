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
    },
    // 비복근 - 종아리 통증 및 발 문제
    {
        name: '비복근',
        location: 'calf-muscle',
        anatomicalPosition: '종아리 뒤쪽 볼록한 근육',
        referredPain: ['종아리', '발뒤꿈치', '발바닥', '무릎 뒤'],
        painAreas: ['calf-back-left', 'calf-back-right', 'heel-left', 'heel-right',
            'knee-back-left', 'knee-back-right', 'achilles-left', 'achilles-right'],
        triggers: ['walking', 'running', 'high-heels', 'prolonged-standing'],
        massage: {
            method: '종아리를 양손으로 감싸 위에서 아래로 주무르기',
            frequency: '하루 2-3회',
            duration: '5-10분',
            precaution: '정맥류 있으면 피하기, 혈전 의심시 중단'
        }
    },
    // 가자미근 - 종아리 깊은 통증
    {
        name: '가자미근',
        location: 'deep-calf',
        anatomicalPosition: '종아리 깊은 부분, 비복근 아래',
        referredPain: ['발뒤꿈치', '발바닥', '종아리'],
        painAreas: ['calf-back-left', 'calf-back-right', 'heel-left', 'heel-right',
            'foot-sole-left', 'foot-sole-right', 'achilles-left', 'achilles-right'],
        triggers: ['running', 'walking-uphill', 'prolonged-standing'],
        massage: {
            method: '무릎을 굽힌 상태에서 종아리 아래쪽 마사지',
            frequency: '하루 2회',
            duration: '5분',
            precaution: '아킬레스건 직접 압박 금지'
        }
    },
    // 대퇴사두근 - 무릎과 허벅지 앞 통증
    {
        name: '대퇴사두근',
        location: 'front-thigh',
        anatomicalPosition: '허벅지 앞쪽 전체',
        referredPain: ['무릎', '허벅지 앞', '정강이'],
        painAreas: ['thigh-front-left', 'thigh-front-right', 'knee-front-left', 'knee-front-right',
            'thigh-outer-left', 'thigh-outer-right', 'shin-left', 'shin-right'],
        triggers: ['squatting', 'climbing-stairs', 'running', 'kicking'],
        massage: {
            method: '폼롤러로 허벅지 앞쪽을 위아래로 굴리기',
            frequency: '하루 2회',
            duration: '10분',
            precaution: '무릎뼈 직접 압박 금지'
        }
    },
    // 장요근 - 허리와 고관절 통증
    {
        name: '장요근',
        location: 'hip-flexor',
        anatomicalPosition: '복부 깊숙이, 요추에서 대퇴골까지',
        referredPain: ['허리', '사타구니', '골반', '허벅지 앞'],
        painAreas: ['lower-back-center', 'lower-back-left', 'lower-back-right',
            'groin-left', 'groin-right', 'thigh-front-left', 'thigh-front-right',
            'pelvis-left', 'pelvis-right', 'lower-abdomen'],
        triggers: ['prolonged-sitting', 'running', 'core-exercises'],
        massage: {
            method: '옆으로 누워 배꼽 옆 깊숙이 부드럽게 압박',
            frequency: '하루 1-2회',
            duration: '3-5분',
            precaution: '복부 장기 주의, 임신 중 금지'
        }
    },
    // 대흉근 - 가슴과 팔 통증
    {
        name: '대흉근',
        location: 'chest-muscle',
        anatomicalPosition: '가슴 앞쪽 큰 근육',
        referredPain: ['가슴', '팔', '어깨', '손가락'],
        painAreas: ['chest-left', 'chest-right', 'chest-upper', 'sternum',
            'shoulder-left-front', 'shoulder-right-front',
            'upper-arm-left', 'upper-arm-right'],
        triggers: ['bench-press', 'push-ups', 'computer-work', 'slouching'],
        massage: {
            method: '문틀에 팔을 대고 스트레칭 후 마사지볼로 가슴 압박',
            frequency: '하루 2-3회',
            duration: '5분',
            precaution: '심장 질환 있으면 가볍게, 갈비뼈 골절 주의'
        }
    },
    // 광배근 - 등과 팔 통증
    {
        name: '광배근',
        location: 'lat-muscle',
        anatomicalPosition: '등 양쪽 넓은 근육',
        referredPain: ['등', '겨드랑이', '팔', '손가락'],
        painAreas: ['upper-back-left', 'upper-back-right', 'mid-back-center',
            'upper-arm-left', 'upper-arm-right', 'upper-arm-back-left', 'upper-arm-back-right',
            'shoulder-blade-left', 'shoulder-blade-right'],
        triggers: ['pull-ups', 'rowing', 'carrying-heavy', 'reaching-overhead'],
        massage: {
            method: '폼롤러에 옆으로 누워 겨드랑이에서 허리까지 굴리기',
            frequency: '하루 2회',
            duration: '10분',
            precaution: '척추와 갈비뼈 직접 압박 금지'
        }
    },
    // 측두근 - 관자놀이 통증과 두통
    {
        name: '측두근',
        location: 'temple',
        anatomicalPosition: '관자놀이에서 귀 위쪽',
        referredPain: ['관자놀이', '눈', '이', '두통'],
        painAreas: ['head-temple-left', 'head-temple-right', 'head-front',
            'jaw-left', 'jaw-right', 'head-crown'],
        triggers: ['teeth-grinding', 'jaw-clenching', 'stress', 'chewing'],
        massage: {
            method: '관자놀이를 손가락으로 원을 그리며 부드럽게 마사지',
            frequency: '하루 3-4회',
            duration: '2-3분',
            precaution: '너무 세게 누르지 않기, 두통 악화시 중단'
        }
    },
    // 전경골근 - 정강이 통증
    {
        name: '전경골근',
        location: 'shin',
        anatomicalPosition: '정강이 앞쪽 바깥',
        referredPain: ['정강이', '발등', '엄지발가락'],
        painAreas: ['shin-left', 'shin-right', 'calf-front-left', 'calf-front-right',
            'foot-top-left', 'foot-top-right', 'ankle-left', 'ankle-right'],
        triggers: ['running', 'walking', 'hiking', 'jumping'],
        massage: {
            method: '정강이 바깥쪽을 엄지로 위에서 아래로 마사지',
            frequency: '하루 2-3회',
            duration: '5분',
            precaution: '경골(뼈) 직접 압박 금지'
        }
    },
    // 복직근 - 복부 통증
    {
        name: '복직근',
        location: 'rectus-abdominis',
        anatomicalPosition: '배 앞쪽 중앙, 식스팩 부위',
        referredPain: ['복부', '허리', '골반'],
        painAreas: ['abdomen-left', 'abdomen-right', 'upper-abdomen', 'lower-abdomen',
            'navel', 'lower-back-center'],
        triggers: ['crunches', 'heavy-lifting', 'coughing', 'prolonged-sitting'],
        massage: {
            method: '복부를 부드럽게 원을 그리며 마사지',
            frequency: '하루 1-2회',
            duration: '3-5분',
            precaution: '식후 바로 하지 않기, 복통 있으면 중단'
        }
    }
];

// 근막 경선 데이터 (Thomas Myers Anatomy Trains 기반)
