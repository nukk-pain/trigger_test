import { setSafeHtml } from './safe-html.js';

export function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.className = 'loading-overlay';
    setSafeHtml(loadingDiv, `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>🤖 AI가 분석 중입니다...</p>
            <p class="loading-subtext">더 정확한 결과를 위해 잠시만 기다려주세요</p>
        </div>
    `);
    document.body.appendChild(loadingDiv);
}

export function hideLoadingIndicator() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

export function showNotification(message, type = 'error') {
    const icons = {
        error: '⚠️',
        warning: '⚠️',
        info: 'ℹ️',
        success: '✅'
    };

    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification-message ${type}`;
    setSafeHtml(notificationDiv, `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.error}</span>
            <span>${message}</span>
            <button data-action="dismiss">✕</button>
        </div>
    `);
    notificationDiv.querySelector('[data-action="dismiss"]').addEventListener('click', () => notificationDiv.remove());

    document.body.appendChild(notificationDiv);

    // 5초 후 자동 제거
    setTimeout(() => {
        if (notificationDiv.parentNode) {
            notificationDiv.remove();
        }
    }, 5000);
}

export function showErrorMessage(message) {
    showNotification(message, 'error');
}

export function showServerStatusDialog() {
    // 서버 프록시 수동 입력 기능 제거 - .env.local로만 설정 가능
    showServerProxyDialog();
}

export function showServerProxyDialog(errorMessage = null) {
    // 기존 다이얼로그가 있으면 제거
    const existing = document.querySelector('.server-proxy-dialog-overlay');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.className = 'server-proxy-dialog-overlay mandatory';

    // 오류 메시지에 따른 제목과 내용 변경
    let title = '🔑 .env.local 파일 설정 필요';
    let description = '이 앱을 사용하려면 서버에 OpenRouter 서버 프록시를 설정해야 합니다.';
    let troubleshootingSection = '';

    if (errorMessage && errorMessage.includes('유효하지 않거나 만료')) {
        title = '❌ 서버 프록시 오류';
        description = 'OpenRouter 서버 프록시가 유효하지 않거나 만료되었습니다.';
        troubleshootingSection = `
            <div class="troubleshooting">
                <h4>🔧 문제 해결:</h4>
                <ul>
                    <li>✅ <strong>새 서버 프록시 발급:</strong> 기존 키가 만료되었을 수 있습니다</li>
                    <li>✅ <strong>결제 정보 확인:</strong> OpenRouter 계정에 크레딧이 있는지 확인</li>
                    <li>✅ <strong>키 형식 확인:</strong> OpenRouter 키 형식인지 확인</li>
                    <li>✅ <strong>공백 제거:</strong> 서버 프록시 앞뒤 공백이 없는지 확인</li>
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

    setSafeHtml(dialog, `
        <div class="server-proxy-dialog">
            <h3>${title}</h3>
            <p>${description}</p>
            ${errorMessage ? `<div class="error-details"><strong>오류:</strong> ${errorMessage}</div>` : ''}
            <div class="server-proxy-info mandatory">
                <p><strong>설정 방법:</strong></p>
                <ol>
                    <li><a href="https://openrouter.ai/settings/keys" target="_blank">OpenRouter</a>에서 새 서버 프록시 발급</li>
                    <li>프로젝트 폴더의 <code>.env.local</code> 파일 수정</li>
                    <li>파일에서 서버 프록시 업데이트:<br>
                        <code>OPENROUTER_API_KEY=sk-or-your-server-proxy-here</code>
                    </li>
                    <li>서버 재시작: <code>npm start</code></li>
                </ol>
                <p><strong>보안:</strong> 서버 프록시는 .env.local 파일에서만 로드되며, 웹 UI로 입력할 수 없습니다.</p>
            </div>
            ${troubleshootingSection}
            <div class="env-file-example">
                <h4>📄 .env.local 파일 예시:</h4>
                <pre><code># OpenRouter API 설정 (새 키로 교체)
OPENROUTER_API_KEY=sk-or-your-server-proxy-here
DAILY_REQUEST_LIMIT=50
MONTHLY_REQUEST_LIMIT=1000
OPENROUTER_MODEL=openrouter/auto</code></pre>
            </div>
            <div class="server-proxy-actions">
                <button data-action="reload" class="primary-btn">설정 후 새로고침</button>
                <button data-action="openrouter-keys" class="secondary-btn">OpenRouter 키 관리</button>
                <button data-action="openrouter-credits" class="secondary-btn">결제 정보 확인</button>
            </div>
            <div class="server-proxy-help">
                <p><small>
                    💡 Node.js 서버를 실행 중인지 확인하세요: <code>npm start</code><br>
                    🔒 서버 프록시는 절대 코드에 직접 입력하지 마세요.<br>
                    💰 OpenRouter API는 유료 서비스입니다. 계정에 크레딧이 필요합니다.
                </small></p>
            </div>
        </div>
    `);

    document.body.appendChild(dialog);
    dialog.querySelector('[data-action="reload"]').addEventListener('click', () => location.reload());
    dialog.querySelector('[data-action="openrouter-keys"]').addEventListener('click', () => {
        window.open('https://openrouter.ai/settings/keys', '_blank');
    });
    dialog.querySelector('[data-action="openrouter-credits"]').addEventListener('click', () => {
        window.open('https://openrouter.ai/settings/credits', '_blank');
    });

    // ESC 키로 닫기 방지
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            e.preventDefault();
        }
    });
}

// 서버 프록시 수동 입력 관련 함수들 제거
// .env.local 파일을 통해서만 서버 프록시 설정 가능

export function updateUsageDisplay() {
    if (!window.openRouterConfig) return;

    const stats = window.openRouterConfig.getUsageStats();
    if (!stats) return;

    const aiText = document.getElementById('ai-text');
    if (aiText) {
        setSafeHtml(aiText, `AI 분석 활성화`);
    }
}

export function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    setSafeHtml(successDiv, `
        <div class="success-content">
            <span class="success-icon">✅</span>
            <span>${message}</span>
            <button data-action="dismiss">✕</button>
        </div>
    `);
    successDiv.querySelector('[data-action="dismiss"]').addEventListener('click', () => successDiv.remove());

    document.body.appendChild(successDiv);

    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}
