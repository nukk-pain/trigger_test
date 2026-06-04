// 모듈에서 필요한 함수 import
import { getAreaDisplayName, formatAIResponse, validateStep1 as validateStep1Pure } from './lib/utils.js';
import { analyzeTriggerPoints as analyzeTriggerPointsLib, analyzeFascialLines as analyzeFascialLinesLib } from './lib/analysis.js';

// 애플리케이션 상태
let currentStep = 1;
let painData = {
    questionnaire: {},
    selectedAreas: [],
    analysis: {}
};

// DOM 요소들
const steps = document.querySelectorAll('.step-section');
const progressSteps = document.querySelectorAll('.progress-step');

// 초기화
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
});

async function initializeApp() {
    try {
        // 환경 설정 및 API 초기화
        await initializeAPI();
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        // 진행률 표시 업데이트
        updateProgressBar();
        
        // 강도 슬라이더 초기화 (존재하는 경우에만)
        const intensitySlider = document.getElementById('intensity');
        const intensityValue = document.getElementById('intensity-value');
        
        if (intensitySlider && intensityValue) {
            intensitySlider.addEventListener('input', function() {
                intensityValue.textContent = this.value;
            });
        }

        // 사용량 표시 업데이트
        updateUsageDisplay();
        
    } catch (error) {
        console.error('앱 초기화 실패:', error);
        showStartupError(error.message);
    }
}

async function initializeAPI() {
    if (!window.openaiConfig) {
        throw new Error('OpenRouter 설정이 로드되지 않았습니다.');
    }

    const ready = await window.openaiConfig.initialize();

    if (!ready) {
        throw new Error('AI 서버 설정을 로드할 수 없습니다.');
    }

    console.log('✅ OpenRouter API 설정 완료');
}

function showStartupError(message) {
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'startup-error-overlay';
    errorOverlay.innerHTML = `
        <div class="startup-error">
            <h2>🚫 앱 실행 실패</h2>
            <p>${message}</p>
            <div class="startup-error-actions">
                <button onclick="location.reload()" class="primary-btn">다시 시도</button>
                <button onclick="showMandatoryAPIKeyDialog()" class="secondary-btn">API 키 설정</button>
            </div>
        </div>
    `;
    document.body.appendChild(errorOverlay);
}

function setupEventListeners() {
    // 1단계 (부위 선택 + 동작 선택) -> 3단계 (분석)
    document.getElementById('analyze-pain').addEventListener('click', function() {
        if (validateStep1()) {
            collectActionData();
            analyzePain();
            goToStep(2);
        }
    });
    
    // 인체 지도 이벤트
    setupBodyMapEvents();
    
    // 뷰 전환 (앞면/뒷면)
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchBodyView(this.dataset.view);
        });
    });
    
    // 선택 초기화
    document.getElementById('clear-selection').addEventListener('click', clearSelection);
    
    // 상단 빠른 지우기 버튼
    const quickClearBtn = document.getElementById('quick-clear');
    if (quickClearBtn) {
        quickClearBtn.addEventListener('click', clearSelection);
    }
    
    // 처음부터 다시
    document.getElementById('start-over').addEventListener('click', function() {
        resetApp();
        goToStep(1);
    });
    
    // AI 관련 이벤트 리스너들
    setupAIEventListeners();
    
    // 동적 폼 이벤트 리스너들
    setupDynamicFormEvents();
}

function setupAIEventListeners() {
    // AI 질문하기 버튼 (존재하는 경우에만)
    const askAIBtn = document.getElementById('ask-ai-btn');
    if (askAIBtn) {
        askAIBtn.addEventListener('click', handleAIQuestion);
    }
    
    // Enter 키로 질문하기 (존재하는 경우에만)
    const aiQuestionInput = document.getElementById('ai-question-input');
    if (aiQuestionInput) {
        aiQuestionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleAIQuestion();
            }
        });
    }
    
    // AI 상태 업데이트
    updateAIStatus();
}

function updateAIStatus() {
    const indicator = document.getElementById('ai-indicator');
    const text = document.getElementById('ai-text');
    
    // Only update if elements exist (footer present)
    if (!indicator || !text) return;
    
    if (window.openaiConfig && window.openaiConfig.isReady && window.openaiConfig.isReady()) {
        indicator.textContent = '🤖✅';
        text.textContent = 'AI 분석 활성화';
    } else {
        indicator.textContent = '🤖❌';
        text.textContent = 'AI 서버 설정 확인 필요';
    }
}

