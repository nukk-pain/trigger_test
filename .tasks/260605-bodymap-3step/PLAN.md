---
name: bodymap-3step
worktree: false
created: 2026-06-05
owner: frontend
references: Oracle gpt-5.5-pro panel (/tmp/oracle-bodymap.md), 17 sources incl. WebMD/Mayo/NN-g/Stanford-CHOIR/WCAG2.2
---

# PLAN: 인체 부위 선택 3단계 줌인 UI 전면 개편

## 요구사항 재진술

### 핵심 요구사항
1. **false affordance 제거**: 전신 96개 클릭맵을 버리고, MVP가 실제 지원하는 **9개 세부 부위(3개 그룹)만** 선택 가능하게 노출.
2. **3단계 progressive disclosure**: ①그룹 3개 → ②그룹 내 세부 부위 → ③좌/우/양쪽/가운데. 각 단계 리스트(primary) + 그림(shortcut) 병행.
3. **사람다운 단일 path 실루엣**: 도형 조합 폐기, 베지어 연속 contour path 1개(coral 톤). 후면 척추선/견갑골선 옅은 보조선.
4. **모바일 탭타깃 ≥44px**: 리스트 버튼 48px, 그림 핫스팟은 그룹 단위(큼).
5. **분석 동선/계약 보존**: 최종 선택은 기존과 동일한 세부 `data-area` 문자열을 `selectedAreas`에 push → `analyzeTriggerPoints` 불변.

### 범위 (Scope)
**포함**:
- 신규 `lib/area-groups.js` — 그룹 정의 + (그룹, 세부, side) → data-area[] 변환 (순수 함수, 테스트 대상)
- 신규 `src/browser/region-select.js` — 3단계 상태머신 + 렌더 (기존 selection-events/ui/renderer 대체)
- `index.html` — step1 내부를 3단계 컨테이너 + 단일 path 실루엣 SVG로 교체
- `styles/body-map.css`, `styles/selection.css` — 3단계 UI 스타일(토큰 재사용)
- `tests/` — 신규 단위 테스트 + 기존 selection 테스트 갱신
- `tests/e2e/mvp-workflows.spec.js` — 새 동선에 맞춰 셀렉터 갱신
- `DESIGN.md` — 컴포넌트 섹션에 3단계 선택 패턴 추가
- ADR 1건 — 선택 UX 전환 결정 기록

**제외 (명시적)**:
- `lib/analysis.js`, 프롬프트, trigger-points/red-flags 데이터 — **불변**.
- 서버 프록시(`/api/chat`,`/api/env`), 보안 — **불변**.
- step2(결과 화면) 구조 — **불변** (단계 진입 트리거 `#analyze-pain`만 유지).
- `appState.painData.selectedAreas` 의미(세부 data-area 문자열 배열) — **불변**.
- `getAreaDisplayName`(lib/area-display.js) — **재사용**(수정 안 함).

### 가정사항 (검증 완료)
- 지원 9개 세부 부위는 좌/우/중앙 변형 data-area가 실제로 존재한다 → 3단계에서 정확한 data-area로 환원 가능. (area-display.js에서 확인: neck-left/right/front, shoulder-blade-left/right, upper-back-left/right/center, lower-back-left/right/center, pelvis-left/right, buttock-left-upper/right-upper 등)
- 분석은 selectedAreas 배열만 보므로 UI 단계 수와 무관하게 동작한다. (selection-state.js, analysis.js 확인)
- 단일 path 실루엣은 도형 조합보다 사람답게 보인다 (Oracle 권고). 단 손으로 그린 path 품질은 [PoC]로 먼저 검증.

---

## 위험 분석

