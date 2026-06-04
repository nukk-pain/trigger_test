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