function setupDynamicFormEvents() {
    // 텍스트 입력 글자 수 카운터
    const painDescriptionTextarea = document.getElementById('pain-description');
    const charCountElement = document.getElementById('char-count');
    
    if (painDescriptionTextarea && charCountElement) {
        painDescriptionTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            const maxLength = this.getAttribute('maxlength') || 500;
            
            charCountElement.textContent = currentLength;
            
            // 글자 수에 따른 스타일 변경
            const counter = charCountElement.parentElement;
            if (currentLength > maxLength * 0.8) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        });
    }
}

async function handleAIQuestion() {
    const questionInput = document.getElementById('ai-question-input');
    if (!questionInput) {
        console.warn('AI 질문 입력창을 찾을 수 없습니다.');
        return;
    }
    
    const question = questionInput.value.trim();
    
    if (!question) {
        showErrorMessage('질문을 입력해주세요.');
        return;
    }
    
    const answerContainer = document.getElementById('ai-answer-container');
    const answerContent = document.getElementById('ai-answer-content');
    
    if (!answerContainer || !answerContent) {
        console.warn('AI 답변 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    // 로딩 표시
    answerContainer.classList.remove('hidden');
    answerContent.innerHTML = '<div class="ai-thinking">🤔 AI가 생각 중입니다...</div>';
    
    try {
        const answer = await askAIQuestion(question);
        answerContent.innerHTML = `<div class="ai-answer">${formatAIResponse(answer)}</div>`;
        
        // 질문 입력창 비우기
        questionInput.value = '';
    } catch (error) {
        answerContent.innerHTML = `<div class="ai-error">❌ 질문 처리 중 오류가 발생했습니다: ${error.message}</div>`;
    }
}

function setupBodyMapEvents() {
    const clickableAreas = document.querySelectorAll('.clickable-area');
    
    clickableAreas.forEach(area => {
        area.addEventListener('click', function() {
            toggleAreaSelection(this.dataset.area);
        });
        
        // 호버 효과
        area.addEventListener('mouseover', function() {
            if (!this.classList.contains('selected')) {
                this.style.fill = 'rgba(255, 165, 0, 0.3)';
            }
        });
        
        area.addEventListener('mouseout', function() {
            if (!this.classList.contains('selected')) {
                this.style.fill = 'rgba(255, 0, 0, 0.1)';
            }
        });
    });
}

function validateStep1() {
    // lib/utils.js의 순수 함수 사용
    const painDescription = document.getElementById('pain-description').value.trim();
    const result = validateStep1Pure(painData.selectedAreas, painDescription);

    if (!result.valid) {
        showNotification(result.message, 'warning');
        return false;
    }

    return true;
}


function collectActionData() {
    const painDescription = document.getElementById('pain-description').value.trim();
    painData.questionnaire = {
        painDescription: painDescription,
        aggravatingActions: [] // 기존 체크박스 방식 제거
    };
}

function toggleAreaSelection(area) {
    const element = document.querySelector(`[data-area="${area}"]`);
    const index = painData.selectedAreas.indexOf(area);
    
    if (index > -1) {
        // 선택 해제
        painData.selectedAreas.splice(index, 1);
        element.classList.remove('selected');
        // 인라인 스타일 완전히 제거하여 원래 상태로 복원
        element.style.fill = '';
        element.style.stroke = '';
        element.style.strokeWidth = '';
        element.style.opacity = '';
    } else {
        // 선택 추가
        painData.selectedAreas.push(area);
        element.classList.add('selected');
        element.style.fill = 'rgba(255, 0, 0, 0.7)';
    }
    
    updateSelectedAreasList();
}

function updateSelectedAreasList() {
    const list = document.getElementById('selected-list');
    const countElement = document.getElementById('selection-count');
    
    // 실시간 상단 표시 업데이트
    updateLiveSelectionDisplay();
    
    if (list) {
        list.innerHTML = '';
        
        // 개수 업데이트
        if (countElement) {
            countElement.textContent = `${painData.selectedAreas.length}개 선택됨`;
        }
        
        if (painData.selectedAreas.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-selection';
            emptyDiv.innerHTML = `
                <div class="empty-selection-icon">🎯</div>
                <div>아픈 부위를 클릭해서 선택해주세요</div>
            `;
            list.appendChild(emptyDiv);
            return;
        }
        
        painData.selectedAreas.forEach(area => {
            const li = document.createElement('li');
            
            const areaName = document.createElement('span');
            areaName.className = 'area-name';
            areaName.textContent = getAreaDisplayName(area);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-area';
            removeBtn.innerHTML = '×';
            removeBtn.title = '제거';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeSelectedArea(area);
            });
            
            li.appendChild(areaName);
            li.appendChild(removeBtn);
            list.appendChild(li);
        });
    }
}

