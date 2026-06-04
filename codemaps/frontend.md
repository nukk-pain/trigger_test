# Frontend Structure
> Last updated: 2026-06-04

## Overview

프론트엔드는 Vanilla JavaScript로 구현되며, ES Modules를 사용합니다.

## File Structure

```
/
├── index.html                # 메인 페이지
├── styles.css                # 공용/잔여 스타일
├── styles/
│   ├── base.css
│   ├── layout.css
│   ├── body-map.css
│   └── analysis.css
├── script.js                 # UI 로직
├── src/browser/
│   ├── analysis-flow.js      # 분석 orchestration
│   ├── analysis-ai.js        # AI 호출/파싱
│   └── analysis-renderer.js  # 결과/경고 렌더링
└── lib/
    ├── env-loader.js         # 환경설정 관리
    ├── config.js             # OpenRouter 프록시 설정
    ├── utils.js              # area/markdown/validation re-export
    ├── data.js               # data/* re-export
    └── analysis.js           # 분석 함수
```

---

## lib/env-loader.js

### EnvLoader Class

**Purpose**: 환경변수 로드 및 설정 관리

```javascript
class EnvLoader {
  config: Object        // 설정 저장소
  loaded: Boolean       // 로드 상태

  // 환경 체크
  isTestEnvironment(): boolean

  // 환경변수 로드
  loadEnv(): Promise<boolean>
  parseEnvContent(content: string): void
  loadFromLocalStorage(): void
  saveToLocalStorage(): void

  // 설정 접근
  get(key: string, defaultValue?: any): any
  set(key: string, value: any): void

  // 서버 준비 상태 확인
  getApiKey(): string
  setApiKey(): throws    // 항상 에러 (보안)
  hasApiKey(): boolean

  // 설정 값 접근
  getDailyLimit(): number     // default: 50
  getMonthlyLimit(): number   // default: 1000
  getModel(): string          // default: openrouter/auto
  getMaxTokens(): number      // default: 1500
  getTemperature(): number    // default: 1

  // 기능 활성화
  isAIQAEnabled(): boolean
  isDetailedAnalysisEnabled(): boolean
}
```

### UsageTracker Class

**Purpose**: 브라우저별 사용량 표시 및 사전 안내

```javascript
class UsageTracker {
  storageKey: 'pain_guide_usage'
  usage: { daily: {}, monthly: {}, total: number }

  // 날짜 헬퍼
  getToday(): string      // YYYY-MM-DD
  getThisMonth(): string  // YYYY-MM

  // 사용량 조회
  getDailyUsage(): number
  getMonthlyUsage(): number

  // 표시용 제한 체크
  canMakeRequest(envLoader): boolean
  canShowClientRequestAllowance(envLoader): boolean
  getRemainingRequests(envLoader): number

  // 기록
  recordRequest(): void
  cleanupOldData(): void  // 30일 이전 데이터 삭제

  // 통계
  getUsageStats(envLoader): UsageStats
}
```

---

## lib/config.js

### OpenRouterConfig Class

**Purpose**: 서버 `/api/chat` 프록시를 통한 OpenRouter API 통신 관리

```javascript
class OpenRouterConfig {
  baseURL: '/api'
  initialized: boolean
  model: string
  maxTokens: number
  temperature: number

  // 초기화
  initialize(): Promise<boolean>

  // 서버 준비 상태
  setApiKey(): throws    // 항상 에러 (보안)
  getApiKey(): string
  hasApiKey(): boolean
  isReady(): boolean
  testApiKey(): Promise<boolean>

  // API 요청
  makeRequest(messages: Message[], systemPrompt?: string): Promise<string>

  // 사용량
  getUsageStats(): UsageStats | null
  getRemainingRequests(): number
}
```

### MEDICAL_PROMPTS

```javascript
{
  PAIN_ANALYSIS: string,    // 통증 분석용 시스템 프롬프트
  MASSAGE_GUIDE: string,    // 마사지 가이드용 프롬프트
  RED_FLAG_CHECK: string    // 응급상황 체크용 프롬프트
}
```

---

## lib/utils.js

### Utility Functions

| Function | Purpose |
|----------|---------|
| `getAreaDisplayName(area)` | 부위코드→한글명 변환 |
| `getLocationDescription(loc)` | 위치코드→설명 변환 |
| `formatAIResponse(response)` | Markdown→HTML 변환 |
| `mapAreaToGroup(area)` | 부위→그룹 매핑 |
| `validateStep1(areas, desc)` | 1단계 입력 검증 |

### formatAIResponse Details

```
입력: Markdown 텍스트
출력: HTML 문자열

변환 규칙:
- # → <h1>, ## → <h2>, ### → <h3>
- **text** → <strong>text</strong>
- *text* → <em>text</em>
- `code` → <code>code</code>
- - item → <li>item</li>
- > quote → <blockquote>quote</blockquote>
- 표(|...|) → <div class="massage-steps">단계 카드</div>
```

---

## lib/analysis.js

### Analysis Functions

```javascript
analyzeTriggerPoints(selectedAreas: string[], questionnaire: object)
├── 입력: 선택된 통증 부위, 설문 데이터
├── 매칭: painAreas와 selectedAreas 비교
├── 신뢰도: triggers + NRS 점수로 계산 (high/medium/low)
└── 출력: TriggerPoint[] (신뢰도순 정렬)

analyzeFascialLines(selectedAreas: string[])
├── 입력: 선택된 통증 부위
├── 매칭: relatedAreas와 mapAreaToGroup(area) 비교
└── 출력: FascialLine[]
```

---

## Global Variables

```javascript
window.envLoader    // EnvLoader 인스턴스
window.usageTracker // UsageTracker 인스턴스
```

## Event Flow

```
Page Load
    │
    ▼
envLoader.loadEnv()
    │
    ▼
User selects pain areas
    │
    ▼
User describes pain
    │
    ▼
validateStep1()
    │
    ▼
analyzeTriggerPoints() + analyzeFascialLines()
    │
    ▼
openAIConfig.makeRequest()
    │
    ▼
formatAIResponse()
    │
    ▼
Display results
```
