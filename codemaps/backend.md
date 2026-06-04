# Backend Structure
> Last updated: 2026-01-28

## Overview

백엔드는 두 가지 환경을 지원합니다:
- **Local Development**: Express.js (server.js)
- **Production**: Vercel Serverless (api/env.js)

## File Structure

```
/
├── server.js          # Express 개발 서버
├── api/
│   ├── chat.js        # OpenRouter chat proxy
│   └── env.js         # Vercel Serverless 함수
└── .env.local         # 환경변수 (gitignored)
```

## server.js - Local Development Server

**Purpose**: 로컬 개발 시 환경변수 제공 및 정적 파일 서빙

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | index.html 서빙 |
| `/api/config` | GET | 환경설정 반환 |
| `/api/env` | GET | Vercel 형식 환경설정 반환 |
| `/api/chat` | POST | OpenRouter Chat Completions 프록시 |
| `/*` | GET | 정적 파일 서빙 |

### Key Functions

```javascript
loadEnvFile()
├── 파일: .env.local 파싱
├── 출력: { OPENROUTER_API_KEY, DAILY_REQUEST_LIMIT, ... }
└── 로깅: 개발환경에서만 설정 출력

GET /api/config
├── 입력: 없음
└── 출력: { OPENROUTER_MODEL, MAX_TOKENS, ... } (API 키 제외)
```

### Environment Variables (server.js)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | 서버 포트 |
| `OPENROUTER_API_KEY` | - | OpenRouter API 키 |
| `DAILY_REQUEST_LIMIT` | 50 | 일일 요청 한도 |
| `MONTHLY_REQUEST_LIMIT` | 1000 | 월간 요청 한도 |
| `OPENROUTER_MODEL` | openrouter/auto | AI 모델 |
| `MAX_TOKENS` | 1500 | 최대 토큰 |
| `TEMPERATURE` | 0.3 | 응답 다양성 |

---

## api/env.js - Vercel Serverless Function

**Purpose**: Vercel 배포 시 환경변수 제공

### Endpoint

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/env` | GET | 환경설정 반환 |
| `/api/env` | OPTIONS | CORS preflight |

### Response Format

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "OPENROUTER_MODEL": "openrouter/auto",
    "MAX_TOKENS": 2000,
    "TEMPERATURE": 0.7,
    "DAILY_LIMIT": 20,
    "MONTHLY_LIMIT": 200
  }
}
```

**Error (500)**:
```json
{
  "success": false,
  "error": "Failed to load environment variables",
  "message": "..."
}
```

### CORS Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Environment Loading Fallback Chain

```
Client Request
     │
     ▼
┌─────────────────┐
│ /api/env (Vercel)│ ──success──▶ Use Vercel config
└────────┬────────┘
         │ fail
         ▼
┌─────────────────┐
│/api/config(Local)│ ──success──▶ Use Local config
└────────┬────────┘
         │ fail
         ▼
┌─────────────────┐
│   localStorage  │ ──▶ Use cached config (no API key)
└─────────────────┘
```

## Security Notes

- API 키는 서버 환경변수에서만 로드
- 프로덕션에서는 Vercel 환경변수 사용
- .env.local은 .gitignore에 포함 필수