| 위험 | 영향도 | 발생 가능성 | 대응 |
|------|--------|-------------|------|
| 그룹/세부/side → data-area 매핑 오류로 잘못된 부위 분석 | 높음 | 중간 | 매핑을 순수함수+[TDD]로 고정, 모든 지원 data-area를 역매핑 커버리지 테스트 |
| 직접 그린 단일 path가 여전히 어색/마네킹 | 중간 | 중간 | [PoC]로 path 먼저 렌더·스크린샷 검증 후 진행. 실패 시 퍼블릭도메인 SVG 폴백(2안) |
| selection-events/ui 대체 시 기존 테스트 대량 깨짐 | 높음 | 높음 | 기존 테스트는 의도적으로 새 계약에 맞춰 갱신(삭제 아닌 재작성). e2e 셀렉터 동반 수정 |
| e2e가 [data-area="neck-front"] 직접 click에 의존 → 새 UI에서 깨짐 | 높음 | 높음 | e2e를 새 3단계 동선(그룹→세부→side→분석)으로 재작성. 최종 selectedAreas 동일 보장 |
| 단계 상태머신 뒤로가기/리셋 버그 | 중간 | 중간 | 상태 전이 [TDD]. start-over/뒤로가기 각각 테스트 |
| 모바일에서 확대 화면 전환이 어지러움 | 낮음 | 중간 | 단순 show/hide(애니메이션 최소), 수동 QA |

> **위험 패턴 자동 감지**:
> - **ADR 1건 부여**: "선택 UX architecture" 전환(전신 클릭맵 → 3단계). 비가역적 UX 결정 + 기존 테스트 계약 breaking → ADR로 *왜* 보존.
> - **[DOUBT] 1건 부여**: 그룹/세부/side → data-area 매핑 (조건 2,4 만족 — 모듈 경계 횡단 + 미래 reader가 매핑 정확성 검증 불가). 잘못된 매핑은 잘못된 의료 가이드로 이어짐.
> - deprecate: 미부여 (in-place 코드 교체, 외부 consumer 없는 내부 UI 모듈 → 4조건 중 1개).

---

## 위험 패턴 자동 감지

### ADR 작성 Task 추가
- Task 0.1: ADR 작성 (`/adr "전신 클릭맵 → 3단계 부위 선택 UI 전환"`)

### [DOUBT] 부여 (Stage 2 통과)
| Task | 매칭 | 만족 조건 |
|------|------|----------|
| Task 1.2 | 그룹→data-area 매핑 invariant | 2(모듈 경계), 4(미래 reader 검증불가) |

---

## 의존성 분석

### 내부 의존성
| 모듈 | 의존 | 변경 |
|------|------|------|
| `region-select.js`(신규) | area-groups, selection-state, mvp-area-support, area-display | 신규 |
| `area-groups.js`(신규) | 없음(순수) | 신규 |
| `app.js` | setupBodyMapEvents 등 selection API | 예 (새 init로 교체) |
| `selection-events.js`/`selection-ui.js`/`selection-renderer.js` | — | 대체/축소 (역할 region-select로 이관) |
| `selection-state.js` | appState | 재사용 (toggle/get/reset 그대로) |
| analysis-flow.js | selectedAreas | 불변 (계약 유지) |

### 외부 의존성
| 패키지 | 신규 |
|--------|------|
| 없음 (vanilla 유지) | 아니오 |

### 영향 범위
- **직접**: index.html, lib/area-groups.js(신규), src/browser/region-select.js(신규), src/browser/app.js, styles/body-map.css, styles/selection.css, tests/(신규+갱신), tests/e2e/mvp-workflows.spec.js, DESIGN.md, docs/decisions/(ADR)
- **간접**: selection-events.js/selection-ui.js/selection-renderer.js(역할 축소/대체), tests/selection-ui.test.js, tests/selection-events.test.js (재작성)

---

## 에이전트 구성
- orchestrator만. 파일 간 강한 캐스케이드 의존(매핑→상태머신→UI→테스트)으로 순차 진행이 안전.

---

## 구현 계획

### Phase 0: 결정 기록 + 실루엣 PoC (예상: M)
> 목표: 비가역 결정 ADR로 박고, 단일 path 실루엣이 실제로 사람답게 보이는지 먼저 검증.

#### Task 0.1: ADR 작성 `[Manual]`
- impl: `docs/decisions/NNNN-bodymap-3step-selection.md`
- **작업 내용**:
  - [ ] `/adr "전신 클릭맵 → 3단계 부위 선택 UI 전환"` 호출
  - [ ] 결정 배경(Oracle 권고, false affordance), 대안(전신맵 유지/실루엣만/3단계), 결과(테스트 계약 breaking 감수) 기록
