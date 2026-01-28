// 분석 함수들 (모듈화 버전)

import { triggerPointsDB, fascialLinesDB } from './data.js';
import { mapAreaToGroup } from './utils.js';

// 트리거 포인트 분석
export function analyzeTriggerPoints(selectedAreas, questionnaire) {
    const recommendations = [];
    const foundTriggerPoints = new Set(); // 중복 방지

    // 선택된 통증 부위에 대해 해당 부위에 통증을 유발하는 트리거 포인트들을 찾기
    selectedAreas.forEach(selectedArea => {
        triggerPointsDB.forEach(triggerPoint => {
            // 이 트리거 포인트가 선택된 부위에 통증을 유발하는지 확인
            const causesSelectedPain = triggerPoint.painAreas.includes(selectedArea);

            if (causesSelectedPain && !foundTriggerPoints.has(triggerPoint.name)) {
                foundTriggerPoints.add(triggerPoint.name);

                // 트리거 액션과 매칭하여 신뢰도 결정
                const triggers = questionnaire.aggravatingActions ?
                    questionnaire.aggravatingActions.join(' ').toLowerCase() : '';

                const actionMatch = triggerPoint.triggers.some(trigger => {
                    const triggerActions = {
                        'sitting': ['sitting', 'computer-work'],
                        'stress': ['stress'],
                        'poor-posture': ['bending', 'reaching'],
                        'computer-work': ['sitting', 'computer-work'],
                        'heavy-lifting': ['lifting', 'carrying'],
                        'sleeping-position': ['sleeping'],
                        'prolonged-sitting': ['sitting'],
                        'forward-head-posture': ['computer-work', 'reading']
                    };

                    const matchingActions = triggerActions[trigger] || [];
                    return matchingActions.some(action => triggers.includes(action));
                });

                // 통증 강도 고려
                const intensityMatch = questionnaire.nrs >= 6;

                let confidence = 'low';
                if (actionMatch && intensityMatch) {
                    confidence = 'high';
                } else if (actionMatch || intensityMatch) {
                    confidence = 'medium';
                }

                recommendations.push({
                    ...triggerPoint,
                    confidence: confidence,
                    matchReason: actionMatch ? 'trigger-action-match' : 'pain-area-match'
                });
            }
        });
    });

    // 신뢰도순으로 정렬 (high > medium > low)
    const confidenceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    recommendations.sort((a, b) => confidenceOrder[b.confidence] - confidenceOrder[a.confidence]);

    return recommendations;
}

// 근막 경선 분석
export function analyzeFascialLines(selectedAreas) {
    const recommendations = [];

    // 선택된 부위를 기반으로 관련 근막 경선 찾기
    Object.keys(fascialLinesDB).forEach(lineKey => {
        const line = fascialLinesDB[lineKey];
        const hasRelatedArea = line.relatedAreas.some(area =>
            selectedAreas.some(selected =>
                mapAreaToGroup(selected) === area
            )
        );

        if (hasRelatedArea) {
            recommendations.push({
                ...line,
                key: lineKey
            });
        }
    });

    return recommendations;
}