function updateLiveSelectionDisplay() {
    const liveText = document.getElementById('live-selection-text');
    const badgesContainer = document.getElementById('live-selection-badges');
    const quickClearBtn = document.getElementById('quick-clear');
    
    if (!liveText || !badgesContainer) return;
    
    // 텍스트 업데이트
    if (painData.selectedAreas.length === 0) {
        liveText.textContent = '아픈 곳을 클릭하세요';
    } else if (painData.selectedAreas.length === 1) {
        liveText.textContent = '1개 선택';
    } else {
        liveText.textContent = `${painData.selectedAreas.length}개 선택`;
    }
    
    // 배지 업데이트
    badgesContainer.innerHTML = '';
    painData.selectedAreas.forEach(area => {
        const badge = document.createElement('div');
        badge.className = 'selection-badge';
        badge.innerHTML = `
            <span>${getAreaDisplayName(area)}</span>
            <span class="remove-btn" data-area="${area}">×</span>
        `;
        
        // 개별 제거 이벤트
        const removeBtn = badge.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSelectedArea(area);
        });
        
        badgesContainer.appendChild(badge);
    });
    
    // 전체 지우기 버튼 표시/숨김
    if (quickClearBtn) {
        if (painData.selectedAreas.length > 0) {
            quickClearBtn.style.display = 'block';
        } else {
            quickClearBtn.style.display = 'none';
        }
    }
}

function removeSelectedArea(areaToRemove) {
    painData.selectedAreas = painData.selectedAreas.filter(area => area !== areaToRemove);
    
    // SVG에서 선택 표시 제거
    const areaElement = document.querySelector(`[data-area="${areaToRemove}"]`);
    if (areaElement) {
        areaElement.classList.remove('selected');
        // 인라인 스타일도 제거하여 완전히 원래 상태로 복원
        areaElement.style.fill = '';
        areaElement.style.stroke = '';
        areaElement.style.strokeWidth = '';
        areaElement.style.opacity = '';
    }
    
    updateSelectedAreasList();
}

// getAreaDisplayName는 lib/utils.js에서 import됨

function clearSelection() {
    painData.selectedAreas.forEach(area => {
        const element = document.querySelector(`[data-area="${area}"]`);
        if (element) {
            element.classList.remove('selected');
            // 인라인 스타일 완전히 제거하여 원래 상태로 복원
            element.style.fill = '';
            element.style.stroke = '';
            element.style.strokeWidth = '';
            element.style.opacity = '';
            element.style.fillOpacity = '';
            // Force style recalculation
            element.offsetHeight;
        }
    });
    
    painData.selectedAreas = [];
    updateSelectedAreasList();
    updateLiveSelectionDisplay();
}

