# 🩺 통증 가이드 도우미

AI 기반 통증 분석 및 셀프 마사지 가이드 제공 웹 애플리케이션

## ✨ 주요 기능

### 🧠 AI 강화 분석
- **OpenRouter** 기반 정밀 통증 분석 (모델 라우팅 지원)
- **개인화된 트리거 포인트** 매핑 및 권장사항
- **근막 경선 이론** 적용 (Thomas Myers의 Anatomy Trains)
- **실시간 레드 플래그** 감지 및 응급상황 알림

### 📝 간소화된 입력 시스템
1. **인체 지도 선택**: 상세한 SVG 기반 부위 선택 (앞면/뒷면)
2. **텍스트 기반 설명**: 통증이 심해지는 상황 자유 기술

### 🔒 사용량 관리
- **일일/월간 사용량 제한**: 기본 20회/일, 200회/월 (localStorage 기반 표시 + 서버 제한)
- **실시간 사용량 추적**: 헤더에 현재 사용현황 표시
- **자동 제한**: 한도 초과 시 요청 차단

### 💬 AI 질문 도우미
- **기본 비활성화**: `ENABLE_AI_QA=false`가 MVP 기본값입니다.
- **안전 중심 설계**: 활성화하더라도 의학적 진단 금지, 셀프케어 가이드만 제공

## 🚀 배포

현재 MVP 안정화 기준의 배포 대상은 **Vercel 단일 경로**입니다. Netlify, Railway, Render, Fly 설정은 이번 안정화 범위에 포함하지 않습니다.

### Vercel

```bash
# 1. Vercel 설치
npm install -g vercel

# 2. 프로젝트 폴더에서 배포
vercel

# 3. 환경변수 설정
vercel env add OPENROUTER_API_KEY
vercel env add OPENROUTER_MODEL
vercel env add MAX_TOKENS
vercel env add TEMPERATURE
vercel env add DAILY_REQUEST_LIMIT
vercel env add MONTHLY_REQUEST_LIMIT
vercel env add RATE_LIMIT_STORE
vercel env add REQUIRE_DURABLE_RATE_LIMIT
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add ALLOWED_ORIGINS

# 4. 재배포
vercel --prod
```

운영 배포에서는 `RATE_LIMIT_STORE=upstash`로 설정하고 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`을 함께 등록해야 합니다.

## 📁 파일 구조

```
trigger_test/
├── index.html          # 메인 HTML (통증 부위 선택 SVG 포함)
├── styles.css          # 공용/잔여 스타일
├── styles/             # 분리된 레이아웃/바디맵/분석 스타일
├── script.js           # 메인 UI 로직
├── config.js           # 브라우저 OpenRouter 프록시 설정
├── env-loader.js       # 브라우저 런타임 설정 로더
├── server.js           # Express 서버 (로컬 개발용)
├── api/
│   ├── env.js          # 공개 런타임 설정
│   ├── status.js       # 서버 프록시 상태
│   └── chat.js         # OpenRouter chat 프록시
├── lib/                # 공유 브라우저/서버 모듈
├── package.json        # 의존성 관리
└── README.md           # 이 파일
```

## 🔧 환경변수 설정

현재 MVP 안정화 기준의 배포 대상은 **Vercel 단일 경로**입니다. Netlify, Railway, Render, Fly 설정은 이번 안정화 범위에 포함하지 않습니다.

### .env.local (로컬 개발용)
```bash
OPENROUTER_API_KEY=<your-openrouter-api-key>
OPENROUTER_MODEL=<choose-openrouter-model>
MAX_TOKENS=800
TEMPERATURE=1
DAILY_REQUEST_LIMIT=20
MONTHLY_REQUEST_LIMIT=200
SERVER_RATE_LIMIT_MAX=20
SERVER_RATE_LIMIT_WINDOW_SECONDS=86400
MAX_CHAT_MESSAGES=6
MAX_CHAT_MESSAGE_CHARS=2000
MAX_CHAT_BODY_BYTES=16384
ENABLE_AI_QA=false
ENABLE_DETAILED_ANALYSIS=true
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=Pain Guide Helper
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_STORE=memory
REQUIRE_DURABLE_RATE_LIMIT=true

