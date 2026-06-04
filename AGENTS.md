# Trigger Test - Agent Orientation

## Scope
- AI pain-analysis and self-massage guide app using static HTML/CSS/JS plus an Express dev server and Vercel serverless API.
- Current architecture is global-object JavaScript; `REFACTORING_PLAN.md` tracks a future React/TypeScript migration.

## Safety Invariants
- Never expose API keys client-side.
- `/api/env` must return only non-sensitive config such as model and limits, not API keys.
- Keep medical safety disclaimers and red-flag handling visible when changing analysis flow.
- Do not present generated guidance as medical diagnosis.

## Where To Look
- `index.html`, `styles.css`, `script.js`: main client app.
- `server.js`: local Express server.
- `api/env.js`, `api/chat.js`, `api/status.js`: Vercel/server API surface.
- `config.js`, `env-loader.js`, `lib/`: configuration and environment loading.
- `tests/`: Vitest tests for config/env behavior.
- `codemaps/`: architecture/backend/frontend/data notes.
- `REFACTORING_PLAN.md`: modernization roadmap.

## Commands
```bash
npm install
npm start
npm test
npm run test:coverage
```

## Project Notes
- Local app uses port 3000 by default.
- `trigger_test` currently has local commits and untracked codemap/refactor docs; do not overwrite them accidentally.
