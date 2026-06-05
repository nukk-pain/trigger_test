# PREFLIGHT: 웰니스 UI/UX 리프레시

> 조사 일시: 2026-06-04 · 대상: PLAN.md (.tasks/260604-wellness-ui-refresh/)

## AC 검증
| AC | 상태 | 비고 |
|----|------|------|
| AC-1 | ✅ 측정가능 | header `<p>` 존재 확인용 `header p` 스타일 실재(layout.css:159); `grep -c 'rgba(255,0,0' index.html` 기준 명확 |
| AC-2 | ✅ 테스트가능 | keydown dispatch + aria-pressed — vitest로 검증 가능(기존 selection-ui.test.js와 동일 패턴) |
| AC-3 | ⚠️ 수동/측정 | "≥44px" 측정 기준은 명확하나 자동화 불가 → 수동 QA로 측정값 기록 필요 |
| AC-4 | ✅ | 칩 → textarea + 카운터, input 이벤트 dispatch 경로 확인(ai-question.js:51) |
| AC-5 | ✅ | 순수함수 단위테스트로 명확 |
| AC-6 | ✅ | `vitest run` / `playwright` 스크립트 실재(package.json:10,13) |
| AC-7 | ✅ | grep 기준 명확. tokens.css 정의부 제외 단서 포함 |
| AC-8 | ⚠️ 수동 | 색 대비는 수동, 측정 권장(대비비 ≥3:1 UI/≥4.5:1 텍스트) |

> AC 품질 양호. AC-3/AC-8만 수동 측정 — 블로킹 아님.

## 영향 범위
- **직접 (17)**: index.html, styles/tokens.css(신규), base/layout/body-map/selection/analysis/status/controls/guides/questionnaire/responsive.css, src/browser/selection-events.js, src/browser/ai-question.js, lib/chip-insert.js(신규), DESIGN.md(신규)
- **간접 (2)**: tests/selection-ui.test.js(계약 확인), playwright e2e(동선)
- **cross-service**: 없음 (프론트 단독, 서버 프록시 API 불변)

## 데이터/계약 감사
- **DOM 계약 (테스트 의존)**: `.selected`, `.clickable-area`, `#live-selection-text`, `#quick-clear`, `#mvp-area-notice`, `#selected-list`, `#selection-count` — 전부 유지 대상. PLAN Scope 반영 완료.
- **색 분포 (총 57건)**: `#4CAF50` 32 · `#2196F3` 12 · `#667eea` 9 · `#764ba2` 4. questionnaire.css(17건)는 현재 비가시 → visible-first 반영 완료.
- **SVG**: clickable-area 96개(실측), 접근성 속성 0개(신규 작업 확정). 최소 영역 예: wrist-left(r=10), ankle-left(r=10), achilles-left(10×15).
- **이상 탐지**: 데이터 이상 0건. 스키마/마이그레이션 없음.

## 비즈니스/도메인 규칙
- 의료 안전: 안전 고지·레드플래그는 톤 변경하되 경고성(alert 토큰) 보존 — AC-8로 강제.
- 보안: API 키 서버사이드 불변, 프론트 변경은 키 노출 경로와 무관.
- 글로벌 규칙 #12(design.md spec) / #15(한국어 카피 AI 냄새 금지) 준수 명시.

## 추가 Task (preflight 발견 → PLAN 반영 완료)
- Task 3.1: `pointer-events:all` 필수 (클릭 불능 회귀 차단)
- Task 3.2: 숨은 뷰 `tabindex=-1` + `:focus-visible` 스타일
- Scope: `#selected-list`/`#selection-count` 계약 추가
- Phase 1: visible-first 우선순위
- Task 4.1: 자연스러운 연결자

## 구현 준비 상태
✅ 준비 완료 — 차단 이슈 없음. 수동 측정 항목(AC-3 탭타깃, AC-8 대비)만 실행 중 기록 필요.
