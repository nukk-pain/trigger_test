# Data Models & Schema
> Last updated: 2026-01-28

## Overview

의료 데이터는 `lib/data.js` 호환성 배럴을 통해 재수출되며, 실제 데이터는 `lib/data/trigger-points.js`, `lib/data/fascial-lines.js`, `lib/data/red-flags.js`에 책임별로 분리되어 있습니다.

---

## triggerPointsDB

**Purpose**: 통증 부위별 트리거 포인트 매핑

### Schema

```typescript
interface TriggerPoint {
  name: string;                  // 근육명 (예: "승모근 상부섬유")
  location: string;              // 위치 코드 (예: "neck-shoulder-junction")
  anatomicalPosition: string;    // 해부학적 위치 설명
  referredPain: string[];        // 연관통 부위 (한글)
  painAreas: string[];           // 통증 유발 부위 코드
  triggers: string[];            // 유발 요인 코드
  massage: {
    method: string;              // 마사지 방법
    frequency: string;           // 권장 빈도
    duration: string;            // 권장 시간
    precaution: string;          // 주의사항
  };
}
```

### Data (17 entries)

| Name | Location | Pain Areas (count) |
|------|----------|-------------------|
| 승모근 상부섬유 | neck-shoulder-junction | 13 |
| 후두하근 | skull-base | 5 |
| 흉쇄유돌근 | neck-side | 5 |
| 승모근 중부섬유 | shoulder-blade-top | 8 |
| 능형근 | between-shoulder-blades | 4 |
| 요방형근 | lower-back-sides | 7 |
| 전거근 | side-ribs | 6 |
| 이상근 | deep-buttock | 8 |
| 비복근 | calf-muscle | 8 |
| 가자미근 | deep-calf | 8 |
| 대퇴사두근 | front-thigh | 8 |
| 장요근 | hip-flexor | 10 |
| 대흉근 | chest-muscle | 8 |
| 광배근 | lat-muscle | 9 |
| 측두근 | temple | 6 |
| 전경골근 | shin | 8 |
| 복직근 | rectus-abdominis | 6 |

### Trigger Codes

| Code | Description |
|------|-------------|
| bench-press | 벤치프레스 |
| breathing-issues | 호흡 문제 |
| carrying-bags | 가방 들기 |
| carrying-heavy | 무거운 물건 운반 |
| chewing | 씹기 |
| climbing-stairs | 계단 오르기 |
| computer-work | 컴퓨터 작업 |
| core-exercises | 코어 운동 |
| coughing | 기침 |
| crunches | 크런치 |
| forward-head-posture | 거북목 |
| heavy-lifting | 무거운 물건 들기 |
| high-heels | 하이힐 |
| hiking | 등산 |
| hip-tightness | 고관절 뻣뻣함 |
| jaw-clenching | 턱 악물기 |
| jumping | 점프 |
| kicking | 킥 동작 |
| lifting | 들어올리기 |
| neck-turning | 목 돌리기 |
| poor-posture | 나쁜 자세 |
| prolonged-sitting | 장시간 앉기 |
| prolonged-standing | 장시간 서기 |
| pull-ups | 풀업 |
| push-ups | 푸시업 |
| reaching-overhead | 위로 뻗기 |
| reading | 독서 |
| rowing | 로잉 |
| running | 달리기 |
| sitting | 앉아있기 |
| sleeping-position | 수면 자세 |
| slouching | 구부정한 자세 |
| squatting | 스쿼트 |
| stress | 스트레스 |
| teeth-grinding | 이갈이 |
| uneven-posture | 비대칭 자세 |
| walking | 걷기 |
| walking-uphill | 오르막 걷기 |

---

## fascialLinesDB

**Purpose**: Thomas Myers의 Anatomy Trains 기반 근막 경선

### Schema

```typescript
interface FascialLine {
  name: string;           // 경선 이름
  path: string[];         // 경로 (근육/구조물)
  commonIssues: string[]; // 흔한 문제
  relatedAreas: string[]; // 관련 부위 그룹
  treatment: string;      // 치료 방향
}
```

### Data (3 entries)

| Key | Name | Related Areas |
|-----|------|---------------|
| superficial-back-line | 표재후선 | lower-back, upper-back, neck |
| deep-front-line | 심층전선 | abdomen, chest, neck |
| lateral-line | 측면선 | thigh, abdomen, neck |

### Path Details

**표재후선 (Superficial Back Line)**
```
발바닥 → 종아리 → 햄스트링 → 천골 → 척추기립근 → 후두골
```

**심층전선 (Deep Front Line)**
```
발등 → 정강이 → 골반저근 → 대요근 → 횡격막 → 목
```

**측면선 (Lateral Line)**
```
발외측 → 종아리외측 → 대퇴외측 → 골반 → 늑간근 → 목측면
```

---

## redFlagConditions

**Purpose**: 응급상황 체크 조건

```javascript
['fever', 'severe-numbness', 'weakness', 'bladder', 'chest-pain', 'breathing']
```

| Code | Description |
|------|-------------|
| fever | 발열 동반 |
| severe-numbness | 심한 저림 |
| weakness | 근력 약화 |
| bladder | 배뇨/배변 장애 |
| chest-pain | 흉통 |
| breathing | 호흡 곤란 |

---

## Area Codes Reference

### 부위 그룹 매핑 (mapAreaToGroup)

| Pattern | Group |
|---------|-------|
| `lower-back-*`, `lumbar*` | lower-back |
| `upper-back-*`, `thoracic*` | upper-back |
| `neck-*` | neck |
| `abdomen-*`, `belly*` | abdomen |
| `chest-*`, `sternum` | chest |
| `thigh-*` | thigh |

### 주요 부위 코드

**머리**: head-front, head-back, head-crown, head-temple-left/right, occipital, jaw-left/right

**목**: neck-front, neck-left/right, neck-back-upper/lower, neck-side-left/right-back

**어깨**: shoulder-left/right-front, shoulder-blade-left/right, shoulder-top-left/right, collar-left/right

**등**: upper-back-center/left/right, mid-back-center, lower-back-upper/left/right/center

**하지**: thigh-front/back/inner/outer-left/right, hamstring-left/right, calf-front/back-left/right
