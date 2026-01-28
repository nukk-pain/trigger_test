# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered pain analysis and self-massage guide web application. Users select pain areas on an interactive SVG body map (60+ regions), describe aggravating factors, and receive OpenAI-powered analysis with trigger point identification and massage instructions.

**Tech Stack**: Vanilla JS + HTML + CSS, Express.js (dev server), OpenAI o4-mini, Vercel serverless deployment

## Development Commands

```bash
# Local development (Express server on port 3000)
npm start

# Alternative: static file server for frontend-only testing
python -m http.server 8000

# Test environment loading
curl http://localhost:3000/api/env
```

## Architecture

### Global State Objects
All state is managed via global window objects initialized on page load:
- `window.envLoader` - Environment variable loader (EnvLoader class in env-loader.js)
- `window.openaiConfig` - OpenAI API wrapper (OpenAIConfig class in config.js)
- `window.usageTracker` - Usage statistics tracker (UsageTracker class in config.js)
- `window.MEDICAL_PROMPTS` - System prompts for AI analysis

### Data Flow
1. User selects body areas on SVG map → stored in `selectedAreas` Set
2. User enters pain description → stored in `document.getElementById('pain-situation').value`
3. Click "Analyze" → `openaiConfig.analyzePain()` sends to OpenAI with `MEDICAL_PROMPTS.PAIN_ANALYSIS`
4. Response parsed and displayed → usage tracked in localStorage

### Key Data Structures (embedded in script.js)
- `triggerPointsDB`: 7+ trigger points with anatomical locations, massage techniques, safety precautions
- `fascialLinesDB`: 3 fascial lines based on Thomas Myers' Anatomy Trains theory
- 60+ clickable SVG body regions mapped to trigger point associations

### Environment Loading (multi-fallback)
1. Vercel serverless `/api/env` (production)
2. Express server `/api/env` (local dev)
3. localStorage fallback (last resort)

### Medical Safety Features
- Red flag symptom detection (fever, neurological signs, chest pain, etc.)
- Embedded disclaimer - no medical diagnosis, self-care guidance only
- Emergency referral prompts when red flags detected

## Environment Variables (.env.local)

```
OPENAI_API_KEY=sk-...          # Required
OPENAI_MODEL=o4-mini           # Reasoning model
MAX_TOKENS=4000                # For o4 inference
TEMPERATURE=1.0                # o4 model optimized
DAILY_REQUEST_LIMIT=50         # localStorage tracked
MONTHLY_REQUEST_LIMIT=1000
```

## Security Constraints

- **API key exposure**: API key must NEVER be exposed client-side. Always proxy through serverless function (`api/env.js`) which returns only non-sensitive config
- The `/api/env` endpoint returns `{ model, maxTokens, temperature, dailyLimit, monthlyLimit }` but NOT the API key
- OpenAI calls happen client-side using key loaded via secure env endpoint pattern

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
