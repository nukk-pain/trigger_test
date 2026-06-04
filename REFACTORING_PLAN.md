# trigger_test 리팩토링 계획

## 현재 상태
통증 가이드 도우미 - OpenRouter 기반 통증 분석 웹앱. Vanilla JS 모놀리식 구조, Express 백엔드, SVG 바디맵 60+ 영역.

## 리팩토링 목표
React + TypeScript + Vite로 전면 현대화

---

## Phase 1: 프로젝트 세팅
- Vite + React + TypeScript 프로젝트 초기화
- 의존성 설치: zustand, zod, axios, tailwindcss, vitest, playwright
- tsconfig, vite.config, ESLint/Prettier 설정
- 기존 코드를 `legacy/` 폴더로 보존 (참조용)

## Phase 2: 타입 시스템 & 데이터 레이어
- `src/types/` - BodyArea, PainData, TriggerPoint, FascialLine, AnalysisResult 등 타입 정의
- `src/data/triggerPoints.json` - 하드코딩된 의료 데이터 8개 트리거포인트 외부화
- `src/data/fascialLines.json` - 3개 근막선 데이터 외부화
- `src/data/bodyAreas.json` - 60+ 신체 부위 메타데이터
- Zod 스키마로 런타임 검증

## Phase 3: 백엔드 API & 보안
- `api/routes/chat.ts` - 서버사이드 OpenRouter 프록시 (클라이언트에 API 키 노출 제거)
- `api/middleware/validation.ts` - Zod 기반 입력 검증
- `api/services/usageTracker.ts` - 서버사이드 사용량 추적
- Rate limiting 구현

## Phase 4: React 컴포넌트 구조
```
App
├── Header (AI 상태, 사용량)
├── PainSelectionPage (Step 1)
│   ├── BodyMapViewer
│   │   ├── BodyMapSVG (60+ 클릭 가능 영역)
│   │   └── ViewToggle (앞/뒤)
│   ├── SelectedAreasPanel
│   └── PainDescriptionForm
├── ResultsPage (Step 2)
│   ├── RedFlagWarning
│   ├── AIAnalysisDisplay
│   └── RestartButton
└── Footer (의료 면책)
```

## Phase 5: 상태 관리 (Zustand)
- `stores/painStore.ts` - selectedAreas, painDescription, analysis 결과
- `stores/usageStore.ts` - 세션ID, 사용량 통계

## Phase 6: API 통합
- `api/client.ts` - Axios 클라이언트 + interceptors
- `api/services/openrouter.service.ts` - analyzePain, askQuestion
- `hooks/useAnalyzePain.ts` - React Query mutation

## Phase 7: 테스트
- Vitest 단위 테스트 (stores, hooks, utils) - 80%+ 커버리지 목표
- React Testing Library 컴포넌트 테스트
- Playwright E2E 테스트 (전체 분석 워크플로우)

## Phase 8: 접근성 & 마무리
- ARIA 라벨, 키보드 내비게이션, 스크린리더 지원
- 로딩 스켈레톤, 에러 바운더리
- 죽은 코드 제거 (basicAnalysis, analyzeTriggerPoints, analyzeFascialLines)

## Phase 9: 배포
- vercel.json 설정 업데이트
- 환경변수 마이그레이션
- 레거시 코드 제거

---

## 핵심 파일 매핑

| 레거시 | 신규 |
|--------|------|
| script.js:1-173 | stores/painStore.ts |
| script.js:174-455 | components/BodyMap/ |
| script.js:753-918 | hooks/useAnalyzePain.ts, api/services/ |
| script.js:1083-1218 | components/Results/MarkdownRenderer.tsx |
| config.js | api/routes/chat.ts, api/prompts.ts |
| env-loader.js | .env.local + api/config.ts |
| index.html SVG | components/BodyMap/BodyMapSVG.tsx |

## 검증 방법
1. `npm run build` - TypeScript 컴파일 에러 없음
2. `npm test` - 80%+ 커버리지
3. `npx playwright test` - E2E 전체 통과
4. 수동 테스트: 부위 선택 → 설명 입력 → AI 분석 → 결과 확인
