# MVP Stabilization From Repository Assessment

## TL;DR
> **Summary**: Stabilize `trigger_test` as a safe, deployable MVP before any React/TypeScript rewrite. This plan implements the assessment decision: keep the project, narrow the MVP, harden API/safety/cost controls, add real browser QA, and preserve existing user-owned worktree changes.
> **Deliverables**:
> - Patched dependency/security baseline with audit gate.
> - Public/private env contract and Vercel deployment readiness.
> - Hardened `/api/chat` validation, sanitized error contract, durable rate/cost limiting.
> - Always-visible medical safety copy, expanded red-flag handling, structured AI output rendering.
> - MVP body-area support filter for neck/shoulder/back/hip without deleting SVG areas.
> - Playwright E2E coverage, CI workflow, and captured manual QA artifacts.
> **Effort**: Large
> **Parallel**: YES - 5 waves
> **Critical Path**: Baseline -> package/tooling lock -> API validation -> durable limiter -> safety/schema UI -> E2E/CI -> final review

## Context

### Original Request
The user asked: `docs/repo-modernization-assessment-2026-06-04.md 문서에 맞춰서 $omo:ulw-plan`.

### Interview Summary
No further user interview is required. The ignored assessment document already makes the product decision: **maintain the project, reduce it to MVP, prioritize security/safety stabilization, and defer React/TypeScript rewrite**.

### Assessment Summary Embedded
The assessment file lives under ignored `docs/`, so future executors must not depend on it being available. The relevant decisions are copied here:

- Current app: static HTML/CSS/Vanilla JS frontend, Express local server, Vercel `api/*.js`, OpenRouter Chat Completions proxy.
- Missing infrastructure: DB, auth, file storage, CI/CD, Docker, checked-in `.env.example`, Playwright/Cypress, production monitoring.
- Current risks: vulnerable dependencies, in-memory serverless rate limit, weak request schema, AI free-text output, red-flag substring matching, missing always-visible non-diagnosis copy, no real browser E2E.
- Product direction: do not discard; do not rewrite immediately; stabilize and reduce to MVP.
- MVP focus: neck/shoulder/back/hip pain guidance; body-area selection plus pain description; deterministic red flags before AI; server proxy; structured guidance; server-side rate/cost controls.

### Research Findings
- `package.json:6-12` has `npm test`, `npm run test:coverage`; no build/E2E/CI scripts.
- `vitest.config.js:4-20` uses jsdom and excludes `.omo/**`.
- `lib/openrouter-proxy.cjs:25-35` validates only role/content presence.
- `lib/openrouter-proxy.cjs:66-129` derives client keys from headers and uses process-local `Map` counters.
- `lib/openrouter-proxy.cjs:160-179` can return upstream/internal error details.
- `api/chat.js:13-67` owns Vercel CORS and delegates to shared proxy logic.
- `server.js:11-12` uses `express.json()` without explicit body size limit.
- `src/browser/analysis-flow.js:19-50` orchestrates analysis and checks red flags before AI.
- `src/browser/analysis-flow.js:91-116` implements current red-flag substring matching.
- `src/browser/analysis-renderer.js:7-57` renders AI output and red-flag warnings.
- `src/browser/safe-html.js` provides sanitizer used by AI rendering.
- Existing tests cover API key non-exposure, CORS, rate limiting, env loading, safe HTML, prompts, selection UI, guide modal, and one red-flag pre-AI case.

### Metis Review (gaps addressed)
- **Durable limiter provider**: choose Upstash Redis for production; keep memory limiter as local/test fallback only.
- **Limiter failure policy**: production fails closed with 503; local/test may use memory fallback.
- **Exact quota defaults**: JSON body max 16 KB, max 6 messages, max 2,000 chars/message, `MAX_TOKENS=800`, daily 20 requests/IP, monthly 200 requests/IP, AI Q&A disabled by default.
- **Model policy**: keep model env-driven; `.env.example` uses placeholder requiring explicit production model choice; do not hardcode a vendor model in source.
- **Structured AI schema**: `{ targetMuscles, summary, steps, stopIf, seekCareIf, disclaimer }`; max 4 steps; all display strings non-empty.
- **Red-flag scope**: chest pain, breathing trouble, fever, trauma, severe numbness, weakness/paralysis, bowel/bladder changes, rapidly worsening pain.
- **MVP body map**: do not delete SVG; add support filter/highlight for neck, shoulder, upper back, lower back, hip/pelvis and a safe unsupported-area notice.
- **E2E tooling**: add Playwright Chromium with scripts.
- **CI**: GitHub Actions on Node 22 with `npm ci`, `npm test`, `npm run test:e2e`, `npm audit --audit-level=high`.
- **Deployment**: add minimal Vercel config only; do not add Netlify/Railway/Fly/Render configs.
- **Dirty worktree**: every executor must run `git status --short` before edits and never revert unrelated modified/untracked files.

## Work Objectives

### Core Objective
Ship a working MVP stabilization pass for `trigger_test` that is safer to deploy publicly, cheaper to operate, and proven through TDD plus real HTTP/browser QA.

### Deliverables
- Dependency and audit baseline.
- `.env.example`, deployment notes, and Vercel config.
- Hardened request validation, body size limits, and sanitized API errors.
- Durable production rate/cost limiter with local/test memory fallback.
- Red-flag checklist expansion and always-visible non-diagnosis/stop-care copy.
- Structured AI JSON prompt/parse/render path with safe fallback.
- MVP supported-area filter without destructive SVG deletion.
- Playwright E2E tests and CI workflow.
- Evidence files under `.omo/evidence/`.

