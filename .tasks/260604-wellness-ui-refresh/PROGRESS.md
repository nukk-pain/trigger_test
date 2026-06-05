# PROGRESS: 웰니스 UI/UX 리프레시

## 상태: 완료 ✅ (AC 7.5/8 — AC-3 부분)

## 베이스라인
- 변경 전 `npm test`: 21 파일 / 223 테스트 green
- 액센트 팔레트: warm coral(primary) + calm sage(secondary), warm cream bg, warm red alert

## 완료
- [x] Phase 0: DESIGN.md(design.md spec 준수) + styles/tokens.css + head 최상단 링크
- [x] Phase 1: 하드코딩 색 3계열(57 hex + 23 rgba + 동반색) → 토큰. AC-7 grep 0 달성
- [x] Phase 2: 헤더 가치제안 1줄 + 안전고지/결과 alert 톤 균형
- [x] Phase 3: SVG 빨간격자 96개 제거 + 키보드/ARIA(role/tabindex/aria-pressed/keydown) + pointer-events 함정 회피 + 모바일 hit 패딩
- [x] Phase 4: 입력 보조 칩(순수함수 lib/chip-insert.js + 마크업 + 배선)
- [x] Phase 5: 반응형 풀폭 SVG + 전체 회귀/E2E

## 검증 결과 (Iron Law — 실제 실행)
- `npm test`: **23 파일 / 232 테스트 green** (223 베이스 + selection-events 4 + chip-insert 5)
- `npm run test:e2e`: **6/6 green** (실제 Chromium — 클릭 동선·레드플래그·MVP·XSS fallback)
- 시각 검증 스크린샷(데스크톱/선택/모바일): 빨간격자 제거·coral 액센트·칩·헤더 카피·안전고지 톤 확인

## AC 달성률
| AC | 결과 | 근거 |
|----|------|------|
| AC-1 헤더 p + 빨간격자 0 | ✅ | grep `rgba(255,0,0` index.html = 0 + 스크린샷 |
| AC-2 키보드 Enter + aria-pressed | ✅ | vitest selection-events |
| AC-3 탭타깃 ≥44px | ~ 부분 | 기하학적 한계. 풀폭+hit패딩으로 ~31px(MVP영역), 작은영역은 미지원. 후속: 줌 |
| AC-4 칩 → textarea + 카운터 | ✅ | vitest + 스크린샷(7/500자) |
| AC-5 칩 dedup/길이초과 | ✅ | vitest chip-insert |
| AC-6 npm test + e2e green | ✅ | 232 + 6 통과 |
| AC-7 브랜드색 grep 0 | ✅ | 0건 |
| AC-8 안전고지 alert 톤 | ✅ | 스크린샷 |

## 알려진 한계 / 후속 권장 (정직 기록)
- AC-3: 96개 밀집 영역에서 전 영역 44px는 불가. 줌/핀치 인터랙션 또는 미세영역 병합이 정공법.
- 선택 상태바(`.selection-status-bar`)가 솔리드 coral로 다소 강함 — 선택 시 옅은 톤으로 완화 가능(선택적 폴리시).
- 잔여 heavy shadow 1건(status.css 모달 overlay), 시맨틱 토스트 상태색(success/warning/info)은 의도적으로 유지.

## 후속 조정 (사용자 피드백 반영)
- SVG가 "사람 같지 않다" → 흩어진 사각형/원 대신 **사람 형태 실루엣**(머리·목·어깨·몸통·팔·손·다리·발)을 `g.body-silhouette`로 새로 깔음. 기존 96개 클릭영역(data-area 계약)은 보존하고 그 위 투명 핫스팟으로 전환(평상시 투명, hover/포커스/선택 시 coral 강조).
- selection.css에 남아 있던 중복 `.clickable-area` 상태 규칙(sage hover + 하드코딩 주황 selected `!important`)이 body-map.css를 덮어써 hover가 청록으로 나오던 충돌 제거 → body-map.css를 SSOT로, selection.css는 펄스 애니메이션만 유지.
- 마우스 클릭 후 파란 기본 포커스 링 노출 → `.clickable-area { outline: none }` + 키보드는 `:focus-visible` coral로 표시.
- 재검증: vitest 232 green, e2e 6/6 green (실루엣 `pointer-events:none`으로 클릭 통과 확인).

## 산출물
- 신규: DESIGN.md, styles/tokens.css, lib/chip-insert.js, tests/selection-events.test.js, tests/chip-insert.test.js
- 수정: index.html, styles/{base,layout,body-map,selection,analysis,controls,status,guides,questionnaire,responsive}.css, src/browser/{selection-events,selection-renderer,selection-ui,ai-question}.js