- **검증 방법**: ADR 파일 생성 + 대안/결과 섹션 존재

#### Task 0.2: 단일 path 실루엣 PoC `[PoC]`
- impl: `styles/`(임시), 스크린샷
- **작업 내용**:
  - [ ] 후면 인체 단일 contour path(머리~발, 베지어) 1개 작성, viewBox 0 0 400 600
  - [ ] coral 톤 fill + 척추선/견갑골 보조선(opacity 0.15)
  - [ ] 로컬 서버 렌더 → 스크린샷으로 "사람다움" 확인
- **검증 방법**: 스크린샷에서 마네킹 아닌 자연스러운 실루엣. 실패 시 PROGRESS에 기록 후 폴백(퍼블릭도메인 SVG) 결정 — Phase 1 진입 전 gate.

---

### Phase 1: 매핑/상태 로직 (예상: M) — 순수 로직 먼저
> 목표: UI 없이 그룹/세부/side → data-area 변환과 단계 상태머신을 테스트로 고정.

#### Task 1.1: 그룹 정의 데이터 `[TDD]`
- test: `tests/area-groups.test.js`
- impl: `lib/area-groups.js`
- **작업 내용**:
  - [ ] `REGION_GROUPS` 정의: 3그룹(neck-shoulder/back-waist/pelvis-hip), 각 그룹의 라벨·세부부위 목록
  - [ ] 세부부위별 side 옵션(left/right/both/center 중 존재하는 것만) 정의
  - [ ] `getGroups()`, `getSubRegions(groupId)` 반환
- **검증 방법**: vitest — 3그룹, 각 세부부위 라벨이 area-display와 일치, 9개 세부 커버

#### Task 1.2: 세부+side → data-area 변환 `[DOUBT][TDD]`
- claim: "(group, subRegion, side) → data-area[] 변환이 모든 지원 부위를 정확히 매핑하며, 미지원/불가 조합을 안전히 거른다."
- artifact: `lib/area-groups.js` (resolveAreas 함수)
- contract: 반환된 모든 data-area는 isMvpSupportedArea=true && getAreaDisplayName에 존재. 역으로 모든 지원 data-area는 어떤 (group,sub,side)로 도달 가능.
- test: `tests/area-groups-resolve.test.js`
- impl: `lib/area-groups.js`
- **작업 내용**:
  - [ ] `resolveAreas(groupId, subId, side)` → 세부 data-area 배열
  - [ ] side='both' → left+right 둘 다, 'center' → -center/-front 등
  - [ ] 커버리지 테스트: mvp-area-support의 모든 지원 prefix 조합이 도달 가능
- **검증 방법**: vitest — 지원 data-area 전수 역매핑 + 잘못된 조합은 빈 배열

#### Task 1.3: 단계 상태머신 `[TDD]`
- test: `tests/region-flow.test.js`
- impl: `src/browser/region-flow.js` (순수 상태 로직, DOM 무관)
- **작업 내용**:
  - [ ] 상태: {step: 'group'|'sub'|'side', groupId, subId}. 전이: selectGroup→sub, selectSub→side, selectSide→commit, back, reset
  - [ ] commit 시 resolveAreas 결과 반환 (selectedAreas에 넣을 값)
- **검증 방법**: vitest — 전이/뒤로가기/리셋, commit이 올바른 data-area 반환

---

### Phase 2: UI 렌더 + 배선 (예상: L) — 가장 큰 단계
> 목표: 3단계 UI를 index.html + region-select.js로 구현, selection-state에 연결.