### Definition of Done (verifiable conditions with commands)
- `git status --short` reviewed before and after every wave; unrelated changes preserved.
- `npm ci` exits 0.
- `npm test` exits 0.
- `npm run test:coverage` exits 0 and meets configured thresholds.
- `npm run test:e2e` exits 0.
- `npm audit --audit-level=high` exits 0, or residual dev-only audit findings are documented in `.omo/evidence/final-audit-exception.md` with package name, advisory, exploit surface, and deferral owner.
- HTTP QA artifacts captured for `/api/env`, `/api/status`, `/api/chat`, invalid chat payload, rate-limit exhaustion, and unsupported method/preflight.
- Browser QA screenshots captured for safe happy path, red-flag path, unsupported-area path, and malformed-AI fallback path.

### Must Have
- TDD RED->GREEN for every production behavior change.
- Manual QA channel artifact for every criterion.
- API keys never exposed in `/api/env`, `/api/status`, `/api/chat` responses, localStorage, or browser-visible config.
- Medical guidance always framed as self-care information, not diagnosis.
- Red flags must block AI requests before cost is incurred.
- Production limiter must not rely on process-local memory.
- Local/test must remain runnable without Upstash credentials.

### Must NOT Have
- No React/TypeScript rewrite in this plan.
- No DB/auth/file-storage addition except Upstash Redis rate/cost limiting.
- No deletion of body-map SVG areas.
- No Netlify/Railway/Fly/Render config.
- No weakening/removing tests.
- No `as any`, `@ts-ignore`, or hidden error suppression if TypeScript is introduced by future work.
- No reverting unrelated dirty worktree changes.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.

- Test decision: TDD with Vitest for unit/integration, Playwright for E2E; dependency-only bumps are exempt from new RED tests only if no production behavior changes occur, but still require before/after audit/test evidence.
- QA policy: Every task has agent-executed HTTP, browser, or tmux scenarios.
- Evidence: `.omo/evidence/task-{N}-{slug}.{ext}` plus final consolidated `.omo/evidence/final-summary.md`.
- Manual QA channels:
  - HTTP: `curl -i` against a running local server.
  - Browser: Playwright/Chromium against the real page with screenshots.
  - tmux: long-running server/CI command transcript capture.

## Execution Strategy

### Parallel Execution Waves
> Target: 5-8 tasks per wave. This brownfield repo has shared files, so waves are constrained by file ownership.

Wave 0: Task 1 only.
Wave 1: Tasks 2 and 3. Task 4 starts after Task 2 because both touch package files.
Wave 2: Tasks 5 and 6 sequentially because both touch `lib/openrouter-proxy.cjs`.
Wave 3: Tasks 7, 8, and 9 with strict ownership. If one worker cannot coordinate renderer ownership, run Task 7 -> Task 8 -> Task 9 sequentially.
Wave 4: Tasks 10 and 11 after API/UI contracts are stable.
Final Wave: F1-F4.

### Dependency Matrix

| Task | Blocks | Blocked By |
|---|---|---|
| 1 Baseline | 2,3,4,5,6,7,8,9,10,11 | none |
| 2 Dependency security patch | 4,10,11 | 1 |
| 3 Env/deployment contract | 6,10 | 1 |
| 4 Playwright scaffold | 10,11 | 1,2 |
| 5 API validation/errors | 6,11 | 1 |
| 6 Durable limiter | 10,11 | 3,5 |
| 7 Safety copy/red flags | 8,11 | 1 |
| 8 Structured AI output | 11 | 7 |
| 9 MVP body-area filter | 11 | 1 |
| 10 CI/Vercel readiness | final | 2,3,4,6 |
| 11 Full E2E scenarios | final | 4,6,8,9,10 |

## TODOs

- [x] 1. Capture Baseline And Ownership Ledger

  **What to do**: Before any implementation, capture current git state and command baseline. Create `.omo/evidence/baseline.md` with dirty worktree summary, package/audit status, and existing test result. Mark all pre-existing modified/untracked files as user-owned unless this plan later assigns them.

  **Must NOT do**: Do not edit source files. Do not run formatters. Do not reset/checkout/revert anything.

  **Parallelization**: Can Parallel: NO | Wave 0 | Blocks: all tasks | Blocked By: none

  **References**:
  - Pattern: `AGENTS.md` - existing project safety invariants and commands.
  - Pattern: `.omo/drafts/mvp-stabilization-plan.md` - planning notepad and skill/gap decisions.
  - Pattern: `package.json:6-12` - baseline commands.

  **Acceptance Criteria**:
  - [ ] `.omo/evidence/baseline.md` contains `git status --short`, `npm test`, `npm audit --json`, and `npm outdated --json` summaries.
  - [ ] Baseline records that unrelated dirty files must not be reverted.

  **QA Scenarios**:
  ```text
  Scenario: Baseline command transcript
    Tool: tmux
    Steps:
      tmux new-session -d -s ulw-qa-baseline 'cd /Users/smpain/Developer/github.com/trigger_test && git status --short && npm test && npm audit --json > .omo/evidence/task-1-audit.json; npm outdated --json > .omo/evidence/task-1-outdated.json || true'
      tmux capture-pane -p -t ulw-qa-baseline -S -2000 > .omo/evidence/task-1-baseline-tmux.txt
    Expected: transcript contains test summary and command exits are recorded in baseline notes.
    Evidence: .omo/evidence/task-1-baseline-tmux.txt

  Scenario: Dirty worktree preservation ledger
    Tool: bash
    Steps: git status --short > .omo/evidence/task-1-git-status.txt
    Expected: file exists and no destructive git command was run.
    Evidence: .omo/evidence/task-1-git-status.txt
  ```

  **Commit**: NO | Message: n/a | Files: `.omo/evidence/*`

