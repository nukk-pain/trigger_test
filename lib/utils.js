// 유틸리티 함수들 (모듈화 버전)

// 부위 이름 한글 변환
export function getAreaDisplayName(area) {
    const areaNames = {
        // 머리 부위
        'head-front': '이마/앞머리',
        'head-back': '뒷머리',
        'head-crown': '정수리',
        'head-temple-left': '왼쪽 관자놀이',
        'head-temple-right': '오른쪽 관자놀이',
        'occipital': '후두부',
        'jaw-left': '왼쪽 턱',
        'jaw-right': '오른쪽 턱',

        // 목 부위
        'neck-front': '목 앞쪽',
        'neck-left': '목 왼쪽',
        'neck-right': '목 오른쪽',
        'neck-back-upper': '목 뒤 윗부분',
        'neck-back-lower': '목 뒤 아래부분',
        'neck-side-left-back': '목 뒤 왼쪽',
        'neck-side-right-back': '목 뒤 오른쪽',

        // 어깨 부위
        'shoulder-left-front': '왼쪽 어깨 앞',
        'shoulder-right-front': '오른쪽 어깨 앞',
        'shoulder-blade-left': '왼쪽 어깨뼈',
        'shoulder-blade-right': '오른쪽 어깨뼈',
        'shoulder-top-left': '왼쪽 어깨 윗부분',
        'shoulder-top-right': '오른쪽 어깨 윗부분',
        'collar-left': '왼쪽 쇄골',
        'collar-right': '오른쪽 쇄골',

        // 가슴 부위
        'chest-upper': '가슴 윗부분',
        'chest-left': '왼쪽 가슴',
        'chest-right': '오른쪽 가슴',
        'sternum': '가슴뼈',

        // 복부 부위
        'upper-abdomen': '명치/상복부',
        'abdomen-left': '왼쪽 배',
        'abdomen-right': '오른쪽 배',
        'navel': '배꼽 주변',
        'lower-abdomen': '아랫배',

        // 등 부위
        'upper-back-center': '등 윗부분 중앙',
        'upper-back-left': '등 윗부분 왼쪽',
        'upper-back-right': '등 윗부분 오른쪽',
        'mid-back-center': '등 중간 부분',
        'lower-back-upper': '허리 윗부분',
        'lower-back-left': '허리 왼쪽',
        'lower-back-right': '허리 오른쪽',
        'lower-back-center': '허리 중앙',
        'sacral': '천골 부위',

        // 엉덩이 부위
        'buttock-left-upper': '왼쪽 엉덩이 위',
        'buttock-right-upper': '오른쪽 엉덩이 위',
        'buttock-left-lower': '왼쪽 엉덩이 아래',
        'buttock-right-lower': '오른쪽 엉덩이 아래',
        'tailbone': '꼬리뼈',

        // 골반 부위
        'pelvis-left': '왼쪽 골반',
        'pelvis-right': '오른쪽 골반',
        'groin-left': '왼쪽 사타구니',
        'groin-right': '오른쪽 사타구니',

        // 팔 부위
        'upper-arm-left': '왼쪽 윗팔',
        'upper-arm-right': '오른쪽 윗팔',
        'upper-arm-back-left': '왼쪽 윗팔 뒤',
        'upper-arm-back-right': '오른쪽 윗팔 뒤',
        'elbow-left': '왼쪽 팔꿈치',
        'elbow-right': '오른쪽 팔꿈치',
        'elbow-back-left': '왼쪽 팔꿈치 뒤',
        'elbow-back-right': '오른쪽 팔꿈치 뒤',
        'forearm-left': '왼쪽 아래팔',
        'forearm-right': '오른쪽 아래팔',
        'forearm-back-left': '왼쪽 아래팔 뒤',
        'forearm-back-right': '오른쪽 아래팔 뒤',
        'wrist-left': '왼쪽 손목',
        'wrist-right': '오른쪽 손목',
        'hand-left': '왼손',
        'hand-right': '오른손',

        // 허벅지 부위
        'thigh-front-left': '왼쪽 허벅지 앞',
        'thigh-front-right': '오른쪽 허벅지 앞',
        'thigh-inner-left': '왼쪽 허벅지 안쪽',
        'thigh-inner-right': '오른쪽 허벅지 안쪽',
        'thigh-outer-left': '왼쪽 허벅지 바깥',
        'thigh-outer-right': '오른쪽 허벅지 바깥',
        'thigh-back-left': '왼쪽 허벅지 뒤',
        'thigh-back-right': '오른쪽 허벅지 뒤',
        'hamstring-left': '왼쪽 햄스트링',
        'hamstring-right': '오른쪽 햄스트링',

        // 무릎 부위
        'knee-front-left': '왼쪽 무릎 앞',
        'knee-front-right': '오른쪽 무릎 앞',
        'knee-back-left': '왼쪽 무릎 뒤',
        'knee-back-right': '오른쪽 무릎 뒤',

        // 정강이/종아리 부위
        'shin-left': '왼쪽 정강이',
        'shin-right': '오른쪽 정강이',
        'calf-front-left': '왼쪽 종아리 앞',
        'calf-front-right': '오른쪽 종아리 앞',
        'calf-back-left': '왼쪽 종아리 뒤',
        'calf-back-right': '오른쪽 종아리 뒤',
        'achilles-left': '왼쪽 아킬레스건',
        'achilles-right': '오른쪽 아킬레스건',

        // 발 부위
        'ankle-left': '왼쪽 발목',
        'ankle-right': '오른쪽 발목',
        'foot-top-left': '왼발 등',
        'foot-top-right': '오른발 등',
        'heel-left': '왼쪽 발뒤꿈치',
        'heel-right': '오른쪽 발뒤꿈치',
        'foot-sole-left': '왼발 바닥',
        'foot-sole-right': '오른발 바닥',

        // 기존 호환성
        'neck': '목',
        'neck-back': '목 뒤',
        'shoulder-left': '왼쪽 어깨',
        'shoulder-right': '오른쪽 어깨',
        'shoulder-back-left': '왼쪽 어깨 뒤',
        'shoulder-back-right': '오른쪽 어깨 뒤',
        'chest': '가슴',
        'upper-back': '등 상부',
        'lower-back': '허리',
        'abdomen': '배',
        'buttocks': '엉덩이',
        'thigh-left': '왼쪽 허벅지',
        'thigh-right': '오른쪽 허벅지',
        'knee-left': '왼쪽 무릎',
        'knee-right': '오른쪽 무릎',
        'arm-left': '왼쪽 팔',
        'arm-right': '오른쪽 팔',
        'arm-back-left': '왼쪽 팔 뒤',
        'arm-back-right': '오른쪽 팔 뒤',
        'calf-left': '왼쪽 종아리',
        'calf-right': '오른쪽 종아리'
    };

    return areaNames[area] || area;
}