# Production durable rate limiting on Vercel
UPSTASH_REDIS_REST_URL=<your-upstash-redis-rest-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-redis-rest-token>

# Vercel Analytics (선택사항)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### 플랫폼별 환경변수 설정

**Vercel**:
```bash
vercel env add OPENROUTER_API_KEY
vercel env add OPENROUTER_MODEL
vercel env add MAX_TOKENS
vercel env add DAILY_REQUEST_LIMIT
vercel env add MONTHLY_REQUEST_LIMIT
vercel env add RATE_LIMIT_STORE
vercel env add REQUIRE_DURABLE_RATE_LIMIT
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add ALLOWED_ORIGINS
```

운영 배포에서는 `RATE_LIMIT_STORE=upstash`로 설정하고 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`을 함께 등록해야 합니다. `RATE_LIMIT_STORE=memory`는 로컬 개발과 테스트 전용 fallback입니다.

다른 플랫폼 설정은 이번 MVP 안정화 계획의 범위 밖입니다.

## 🛡️ 보안 고려사항

### API 키 보안
- **절대 금지**: 클라이언트 사이드에 API 키 노출
- **권장**: 서버리스 함수를 통한 프록시 패턴
- **환경변수**: 플랫폼별 환경변수 설정 활용

## 📱 로컬 개발

```bash
# 1. 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 API 키 설정

# 2. Node.js 서버 실행
node server.js
```

## 🧪 테스트

```bash
# 환경변수 로드 테스트
curl http://localhost:3000/api/env

# 서버 프록시 상태 테스트
curl http://localhost:3000/api/status

