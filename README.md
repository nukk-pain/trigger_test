# 🩺 통증 가이드 도우미

AI 기반 통증 분석 및 셀프 마사지 가이드 제공 웹 애플리케이션

## ✨ 주요 기능

### 🧠 AI 강화 분석
- **OpenAI o4-mini** 기반 정밀 통증 분석 (추론 모델 지원)
- **개인화된 트리거 포인트** 매핑 및 권장사항
- **근막 경선 이론** 적용 (Thomas Myers의 Anatomy Trains)
- **실시간 레드 플래그** 감지 및 응급상황 알림

### 📝 간소화된 입력 시스템
1. **인체 지도 선택**: 상세한 SVG 기반 부위 선택 (앞면/뒷면)
2. **텍스트 기반 설명**: 통증이 심해지는 상황 자유 기술

### 🔒 사용량 관리
- **일일/월간 사용량 제한**: 기본 50회/일, 1000회/월 (localStorage 기반 추적)
- **실시간 사용량 추적**: 헤더에 현재 사용현황 표시
- **자동 제한**: 한도 초과 시 요청 차단

### 💬 AI 질문 도우미
- **맥락 인식 Q&A**: 분석 결과 기반 추가 질문 답변
- **안전 중심 설계**: 의학적 진단 금지, 셀프케어 가이드만 제공

## 🚀 배포 옵션

### 1. Vercel (추천) ⭐

**장점**: 서버리스, 환경변수 보안, 무료 플랜, 쉬운 배포
**단점**: 콜드 스타트, 실행 시간 제한

```bash
# 1. Vercel 설치
npm install -g vercel

# 2. 프로젝트 폴더에서 배포
vercel

# 3. 환경변수 설정
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL
vercel env add MAX_TOKENS
vercel env add TEMPERATURE
vercel env add DAILY_LIMIT
vercel env add MONTHLY_LIMIT

# 4. Vercel Analytics 활성화 (선택사항)
vercel env add NEXT_PUBLIC_VERCEL_ANALYTICS_ID

# 5. 재배포
vercel --prod
```

### 2. Netlify

**장점**: 정적 사이트 특화, CDN, 무료 플랜
**단점**: 서버리스 함수 제한적

```bash
# 1. Netlify Functions 폴더 구조 생성
mkdir netlify/functions
cp api/env.js netlify/functions/

# 2. netlify.toml 생성
cat > netlify.toml << 'EOF'
[build]
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
EOF

# 3. 배포 (Git 푸시 후 Netlify에서 연결)
```

### 3. GitHub Pages (API 키 별도 관리 필요)

**장점**: 무료, GitHub 통합, 간단
**단점**: 정적 사이트만, 서버 기능 없음

```bash
# GitHub Settings > Pages > Source: GitHub Actions 활성화
```

### 4. Railway / Render

**장점**: 풀스택 지원, 데이터베이스 연결 가능
**단점**: 유료, 복잡한 설정

## 📁 파일 구조

```
code_test/
├── index.html          # 메인 HTML (통증 부위 선택 SVG 포함)
├── styles.css          # 스타일시트
├── script.js           # 메인 로직 (트리거 포인트 DB 포함)
├── config.js           # OpenAI API 설정 및 의료 프롬프트
├── env-loader.js       # 환경변수 로더
├── server.js           # Express 서버 (로컬 개발용)
├── api/
│   └── env.js          # Vercel 서버리스 함수
├── package.json        # 의존성 관리
├── package-lock.json   # 의존성 락 파일
└── README.md           # 이 파일
```

## 🔧 환경변수 설정

### .env.local (로컬 개발용)
```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=o4-mini
MAX_TOKENS=4000
TEMPERATURE=1.0
DAILY_REQUEST_LIMIT=50
MONTHLY_REQUEST_LIMIT=1000
ENABLE_AI_QA=true
ENABLE_DETAILED_ANALYSIS=true

# Vercel Analytics (선택사항)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### 플랫폼별 환경변수 설정

**Vercel**:
```bash
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL
```

**Netlify**: Site settings > Environment variables

**Railway**: Variables 탭에서 설정

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

# 2. 정적 파일 서버 실행 (개발용)
python -m http.server 8000
# 또는
npx http-server

# 3. Node.js 서버 실행 (프로덕션 테스트용)
node server.js
```

## 🧪 테스트

```bash
# 환경변수 로드 테스트
curl http://localhost:8000/api/env

# AI 분석 테스트 (브라우저 개발자 도구 콘솔)
console.log(await window.envLoader.loadEnv());
```

## ⚙️ 환경변수 설정

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `OPENAI_API_KEY` | - | OpenAI API 키 (필수) |
| `DAILY_REQUEST_LIMIT` | 50 | 일일 요청 제한 |
| `MONTHLY_REQUEST_LIMIT` | 1000 | 월간 요청 제한 |
| `OPENAI_MODEL` | o4-mini | 사용할 OpenAI 모델 |
| `MAX_TOKENS` | 4000 | 최대 토큰 수 (o4 모델용 증가) |
| `TEMPERATURE` | 1.0 | AI 창의성 수준 (o4 모델 최적화) |
| `ENABLE_AI_QA` | true | AI 질문 도우미 활성화 |
| `ENABLE_DETAILED_ANALYSIS` | true | 상세 분석 활성화 |
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
- **일일 제한**: 50회 (기본값)
- **월간 제한**: 1000회 (기본값)
- **토큰 제한**: 요청당 4000 토큰 (o4 모델 최적화)

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
- **AI**: OpenAI o4-mini API (추론 최적화 모델)
- **Analytics**: Vercel Analytics (Web Vitals, 페이지 뷰)
- **의학 이론**: 
  - 트리거 포인트 치료법 (Dr. Janet Travell)
  - 근막 경선 이론 (Thomas Myers)
- **데이터 저장**: localStorage (로컬 저장)
- **보안**: API 키 서버사이드 관리

## 🛡️ 개인정보 보호

- **로컬 처리**: 모든 데이터는 브라우저 로컬에서 처리
- **API 키 보안**: 로컬 저장소에만 저장, 외부 전송 없음
- **익명화**: 개인 식별 정보 수집하지 않음
- **Vercel Analytics**: 익명화된 페이지 뷰 및 성능 지표만 수집
- **OpenAI 정책**: OpenAI 개인정보 처리방침 준수

## 💰 비용 예상

o4-mini 기준 (2025년 기준):
- **입력**: $0.15 / 1M 토큰
- **출력**: $0.60 / 1M 토큰
- **예상 비용**: 요청당 약 $0.002-0.003 (약 3-4원)

일일 50회 사용 시 월 약 $5-8 (약 7,000-11,000원) - o4 모델 추론 비용 포함

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