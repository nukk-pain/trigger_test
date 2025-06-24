// 통증 가이드 도우미 - 메인 JavaScript (OpenAI API 통합)

// 트리거 포인트 데이터베이스 - 통증 부위별 실제 치료 포인트 매핑
const triggerPointsDB = [
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
const fascialLinesDB = {
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
const redFlagConditions = [
    'fever', 'severe-numbness', 'weakness', 'bladder', 'chest-pain', 'breathing'
];

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
        throw new Error('OpenAI 설정이 로드되지 않았습니다.');
    }

    const hasApiKey = await window.openaiConfig.initialize();
    
    if (!hasApiKey) {
        // API 키가 없으면 필수 설정 다이얼로그 표시
        showMandatoryAPIKeyDialog();
        throw new Error('API 키 설정이 필요합니다.');
    }

    console.log('✅ OpenAI API 설정 완료');
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
    // 1단계 (부위 선택) -> 2단계 (문진)
    document.getElementById('next-to-step2').addEventListener('click', function() {
        if (validateStep1()) {
            goToStep(2);
        }
    });
    
    // 2단계 (문진) -> 1단계 (부위 선택)
    document.getElementById('back-to-step1').addEventListener('click', function() {
        goToStep(1);
    });
    
    // 2단계 (문진) -> 3단계 (분석)
    document.getElementById('analyze-pain').addEventListener('click', function() {
        if (validateStep2()) {
            collectStep2Data();
            analyzePain();
            goToStep(3);
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
    
    if (window.openaiConfig && window.openaiConfig.hasApiKey()) {
        indicator.textContent = '🤖✅';
        text.textContent = 'AI 분석 활성화 (.env.local 설정됨)';
    } else {
        indicator.textContent = '🤖❌';
        text.textContent = '.env.local 파일에 API 키 설정 필요';
    }
}

function setupDynamicFormEvents() {
    // 다친 적이 있는지에 따른 상세 질문 표시/숨김
    document.querySelectorAll('input[name="injury-history"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const injuryDetails = document.getElementById('injury-details');
            if (this.value === '네') {
                injuryDetails.style.display = 'block';
            } else {
                injuryDetails.style.display = 'none';
            }
        });
    });
    
    // 외상 종류에서 '기타' 선택 시 텍스트 입력 표시
    document.querySelectorAll('input[name="injury-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const otherInput = document.getElementById('injury-other');
            if (this.value === '기타') {
                otherInput.style.display = 'block';
            } else {
                otherInput.style.display = 'none';
            }
        });
    });
    
    // 통증 성격에서 '기타' 선택 시 텍스트 입력 표시
    document.querySelectorAll('input[name="pain-quality"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const otherInput = document.getElementById('pain-quality-other');
            const isOtherChecked = document.querySelector('input[name="pain-quality"][value="기타"]:checked');
            if (isOtherChecked) {
                otherInput.style.display = 'block';
            } else {
                otherInput.style.display = 'none';
            }
        });
    });
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
    // 1단계: 부위 선택 검증
    if (painData.selectedAreas.length === 0) {
        alert('아픈 곳을 선택해 주세요.');
        return false;
    }
    return true;
}

function validateStep2() {
    // 2단계: 문진 검증
    const injuryHistory = document.querySelector('input[name="injury-history"]:checked');
    if (!injuryHistory) {
        alert('다친 적이 있는지 선택하세요.');
        return false;
    }
    
    const duration = document.querySelector('input[name="duration"]:checked');
    if (!duration) {
        alert('아픈 기간을 선택하세요.');
        return false;
    }
    
    const nrs = document.querySelector('input[name="nrs"]:checked');
    if (!nrs) {
        alert('아픈 정도를 선택하세요.');
        return false;
    }
    
    return true;
}

