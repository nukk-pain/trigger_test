const GUIDE_STEPS = {
    'neck-shoulder-junction': [
        {
            title: '위치 찾기',
            content: '어깨와 목이 만나는 지점을 찾으세요. 어깨를 위아래로 움직여 확인하세요.',
            image: '🫱',
            tip: '어깨를 으쓱할 때 가장 높은 부분입니다.'
        },
        {
            title: '손가락으로 찾기',
            content: '반대편 손 2-3개 손가락으로 부드럽게 눌러보세요.',
            image: '👆',
            tip: '너무 세게 누르지 마세요.'
        },
        {
            title: '확인하기',
            content: '딱딱한 매듭을 찾았나요? 누르면 목이나 머리로 통증이 퍼지나요?',
            image: '🎯',
            tip: '맞는 지점을 누르면 익숙한 통증이 느껴집니다.'
        },
        {
            title: '마사지하기',
            content: '5-10초간 누른 후, 원을 그리며 마사지하세요.',
            image: '🖐️',
            tip: '깊게 숨쉬며 근육이 풀리는 걸 느껴보세요.'
        }
    ],
    'skull-base': [
        {
            title: '뒤통수 찾기',
            content: '뒤통수와 목이 만나는 경계선을 찾으세요. 머리카락 바로 아래입니다.',
            image: '🧠',
            tip: '고개를 끄덕여보면 경계선을 쉽게 찾을 수 있어요.'
        },
        {
            title: '양쪽 누르기',
            content: '양손 엄지로 뒤통수 양쪽을 동시에 눌러보세요.',
            image: '👍',
            tip: '척추는 피하고 양쪽 근육만 누르세요.'
        },
        {
            title: '아픈 점 확인',
            content: '아픈 부분을 찾았나요? 누르면 머리 앞쪽으로 통증이 퍼지나요?',
            image: '🎯',
            tip: '이 부분은 두통을 자주 일으킵니다.'
        },
        {
            title: '마사지하기',
            content: '엄지로 작은 원을 그리며 5-10분간 마사지하세요.',
            image: '🔄',
            tip: '목 부위라 부드럽게, 절대 세게 누르지 마세요.'
        }
    ]
};

function buildFallbackSteps(triggerPointName) {
    return [
        {
            title: '부위 찾기',
            content: `${triggerPointName} 부위를 찾으세요.`,
            image: '📍',
            tip: '정확한 위치를 찾아보세요.'
        },
        {
            title: '누르기',
            content: '손가락으로 부드럽게 눌러보세요.',
            image: '🔍',
            tip: '딱딱한 매듭이나 아픈 점을 찾으세요.'
        },
        {
            title: '마사지',
            content: '적절한 압력으로 마사지하세요.',
            image: '🖐️',
            tip: '아프면 약하게, 괜찮으면 조금 더 세게 누르세요.'
        }
    ];
}

export function getGuideSteps(triggerPointName, location) {
    return {
        steps: GUIDE_STEPS[location] || buildFallbackSteps(triggerPointName)
    };
}
