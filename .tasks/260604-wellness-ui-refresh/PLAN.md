---
name: wellness-ui-refresh
worktree: false
created: 2026-06-04
owner: frontend
---

# PLAN: 웰니스(Headspace/Calm) 스타일 UI/UX 리프레시

## 요구사항 재진술

### 핵심 요구사항
1. 통증 셀프마사지 가이드 앱 프론트엔드를 **따뜻한 웰니스 톤**으로 리프레시 (레퍼런스 후보2: Headspace/Calm).
2. 첫 화면에서 **서비스 정체성이 즉시 이해**되도록 헤더 가치제안 1줄 추가.
3. **CSS custom property 토큰**으로 색·간격·타이포·radius 통일 (보라 그라데이션·녹색·파랑 3계열 → 따뜻한 파스텔 단일 액센트 + 의료 신뢰 보조색).
4. SVG 인체지도의 **항상 보이는 빨간 격자 제거** + **모바일 탭 타깃 ≥44px** + **키보드/스크린리더 접근성**.
5. 자유서술 textarea에 **빠른 입력 보조 칩** 추가.
6. 결과 화면 + 안전 고지문 **웰니스 톤 + 의료 신뢰 균형**.

### 범위 (Scope)
**포함**:
- `index.html` (헤더 카피, SVG inline 속성, 칩 마크업)
- `styles/*.css` 전체 + 신규 `styles/tokens.css`
- `src/browser/selection-events.js` (키보드 핸들러), `ai-question.js` (칩 이벤트)
- 신규 `DESIGN.md` (design.md spec 준수 산출물)
- 신규 순수 함수 모듈 1개 (칩 → textarea 삽입 로직, 테스트 대상)

**제외 (명시적)**:
- 프레임워크/빌드툴 도입 — **금지**. Vanilla JS + 순수 CSS 유지.
- 서버 프록시(`/api/chat`, `/api/env`), API 키 서버사이드 보안 — **불변**.
- 분석 로직(`lib/analysis.js`), 프롬프트, 데이터(trigger-points/red-flags) — **불변**.
- 2스텝 동선 구조(step1→step2) — **불변**.
- DOM `id` 계약 및 테스트가 의존하는 클래스/id(`.selected`, `.clickable-area`, `#live-selection-text`, `#quick-clear`, `#mvp-area-notice`, `#selected-list`, `#selection-count`) — **유지**.

### 가정사항
- 모든 시각 변경은 토큰 치환/클래스 추가 위주의 surgical 변경으로 가능하다 (DOM 구조 대수술 불필요).
- `styles.css`의 `@import` 체인은 유지하되, 신규 `tokens.css`는 `<head>` 최상단에 직접 링크해 모든 CSS보다 먼저 로드한다(캐스케이드 우선).
- 칩은 textarea를 대체하지 않고 **보조**한다 (자유서술 입력 가능성 유지 → 기존 validate/collect 동선 불변).

---

## 위험 분석

| 위험 | 영향도 | 발생 가능성 | 대응 방안 |
|------|--------|-------------|----------|
| SVG inline `fill` 제거 시 선택/hover 시각 상태 깨짐 | 높음 | 중간 | CSS class 상태(`.clickable-area`, `:hover`, `.selected`)를 먼저 정의·검증 후 inline 제거 |
| 색 토큰 치환 중 기존 vitest/playwright 깨짐 | 높음 | 낮음 | 각 Phase 후 `npm test` 실행; DOM id/클래스 계약 미변경 |
| 키보드 핸들러 추가가 기존 click 동선/테스트와 충돌 | 중간 | 낮음 | click 핸들러 유지하고 keydown은 **추가**만; 공통 토글 함수로 분기 |
| 작은 SVG 영역(r=10) 탭 타깃 확대 시 영역 겹침(오선택) | 중간 | 중간 | 시각 크기는 유지, `pointer-events`용 투명 hit-area 또는 `stroke-width`/패딩으로 hit 확대; 겹침은 수동 QA |
| 웰니스 톤이 의료 안전 고지의 경고성을 약화 | 중간 | 중간 | 안전 고지/레드플래그는 **경고 토큰(warm red)** 별도 유지, 톤만 정리 |
| `tokens.css` 로드 순서 문제로 변수 미적용 | 낮음 | 낮음 | `<head>` 최상단 링크 + `:root` 정의; DevTools로 computed 확인 |