function collectStep2Data() {
    painData.questionnaire = {
        mostDifficultMovement: document.getElementById('pain-description').value,
        injuryHistory: document.querySelector('input[name="injury-history"]:checked')?.value || '',
        injuryType: document.querySelector('input[name="injury-type"]:checked')?.value || '',
        injuryOther: document.getElementById('injury-other').value || '',
        duration: document.querySelector('input[name="duration"]:checked')?.value || '',
        nrs: document.querySelector('input[name="nrs"]:checked')?.value || '',
        painQuality: Array.from(document.querySelectorAll('input[name="pain-quality"]:checked')).map(cb => cb.value),
        painQualityOther: document.getElementById('pain-quality-other').value || '',
        painPattern: Array.from(document.querySelectorAll('input[name="pain-pattern"]:checked')).map(cb => cb.value),
        nightWake: document.querySelector('input[name="night-wake"]:checked')?.value || '',
        worsenFactors: document.getElementById('worsen-factors').value || '',
        improveFactors: document.getElementById('improve-factors').value || '',
        redFlags: Array.from(document.querySelectorAll('input[name="red-flag"]:checked')).map(cb => cb.value)
    };
}

function toggleAreaSelection(area) {
    const element = document.querySelector(`[data-area="${area}"]`);
    const index = painData.selectedAreas.indexOf(area);
    
    if (index > -1) {
        // 선택 해제
        painData.selectedAreas.splice(index, 1);
        element.classList.remove('selected');
        element.style.fill = 'rgba(255, 0, 0, 0.1)';
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
    }
    
    updateSelectedAreasList();
}