- [x] 2. Patch Dependency Security Baseline

  **What to do**: Update dependencies with the smallest safe scope. Keep Express on 4.x by setting `express` to the latest 4.x patched range available to npm. Update `vitest` and `@vitest/coverage-v8` together to the same latest 4.x version. Update `jsdom` only if the existing jsdom tests remain green. Update `package-lock.json` with `npm install`. Record before/after `npm audit --json`.

  **Must NOT do**: Do not migrate to Express 5. Do not add Playwright here. Do not edit source code in this task.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4,10,11 | Blocked By: 1

  **References**:
  - Pattern: `package.json:23-31` - current dependency set.
  - Pattern: `vitest.config.js:4-20` - current Vitest/jsdom configuration.
  - External: Express 5 migration guide is deferred; do not apply Express 5 behavior changes.

  **Acceptance Criteria**:
  - [ ] `package.json` and `package-lock.json` updated only for dependency patching.
  - [ ] `npm test` exits 0.
  - [ ] `npm audit --audit-level=high` exits 0 or residual finding is documented with a deferral rationale.
  - [ ] No production source files changed by this task.

  **QA Scenarios**:
  ```text
  Scenario: Dependency patch command evidence
    Tool: tmux
    Steps:
      tmux new-session -d -s ulw-qa-deps 'cd /Users/smpain/Developer/github.com/trigger_test && npm install && npm test && npm audit --audit-level=high'
      tmux capture-pane -p -t ulw-qa-deps -S -3000 > .omo/evidence/task-2-deps-tmux.txt
    Expected: transcript shows install, test pass, and audit status.
    Evidence: .omo/evidence/task-2-deps-tmux.txt

  Scenario: Express 5 not introduced
    Tool: bash
    Steps: node -e "const p=require('./package.json'); if (!/^\\^?4\\./.test(p.dependencies.express)) process.exit(1)"
    Expected: command exits 0.
    Evidence: append command/result to .omo/evidence/task-2-deps-tmux.txt
  ```

  **Commit**: YES | Message: `chore(deps): patch security baseline` | Files: `package.json`, `package-lock.json`

