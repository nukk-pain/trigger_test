---
version: alpha
name: Warm Relief
description: 통증 셀프케어 가이드의 디자인 시스템. 따뜻한 산호빛 톤으로 셀프케어의 편안함을, 차분한 세이지 톤으로 의료적 신뢰를 함께 전한다.
colors:
  bg: "#FBF7F2"
  surface: "#FFFFFF"
  surface-sunken: "#F4EDE4"
  primary: "#DD6B4D"
  primary-strong: "#B5482F"
  primary-soft: "#F6C9B8"
  secondary: "#5FA89A"
  secondary-strong: "#3F7E72"
  text: "#3A352F"
  text-muted: "#857C72"
  border: "#E9E1D7"
  alert: "#C9453B"
  alert-soft: "#FBEAE7"
  selected: "#F6C9B8"
  selected-stroke: "#B5482F"
typography:
  h1:
    fontFamily: Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  h2:
    fontFamily: Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: -0.01em
  h3:
    fontFamily: Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
rounded:
  sm: 8px
  md: 12px
  lg: 20px
  full: 999px
components:
  button-primary:
    background: "{colors.primary}"
    backgroundHover: "{colors.primary-strong}"
    text: "{colors.surface}"
    radius: "{rounded.full}"
  card:
    background: "{colors.surface}"
    radius: "{rounded.lg}"
    border: "{colors.border}"
  chip:
    background: "{colors.surface-sunken}"
    backgroundActive: "{colors.primary-soft}"
    text: "{colors.text}"
    radius: "{rounded.full}"
  safety-notice:
    background: "{colors.alert-soft}"
    accent: "{colors.alert}"
    radius: "{rounded.md}"
---

# Warm Relief — 통증 셀프케어 디자인 시스템

## Overview

Warm Relief는 "아픈 곳을 짚으면, 스스로 풀어주는 법을 알려준다"는 제품 약속을 시각으로 옮긴 시스템이다. 두 가지 감정을 동시에 전한다. 하나는 **편안함** — 따뜻한 산호빛(coral)과 크림 배경으로 병원의 차가움 대신 집에서 몸을 돌보는 느낌을 준다. 다른 하나는 **신뢰** — 차분한 세이지(sage)와 절제된 경고색으로 "이건 장난이 아니라 안전을 챙기는 도구"라는 인상을 남긴다.

장식은 줄이고 행동은 또렷하게. 한 화면에 액센트는 하나, 경고는 경고답게.

## Colors

- **Coral (primary `#DD6B4D`)**: 핵심 행동색. 주 버튼, 선택 강조, 링크. 흰 글씨를 얹는 버튼은 hover에서 `primary-strong`으로 어두워진다.
- **Deep Terracotta (primary-strong `#B5482F`)**: hover/포커스/본문 위 링크 등 대비가 필요한 자리. 선택된 부위의 외곽선.
- **Soft Coral (primary-soft `#F6C9B8`)**: 선택된 통증 부위 채움, 활성 칩 배경 등 옅은 강조.
- **Sage (secondary `#5FA89A`)**: 신뢰·보조 정보. 보조 탭/배지/정보성 강조. 주색과 경쟁하지 않게 보조로만.
- **Warm Cream (bg `#FBF7F2`)** / **Surface `#FFFFFF`** / **Sunken `#F4EDE4`**: 배경 3단. 카드는 흰색, 페이지는 크림, 눌린 영역(칩 트랙 등)은 sunken.
- **Warm Charcoal (text `#3A352F`)** / **Muted `#857C72`**: 본문/보조 텍스트. 본문은 흰 배경에서 대비 ≥ 4.5:1.
- **Alert (`#C9453B`) + Alert Soft (`#FBEAE7`)**: 안전 고지·레드플래그 **전용**. 다른 곳에 쓰지 않는다. 경고가 평소 UI에 묻히지 않도록 격리한다.