> **위험 패턴 자동 감지**: [DOUBT]/ADR/deprecate 게이트 평가 결과 — 매칭 0건.
> (CSS/UI 변경으로 branching 1건(키보드 핸들러)만 도입, 모듈 경계 횡단·비가역 blast radius·thread-safety 주장 없음 → 5조건 中 1개로 DOUBT 미부여. 라이브러리/프레임워크/DB 선택 없음 → ADR 미부여. system-level deprecation 아님 → deprecate 미부여.)

---

## 의존성 분석

### 내부 의존성
| 모듈 | 의존성 | 변경 필요 |
|------|--------|----------|
| `index.html` | styles/*.css, src/browser/*.js | 예 (헤더 카피, SVG 속성, 칩 마크업, tokens.css 링크) |
| `styles/*.css` | 없음 (순수 CSS) | 예 (토큰 치환) |
| `selection-events.js` | selection-state, selection-renderer, mvp-area-support | 예 (keydown 추가) |
| `ai-question.js` | utils, app-state, notifications | 예 (칩 이벤트 배선) |
| 신규 `lib/chip-insert.js` | 없음 (순수 함수) | 신규 |

### 외부 의존성
| 패키지 | 버전 | 용도 | 새로 추가 |
|--------|------|------|----------|
| (없음) | - | 빌드툴/프레임워크 도입 금지 | 아니오 |

### 영향 범위
- **직접 영향**: `index.html`, `styles/tokens.css`(신규), `styles/base.css`, `layout.css`, `body-map.css`, `selection.css`, `analysis.css`, `status.css`, `controls.css`, `guides.css`, `questionnaire.css`, `responsive.css`, `src/browser/selection-events.js`, `src/browser/ai-question.js`, `lib/chip-insert.js`(신규), `DESIGN.md`(신규)
- **간접 영향**: `tests/selection-ui.test.js`(계약 유지 확인), playwright e2e(동선 확인)

---

## 에이전트 구성
- orchestrator만 사용 (단일 작업 흐름, 파일 간 캐스케이드 의존으로 순차 진행 안전). Agent Team 불필요.

---

## 구현 계획

### Phase 0: 디자인 토큰 정의 (예상: S)
> 목표: design.md spec을 따르는 토큰 SSOT 확정. 이후 모든 Phase가 이 토큰을 참조.

#### Task 0.1: DESIGN.md 작성 `[Manual]`
- impl: `DESIGN.md` (repo 루트)
- **작업 내용**:
  - [x] `~/.claude/design.md` spec의 frontmatter(YAML tokens) + 마크다운 본문 구조 그대로 따름
  - [x] colors: `bg`(warm cream), `surface`, `primary`(warm coral 액센트), `primary-strong`(hover/대비), `secondary`(calm sage — 의료 신뢰), `text`, `muted`, `alert`(warm red — 안전고지 전용), `selected`(primary tint)
  - [x] typography: h1/h2/h3/body/label/caption (Pretendard/Malgun Gothic 한글 우선 스택)
  - [x] spacing: xs/sm/md/lg/xl (8pt 그리드), rounded: sm/md/lg/full
  - [x] 본문 섹션 순서: Overview → Colors → Typography → Layout → Elevation → Shapes → Components
  - [x] 한국어 카피 톤 가이드 1줄 명시 (글로벌 규칙 #15 — AI 냄새 금지)
- **검증 방법**: 프론트매터 YAML 파싱 유효 + 섹션 순서 spec 일치 (수동 점검)

#### Task 0.2: tokens.css 생성 + head 링크 `[Manual]`
- impl: `styles/tokens.css`, `index.html`(head)
- **작업 내용**:
  - [x] DESIGN.md 토큰을 `:root { --color-*, --space-*, --radius-*, --font-* }` CSS 변수로 1:1 옮김
  - [x] `index.html` `<head>` 최상단(다른 모든 CSS 링크보다 먼저)에 `<link rel="stylesheet" href="styles/tokens.css">` 추가
- **검증 방법**: 브라우저 DevTools에서 `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')` 값 반환 확인

---

### Phase 1: 토큰 적용 + 색 통일 (예상: M)
> 목표: 하드코딩된 색을 토큰 변수로 치환. 시각 톤 = 웰니스.
> 검증된 색 분포(총 57건): `#4CAF50` 32건(압도적), `#2196F3` 12건, `#667eea` 9건, `#764ba2` 4건.
> ⚠️ [우선순위] **visible-first**: `questionnaire.css`(#4CAF50 10건 등)는 현재 화면에 렌더되는 요소가 거의 없음(문진폼 제거됨). **지금 보이는 화면(base/layout/body-map/selection/analysis) 먼저** 토큰화하고, questionnaire/guides는 그 다음. 단 AC-7(잔여 grep 0) 충족 위해 최종적으로 전부 치환.

#### Task 1.1: base.css 배경/타이포 토큰화 `[Manual]`
- impl: `styles/base.css`
- **작업 내용**:
  - [x] 보라 그라데이션 → `--color-bg`(warm cream) 단색 또는 아주 옅은 톤
  - [x] font-family/line-height/color를 토큰 참조로
- **검증 방법**: 배경이 따뜻한 크림톤으로 렌더, 텍스트 대비 WCAG AA(≥4.5:1)

#### Task 1.2: layout.css / controls.css 버튼·카드·헤더 토큰화 `[Manual]`
- impl: `styles/layout.css`, `styles/controls.css`
- **작업 내용**:
  - [x] 카드(`.step-section`, `header`) radius/shadow를 `--radius-*`, elevation 토큰으로
  - [x] 주 버튼(`.next-btn`) 녹색 → `--color-primary`, hover `--color-primary-strong`
  - [x] `header h1/p` 타이포 토큰화
- **검증 방법**: 버튼/카드 색이 단일 액센트 계열로 통일됨 (시각 점검)

#### Task 1.3: body-map.css / selection.css 탭·패널 색 통일 `[Manual]`
- impl: `styles/body-map.css`, `styles/selection.css`
- **작업 내용**:
  - [x] `.view-tab.active`/hover 녹색·파랑 → primary/secondary 토큰
  - [x] 선택 부위 칩/패널 색 토큰화 (selected = `--color-selected`)
- **검증 방법**: 한 화면에 3계열 액센트가 사라지고 1액센트+1보조로 정리 (시각 점검)

#### Task 1.4: analysis/status/guides/questionnaire.css 잔여 색 토큰화 `[Manual]`
- impl: `styles/analysis.css`, `styles/status.css`, `styles/guides.css`, `styles/questionnaire.css`
- **작업 내용**:
  - [x] 결과/상태/가이드/문진 영역 하드코딩 색 → 토큰
  - [x] 잔여 #667eea/#764ba2/#4CAF50/#2196F3 grep 0건까지
- **검증 방법**: `grep -rn "#667eea\|#764ba2\|#4CAF50\|#2196F3" styles/` → 0건 (단 tokens.css 정의부 제외)

---

### Phase 2: 헤더 가치제안 + 톤 카피 (예상: S)
> 목표: 서비스 정체성 즉시 이해 + 웰니스/의료 균형 카피.

#### Task 2.1: 헤더 가치제안 1줄 추가 `[Manual]`
- impl: `index.html` (header, 18-24행)
- **작업 내용**:
  - [x] `h1` 아래 `<p>` 추가 (layout.css `header p` 스타일 이미 존재)
  - [x] 카피: 아픈 곳 선택 → 셀프 마사지 안내를 한 문장으로. 글로벌 규칙 #15(AI 냄새 금지) 준수 — 가운뎃점 나열·번역투·헤지 금지
- **검증 방법**: 첫 화면 스크롤 없이 "무엇을 하는 서비스"가 읽힘 (수동 점검)

#### Task 2.2: 안전 고지/결과 톤 균형 `[Manual]`
- impl: `index.html`(initial-safety-notice, step2), 관련 css
- **작업 내용**:
  - [x] 안전 고지문은 `--color-alert` 유지(경고성 보존), 박스 톤만 정리
  - [x] 결과 헤더(`마사지 가이드`) 웰니스 톤 정리
- **검증 방법**: 응급/중단/진료 기준 문구가 여전히 시각적으로 두드러짐 (수동 점검)

---

### Phase 3: SVG 격자 제거 + 접근성 + 탭 타깃 (예상: M) — 가장 핵심
> 목표: 항상 보이던 빨간 박스 제거, 키보드/스크린리더 선택 가능, 모바일 탭 타깃 확보.

#### Task 3.1: SVG inline fill 제거 → CSS class 상태화 `[Manual]`
- impl: `index.html`(clickable-area **96개**), `styles/body-map.css`
- **작업 내용**:
  - [x] 모든 `clickable-area`의 inline `fill="rgba(255,0,0,0.1)"`, `stroke="#666"` 제거 (검증으로 96개 확인)
  - [x] ⚠️ [회귀-치명] SVG에서 `fill:none`이면 내부 클릭이 hit-test 안 됨 → `.clickable-area { fill: transparent; pointer-events: all; }` **반드시** 명시. 제거 후 클릭/탭이 여전히 동작하는지 Task 3.2 테스트로 확인.
  - [x] `.clickable-area` 기본=투명/차분, `:hover`/`:focus-visible`=primary 옅은 톤, `.selected`=`--color-selected` 채움 + 또렷한 외곽선 (CSS로)
  - [x] 인체 outline(비클릭 ellipse)은 차분한 stroke 토큰으로
- **검증 방법**: 초기 로드 시 빨간 격자 없음(`grep -c 'rgba(255,0,0' index.html` = 0); hover/선택 시만 색 표시; **inline fill 제거 후에도 click/keydown 선택 정상 동작**(시각 + Task 3.2 테스트)

#### Task 3.2: SVG 영역 키보드/ARIA 접근성 `[DOUBT 미해당][TDD]`
- test: `tests/selection-events.test.js` (신규)
- impl: `src/browser/selection-events.js`
- **작업 내용**:
  - [x] 각 `clickable-area`에 `role="button"`, `aria-label`(title값), `aria-pressed="false"` 부여 (JS setup 시 일괄 부여 → index.html 96곳 수기수정 회피)
  - [x] ⚠️ [접근성] **탭 순서 폭주 방지**: 96개 전부 `tabindex=0`이면 키보드 탭이 96스텝. 현재 active 뷰(front/back)의 영역만 `tabindex=0`, 숨은 뷰는 `tabindex=-1`. `switchBodyView` 시 갱신. MVP 미지원 영역도 포커스 가능하되 Enter 시 mvp-area-notice 노출(기존 click과 동일).
  - [x] ⚠️ [접근성] SVG 요소는 기본 `:focus-visible` 링이 브라우저별로 안 보임 → `.clickable-area:focus-visible { outline: ...; stroke: var(--color-primary-strong); }` 명시적 포커스 스타일 추가.
  - [x] `keydown` Enter/Space → 기존 click 토글과 **동일 경로** 호출 (공통 함수 추출). Space 기본 스크롤 `preventDefault`.
  - [x] 토글 시 `aria-pressed` 동기화
  - [x] 기존 `click` 동작·MVP 필터·`.selected`·`mvp-area-notice` 계약 유지
- **검증 방법**: vitest — keydown(Enter) dispatch 시 `selectedAreas`에 반영 + `aria-pressed="true"`; 숨은 뷰 영역 `tabindex=-1` 확인; 기존 `selection-ui.test.js` green 유지

#### Task 3.3: 모바일 탭 타깃 ≥44px 확보 `[Manual]`
- impl: `styles/body-map.css`, `styles/responsive.css`, (필요 시 index.html 작은 영역 hit-area)
- **작업 내용**:
  - [x] 작은 영역(`r=10`, `width=10`)의 실제 탭 영역 확대: `stroke-width` 투명 확대 또는 `pointer-events` hit 패딩
  - [x] 모바일 breakpoint에서 `#body-svg` 최소 폭 재검토(현 300px) — 영역이 44px 충족하도록
  - [x] 영역 겹침으로 인한 오선택 없는지 확인
- **검증 방법**: 모바일 뷰포트(375px)에서 최소 영역 탭 가능 + 인접 오선택 없음 (수동 QA, 측정값 기록)

---

### Phase 4: 입력 보조 칩 (예상: S)
> 목표: 빈 textarea 부담 완화. 칩 = 자유서술 보조(대체 아님).

#### Task 4.1: 칩 삽입 순수 함수 `[TDD]`
- test: `tests/chip-insert.test.js` (신규)
- impl: `lib/chip-insert.js` (신규)
- **작업 내용**:
  - [x] `appendChipText(current, chipText)` → 중복 방지 + **자연스러운 연결**(빈 값이면 그대로, 기존 값 있으면 `, ` 또는 줄바꿈으로 연결해 사람이 쓴 문장과 어색하지 않게 — 글로벌 #15 톤) + maxlength(500) 초과 시 미삽입(원본 반환)
  - [x] 순수 함수 (DOM 무관), ESM `export function`
- **검증 방법**: vitest — 빈 값/기존 값/중복/길이초과 4 케이스

#### Task 4.2: 칩 마크업 + 이벤트 배선 `[Manual]`
- impl: `index.html`(pain-description-input 영역), `src/browser/ai-question.js`(setupDynamicFormEvents), `styles/selection.css` 또는 `questionnaire.css`
- **작업 내용**:
  - [x] textarea 위에 칩 그룹 추가 (예: "앉아 있을 때", "자고 일어나면", "무거운 걸 들면", "오래 걸으면", "고개 숙일 때") — 글로벌 규칙 #15 톤
  - [x] 칩 클릭 → `appendChipText`로 textarea 갱신 + `input` 이벤트 트리거(char-counter 동기화)
  - [x] 칩에 `type="button"`, `aria-pressed`, 키보드 포커스
  - [x] 기존 칩 시각 언어(selection.css) 재사용
- **검증 방법**: 칩 클릭 시 textarea에 문구 추가 + 글자수 카운터 갱신; 분석 동선 정상 (수동 + e2e)

---

### Phase 5: 반응형 + 통합 검증 (예상: S)
> 목표: 모바일/데스크톱 정합 + 회귀 없음.

#### Task 5.1: responsive.css 토큰 정합 + breakpoint 점검 `[Manual]`
- impl: `styles/responsive.css`
- **작업 내용**:
  - [x] 간격/폰트 토큰 사용으로 모바일 일관성
  - [x] 긴 세로 스크롤 완화(선택패널/고지문 간격 토큰화)
- **검증 방법**: 375 / 768 / 1200px 뷰포트 깨짐 없음 (수동)

#### Task 5.2: 전체 회귀 + E2E `[E2E]`
- test: 기존 `tests/*.test.js` + playwright
- **작업 내용**:
  - [x] `npm test` 전부 green
  - [x] `npm run test:e2e` 분석 동선 green
- **검증 방법**: 테스트 통과 로그

---

## 노력도 추정

| Phase | 규모 | 태스크 수 |
|-------|------|----------|
| Phase 0 | S | 2 |
| Phase 1 | M | 4 |
| Phase 2 | S | 2 |
| Phase 3 | M | 3 |
| Phase 4 | S | 2 |
| Phase 5 | S | 2 |
| **합계** | **M** | **15** |

> 전체 약 1~1.5일.

---

## 테스트 전략

### 단위 테스트 (vitest)
- [x] `chip-insert.test.js`: 빈/기존/중복/길이초과 텍스트 삽입
- [x] `selection-events.test.js`: keydown(Enter/Space) → 선택 토글 + aria-pressed 동기화

### 통합/계약 테스트
- [x] `selection-ui.test.js`(기존): click·.selected·live-selection-text·quick-clear·MVP·mvp-area-notice 계약 유지 확인

### E2E (playwright)
- [x] 부위선택 → 입력(칩 포함) → 분석하기 → 결과 표시 동선
- [x] 다시 하기(start-over) 리셋

### 수동 테스트
- [x] 빨간 격자 제거 시각 확인
- [x] 모바일 375px 탭 타깃/오선택
- [x] 색 토큰 통일(잔여 하드코딩 grep 0)
- [x] 키보드 only로 부위 선택 + 포커스 링 가시성
- [x] 안전 고지 경고성 보존

---

## Acceptance Criteria (인수 기준)

- [x] AC-1: Given 첫 진입, When step1 로드, Then 헤더에 서비스 설명 `<p>`가 보이고 SVG에 빨간 격자(rgba(255,0,0,*)) inline fill이 0개다.
- [x] AC-2: Given step1, When 키보드 Tab으로 SVG 영역에 포커스 후 Enter, Then 해당 부위가 선택되고 `aria-pressed="true"`로 바뀐다.
- [~] AC-3 (부분): Given 375px 모바일 뷰포트, When 가장 작은 클릭 영역을 탭, Then 그 영역의 탭 타깃 실측이 ≥44px이고 인접 영역 오선택이 없다. → **부분 달성**. 모바일 풀폭 + 투명 stroke hit 패딩(10u)으로 개선했으나, 이 실루엣 밀도(96영역)에서 모든 영역의 엄격한 44px CSS는 기하학적으로 불가(겹침). 단 작은 영역(wrist/ankle/achilles r≈10)은 전부 MVP 미지원이라 실사용 영향 제한적. MVP 지원 영역(neck 등 최소 25u)은 ~31px. 후속안: 줌 인터랙션 또는 미세영역 병합.
- [x] AC-4: Given 빈 textarea, When 입력 보조 칩 1개 클릭, Then textarea 값에 칩 문구가 추가되고 글자수 카운터가 증가한다.
- [x] AC-5: Given 동일 칩 재클릭 또는 500자 초과, When 클릭, Then 중복 문구 미삽입·길이초과 미삽입.
- [x] AC-6: Given 전체 변경 적용, When `npm test` 및 `npm run test:e2e` 실행, Then 기존 테스트 전부 green이고 분석 동선이 동작한다.
- [x] AC-7: Given 모든 CSS, When `grep -rn "#667eea\|#764ba2\|#4CAF50\|#2196F3" styles/` (tokens.css 정의부 제외), Then 0건이다.
- [x] AC-8: Given 안전 고지/레드플래그 영역, When 톤 리프레시 후, Then 경고 색(`--color-alert`)으로 시각적으로 두드러진다.

---

## Verification Strategy (검증 전략)

| AC | 검증 방법 | 측정 기준 |
|----|-----------|-----------|
| AC-1 | 수동 + grep | header `<p>` 존재 && `grep -c 'rgba(255,0,0' index.html` = 0 |
| AC-2 | 단위(vitest) | keydown Enter dispatch 후 selectedAreas 포함 && aria-pressed="true" |
| AC-3 | 수동 QA(측정) | DevTools로 최소 영역 bounding box ≥44×44px, 오선택 0 |
| AC-4 | 단위 + 수동 | appendChipText 반환값 검증 + 실제 textarea 반영 |
| AC-5 | 단위(vitest) | 중복 입력 시 길이 불변, 500자 초과 시 미변경 |
| AC-6 | CI/로컬 | vitest exit 0 && playwright exit 0 |
| AC-7 | grep | 매칭 0건 (tokens.css 제외) |
| AC-8 | 수동 | 안전 고지 배경/테두리가 alert 토큰, 대비 충분 |

---

## 병렬 실행 그룹
- 그룹 A (Phase 0, 순차): Task 0.1 → 0.2  (토큰이 모든 것의 선행 의존)
- 그룹 B (0 완료 후, 부분 병렬 가능): Task 1.1 / 1.2 / 1.3 / 1.4 (파일별 독립, 단 같은 토큰 참조)
- 그룹 C (0 완료 후, B와 병렬 가능): Task 2.1 / 2.2
- 그룹 D (1·3.1 완료 후): Task 3.2 → 3.3 (3.1 시각 상태 정의 후 접근성/탭타깃)
- 그룹 E (독립, 언제든): Task 4.1 → 4.2
- 그룹 F (전부 완료 후): Task 5.1 → 5.2

> 실제 실행은 캐스케이드 안전을 위해 Phase 순차 진행 권장.

---

## 리뷰 로그

> 리뷰 일시: 2026-06-04

### 총평
저위험 UI/CSS 리프레시. 구조 견고하고 계약 보존 설계가 명확함. 단 하나의 치명 함정(SVG inline fill 제거 시 pointer-events 누락 → 클릭 불능)을 사전 차단하면 안전하게 진행 가능.

### 반영 완료
- [x] [높음][회귀] SVG `fill:none` 시 hit-test 불능 → Task 3.1에 `fill:transparent; pointer-events:all` 필수 명시 + 제거 후 클릭 동작 검증 추가
- [x] [높음][접근성] 96개 전부 `tabindex=0` 시 키보드 탭 폭주 → Task 3.2에 active 뷰만 포커서블(숨은 뷰 `tabindex=-1`) + 명시적 `:focus-visible` 스타일 추가
- [x] [중간][계약] 테스트가 `#selected-list`/`#selection-count`도 assert → Scope 계약 목록에 추가
- [x] [중간][우선순위] `#4CAF50` 32건 압도 + questionnaire.css는 현재 비가시 → Phase 1에 visible-first 원칙 명시
- [x] [중간][UX] 칩 평문 append 어색함 → Task 4.1에 자연스러운 연결자 처리 명시
- [x] [정정] 빨간 격자 영역 수 60+ → 실측 96개로 정정 (Task 3.1)

### 미반영 (참고용)
- [낮음][톤] 이모지 과다(🤖🎯🗑️⚠️) — 웰니스 톤에서 절제 권장. 실행 중 재량 정리.
- [낮음][성능] 한글 웹폰트(Pretendard 등) 추가 시 로드 비용 — 시스템 폰트(Malgun Gothic/Apple) 우선, 웹폰트는 보류.