- [x] 3. Add Public/Private Runtime Env Contract

  **What to do**: Add `.env.example` and update `README.md` deployment notes documenting public/private config. Include exact variables: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `MAX_TOKENS=800`, `TEMPERATURE=1`, `DAILY_REQUEST_LIMIT=20`, `MONTHLY_REQUEST_LIMIT=200`, `SERVER_RATE_LIMIT_MAX=20`, `SERVER_RATE_LIMIT_WINDOW_SECONDS=86400`, `MAX_CHAT_MESSAGES=6`, `MAX_CHAT_MESSAGE_CHARS=2000`, `MAX_CHAT_BODY_BYTES=16384`, `ENABLE_AI_QA=false`, `ENABLE_DETAILED_ANALYSIS=true`, `ALLOWED_ORIGINS`, `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`, `RATE_LIMIT_STORE=memory|upstash`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REQUIRE_DURABLE_RATE_LIMIT=true`.

  **Must NOT do**: Do not include real secrets. Do not expose Upstash token through `/api/env`. Do not change runtime behavior yet.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6,10 | Blocked By: 1

  **References**:
  - Pattern: `lib/client-config.cjs` - public env whitelist.
  - Pattern: `lib/public-env-config.cjs` - public env payload wrapper.
  - Pattern: `api/env.js:22-24` - serverless env endpoint.
  - Pattern: `server.js:62-64` - local env endpoint.

  **Acceptance Criteria**:
  - [ ] `.env.example` exists and contains all variables above with comments separating server-only secrets from public config.
  - [ ] Tests assert `UPSTASH_REDIS_REST_TOKEN`, `OPENROUTER_API_KEY`, and other secrets are never included in `getPublicEnvPayload`.
  - [ ] README/deployment notes state Vercel is the only deployment target for this plan.

  **QA Scenarios**:
  ```text
  Scenario: Public env endpoint does not leak secrets
    Tool: HTTP call
    Steps:
      npm start in tmux on an available port with OPENROUTER_API_KEY=sk-secret UPSTASH_REDIS_REST_TOKEN=redis-secret
      curl -i http://127.0.0.1:<PORT>/api/env > .omo/evidence/task-3-env-http.txt
    Expected: HTTP 200 and body does not contain sk-secret or redis-secret.
    Evidence: .omo/evidence/task-3-env-http.txt

  Scenario: Env example has required limiter and quota variables
    Tool: bash
    Steps: node -e "const fs=require('fs'); const s=fs.readFileSync('.env.example','utf8'); for (const k of ['RATE_LIMIT_STORE','UPSTASH_REDIS_REST_URL','MAX_CHAT_BODY_BYTES','ENABLE_AI_QA=false']) if(!s.includes(k)) throw new Error(k)"
    Expected: command exits 0.
    Evidence: .omo/evidence/task-3-env-contract.txt
  ```

  **Commit**: YES | Message: `docs(config): document MVP runtime environment` | Files: `.env.example`, `README.md`, `tests/api-env.test.js`

- [x] 4. Add Playwright E2E Scaffold

  **What to do**: Add Playwright dev dependency and scripts: `test:e2e` and `test:e2e:headed`. Add `playwright.config.js` with Chromium-only project, `webServer` using `npm start`, and port from `PORT` defaulting to 3000. Add `tests/e2e/README.md` documenting screenshot/evidence policy.

  **Must NOT do**: Do not write final workflow tests in this task beyond a smoke test that loads `/`. Do not edit app behavior.

  **Parallelization**: Can Parallel: NO | Wave 1 after Task 2 | Blocks: 10,11 | Blocked By: 1,2

  **References**:
  - Pattern: `package.json:6-12` - scripts section.
  - Pattern: `server.js:83-92` - local server startup behavior.
  - Pattern: `index.html:18-23` - visible header text for smoke assertion.

  **Acceptance Criteria**:
  - [ ] `npm run test:e2e` exists and exits 0.
  - [ ] Smoke E2E opens `/` and verifies `AI 셀프 마사지 가이드` is visible.
  - [ ] Screenshot saved to `.omo/evidence/task-4-homepage.png` during QA.

  **QA Scenarios**:
  ```text
  Scenario: E2E smoke loads real page
    Tool: Browser use
    Steps:
      npm run test:e2e -- --grep "homepage smoke"
      Playwright action: page.goto('/'); expect h1 text "AI 셀프 마사지 가이드"; screenshot .omo/evidence/task-4-homepage.png
    Expected: test exits 0 and screenshot exists.
    Evidence: .omo/evidence/task-4-homepage.png

  Scenario: E2E script is CI-safe
    Tool: tmux
    Steps:
      tmux new-session -d -s ulw-qa-e2e 'cd /Users/smpain/Developer/github.com/trigger_test && npm run test:e2e'
      tmux capture-pane -p -t ulw-qa-e2e -S -2000 > .omo/evidence/task-4-e2e-tmux.txt
    Expected: transcript shows Playwright pass.
    Evidence: .omo/evidence/task-4-e2e-tmux.txt
  ```

  **Commit**: YES | Message: `test(e2e): add browser workflow scaffold` | Files: `package.json`, `package-lock.json`, `playwright.config.js`, `tests/e2e/*`

- [x] 5. Harden Chat API Validation And Error Contract

  **What to do**: Introduce explicit chat request validation in `lib/openrouter-proxy.cjs`. Enforce: body is object, `messages` array length 1-6, roles only `system|user|assistant`, content non-empty string, each content <= 2,000 chars, total serialized body <= 16 KB. Add local Express JSON parser limit in `server.js` as `express.json({ limit: '16kb' })` and add an Express JSON parse error handler returning HTTP 413 with `{ error, code: 'PAYLOAD_TOO_LARGE' }` for oversized bodies. Add local `OPTIONS /api/chat` handling in `server.js` matching Vercel preflight. Sanitize upstream and catch errors so user-facing responses never include API keys, upstream raw internals, stack traces, or `details` in production. Keep tests able to inspect stable `error`, `code`, and `retryAfterSeconds` fields.

  **Must NOT do**: Do not change OpenRouter prompt content or response rendering here. Do not implement durable limiter here.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 6,11 | Blocked By: 1

  **References**:
  - Pattern: `lib/openrouter-proxy.cjs:25-35` - replace/extend current validation.
  - Pattern: `lib/openrouter-proxy.cjs:136-182` - response contract and error path.
  - Pattern: `server.js:11-12` - Express JSON parser.
  - Tests: `tests/openrouter-api.test.js`, `tests/server-routes.test.js`.

  **Acceptance Criteria**:
  - [ ] Test written first in `tests/openrouter-api.test.js` for invalid role, empty content, too many messages, overlong content, and body too large; tests fail before implementation and pass after.
  - [ ] `/api/chat` returns 400 with stable code for validation errors.
  - [ ] `/api/chat` returns sanitized upstream errors without secret/internal leakage.
  - [ ] `npm test -- tests/openrouter-api.test.js tests/server-routes.test.js` exits 0.

  **QA Scenarios**:
  ```text
  Scenario: Invalid chat payload rejected
    Tool: HTTP call
    Steps:
      curl -i -X POST http://127.0.0.1:<PORT>/api/chat -H 'Content-Type: application/json' --data '{"messages":[{"role":"hacker","content":"x"}]}' > .omo/evidence/task-5-invalid-chat-http.txt
    Expected: HTTP 400 and JSON contains validation error code, not OpenRouter call output.
    Evidence: .omo/evidence/task-5-invalid-chat-http.txt

  Scenario: Body limit rejected
    Tool: HTTP call
    Steps:
      node -e "console.log(JSON.stringify({messages:[{role:'user',content:'x'.repeat(20000)}]}))" > .omo/evidence/task-5-large-body.json
      curl -i -X POST http://127.0.0.1:<PORT>/api/chat -H 'Content-Type: application/json' --data-binary @.omo/evidence/task-5-large-body.json > .omo/evidence/task-5-large-body-http.txt
    Expected: HTTP 413; body contains code PAYLOAD_TOO_LARGE and no secret.
    Evidence: .omo/evidence/task-5-large-body-http.txt
  ```

  **Commit**: YES | Message: `fix(api): validate chat requests and sanitize errors` | Files: `lib/openrouter-proxy.cjs`, `server.js`, `api/chat.js`, `tests/openrouter-api.test.js`, `tests/server-routes.test.js`

- [x] 6. Add Durable Rate And Cost Limiter Adapter

  **What to do**: Add `lib/rate-limit-store.cjs`, used by `lib/openrouter-proxy.cjs`. Support `RATE_LIMIT_STORE=memory` for local/test and `RATE_LIMIT_STORE=upstash` for production. Upstash mode uses env `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; production with `REQUIRE_DURABLE_RATE_LIMIT=true` and missing/unavailable Upstash fails closed with HTTP 503. Normalize `x-forwarded-for` by taking the first comma-separated IP, trimming, and falling back to `x-real-ip` or socket address. Enforce daily/monthly request limits and estimated token budget using input char estimate plus `MAX_TOKENS`. Keep tests mock-backed; do not require real Upstash credentials.

  **Must NOT do**: Do not store request contents or health data in Redis. Store only anonymous client/window counters. Do not add DB/auth.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 10,11 | Blocked By: 3,5

  **References**:
  - Pattern: `lib/openrouter-proxy.cjs:66-130` - current key/window/rate logic to replace behind adapter.
  - Tests: `tests/openrouter-api.test.js` rate-limit cases.
  - Env: `.env.example` from Task 3.

  **Acceptance Criteria**:
  - [ ] TDD tests written first for IP normalization, memory mode, Upstash mock success, Upstash missing env fail-closed in production, and monthly/daily exhaustion.
  - [ ] Local/test default remains memory and existing tests do not need network.
  - [ ] Production Upstash outage returns 503 with safe retry message.
  - [ ] No API key, prompt, or pain text is persisted by limiter code.

  **QA Scenarios**:
  ```text
  Scenario: Daily rate limit exhaustion via HTTP
    Tool: HTTP call
    Steps:
      Start a mock OpenRouter server in tmux: node -e "require('http').createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{message:{content:'ok'}}],usage:{total_tokens:1}}))}).listen(3999)"
      Start local app in tmux with OPENROUTER_API_KEY=sk-test OPENROUTER_BASE_URL=http://127.0.0.1:3999 DAILY_REQUEST_LIMIT=1 SERVER_RATE_LIMIT_MAX=1 RATE_LIMIT_STORE=memory.
      curl -i -X POST http://127.0.0.1:<PORT>/api/chat -H 'Content-Type: application/json' -H 'x-forwarded-for: 203.0.113.10, 10.0.0.1' --data '{"messages":[{"role":"user","content":"목 통증"}]}' > .omo/evidence/task-6-rate-first-http.txt
      Repeat same curl > .omo/evidence/task-6-rate-second-http.txt
    Expected: first response is HTTP 200 with output "ok"; second response is HTTP 429 with Retry-After.
    Evidence: .omo/evidence/task-6-rate-first-http.txt, .omo/evidence/task-6-rate-second-http.txt

  Scenario: Production durable limiter missing env fails closed
    Tool: HTTP call
    Steps:
      Start local server with NODE_ENV=production RATE_LIMIT_STORE=upstash REQUIRE_DURABLE_RATE_LIMIT=true and no UPSTASH vars.
      curl -i -X POST http://127.0.0.1:<PORT>/api/chat -H 'Content-Type: application/json' --data '{"messages":[{"role":"user","content":"목 통증"}]}' > .omo/evidence/task-6-durable-missing-http.txt
    Expected: HTTP 503 with safe limiter configuration message and no secret.
    Evidence: .omo/evidence/task-6-durable-missing-http.txt
  ```

  **Commit**: YES | Message: `feat(api): add durable rate limit adapter` | Files: `lib/rate-limit-store.cjs`, `lib/openrouter-proxy.cjs`, `.env.example`, tests

- [x] 7. Expand Red-Flag Safety And Always-Visible Medical Copy

  **What to do**: Add `src/browser/red-flags.js` exporting deterministic red-flag pattern data and `hasRedFlagText(description)`. Update `src/browser/analysis-flow.js` to use that module. Red flags must cover chest pain, breathing trouble, fever, trauma, severe numbness, weakness/paralysis, bowel/bladder changes, and rapidly worsening pain in Korean and English variants. Add visible result-area copy: `이 도구는 진단이 아니며 응급 증상이 있으면 즉시 119 또는 의료기관에 문의하세요.` Always show stop criteria and care-seeking criteria on non-red-flag results. Red flags must block AI requests before usage counters or OpenRouter calls.

  **Must NOT do**: Do not ask AI to decide emergency status before deterministic checks. Do not present guidance as diagnosis.

  **Parallelization**: Can Parallel: CONDITIONAL | Wave 3 | Blocks: 8,11 | Blocked By: 1

  **References**:
  - Pattern: `src/browser/analysis-flow.js:19-24` - current pre-AI red-flag block.
  - Pattern: `src/browser/analysis-flow.js:91-116` - current pattern list.
  - Pattern: `src/browser/analysis-renderer.js:39-57` - warning renderer.
  - Pattern: `index.html:333-336` - red-flag warning DOM.
  - Tests: `tests/analysis-flow.test.js`, `tests/prompts.test.js`.

  **Acceptance Criteria**:
  - [ ] Table-driven red-flag tests written first and fail before implementation.
  - [ ] Safe non-red-flag result tests assert non-diagnosis and stop-care copy are visible.
  - [ ] Red-flag path does not call `window.openRouterConfig.makeRequest` and does not record usage.
  - [ ] `npm test -- tests/analysis-flow.test.js tests/prompts.test.js` exits 0.

  **QA Scenarios**:
  ```text
  Scenario: Red-flag browser path blocks AI
    Tool: Browser use
    Steps:
      Open http://127.0.0.1:<PORT>/.
      Click neck-front area.
      Fill #pain-description with "목이 아프고 숨이 차며 가슴 통증이 있습니다."
      Click #analyze-pain.
      Screenshot .omo/evidence/task-7-red-flag.png.
    Expected: red-flag warning visible, massage guide hidden, no network call to /api/chat.
    Evidence: .omo/evidence/task-7-red-flag.png and Playwright action log.

  Scenario: Safe result path shows medical disclaimer
    Tool: Browser use
    Steps:
      Mock /api/chat response with valid structured safe result.
      Select neck-front, enter "컴퓨터 작업을 오래 하면 목 뒤가 뻐근합니다.", click analyze.
      Screenshot .omo/evidence/task-7-safe-disclaimer.png.
    Expected: result view contains non-diagnosis copy plus stop/care criteria.
    Evidence: .omo/evidence/task-7-safe-disclaimer.png
  ```

  **Commit**: YES | Message: `fix(safety): expand red flag handling` | Files: `src/browser/red-flags.js`, `src/browser/analysis-flow.js`, `src/browser/analysis-renderer.js`, `index.html`, `styles/analysis.css`, `tests/analysis-flow.test.js`, `tests/prompts.test.js`

- [x] 8. Implement Structured AI Output Contract And Safe Fallback

  **What to do**: Update prompts and client parsing/rendering so the AI result is expected as JSON with:
  `targetMuscles: string[]`,
  `summary: string`,
  `steps: [{ title: string, method: string, duration: string, caution: string }]` with 1-4 steps,
  `stopIf: string[]`,
  `seekCareIf: string[]`,
  `disclaimer: string`.
  Parse/validate on the client before rendering. If invalid, empty, HTML/script-filled, overlong, or malformed JSON, render a safe fallback panel that says guidance could not be safely formatted and repeats generic stop/care criteria. Preserve sanitizer for all rendered strings.

  **Must NOT do**: Do not render raw model output as trusted HTML. Do not remove `setSafeHtml` unless replacing it with equally tested safe DOM rendering.

  **Parallelization**: Can Parallel: CONDITIONAL | Wave 3 | Blocks: 11 | Blocked By: 7

  **References**:
  - Pattern: `src/browser/analysis-ai.js:37-59` - current AI request/response path.
  - Pattern: `src/browser/analysis-ai.js:62-79` - current wrapper function.
  - Pattern: `src/browser/analysis-renderer.js:7-37` - current free-text rendering path.
  - Pattern: `lib/prompts.js:1-53` - prompt definitions.
  - Pattern: `src/browser/safe-html.js` - sanitizer to preserve.
  - Tests: `tests/safe-html.test.js`, `tests/prompts.test.js`.

  **Acceptance Criteria**:
  - [ ] Tests written first for valid schema, malformed JSON, empty output, script injection in structured fields, and more than 4 steps.
  - [ ] Valid structured response renders target muscles, summary, steps, stop criteria, care criteria, and disclaimer.
  - [ ] Invalid response renders safe fallback and never raw model HTML.
  - [ ] `npm test -- tests/safe-html.test.js tests/prompts.test.js` plus new renderer tests exits 0.

  **QA Scenarios**:
  ```text
  Scenario: Valid structured AI response renders cards
    Tool: Browser use
    Steps:
      Mock /api/chat to return JSON string with targetMuscles ["상부 승모근"], one step, stopIf, seekCareIf, disclaimer.
      Select shoulder-top-left, enter safe pain text, click analyze.
      Screenshot .omo/evidence/task-8-structured-valid.png.
    Expected: page shows structured step card and disclaimer, not raw JSON.
    Evidence: .omo/evidence/task-8-structured-valid.png

  Scenario: Malformed AI response falls back safely
    Tool: Browser use
    Steps:
      Mock /api/chat to return "<script>alert(1)</script>bad".
      Select neck-front, enter safe pain text, click analyze.
      Screenshot .omo/evidence/task-8-structured-fallback.png.
    Expected: safe fallback message visible; no script execution; raw script text not rendered as HTML.
    Evidence: .omo/evidence/task-8-structured-fallback.png
  ```

  **Commit**: YES | Message: `fix(ai): validate structured guidance output` | Files: `src/browser/analysis-ai.js`, `src/browser/analysis-renderer.js`, `lib/prompts.js`, tests

- [x] 9. Add MVP Body-Area Support Filter

  **What to do**: Add `src/browser/mvp-area-support.js` with support metadata for MVP-supported areas without deleting the existing SVG. Supported groups: neck, shoulder, upper back, lower back, hip/pelvis. Exact supported area prefixes/ids: `neck-`, `shoulder-`, `shoulder-blade-`, `shoulder-top-`, `upper-back-`, `mid-back-`, `lower-back-`, `sacral`, `pelvis-`, `buttock-`. When a user clicks unsupported areas, do not add them to selected areas; show a non-alarming notice: `이 부위는 현재 MVP에서 지원 준비 중입니다. 응급 증상이 있으면 의료기관에 문의하세요.` Supported areas remain selectable.

  **Must NOT do**: Do not remove SVG elements. Do not block red-flag text handling because an area is unsupported.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 11 | Blocked By: 1

  **References**:
  - Pattern: `index.html:42` and body SVG areas - preserve SVG.
  - Pattern: `src/browser/selection-ui.js` - selection validation/controller.
  - Pattern: `src/browser/selection-events.js` - body-map click handling.
  - Pattern: `src/browser/selection-renderer.js` - selected area UI.
  - Pattern: `lib/area-display.js` - area labels.
  - Tests: `tests/selection-ui.test.js`, `tests/script.test.js`.

  **Acceptance Criteria**:
  - [ ] Tests written first for supported neck selection and unsupported wrist/foot selection.
  - [ ] Unsupported areas are not added to `appState.painData.selectedAreas`.
  - [ ] User sees unsupported notice.
  - [ ] Supported areas still render selected badges and can be cleared.

  **QA Scenarios**:
  ```text
  Scenario: Supported area can be selected
    Tool: Browser use
    Steps:
      Open page, click `[data-area="neck-front"]`, screenshot .omo/evidence/task-9-supported-area.png.
    Expected: selected count is 1 and label is visible.
    Evidence: .omo/evidence/task-9-supported-area.png

  Scenario: Unsupported area shows notice and is not selected
    Tool: Browser use
    Steps:
      Open page, click `[data-area="wrist-left"]`, screenshot .omo/evidence/task-9-unsupported-area.png.
    Expected: selected count remains 0 and unsupported MVP notice is visible.
    Evidence: .omo/evidence/task-9-unsupported-area.png
  ```

  **Commit**: YES | Message: `feat(ui): limit selectable areas to MVP scope` | Files: `src/browser/mvp-area-support.js`, `src/browser/selection-ui.js`, `src/browser/selection-events.js`, `src/browser/selection-renderer.js`, `styles/selection.css`, `tests/selection-ui.test.js`, `tests/script.test.js`

- [x] 10. Add CI And Vercel Deployment Readiness

  **What to do**: Add `.github/workflows/ci.yml` with Node 22, `npm ci`, `npm test`, `npm run test:e2e`, and `npm audit --audit-level=high`. Add minimal `vercel.json` with only `"version": 2` and any required Node/serverless function runtime configuration for `api/*.js`; do not add rewrites unless local testing proves Vercel needs them, and if a rewrite is required it must map only `/api/*` to existing `api/*.js`. Update README deployment checklist to include required server-only env vars, public config vars, Upstash production requirement, and the fact that Netlify/Railway/Fly/Render are out of scope for this stabilization pass.

  **Must NOT do**: Do not add deploy secrets. Do not add other platform configs. Do not require real OpenRouter/Upstash credentials in CI tests.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: final | Blocked By: 2,3,4,6

  **References**:
  - Pattern: `README.md` deployment/environment sections.
  - Pattern: `package.json:6-12` after Task 4 scripts.
  - Pattern: `api/*.js` and `server.js` deployment surfaces.

  **Acceptance Criteria**:
  - [ ] CI workflow exists and uses Node 22.
  - [ ] CI workflow installs Playwright Chromium if `test:e2e` requires browser binaries.
  - [ ] `vercel.json` does not introduce alternate API routes or expose secrets.
  - [ ] README states production requires `RATE_LIMIT_STORE=upstash` and Upstash envs.

  **QA Scenarios**:
  ```text
  Scenario: CI commands pass locally
    Tool: tmux
    Steps:
      tmux new-session -d -s ulw-qa-ci 'cd /Users/smpain/Developer/github.com/trigger_test && npm ci && npm test && npm run test:e2e && npm audit --audit-level=high'
      tmux capture-pane -p -t ulw-qa-ci -S -4000 > .omo/evidence/task-10-ci-local-tmux.txt
    Expected: transcript shows all CI commands pass or records approved audit exception.
    Evidence: .omo/evidence/task-10-ci-local-tmux.txt

  Scenario: Vercel config and env docs contain no secrets
    Tool: bash
    Steps: rg -n "sk-[A-Za-z0-9]|UPSTASH_REDIS_REST_TOKEN=[A-Za-z0-9]" vercel.json README.md .env.example > .omo/evidence/task-10-secret-scan.txt || true
    Expected: evidence file is empty; placeholders such as "<your-token>" are allowed.
    Evidence: .omo/evidence/task-10-secret-scan.txt
  ```

  **Commit**: YES | Message: `ci: add MVP stabilization checks` | Files: `.github/workflows/ci.yml`, `vercel.json`, `README.md`

- [x] 11. Add Full E2E And Manual QA Workflows

  **What to do**: Add final Playwright tests for four real workflows: safe happy path, red-flag path, unsupported-area path, and malformed-AI fallback path. Use route mocking for `/api/chat` where needed so tests do not call OpenRouter. Capture screenshots into `.omo/evidence/` during manual QA. Add `scripts/manual-qa-http.sh` containing exact `curl -i` commands for `/api/env`, `/api/status`, `/api/chat`, OPTIONS, invalid method, invalid origin, validation error, and rate-limit exhaustion.

  **Must NOT do**: Do not depend on real OpenRouter API key for automated tests. Do not skip browser screenshots.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: final | Blocked By: 4,6,8,9,10

  **References**:
  - Pattern: `index.html:27-345` - user-facing workflow.
  - Pattern: `api/chat.js:45-67` - Vercel chat method handling.
  - Pattern: `api/env.js:6-34`, `api/status.js:6-13` - HTTP QA endpoints.
  - Pattern: `tests/openrouter-api.test.js` - API behavior cases.

  **Acceptance Criteria**:
  - [ ] `npm run test:e2e` passes with happy, red-flag, unsupported-area, malformed fallback scenarios.
  - [ ] HTTP QA artifacts exist for `/api/env`, `/api/status`, `/api/chat`, OPTIONS, invalid method, invalid origin, validation failure, and rate limit.
  - [ ] Browser screenshots exist for all four UI scenarios.

  **QA Scenarios**:
  ```text
  Scenario: Full browser happy path
    Tool: Browser use
    Steps:
      Playwright: page.goto('/'); click neck-front; fill safe pain text; mock /api/chat valid JSON; click analyze; screenshot .omo/evidence/task-11-happy.png.
    Expected: structured guidance, disclaimer, stop criteria, and seek-care criteria visible.
    Evidence: .omo/evidence/task-11-happy.png

  Scenario: Full API route matrix
    Tool: HTTP call
    Steps:
      curl -i http://127.0.0.1:<PORT>/api/env > .omo/evidence/task-11-env-http.txt
      curl -i http://127.0.0.1:<PORT>/api/status > .omo/evidence/task-11-status-http.txt
      curl -i -X OPTIONS http://127.0.0.1:<PORT>/api/chat > .omo/evidence/task-11-options-http.txt
      curl -i -X GET http://127.0.0.1:<PORT>/api/chat > .omo/evidence/task-11-method-http.txt
      curl -i -X POST http://127.0.0.1:<PORT>/api/chat -H 'Origin: https://evil.example' -H 'Content-Type: application/json' --data '{"messages":[{"role":"user","content":"목 통증"}]}' > .omo/evidence/task-11-origin-http.txt
    Expected: env/status 200 no secrets; OPTIONS allowed; GET returns 405 where applicable; evil origin returns 403 where applicable.
    Evidence: .omo/evidence/task-11-*-http.txt
  ```

  **Commit**: YES | Message: `test(e2e): cover MVP safety workflows` | Files: `tests/e2e/*`, `scripts/manual-qa-http.sh`

## Final Verification Wave (MANDATORY - after ALL implementation tasks)
> ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. Plan Compliance Audit
  - Confirm every task acceptance criterion has evidence under `.omo/evidence/`.
  - Confirm every production behavior change has RED->GREEN proof recorded in `.omo/evidence/final-red-green-ledger.md`.
  - Confirm no task implemented React/TypeScript rewrite or unrelated refactors.

- [x] F2. Code Quality Review
  - Run `npm test`, `npm run test:coverage`, `npm run test:e2e`, `npm audit --audit-level=high`.
  - Run `git diff --stat` and verify changes match task file ownership.
  - Check `lib/openrouter-proxy.cjs`, limiter adapter, renderer, and red-flag flow for complexity and secret leakage.

- [x] F3. Real Manual QA
  - Start app in tmux: `PORT=3000 npm start`.
  - Run all HTTP curl scenarios from Task 11.
  - Run browser scenarios for happy path, red-flag path, unsupported-area path, malformed AI fallback.
  - Save screenshots and HTTP transcripts under `.omo/evidence/`.
  - Tear down tmux/server sessions and record `tmux ls` cleanup receipt.

- [x] F4. Scope Fidelity Check
  - Verify no DB/auth/file storage was added.
  - Verify no Netlify/Railway/Fly/Render config was added.
  - Verify SVG body areas were not deleted.
  - Verify `.env.example` contains placeholders only.
  - Verify dirty worktree unrelated changes were not reverted.

## Commit Strategy
- Use one atomic conventional commit per TODO unless two tasks intentionally share package-lock ownership.
- Do not auto-commit unless the user preauthorizes commits.
- Suggested final commit order:
  1. `chore(deps): patch security baseline`
  2. `docs(config): document MVP runtime environment`
  3. `test(e2e): add browser workflow scaffold`
  4. `fix(api): validate chat requests and sanitize errors`
  5. `feat(api): add durable rate limit adapter`
  6. `fix(safety): expand red flag handling`
  7. `fix(ai): validate structured guidance output`
  8. `feat(ui): limit selectable areas to MVP scope`
  9. `ci: add MVP stabilization checks`
  10. `test(e2e): cover MVP safety workflows`
- Final commit footer for plan-driven work: `Plan: .omo/plans/mvp-stabilization-from-assessment.md`

## Success Criteria
- Plan executor can start without reading ignored `docs/` assessment.
- All tasks have concrete file ownership, acceptance criteria, QA scenarios, evidence paths, and commit guidance.
- Implementation delivers MVP stabilization without broad rewrite.
- Public deployment blockers from the assessment are either fixed or documented with explicit deferral and residual risk.
- Final user-facing behavior is proven by automated tests and real HTTP/browser manual QA, not tests alone.