# AI 분석 테스트 (브라우저 개발자 도구 콘솔)
console.log(await window.envLoader.loadEnv());
```

## ⚙️ 환경변수 설정

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `OPENROUTER_API_KEY` | - | OpenRouter API 키 (필수, 서버 전용) |
| `DAILY_REQUEST_LIMIT` | 20 | 일일 요청 제한 |
| `MONTHLY_REQUEST_LIMIT` | 200 | 월간 요청 제한 |
| `OPENROUTER_MODEL` | - | 사용할 OpenRouter 모델. 운영 전 명시적으로 선택 |
| `MAX_TOKENS` | 800 | 최대 출력 토큰 수 |
| `TEMPERATURE` | 1 | AI 창의성 수준 |
| `SERVER_RATE_LIMIT_MAX` | `DAILY_REQUEST_LIMIT` | 서버 프록시 rate limit |
| `SERVER_RATE_LIMIT_WINDOW_SECONDS` | 86400 | 서버 rate limit 윈도우 |
| `MAX_CHAT_MESSAGES` | 6 | `/api/chat` 요청당 최대 메시지 수 |
| `MAX_CHAT_MESSAGE_CHARS` | 2000 | 메시지당 최대 글자 수 |
| `MAX_CHAT_BODY_BYTES` | 16384 | `/api/chat` JSON body 최대 크기 |
| `ENABLE_AI_QA` | false | AI 질문 도우미 활성화 |
| `ENABLE_DETAILED_ANALYSIS` | true | 상세 분석 활성화 |
| `ALLOWED_ORIGINS` | - | 허용할 브라우저 origin 목록 |
| `RATE_LIMIT_STORE` | memory | `memory` 또는 `upstash`; 운영은 `upstash` 권장 |
| `REQUIRE_DURABLE_RATE_LIMIT` | true | 운영에서 durable limiter 필수 여부 |
| `UPSTASH_REDIS_REST_URL` | - | Upstash Redis REST URL (서버 전용) |
| `UPSTASH_REDIS_REST_TOKEN` | - | Upstash Redis REST token (서버 전용) |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | - | Vercel Analytics ID (선택사항) |

## 🎯 사용 방법

### 1단계: 통증 정보 입력 (한 화면에서 완료)
**통증 부위 선택:**
- **인체 지도 클릭**: 앞면/뒷면 전환하여 정확한 통증 부위 선택
- **다중 선택 가능**: 여러 부위를 동시에 선택 가능
- **실시간 확인**: 선택된 부위가 우측 패널에 실시간 표시
- **세밀한 부위 구분**: 머리, 목, 어깨, 등, 허리, 팔, 다리의 상세 구역별 선택

**통증 상황 설명:**
- **자유로운 텍스트 입력**: "어떨 때 더 아프세요?" 질문에 답변
- **구체적 기술**: 통증이 심해지는 상황을 자세히 기술 (최대 500자)
- **예시**: "컴퓨터 작업을 30분 이상 하면 목이 뻣뻣해지고, 잠에서 깰 때 어깨가 결린다"

**분석 시작**: "분석하기" 버튼 클릭

### 2단계: AI 분석 결과 및 마사지 가이드
- **타겟 근육 식별**: 통증 원인이 되는 주요 근육군 AI 분석
- **단계별 마사지 가이드**: 구체적인 셀프 마사지 방법 제시
- **안전 주의사항**: 마사지 시 주의할 점과 중단 기준 안내
- **응급상황 감지**: 레드 플래그 증상 시 병원 방문 권고

## ⚠️ 안전 가이드라인

### 즉시 병원 방문이 필요한 경우
- 발열을 동반한 통증
- 심한 저림이나 마비 증상
- 근력 약화
- 배뇨/배변 장애
- 가슴 통증이나 호흡곤란
- 외상 후 지속되는 심한 통증

### 마사지 주의사항
- 통증이 심해지면 즉시 중단
- 과도한 압력 사용 금지
- 관절 직접 압박 피하기
- 3일 이상 통증 지속 시 의료진 상담

## 📊 사용량 관리

### 제한 사항
- **일일 제한**: 20회 (기본값)
- **월간 제한**: 200회 (기본값)
- **토큰 제한**: 요청당 800 토큰 (기본값)

### 사용량 확인
- 헤더에서 실시간 사용량 확인
- 브라우저 localStorage를 통한 클라이언트 사이드 추적

### 제한 초과 시
- 요청 차단 및 알림 메시지 표시
- 다음 날/다음 달까지 대기 또는 제한 상향 조정

### 사용량 모니터링
애플리케이션은 다음을 추적합니다:
- 일일 API 요청 수
- 월간 API 요청 수
- 총 누적 사용량

사용량은 브라우저 localStorage에 저장되며, 30일 후 자동 정리됩니다.

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Express.js (로컬 개발 서버)
- **AI**: OpenRouter Chat Completions API
- **Analytics**: Vercel Analytics (Web Vitals, 페이지 뷰)
- **의학 이론**: 
  - 트리거 포인트 치료법 (Dr. Janet Travell)
  - 근막 경선 이론 (Thomas Myers)
- **데이터 저장**: localStorage (로컬 저장)
- **보안**: API 키 서버사이드 관리

## 🛡️ 개인정보 보호

- **로컬 처리**: 모든 데이터는 브라우저 로컬에서 처리
- **API 키 보안**: 서버 환경변수에만 저장, 클라이언트 노출 없음
- **익명화**: 개인 식별 정보 수집하지 않음
- **Vercel Analytics**: 익명화된 페이지 뷰 및 성능 지표만 수집
- **OpenRouter 정책**: OpenRouter 개인정보 처리방침 준수

## 💰 비용 예상

비용은 `OPENROUTER_MODEL`로 선택한 모델의 OpenRouter 요금표를 따릅니다.

일일 20회 사용량 제한과 `MAX_TOKENS=800` 기본값으로 월간 비용을 제어할 수 있습니다.

## 🤝 기여하기

### 이슈 리포트
- 버그 발견 시 상세한 재현 단계 제공
- 브라우저 및 운영체제 정보 포함

### 개선 제안
- 새로운 트리거 포인트 데이터
- UI/UX 개선 아이디어
- 안전성 강화 방안

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

**면책조항**: 이 애플리케이션은 교육 및 정보 제공 목적으로만 사용되어야 하며, 전문적인 의료 조언, 진단 또는 치료를 대체할 수 없습니다. 심각한 통증이나 지속적인 증상이 있는 경우 반드시 의료 전문가와 상담하세요.