function switchBodyView(view) {
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    document.querySelectorAll('.body-view').forEach(bodyView => {
        bodyView.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');
}

async function analyzePain() {
    // 사용량 확인
    if (!window.openaiConfig.getRemainingRequests()) {
        const stats = window.openaiConfig.getUsageStats();
        showErrorMessage(`사용량 한도에 도달했습니다. 일일: ${stats.daily.used}/${stats.daily.limit}, 월간: ${stats.monthly.used}/${stats.monthly.limit}`);
        return;
    }

    // 로딩 표시
    showLoadingIndicator();
    
    try {
        // API 키가 필수이므로 항상 AI 분석 사용
        await performAIAnalysis();
        
        // 사용량 표시 업데이트
        updateUsageDisplay();
        
    } catch (error) {
        console.error('분석 중 오류:', error);
        
        if (error.message.includes('사용량 한도')) {
            showErrorMessage(error.message);
        } else if (error.message.includes('API 키')) {
            showErrorMessage('API 키 문제가 발생했습니다. 설정을 확인해주세요.');
            showMandatoryAPIKeyDialog();
        } else {
            showErrorMessage(`분석 중 오류가 발생했습니다: ${error.message}`);
        }
    } finally {
        hideLoadingIndicator();
    }
}

function performBasicAnalysis() {
    // 레드 플래그 체크
    const hasRedFlags = painData.questionnaire.medicalConditions && 
        painData.questionnaire.medicalConditions.some(condition => 
            ['chest-pain', 'breathing', 'severe-illness'].includes(condition)
        );
    
    if (hasRedFlags) {
        showRedFlagWarning();
        return;
    }
    
    // 기본 트리거 포인트 분석
    const triggerPointAnalysis = analyzeTriggerPoints();
    
    // 근막 경선 분석
    const fascialLineAnalysis = analyzeFascialLines();
    
    // 결과 저장
    painData.analysis = {
        triggerPoints: triggerPointAnalysis,
        fascialLines: fascialLineAnalysis,
        hasRedFlags: hasRedFlags,
        aiEnhanced: false
    };
    
    // 결과 표시
    displayAnalysisResults();
}

async function performAIAnalysis() {
    // AI 기반 통증 분석 (한 번의 API 호출로 레드 플래그와 분석 모두 수행)
    const aiAnalysis = await analyzeWithAI();
    
    // 결과 저장
    painData.analysis = {
        ...aiAnalysis,
        hasRedFlags: false,
        aiEnhanced: true
    };
    
    // GPT 결과만 표시 (내부 트리거 포인트 분석 제거)
    displayGPTResults(aiAnalysis);
}

function displayGPTResults(aiAnalysis) {
    const massageGuide = document.getElementById('massage-guide');
    const container = document.getElementById('massage-steps');
    
    // 컨테이너가 존재하는지 확인
    if (!container) {
        console.error('massage-steps container not found');
        return;
    }
    
    // 컨테이너 초기화
    container.innerHTML = '';
    
    // GPT 결과를 HTML로 변환하여 표시
    const rawResult = aiAnalysis.aiAnalysis || aiAnalysis.analysis || aiAnalysis.text || aiAnalysis;
    const formattedResult = formatAIResponse(rawResult);
    
    container.innerHTML = `
        <div class="ai-analysis-result">
            <h3>🤖 AI 전문가 분석</h3>
            <div class="analysis-content">
                ${formattedResult}
            </div>
        </div>
    `;
    
    // 마사지 가이드 표시
    if (massageGuide) {
        massageGuide.style.display = 'block';
    }
}

async function checkRedFlagsWithAI() {
    const symptoms = {
        nrs: painData.questionnaire.nrs,
        aggravatingActions: painData.questionnaire.aggravatingActions,
        aggravatingOther: painData.questionnaire.aggravatingOther,
        medicalConditions: painData.questionnaire.medicalConditions,
        medicalOther: painData.questionnaire.medicalOther
    };
    
    const prompt = `환자 증상: ${JSON.stringify(symptoms, null, 2)}`;
    
    try {
        const response = await window.openaiConfig.makeRequest(
            [{ role: 'user', content: prompt }],
            window.MEDICAL_PROMPTS.RED_FLAG_CHECK
        );
        
        return {
            isEmergency: response.startsWith('응급상황'),
            reason: response
        };
    } catch (error) {
        console.error('레드 플래그 AI 분석 실패:', error);
        // 간단한 분석이므로 응급상황 없음
        return {
            isEmergency: false,
            reason: '간단한 분석 사용'
        };
    }
}

async function analyzeWithAI() {
    const q = painData.questionnaire;
    const areas = painData.selectedAreas.map(area => getAreaDisplayName(area));
    
    // 입력 최적화: 간결한 형태로 변경
    const prompt = `부위: ${areas.join(', ')}
악화: ${q.painDescription}`;
    
    try {
        const analysis = await window.openaiConfig.makeRequest(
            [{ role: 'user', content: prompt }],
            window.MEDICAL_PROMPTS.PAIN_ANALYSIS
        );
        
        return {
            aiAnalysis: analysis,
            hasRedFlags: false,
            aiEnhanced: true
        };
    } catch (error) {
        console.error('AI 분석 실패:', error);
        throw error;
    }
}

function parseAIAnalysis(aiResponse) {
    // AI 응답을 구조화된 형태로 변환
    return {
        triggerPoints: [{
            name: 'AI 분석 결과',
            analysis: aiResponse,
            confidence: 'ai-powered',
            massage: {
                method: 'AI 권장 방법 (상세 내용은 분석 결과 참조)',
                frequency: 'AI 권장 빈도',
                duration: 'AI 권장 시간',
                precaution: 'AI 권장 주의사항'
            }
        }],
        fascialLines: [],
        aiAnalysis: aiResponse
    };
}

function showRedFlagWarning(aiReason = null) {
    const warningElement = document.getElementById('red-flag-warning');
    warningElement.classList.remove('hidden');
    document.getElementById('massage-guide').style.display = 'none';
    
    // AI 분석 결과가 있으면 추가 정보 표시
    if (aiReason) {
        const emergencyNotice = warningElement.querySelector('.emergency-notice');
        const aiAnalysisDiv = document.createElement('div');
        aiAnalysisDiv.className = 'ai-analysis';
        aiAnalysisDiv.innerHTML = `
            <h4>🤖 AI 분석 결과</h4>
            <p>${aiReason}</p>
        `;
        emergencyNotice.appendChild(aiAnalysisDiv);
    }
    
    painData.analysis.hasRedFlags = true;
}

// analyzeTriggerPoints와 analyzeFascialLines는 lib/analysis.js에서 import됨
// 로컬 래퍼 함수 - painData 전역 상태를 전달
function analyzeTriggerPoints() {
    return analyzeTriggerPointsLib(painData.selectedAreas, painData.questionnaire);
}

function analyzeFascialLines() {
    return analyzeFascialLinesLib(painData.selectedAreas);
}

function displayAnalysisResults() {
    if (painData.analysis.hasRedFlags) return;
    
    // AI 분석 결과만 표시
    if (painData.analysis.aiEnhanced && painData.analysis.aiAnalysis) {
        const resultContainer = document.getElementById('ai-analysis-result');
        if (!resultContainer) {
            console.error('ai-analysis-result container not found');
            return;
        }
        resultContainer.innerHTML = `
            <div class="ai-result-content">
                ${formatAIResponse(painData.analysis.aiAnalysis)}
            </div>
        `;
    }
}

function displayAIAnalysis() {
    const analysisContainer = document.getElementById('trigger-points-analysis');
    
    if (!analysisContainer) {
        console.error('trigger-points-analysis container not found');
        return;
    }
    
    // AI 분석 결과 섹션 추가
    const aiSection = document.createElement('div');
    aiSection.className = 'ai-analysis-section';
    aiSection.innerHTML = `
        <div class="ai-badge">🤖 AI 강화 분석</div>
        <div class="ai-analysis-content">
            <h4>전문 AI 분석 결과</h4>
            <div class="ai-response">${formatAIResponse(painData.analysis.aiAnalysis)}</div>
        </div>
    `;
    
    analysisContainer.insertBefore(aiSection, analysisContainer.firstChild);
}

// formatAIResponse는 lib/utils.js에서 import됨

function createTriggerPointElement(tp) {
    const div = document.createElement('div');
    div.className = 'trigger-point-card';
    
    const confidenceText = {
        'high': '높은 일치도',
        'medium': '중간 일치도', 
        'low': '낮은 일치도'
    };
    
    const matchReasonText = {
        'trigger-action-match': '행동 패턴 일치',
        'pain-area-match': '통증 부위 일치'
    };
    
    div.innerHTML = `
        <h4>🎯 ${tp.name}</h4>
        <p><strong>치료 위치:</strong> ${tp.anatomicalPosition}</p>
        <p><strong>연관 통증:</strong> ${tp.referredPain.join(', ')}</p>
        
        <div class="trigger-explanation">
            <p><strong>❓ 왜 여기를 치료하나요?</strong></p>
            <p class="explanation-text">아픈 곳의 원인이 <strong>${tp.anatomicalPosition}</strong>에 있을 수 있습니다.</p>
        </div>

        <!-- 트리거 포인트 찾기 가이드 -->
        <div class="find-trigger-guide">
            <h5>🔍 찾는 방법</h5>
            <div class="guide-steps">
                <div class="guide-step">
                    <span class="step-number">1</span>
                    <div class="step-content">
                        <strong>위치:</strong> ${tp.anatomicalPosition}을 찾으세요
                    </div>
                </div>
                <div class="guide-step">
                    <span class="step-number">2</span>
                    <div class="step-content">
                        <strong>누르기:</strong> 딱딱한 매듭을 찾으세요
                    </div>
                </div>
                <div class="guide-step">
                    <span class="step-number">3</span>
                    <div class="step-content">
                        <strong>확인:</strong> 누르면 ${tp.referredPain.join(', ')}에 통증이 느껴지나요?
                    </div>
                </div>
            </div>
            <button class="interactive-guide-btn" onclick="startInteractiveGuide('${tp.name}', '${tp.location}')">
                📱 상세 가이드
            </button>
        </div>

        <div class="massage-method">
            <h5>🖐️ 마사지</h5>
            <p><strong>방법:</strong> ${tp.massage.method}</p>
            <p><strong>빈도:</strong> ${tp.massage.frequency}</p>
            <p><strong>시간:</strong> ${tp.massage.duration}</p>
            <p class="precaution">⚠️ ${tp.massage.precaution}</p>
        </div>
        
        <div class="confidence-badge ${tp.confidence}">
            ${confidenceText[tp.confidence]}
        </div>
    `;
    
    return div;
}

function createFascialLineElement(line) {
    const div = document.createElement('div');
    div.className = 'fascial-line-card';
    
    div.innerHTML = `
        <h4>🔗 ${line.name}</h4>
        <p><strong>경로:</strong> ${line.path.join(' → ')}</p>
        <p><strong>관련 문제:</strong> ${line.commonIssues.join(', ')}</p>
        <p><strong>치료법:</strong> ${line.treatment}</p>
    `;
    
    return div;
}

// getLocationDescription는 lib/utils.js에서 import됨

function displayMassageInstructions() {
    const container = document.getElementById('massage-steps');
    container.innerHTML = '';
    
    const generalSteps = `
        <div class="massage-instruction">
            <h4>📋 일반적인 마사지 순서</h4>
            <ol>
                <li><strong>준비:</strong> 편안한 자세로 긴장을 푸세요</li>
                <li><strong>찾기:</strong> 위에서 추천한 트리거 포인트를 찾아보세요</li>
                <li><strong>압박:</strong> 엄지손가락이나 손가락으로 5-10초간 압박</li>
                <li><strong>이완:</strong> 압박 후 부드럽게 마사지</li>
                <li><strong>스트레칭:</strong> 해당 근육을 천천히 늘려주세요</li>
                <li><strong>휴식:</strong> 마사지 후 충분한 휴식</li>
            </ol>
        </div>
        
        <div class="massage-timing">
            <h4>⏰ 권장 타이밍</h4>
            <ul>
                <li>하루 2-3회, 각 세션 10-15분</li>
                <li>샤워 후 근육이 이완된 상태에서</li>
                <li>통증이 심할 때는 빈도를 늘리되 강도는 줄이세요</li>
            </ul>
        </div>
    `;
    
    container.innerHTML = generalSteps;
}

function goToStep(stepNumber) {
    // 현재 단계 숨기기
    steps.forEach(step => step.classList.remove('active'));
    if (progressSteps.length > 0) {
        progressSteps.forEach(step => step.classList.remove('active'));
    }
    
    // 새 단계 보이기
    document.getElementById(`step${stepNumber}`).classList.add('active');
    const progressStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (progressStep) {
        progressStep.classList.add('active');
    }
    
    currentStep = stepNumber;
    updateProgressBar();
}

function updateProgressBar() {
    // Only update if progress steps exist
    if (progressSteps.length === 0) return;
    
    progressSteps.forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('completed');
        } else if (index === currentStep - 1) {
            step.classList.add('active');
        } else {
            step.classList.remove('completed', 'active');
        }
    });
}

