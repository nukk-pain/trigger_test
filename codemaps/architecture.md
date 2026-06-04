# Architecture Overview
> Last updated: 2026-06-04

## System Overview

Pain Guide Helper는 AI 기반 통증 분석 및 셀프 마사지 가이드를 제공하는 웹 애플리케이션입니다.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ index.html  │──│   script.js   │──│  lib/ modules    │  │
│  │ styles/*.css│  │  (UI logic)   │  │  (core logic)    │  │
│  └─────────────┘  └───────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
       ┌──────▼──────┐              ┌───────▼───────┐
       │  Local Dev  │              │    Vercel     │
       │  server.js  │              │  api/*.js     │
       │ /api/env    │              │/api/env/chat  │
       │ /api/status │              │ /api/status   │
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
├── data.js           # data/* re-export
├── utils.js          # area-display/markdown-format/validation re-export
├── config.js         # OpenRouter 설정 (→ env-loader)
└── analysis.js       # 분석 함수 (→ data, utils)

script.js → lib/* (모든 모듈 사용)
```

## Data Flow

1. **Environment Loading**
   ```
   Client → /api/env → EnvLoader
   ```

2. **Pain Analysis Flow**
   ```
   User Input → analyzeTriggerPoints() → /api/chat → OpenRouter API → formatAIResponse() → UI
   ```

3. **Usage Tracking**
   ```
   Client estimate → UsageTracker.recordRequest() → localStorage
   Server enforcement → /api/chat → server-side rate limit
   ```

## Security Constraints

- API 키는 서버에서만 로드 (.env.local)
- localStorage에 API 키 저장 금지
- 클라이언트에서 API 키 설정 불가 (setApiKey throws)
- 사용량 제한: 서버 프록시 rate limit이 실제 차단을 담당하고, UsageTracker는 브라우저 표시/사전 안내용

## Key Abstractions

| Class/Function | Responsibility |
|---------------|----------------|
| `EnvLoader` | 환경설정 로드 및 관리 |
| `UsageTracker` | 브라우저별 사용량 표시 |
| `OpenRouterConfig` | OpenRouter API 래퍼 |
| `analyzeTriggerPoints()` | 트리거포인트 매칭 |
| `analyzeFascialLines()` | 근막경선 매칭 |