function getAreaDisplayName(area) {
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

function clearSelection() {
    painData.selectedAreas.forEach(area => {
        const element = document.querySelector(`[data-area="${area}"]`);
        if (element) {
            element.classList.remove('selected');
            element.style.fill = 'rgba(255, 0, 0, 0.1)';
        }
    });
    
    painData.selectedAreas = [];
    updateSelectedAreasList();
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
    const hasRedFlags = painData.questionnaire.redFlags.some(flag => 
        redFlagConditions.includes(flag)
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
    // 기본 레드 플래그 체크만 수행 (API 호출 없이)
    const hasRedFlags = painData.questionnaire.redFlags.some(flag => 
        redFlagConditions.includes(flag)
    );
    
    if (hasRedFlags) {
        showRedFlagWarning();
        return;
    }
    
    // AI 기반 통증 분석 (한 번의 API 호출로 레드 플래그와 분석 모두 수행)
    const aiAnalysis = await analyzeWithAI();
    
    // 결과 저장
    painData.analysis = {
        ...aiAnalysis,
        hasRedFlags: false,
        aiEnhanced: true
    };
    
    // 결과 표시
    displayAnalysisResults();
}

async function checkRedFlagsWithAI() {
    const symptoms = {
        redFlags: painData.questionnaire.redFlags,
        painTypes: painData.questionnaire.painTypes,
        intensity: painData.questionnaire.intensity,
        duration: painData.questionnaire.duration,
        description: painData.questionnaire.description
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
        // 안전을 위해 기본 체크 사용
        return {
            isEmergency: painData.questionnaire.redFlags.some(flag => 
                redFlagConditions.includes(flag)
            ),
            reason: '기본 안전 체크 사용'
        };
    }
}

async function analyzeWithAI() {
    const q = painData.questionnaire;
    const areas = painData.selectedAreas.map(area => getAreaDisplayName(area));
    
    const prompt = `환자 정보:
가장 힘든 동작: ${q.mostDifficultMovement}
다친 기억: ${q.injuryHistory}${q.injuryType ? ` (${q.injuryType}${q.injuryOther ? ': ' + q.injuryOther : ''})` : ''}
통증 지속 기간: ${q.duration}
통증 강도: ${q.nrs}/10
통증 성격: ${q.painQuality.join(', ')}${q.painQualityOther ? ' (' + q.painQualityOther + ')' : ''}
통증 양상: ${q.painPattern.join(', ')}
밤에 잠깸: ${q.nightWake}
악화 요인: ${q.worsenFactors || '없음'}
완화 요인: ${q.improveFactors || '없음'}
통증 부위: ${areas.join(', ')}

위 정보를 바탕으로 분석해주세요.`;
    
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

function analyzeTriggerPoints() {
    const recommendations = [];
    const foundTriggerPoints = new Set(); // 중복 방지
    
    // 선택된 통증 부위에 대해 해당 부위에 통증을 유발하는 트리거 포인트들을 찾기
    painData.selectedAreas.forEach(selectedArea => {
        triggerPointsDB.forEach(triggerPoint => {
            // 이 트리거 포인트가 선택된 부위에 통증을 유발하는지 확인
            const causesSelectedPain = triggerPoint.painAreas.includes(selectedArea);
            
            if (causesSelectedPain && !foundTriggerPoints.has(triggerPoint.name)) {
                foundTriggerPoints.add(triggerPoint.name);
                
                // 트리거 액션과 매칭하여 신뢰도 결정
                const triggers = painData.questionnaire.worsenFactors ? 
                    painData.questionnaire.worsenFactors.toLowerCase() : '';
                
                const actionMatch = triggerPoint.triggers.some(trigger => {
                    const triggerKeywords = {
                        'sitting': ['앉', '의자', '컴퓨터'],
                        'stress': ['스트레스', '긴장', '피로'],
                        'poor-posture': ['자세', '구부정', '앞으로'],
                        'computer-work': ['컴퓨터', '업무', '모니터', '키보드'],
                        'heavy-lifting': ['들기', '무거운', '짐'],
                        'sleeping-position': ['잠', '베개', '누워서'],
                        'prolonged-sitting': ['오래 앉', '장시간'],
                        'forward-head-posture': ['목 앞으로', '거북목']
                    };
                    
                    const keywords = triggerKeywords[trigger] || [trigger];
                    return keywords.some(keyword => triggers.includes(keyword));
                });
                
                // 통증 강도 고려
                const intensityMatch = painData.questionnaire.nrs >= 6;
                
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

function analyzeFascialLines() {
    const recommendations = [];
    
    // 선택된 부위를 기반으로 관련 근막 경선 찾기
    Object.keys(fascialLinesDB).forEach(lineKey => {
        const line = fascialLinesDB[lineKey];
        const hasRelatedArea = line.relatedAreas.some(area => 
            painData.selectedAreas.some(selected => 
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

// mapAreaToGroup 함수 제거 - 이제 직접 painAreas 배열로 매칭

function displayAnalysisResults() {
    if (painData.analysis.hasRedFlags) return;
    
    // AI 분석 결과만 표시
    if (painData.analysis.aiEnhanced && painData.analysis.aiAnalysis) {
        const resultContainer = document.getElementById('ai-analysis-result');
        resultContainer.innerHTML = `
            <div class="ai-result-content">
                ${formatAIResponse(painData.analysis.aiAnalysis)}
            </div>
        `;
    }
}

function displayAIAnalysis() {
    const analysisContainer = document.getElementById('trigger-points-analysis');
    
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

function formatAIResponse(response) {
    // AI 응답을 HTML로 포맷팅
    return response
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

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

function getLocationDescription(location) {
    const descriptions = {
        'neck-shoulder-junction': '목과 어깨 경계 부분',
        'skull-base': '머리 뒤쪽 경계선',
        'shoulder-blade-top': '어깨 날개뼈 위쪽',
        'between-shoulder-blades': '양쪽 어깨 날개뼈 사이',
        'lower-back-sides': '허리 양쪽'
    };
    
    return descriptions[location] || location;
}

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
    progressSteps.forEach(step => step.classList.remove('active'));
    
    // 새 단계 보이기
    document.getElementById(`step${stepNumber}`).classList.add('active');
    document.querySelector(`[data-step="${stepNumber}"]`).classList.add('active');
    
    currentStep = stepNumber;
    updateProgressBar();
}

function updateProgressBar() {
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
    
    // 폼 초기화
    document.getElementById('pain-questionnaire').reset();
    const intensityValue = document.getElementById('intensity-value');
    if (intensityValue) {
        intensityValue.textContent = '5';
    }
    
    // 선택 영역 초기화
    clearSelection();
    
    // 경고 숨기기
    document.getElementById('red-flag-warning').classList.add('hidden');
    document.getElementById('massage-guide').style.display = 'block';
    
    currentStep = 1;
}

// OpenAI API 관련 유틸리티 함수들
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

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
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
    let description = '이 앱을 사용하려면 .env.local 파일에 OpenAI API 키를 설정해야 합니다.';
    let troubleshootingSection = '';
    
    if (errorMessage && errorMessage.includes('유효하지 않거나 만료')) {
        title = '❌ API 키 오류';
        description = 'OpenAI API 키가 유효하지 않거나 만료되었습니다.';
        troubleshootingSection = `
            <div class="troubleshooting">
                <h4>🔧 문제 해결:</h4>
                <ul>
                    <li>✅ <strong>새 API 키 발급:</strong> 기존 키가 만료되었을 수 있습니다</li>
                    <li>✅ <strong>결제 정보 확인:</strong> OpenAI 계정에 크레딧이 있는지 확인</li>
                    <li>✅ <strong>키 형식 확인:</strong> sk-proj- 또는 sk- 로 시작하는지 확인</li>
                    <li>✅ <strong>공백 제거:</strong> API 키 앞뒤 공백이 없는지 확인</li>
                </ul>
            </div>
        `;
    } else if (errorMessage && errorMessage.includes('사용량 한도')) {
        title = '📊 사용량 한도 초과';
        description = 'OpenAI API 사용량 한도를 초과했습니다.';
        troubleshootingSection = `
            <div class="troubleshooting">
                <h4>🔧 해결 방법:</h4>
                <ul>
                    <li>💳 <strong>결제 정보 추가:</strong> OpenAI 계정에 결제 방법 등록</li>
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
                    <li><a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>에서 새 API 키 발급</li>
                    <li>프로젝트 폴더의 <code>.env.local</code> 파일 수정</li>
                    <li>파일에서 API 키 업데이트:<br>
                        <code>OPENAI_API_KEY=sk-your-new-api-key-here</code>
                    </li>
                    <li>서버 재시작: <code>npm start</code></li>
                </ol>
                <p><strong>보안:</strong> API 키는 .env.local 파일에서만 로드되며, 웹 UI로 입력할 수 없습니다.</p>
            </div>
            ${troubleshootingSection}
            <div class="env-file-example">
                <h4>📄 .env.local 파일 예시:</h4>
                <pre><code># OpenAI API 설정 (새 키로 교체)
OPENAI_API_KEY=sk-proj-새로운키를여기에입력
DAILY_REQUEST_LIMIT=50
MONTHLY_REQUEST_LIMIT=1000
OPENAI_MODEL=gpt-4o-mini</code></pre>
            </div>
            <div class="api-key-actions">
                <button onclick="location.reload()" class="primary-btn">설정 후 새로고침</button>
                <button onclick="window.open('https://platform.openai.com/api-keys', '_blank')" class="secondary-btn">새 API 키 발급</button>
                <button onclick="window.open('https://platform.openai.com/account/billing', '_blank')" class="secondary-btn">결제 정보 확인</button>
            </div>
            <div class="api-key-help">
                <p><small>
                    💡 Node.js 서버를 실행 중인지 확인하세요: <code>npm start</code><br>
                    🔒 API 키는 절대 코드에 직접 입력하지 마세요.<br>
                    💰 OpenAI API는 유료 서비스입니다. 계정에 크레딧이 필요합니다.
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
        const remaining = window.openaiConfig.getRemainingRequests();
        aiText.innerHTML = `AI 분석 활성화 (남은 요청: ${remaining}회)`;
    }
    
    // 헤더에 사용량 표시 추가
    let usageDisplay = document.getElementById('usage-display');
    if (!usageDisplay) {
        const aiStatus = document.getElementById('ai-status');
        usageDisplay = document.createElement('div');
        usageDisplay.id = 'usage-display';
        usageDisplay.className = 'usage-display';
        aiStatus.appendChild(usageDisplay);
    }
    
    usageDisplay.innerHTML = `
        <small>
            일일: ${stats.daily.used}/${stats.daily.limit} | 
            월간: ${stats.monthly.used}/${stats.monthly.limit}
        </small>
    `;
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
    if (!window.openaiConfig.hasApiKey()) {
        showErrorMessage('AI 질문 기능을 사용하려면 OpenAI API 키가 필요합니다.');
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