#### Task 2.1: index.html step1 구조 교체 `[Manual]`
- impl: `index.html`
- **작업 내용**:
  - [ ] 기존 96개 clickable-area SVG 제거 → 단일 path 실루엣(앞/뒤) + 그룹 3개 핫스팟(큰 zone)만
  - [ ] 3단계 컨테이너: `#region-step-group`(카드3+그림), `#region-step-sub`, `#region-step-side`
  - [ ] 하단 '다른 부위가 불편해요' 보조 영역(피드백 문구)
  - [ ] 선택 요약(#selected-list, #selection-count 유지) + #pain-description + #analyze-pain 유지
  - [ ] ⚠️ 기존 테스트가 참조하는 id(#live-selection-text,#quick-clear,#mvp-area-notice,#selected-list,#selection-count)는 유지하거나 테스트와 함께 갱신
- **검증 방법**: 페이지 로드 시 1단계(그룹3) 표시, 미지원 부위 클릭 불가

#### Task 2.2: region-select.js 렌더/이벤트 `[TDD]`
- test: `tests/region-select.test.js`
- impl: `src/browser/region-select.js`
- **작업 내용**:
  - [ ] region-flow 상태에 따라 group/sub/side 화면 렌더 (jsdom 가능 범위)
  - [ ] 그룹 카드·세부 버튼·side segmented control 클릭 → flow 전이
  - [ ] commit 시 resolveAreas → selection-state(toggle/set) + renderSelectedAreas
  - [ ] 그림 핫스팟과 리스트 동일 동작 (클릭 동기화)
  - [ ] 키보드/aria: 버튼 role, tabindex, aria-pressed
- **검증 방법**: vitest — 그룹 선택→세부→side→commit 시 selectedAreas에 정확한 data-area

#### Task 2.3: app.js 초기화 교체 `[Manual]`
- impl: `src/browser/app.js`
- **작업 내용**:
  - [ ] setupBodyMapEvents/switchBodyView 대신 region-select init 호출
  - [ ] start-over가 region-flow reset도 호출
  - [ ] 분석 트리거(#analyze-pain) 동선 유지
- **검증 방법**: 수동 — 전체 동선 클릭 통과

#### Task 2.4: 3단계 UI 스타일 `[Manual]`
- impl: `styles/body-map.css`, `styles/selection.css`
- **작업 내용**:
  - [ ] 그룹 카드/세부 버튼 48px+ (탭타깃), 토큰 색
  - [ ] 단일 path 실루엣 + 보조선 스타일
  - [ ] side segmented control
  - [ ] 단계 전환 show/hide
- **검증 방법**: 모바일 375px 스크린샷, 탭타깃 ≥44px

---

### Phase 3: 테스트 갱신 + 통합 (예상: M)
> 목표: 기존 계약 테스트를 새 동선으로 재작성, 전체 green.

#### Task 3.1: 기존 selection 단위 테스트 갱신 `[TDD]`
- test: `tests/selection-ui.test.js`, `tests/selection-events.test.js`
- impl: (테스트 재작성)
- **작업 내용**:
  - [ ] 96개 clickable-area 전제 테스트 → 3단계 동선 테스트로 재작성
  - [ ] 더 이상 유효하지 않은 단언 제거, 새 계약(commit→selectedAreas) 단언 추가
- **검증 방법**: vitest 해당 파일 green

#### Task 3.2: e2e 동선 재작성 `[E2E]`
- test: `tests/e2e/mvp-workflows.spec.js`
- **작업 내용**:
  - [ ] happy path: 그룹(목·어깨)→세부(목)→side(가운데/해당)→#pain-description fill→#analyze-pain→결과
  - [ ] red-flag/미지원/malformed 케이스도 새 동선으로 갱신 (selectedAreas 최종 동일 보장)
  - [ ] homepage-smoke: 헤더/안전고지 유지 확인
- **검증 방법**: `npm run test:e2e` 6/6 또는 갱신된 케이스 전부 green

#### Task 3.3: 전체 회귀 + 시각 검증 `[Manual]`
- **작업 내용**:
  - [ ] `npm test` 전부 green
  - [ ] 데스크톱/모바일 스크린샷으로 사람다움·단계 흐름 확인
  - [ ] DESIGN.md 컴포넌트 섹션에 3단계 패턴 추가
- **검증 방법**: 테스트 로그 + 스크린샷

---

## 노력도 추정
| Phase | 규모 | Task |
|-------|------|------|
| Phase 0 | M | 2 |
| Phase 1 | M | 3 |
| Phase 2 | L | 4 |
| Phase 3 | M | 3 |
| **합계** | **L** | **12** |

> 전체 약 1.5~2.5일. Phase 2가 가장 큼.

---

## 테스트 전략

### 단위 (vitest)
- [ ] area-groups: 그룹 정의, 라벨 정합
- [ ] area-groups-resolve: 그룹/세부/side → data-area 전수 커버리지 (DOUBT 대상)
- [ ] region-flow: 상태 전이/뒤로/리셋/commit
- [ ] region-select: 클릭→selectedAreas 반영

### E2E (playwright)
- [ ] 3단계 happy path → 분석 → 결과
- [ ] red-flag/미지원/malformed 갱신
- [ ] 헤더/안전고지 스모크

### 수동
- [ ] 단일 path 사람다움
- [ ] 모바일 탭타깃 ≥44px, 단계 전환
- [ ] 키보드 only 선택

---

## Acceptance Criteria

- [ ] AC-1: Given 첫 진입, When step1 로드, Then 큰 부위군 3개(목·어깨/등·허리/골반·엉덩이)만 선택 가능하고 팔·다리·머리 등 미지원 핫스팟은 0개다.
- [ ] AC-2: Given 그룹 '등·허리' 선택, When 다음 단계, Then 세부(등 상부/등 중부/허리)만 48px+ 버튼으로 표시된다.
- [ ] AC-3: Given 세부 '허리' + side '가운데' 선택, When commit, Then selectedAreas에 'lower-back-center'(정확한 data-area)가 들어가고 #analyze-pain로 분석이 동작한다.
- [ ] AC-4: Given side 'both', When commit, Then 좌+우 data-area 둘 다 selectedAreas에 들어간다.
- [ ] AC-5: Given resolveAreas 전수 테스트, When 모든 지원 data-area, Then 각각 어떤 (group,sub,side)로 도달 가능하고 미지원 조합은 빈 배열이다.
- [ ] AC-6: Given 375px 모바일, When 각 단계 버튼/핫스팟, Then 탭타깃 실측 ≥44px.
- [ ] AC-7: Given 전체 변경, When `npm test` + `npm run test:e2e`, Then 전부 green(또는 갱신 케이스 전부 green).
- [ ] AC-8: Given 단일 path 실루엣, When 렌더, Then 도형 조합 흔적(분절 사각형/원) 없이 연속 윤곽으로 보인다(수동).
- [ ] AC-9: Given 미지원 부위 흐름, When '다른 부위가 불편해요', Then 막다른 안내가 아니라 피드백/로드맵 문구를 보여준다.

---

## Verification Strategy
| AC | 검증 | 측정 |
|----|------|------|
| AC-1 | 수동+grep | step1에 미지원 data-area 핫스팟 0, 그룹 3개 존재 |
| AC-2 | 단위+수동 | getSubRegions('back-waist') = [등상부,등중부,허리] |
| AC-3 | 단위(vitest) | commit 결과 selectedAreas 포함 'lower-back-center' |
| AC-4 | 단위 | side='both' → [*-left,*-right] |
| AC-5 | 단위 | 지원 data-area 전수 역매핑 통과, 잘못된 조합 [] |
| AC-6 | 수동 QA | DevTools bounding box ≥44px |
| AC-7 | CI/로컬 | vitest exit0 && playwright exit0 |
| AC-8 | 수동 | 스크린샷 |
| AC-9 | 수동 | 피드백 문구 노출 |

---

## 병렬 실행 그룹
- 그룹 A (Phase 0 순차): 0.1 → 0.2 (PoC gate)
- 그룹 B (Phase 1, 1.1→1.2→1.3 순차: 매핑 의존)
- 그룹 C (Phase 2, 2.1→2.2→2.3→2.4 순차: 캐스케이드)
- 그룹 D (Phase 3, 3.1‖3.2 후 3.3)

> Phase 0 PoC가 실패(실루엣 어색)하면 Phase 1 진입 전 폴백 결정.