function resetApp() {
    painData = {
        questionnaire: {},
        selectedAreas: [],
        analysis: {}
    };
    
    // 텍스트 영역 초기화
    const painDescription = document.getElementById('pain-description');
    if (painDescription) {
        painDescription.value = '';
    }
    
    // 글자 수 카운터 초기화
    const charCount = document.getElementById('char-count');
    if (charCount) {
        charCount.textContent = '0';
    }
    
    // 선택 영역 초기화
    clearSelection();
    
    // 경고 숨기기
    const redFlagWarning = document.getElementById('red-flag-warning');
    if (redFlagWarning) {
        redFlagWarning.classList.add('hidden');
    }
    
    const massageGuide = document.getElementById('massage-guide');
    if (massageGuide) {
        massageGuide.style.display = 'block';
    }
    
    currentStep = 1;
}

function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>🤖 AI가 분석 중입니다...</p>
            <p class="loading-subtext">더 정확한 결과를 위해 잠시만 기다려주세요</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoadingIndicator() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function showNotification(message, type = 'error') {
    const icons = {
        error: '⚠️',
        warning: '⚠️',
        info: 'ℹ️',
        success: '✅'
    };

    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification-message ${type}`;
    notificationDiv.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.error}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;

    document.body.appendChild(notificationDiv);

    // 5초 후 자동 제거
    setTimeout(() => {
        if (notificationDiv.parentNode) {
            notificationDiv.remove();
        }
    }, 5000);
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showAPIKeyDialog() {
    // API 키 수동 입력 기능 제거 - .env.local로만 설정 가능
    showMandatoryAPIKeyDialog();
}

function showMandatoryAPIKeyDialog(errorMessage = null) {
    // 기존 다이얼로그가 있으면 제거
    const existing = document.querySelector('.api-key-dialog-overlay');
    if (existing) existing.remove();
    
    const dialog = document.createElement('div');
    dialog.className = 'api-key-dialog-overlay mandatory';
    
    // 오류 메시지에 따른 제목과 내용 변경
    let title = '🔑 .env.local 파일 설정 필요';
    let description = '이 앱을 사용하려면 서버에 OpenRouter API 키를 설정해야 합니다.';
    let troubleshootingSection = '';
    
    if (errorMessage && errorMessage.includes('유효하지 않거나 만료')) {
        title = '❌ API 키 오류';
        description = 'OpenRouter API 키가 유효하지 않거나 만료되었습니다.';
        troubleshootingSection = `
            <div class="troubleshooting">
                <h4>🔧 문제 해결:</h4>
                <ul>
                    <li>✅ <strong>새 API 키 발급:</strong> 기존 키가 만료되었을 수 있습니다</li>
                    <li>✅ <strong>결제 정보 확인:</strong> OpenRouter 계정에 크레딧이 있는지 확인</li>
                    <li>✅ <strong>키 형식 확인:</strong> OpenRouter 키 형식인지 확인</li>
                    <li>✅ <strong>공백 제거:</strong> API 키 앞뒤 공백이 없는지 확인</li>
                </ul>
            </div>
        `;
    } else if (errorMessage && errorMessage.includes('사용량 한도')) {
        title = '📊 사용량 한도 초과';
        description = 'OpenRouter API 사용량 한도를 초과했습니다.';
        troubleshootingSection = `
            <div class="troubleshooting">
                <h4>🔧 해결 방법:</h4>
                <ul>
                    <li>💳 <strong>결제 정보 추가:</strong> OpenRouter 계정에 결제 방법 등록</li>
                    <li>💰 <strong>크레딧 충전:</strong> 계정에 충분한 크레딧 추가</li>
                    <li>⏰ <strong>잠시 대기:</strong> 무료 한도 초기화까지 대기</li>
                    <li>📈 <strong>플랜 업그레이드:</strong> 더 높은 사용량 플랜으로 변경</li>
                </ul>
            </div>
        `;
    }
    
    dialog.innerHTML = `
        <div class="api-key-dialog">
            <h3>${title}</h3>
            <p>${description}</p>
            ${errorMessage ? `<div class="error-details"><strong>오류:</strong> ${errorMessage}</div>` : ''}
            <div class="api-key-info mandatory">
                <p><strong>설정 방법:</strong></p>
                <ol>
                    <li><a href="https://openrouter.ai/settings/keys" target="_blank">OpenRouter</a>에서 새 API 키 발급</li>
                    <li>프로젝트 폴더의 <code>.env.local</code> 파일 수정</li>
                    <li>파일에서 API 키 업데이트:<br>
                        <code>OPENROUTER_API_KEY=sk-or-your-api-key-here</code>
                    </li>
                    <li>서버 재시작: <code>npm start</code></li>
                </ol>
                <p><strong>보안:</strong> API 키는 .env.local 파일에서만 로드되며, 웹 UI로 입력할 수 없습니다.</p>
            </div>
            ${troubleshootingSection}
            <div class="env-file-example">
                <h4>📄 .env.local 파일 예시:</h4>
                <pre><code># OpenRouter API 설정 (새 키로 교체)
OPENROUTER_API_KEY=sk-or-새로운키를여기에입력
DAILY_REQUEST_LIMIT=50
MONTHLY_REQUEST_LIMIT=1000
OPENROUTER_MODEL=openrouter/auto</code></pre>
            </div>
            <div class="api-key-actions">
                <button onclick="location.reload()" class="primary-btn">설정 후 새로고침</button>
                <button onclick="window.open('https://openrouter.ai/settings/keys', '_blank')" class="secondary-btn">새 API 키 발급</button>
                <button onclick="window.open('https://openrouter.ai/settings/credits', '_blank')" class="secondary-btn">결제 정보 확인</button>
            </div>
            <div class="api-key-help">
                <p><small>
                    💡 Node.js 서버를 실행 중인지 확인하세요: <code>npm start</code><br>
                    🔒 API 키는 절대 코드에 직접 입력하지 마세요.<br>
                    💰 OpenRouter API는 유료 서비스입니다. 계정에 크레딧이 필요합니다.
                </small></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // ESC 키로 닫기 방지
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            e.preventDefault();
        }
    });
}