// 위치 설명 변환
export function getLocationDescription(location) {
    const descriptions = {
        'neck-shoulder-junction': '목과 어깨 경계 부분',
        'skull-base': '머리 뒤쪽 경계선',
        'shoulder-blade-top': '어깨 날개뼈 위쪽',
        'between-shoulder-blades': '양쪽 어깨 날개뼈 사이',
        'lower-back-sides': '허리 양쪽'
    };

    return descriptions[location] || location;
}

// AI 응답 포맷팅
export function formatAIResponse(response) {
    // AI 응답을 HTML로 포맷팅 (마크다운 지원)
    // 문자열이 아닌 경우 처리
    if (typeof response !== 'string') {
        if (response && typeof response === 'object') {
            // 객체인 경우 JSON.stringify로 변환
            response = JSON.stringify(response, null, 2);
        } else {
            // 기타 타입인 경우 String으로 변환
            response = String(response || '');
        }
    }

    // 빈 문자열 체크
    if (!response || response.trim() === '') {
        return '<p>AI 분석 결과를 받지 못했습니다. 다시 시도해주세요.</p>';
    }

    // 마크다운 표를 단계별 카드로 변환
    function convertTableToSteps(text) {
        const lines = text.split('\n');
        let result = '';
        let tableLines = [];
        let inTable = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('|') && line.endsWith('|')) {
                // 구분선 스킵
                if (line.match(/^\|[\s\-:|]+\|$/)) {
                    continue;
                }

                if (!inTable) {
                    inTable = true;
                    tableLines = [line];
                } else {
                    tableLines.push(line);
                }
            } else {
                // 표 끝
                if (inTable && tableLines.length > 1) {
                    // 데이터 분리
                    const dataLines = tableLines.slice(1);

                    // 단계별 카드 생성
                    let stepsHtml = '<div class="massage-steps">';

                    dataLines.forEach((dataLine, index) => {
                        const cells = dataLine.slice(1, -1).split('|').map(c => c.trim());

                        stepsHtml += `
                            <div class="step-card">
                                <div class="step-number">단계 ${index + 1}</div>
                                <div class="step-content">
                                    <div class="step-method"><strong>방법:</strong> ${cells[1] || ''}</div>
                                    <div class="step-time"><strong>시간:</strong> ${cells[2] || ''}</div>
                                    <div class="step-note"><strong>주의:</strong> ${cells[3] || ''}</div>
                                </div>
                            </div>`;
                    });

                    stepsHtml += '</div>';
                    result += stepsHtml + '\n';

                    inTable = false;
                    tableLines = [];
                } else if (inTable) {
                    inTable = false;
                    tableLines = [];
                }

                result += line + '\n';
            }
        }

        return result;
    }

    // 표를 단계별 카드로 변환
    response = convertTableToSteps(response);

    return response
        // 마크다운 헤딩
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')

        // 인용문 (> 로 시작)
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

        // 불릿 포인트
        .replace(/^• (.*$)/gm, '<li>$1</li>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>')

        // 볼드 텍스트
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

        // 이탤릭 텍스트
        .replace(/\*(.*?)\*/g, '<em>$1</em>')

        // 인라인 코드
        .replace(/`(.*?)`/g, '<code>$1</code>')

        // 리스트 래핑 (연속된 li들을 ul로 감싸기)
        .replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/gs, '<ul class="markdown-list">$&</ul>')

        // 연속된 줄바꿈만 단락으로 변환 (2개 이상의 줄바꿈)
        .replace(/\n\s*\n\s*/g, '</p><p>')

        // 단일 줄바꿈은 공백으로 변환 (불필요한 <br> 제거)
        .replace(/\n/g, ' ')

        // 문단 래핑
        .replace(/^(.)/gm, '<p>$1')
        .replace(/(.)$/gm, '$1</p>')

        // 태그 정리
        .replace(/<p>(<h[1-6]>)/g, '$1')
        .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
        .replace(/<p>(<table)/g, '$1')
        .replace(/(<\/table>)<\/p>/g, '$1')
        .replace(/<p>(<ul)/g, '$1')
        .replace(/(<\/ul>)<\/p>/g, '$1')
        .replace(/<p>(<blockquote)/g, '$1')
        .replace(/(<\/blockquote>)<\/p>/g, '$1')

        // 빈 문단 정리
        .replace(/<p><\/p>/g, '');
}

// 영역을 그룹으로 매핑
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