원칙: 한 화면의 강조색은 coral 1계열. sage는 보조, alert는 안전 문맥에만.

## Typography

한글 우선 스택(Pretendard → Apple SD Gothic Neo → Malgun Gothic). 웹폰트는 강제 로드하지 않고 시스템에 있으면 쓰는 점진 향상 방식(성능 우선).

위계: 페이지 제목 `h1` 32 / 섹션 `h2` 24 / 소제목 `h3` 19 / 본문 16 / 입력 라벨 15(굵게) / 보조 13. 제목은 자간을 살짝 좁혀(-0.01~-0.02em) 또렷하게, 본문은 line-height 1.6으로 읽기 편하게.

## Layout

8pt 그리드. 간격 토큰 `xs 4 / sm 8 / md 16 / lg 24 / xl 40`만 사용한다(임의 px 금지). 컨테이너 최대폭 1200px, 본문 읽기 영역은 그보다 좁게. 카드 안쪽 여백은 `lg`(24), 카드 사이는 `lg~xl`.

모바일에서는 세로 스크롤을 줄이는 방향으로 간격을 `md`로 좁히되, 터치 대상은 절대 줄이지 않는다(최소 44×44px).

## Elevation & Depth

그림자는 절제한다. 두 단계만.
- **Raised (카드)**: `0 4px 16px rgba(58, 53, 47, 0.06)` — 페이지 위에 살짝 뜬 카드.
- **Overlay (모달/알림)**: `0 12px 32px rgba(58, 53, 47, 0.16)`.

기존의 과한 `0 10px 30px` 큰 그림자는 쓰지 않는다.

## Shapes

둥근 모서리로 부드러움을 준다. `sm 8`(작은 요소) / `md 12`(입력·고지 박스) / `lg 20`(카드) / `full`(버튼·칩·탭은 pill 형태). 버튼과 칩은 항상 pill.

## Components

- **button-primary**: coral 배경 + 흰 글씨 + pill. hover에서 `primary-strong`. 화면당 주 행동 하나(예: "분석하기")만 이 스타일을 갖는다.
- **card**: 흰 배경, `lg` radius, `border` 1px, Raised 그림자. 페이지의 기본 담는 그릇.
- **chip**: sunken 배경 + pill. 클릭/활성 시 `primary-soft` 배경. 입력 보조(빠른 증상 선택)와 선택된 부위 표시에 공통 사용.
- **safety-notice**: `alert-soft` 배경 + `alert` 좌측 강조선 + `md` radius. 응급/중단/진료 기준 문구 전용. 톤은 정돈하되 시선은 끌어야 한다.
- **region-select (부위 선택, 2단계)**: 정직한 affordance가 원칙 — 도와줄 수 있는 부위만 고를 수 있게 한다.
  - 배경에 사람 형태 단일 path 실루엣(coral `primary-soft`)을 두어 맥락을 주되, 클릭은 그 위의 큰 그룹 zone과 리스트가 받는다. 리스트가 primary, 그림은 shortcut.
  - **1단계 그룹 카드**: 세로 스택, 최소 높이 `--tap-min`(44px). hover/focus에서 `primary-soft` 배경 + `primary` 테두리.
  - **2단계 세부 버튼**: 2열 pill 그리드, 한글 부위명 그대로. 선택 시 coral 채움(흰 글씨). 다중 선택 가능.
  - 분석 데이터가 없는 부위(트리거포인트 0)는 노출하지 않는다 — 누르면 빈 결과가 나오는 false affordance를 만들지 않기 위함. 미지원 부위는 "다른 부위가 불편해요" 보조 흐름으로 받는다.

> 한국어 카피 톤(글로벌 규칙 #15 준수): 가운뎃점 나열·번역투·헤지("~일 수 있습니다") 금지. 짧게 치고 길게 푸는 리듬으로, 고객이 실제 쓰는 말("앉아 있으면 결려요")을 쓴다. 안전 문구만은 단정하고 분명하게.
