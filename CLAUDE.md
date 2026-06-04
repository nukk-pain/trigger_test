# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered pain analysis and self-massage guide web application. Users select pain areas on an interactive SVG body map (60+ regions), describe aggravating factors, and receive OpenRouter-powered analysis with trigger point identification and massage instructions.

**Tech Stack**: Vanilla JS + HTML + CSS, Express.js (dev server), OpenRouter Chat Completions, Vercel serverless deployment

## Development Commands

```bash
# Local development (Express server on port 3000)
npm start

# Test environment loading
curl http://localhost:3000/api/env
```

## Architecture

### Global State Objects
All state is managed via global window objects initialized on page load:
- `window.envLoader` - Environment variable loader (EnvLoader class in env-loader.js)
- `window.openRouterConfig` - OpenRouter server-proxy API wrapper in config.js
- `window.usageTracker` - Usage statistics tracker (UsageTracker class re-exported from env-loader.js)
- `window.MEDICAL_PROMPTS` - System prompts for AI analysis

### Data Flow
1. User selects body areas on SVG map → stored in `appState.painData.selectedAreas`
2. User enters pain description → stored from `#pain-description`
3. Click "Analyze" → `openRouterConfig.makeRequest()` sends messages to server `/api/chat` with `MEDICAL_PROMPTS.PAIN_ANALYSIS`
4. Response parsed and displayed → browser usage display updates; authoritative rate limiting stays server-side

### Key Data Structures
- `triggerPointsDB`: 17 trigger points in `lib/data/trigger-points.js` with anatomical locations, massage techniques, safety precautions
- `fascialLinesDB`: 3 fascial lines based on Thomas Myers' Anatomy Trains theory
- `redFlagConditions`: emergency screening codes in `lib/data/red-flags.js`
- 60+ clickable SVG body regions mapped to trigger point associations

### Environment Loading
1. `/api/env` returns public runtime config in both Express and Vercel
2. localStorage fallback keeps only non-sensitive display/config values

### Medical Safety Features
- Red flag symptom detection (fever, neurological signs, chest pain, etc.)
- Embedded disclaimer - no medical diagnosis, self-care guidance only
- Emergency referral prompts when red flags detected

## Environment Variables (.env.local)

```
OPENROUTER_API_KEY=sk-or-...   # Required, server-side only
OPENROUTER_MODEL=openrouter/auto
MAX_TOKENS=1500
TEMPERATURE=1.0
DAILY_REQUEST_LIMIT=50
MONTHLY_REQUEST_LIMIT=1000
SERVER_RATE_LIMIT_MAX=50
SERVER_RATE_LIMIT_WINDOW_SECONDS=86400
```

## Security Constraints

- **API key exposure**: API key must NEVER be exposed client-side. Always proxy through serverless function (`api/env.js`) which returns only non-sensitive config
- The `/api/env` endpoint returns `{ model, maxTokens, temperature, dailyLimit, monthlyLimit }` but NOT the API key
- OpenRouter calls happen server-side through `/api/chat`; the browser never receives the key

## Guardrails (from ~/.ai/global-rules.md)

1. **가정 기반 주장 금지**: Before claiming "X doesn't exist" or "Y isn't used", verify via DB schema, actual data, and complete code flow. Ask "why?" at least 2 levels deep.
2. **생성 후 통합 검증 필수**: After creating modules/providers/adapters, verify they are actually imported and invoked at call sites. Created-but-not-connected code is equivalent to non-existent.
3. **LLM 출력 정규화 후 검증**: Before passing LLM output downstream, normalize case, key names, and field structure to match target schema, then validate.
4. **인증 경로 명시적 매칭만 허용**: Never use prefix matching (`startsWith`) or fallback operators (`||`) for auth paths. Use explicit exact-match lists only.

## Planned Refactoring

See `REFACTORING_PLAN.md` for the 9-phase modernization to React + TypeScript + Vite. Key changes:
- Move from monolithic script.js to component-based architecture
- Server-side usage tracking (currently client-side localStorage)
- Vitest + Playwright testing (currently manual only)
