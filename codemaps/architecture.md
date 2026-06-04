# Architecture Overview
> Last updated: 2026-01-28

## System Overview

Pain Guide Helper는 AI 기반 통증 분석 및 셀프 마사지 가이드를 제공하는 웹 애플리케이션입니다.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ index.html  │──│   script.js   │──│  lib/ modules    │  │
│  │ styles.css  │  │  (UI logic)   │  │  (core logic)    │  │
│  └─────────────┘  └───────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
       ┌──────▼──────┐              ┌───────▼───────┐
       │  Local Dev  │              │    Vercel     │
       │  server.js  │              │  api/*.js     │
       │/api/config  │              │/api/env/chat  │
       └──────┬──────┘              └───────┬───────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │ OpenRouter API  │
                    │ Chat Completion │
                    └─────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JS, CSS |
| Backend (Dev) | Express.js |
| Backend (Prod) | Vercel Serverless |
| AI | OpenRouter Chat Completions |
| Testing | Vitest + jsdom |

## Module Dependency Graph

```
lib/
├── env-loader.js     # 환경설정 로드 (독립)
├── data.js           # 트리거포인트/근막 데이터 (독립)
├── utils.js          # 유틸리티 함수 (독립)
├── config.js         # OpenRouter 설정 (→ env-loader)
└── analysis.js       # 분석 함수 (→ data, utils)

script.js → lib/* (모든 모듈 사용)
```

## Data Flow

1. **Environment Loading**
   ```
   Client → /api/env (Vercel) || /api/config (Local) → EnvLoader
   ```

2. **Pain Analysis Flow**
   ```
   User Input → analyzeTriggerPoints() → /api/chat → OpenRouter API → formatAIResponse() → UI
   ```

3. **Usage Tracking**
   ```
   API Request → UsageTracker.recordRequest() → localStorage
   ```

## Security Constraints

- API 키는 서버에서만 로드 (.env.local)
- localStorage에 API 키 저장 금지
- 클라이언트에서 API 키 설정 불가 (setApiKey throws)
- 사용량 제한: 일일 50회, 월간 1000회 (기본값)

## Key Abstractions

| Class/Function | Responsibility |
|---------------|----------------|
| `EnvLoader` | 환경설정 로드 및 관리 |
| `UsageTracker` | API 사용량 추적 |
| `OpenRouterConfig` | OpenRouter API 래퍼 |
| `analyzeTriggerPoints()` | 트리거포인트 매칭 |
| `analyzeFascialLines()` | 근막경선 매칭 |