// API 키 수동 입력 관련 함수들 제거
// .env.local 파일을 통해서만 API 키 설정 가능

function updateUsageDisplay() {
    if (!window.openaiConfig) return;
    
    const stats = window.openaiConfig.getUsageStats();
    if (!stats) return;
    
    const aiText = document.getElementById('ai-text');
    if (aiText) {
        aiText.innerHTML = `AI 분석 활성화`;
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <span class="success-icon">✅</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

// AI 질문 도우미 기능
async function askAIQuestion(question) {
    if (window.openaiConfig.isReady && !window.openaiConfig.isReady()) {
        showErrorMessage('AI 질문 기능을 사용하려면 서버 설정이 필요합니다.');
        return;
    }
    
    const context = painData.analysis.aiAnalysis ? 
        `현재 분석 결과: ${painData.analysis.aiAnalysis}\n\n` : '';
    
    const prompt = `${context}질문: ${question}`;
    
    try {
        const response = await window.openaiConfig.makeRequest(
            [{ role: 'user', content: prompt }],
            `당신은 트리거 포인트 치료 전문가입니다. 사용자의 질문에 안전하고 도움이 되는 답변을 제공하세요. 
            의학적 진단은 하지 말고, 일반적인 셀프 케어 가이드만 제공하세요.`
        );
        
        return response;
    } catch (error) {
        console.error('AI 질문 처리 실패:', error);
        throw error;
    }
}

// 인터랙티브 트리거 포인트 찾기 가이드
function startInteractiveGuide(triggerPointName, location) {
    const guideData = getGuideSteps(triggerPointName, location);
    
    const modal = document.createElement('div');
    modal.className = 'interactive-guide-modal';
    modal.innerHTML = `
        <div class="guide-modal-content">
            <div class="guide-header">
                <h3>🔍 ${triggerPointName} 찾기 가이드</h3>
                <button class="close-guide" onclick="closeInteractiveGuide()">✕</button>
            </div>
            <div class="guide-progress">
                <div class="progress-dots">
                    ${guideData.steps.map((_, index) => 
                        `<div class="progress-dot ${index === 0 ? 'active' : ''}" data-step="${index}"></div>`
                    ).join('')}
                </div>
            </div>
            <div class="guide-content" id="guide-content">
                <!-- 동적으로 단계별 내용 표시 -->
            </div>
            <div class="guide-navigation">
                <button id="prev-step" class="guide-nav-btn" disabled>이전</button>
                <button id="next-step" class="guide-nav-btn">다음</button>
                <button id="finish-guide" class="guide-finish-btn" style="display: none;">완료</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 가이드 상태 초기화
    window.currentGuide = {
        currentStep: 0,
        totalSteps: guideData.steps.length,
        steps: guideData.steps,
        triggerPointName: triggerPointName
    };
    
    updateGuideStep();
    setupGuideNavigation();
}

function getGuideSteps(triggerPointName, location) {
    const commonSteps = {
        'neck-shoulder-junction': {
            steps: [
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
            ]
        },
        'skull-base': {
            steps: [
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
        }
    };
    
    return commonSteps[location] || {
        steps: [
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
        ]
    };
}

function updateGuideStep() {
    const guide = window.currentGuide;
    const content = document.getElementById('guide-content');
    const step = guide.steps[guide.currentStep];
    
    content.innerHTML = `
        <div class="guide-step-content">
            <div class="step-header">
                <div class="step-emoji">${step.image}</div>
                <h4>단계 ${guide.currentStep + 1}: ${step.title}</h4>
            </div>
            <div class="step-body">
                <p class="step-description">${step.content}</p>
                <div class="step-tip">
                    <span class="tip-icon">💡</span>
                    <span class="tip-text">${step.tip}</span>
                </div>
            </div>
        </div>
    `;
    
    // 진행률 점 업데이트
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === guide.currentStep);
        dot.classList.toggle('completed', index < guide.currentStep);
    });
    
    // 네비게이션 버튼 상태 업데이트
    document.getElementById('prev-step').disabled = guide.currentStep === 0;
    
    const nextBtn = document.getElementById('next-step');
    const finishBtn = document.getElementById('finish-guide');
    
    if (guide.currentStep === guide.totalSteps - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
    }
}

function setupGuideNavigation() {
    document.getElementById('prev-step').addEventListener('click', () => {
        if (window.currentGuide.currentStep > 0) {
            window.currentGuide.currentStep--;
            updateGuideStep();
        }
    });
    
    document.getElementById('next-step').addEventListener('click', () => {
        if (window.currentGuide.currentStep < window.currentGuide.totalSteps - 1) {
            window.currentGuide.currentStep++;
            updateGuideStep();
        }
    });
    
    document.getElementById('finish-guide').addEventListener('click', () => {
        closeInteractiveGuide();
        showSuccessMessage(`${window.currentGuide.triggerPointName} 가이드 완료! 꾸준히 하시면 좋아질 거예요.`);
    });
}

function closeInteractiveGuide() {
    const modal = document.querySelector('.interactive-guide-modal');
    if (modal) {
        modal.remove();
    }
    window.currentGuide = null;
}
