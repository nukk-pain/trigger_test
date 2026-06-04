# First-Pass Refactor Plan

## TL;DR
> Summary:      Complete the 10 requested refactors as a behavior-preserving first pass across the browser app, runtime config, server proxy, styles, status UI, and server rate limiting. Based on exploration, partial work already exists in `lib/prompts.js`, `src/browser/app-state.js`, `styles/base.css`, and updated runtime config files; executors must preserve and finish that work, not restart it.
> Deliverables:
> - Split browser modules under `src/browser/` with `script.js` left as a thin entry point
> - Safe DOM rendering with no inline `onclick` and no unsafe `innerHTML` in app modules
> - OpenRouter-only runtime names, canonical `lib/` config/env modules, extracted medical prompts
> - Shared OpenRouter proxy helpers, `/api/status`, and best-effort server rate limiting
> - Split CSS load order with `styles/base.css` before feature styles
> Effort:       Medium
> Risk:         Medium - multiple dirty/partial browser and config changes must be preserved while changing globals, module loading, and proxy behavior.

## Scope
### Must have
- Preserve the current static HTML/CSS/JS app and Express/Vercel API architecture; do not migrate to React or TypeScript.
- Preserve Korean medical safety copy, red-flag UI visibility, and the rule that generated output is guidance, not diagnosis.
- Preserve API-key safety: `/api/env`, `/api/config`, `/api/status`, client modules, browser storage, and test/evidence output must not expose `OPENROUTER_API_KEY`.
- Continue from current dirty worktree state:
  - `src/browser/app-state.js:1` already exists as the state module seed.
  - `lib/prompts.js:1` already exists as the medical prompt module seed.
  - `config.js:1` and `env-loader.js:1` are already thin ESM wrappers around `lib/`.
  - `styles/base.css:1` already exists, but `index.html:8` still only loads `styles.css`.
  - `tests/refactor-guards.test.js:9` and `tests/prompts.test.js:1` exist as guard tests.
- Use `src/browser/` for browser app modules, `lib/` for canonical testable config/env/prompt modules, and CommonJS `.cjs` helpers under `lib/server/` for code shared by `server.js` and Vercel API handlers.
- Add `/api/status` for non-sensitive server proxy status. It must not call OpenRouter by default and must not reveal the key.
- Add first-pass server rate limiting as unauthenticated, per-client, fixed-window, in-memory limiting. Key derivation: first `x-forwarded-for` value, else `req.ip`, else socket remote address, else `unknown`. This is best-effort for Vercel warm instances and must be documented in code/test expectations, not presented as durable abuse protection.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do not delete or overwrite untracked/dirty files without reading them first.
- Do not change `package.json` module type.
- Do not expose API keys client-side or in public API responses.
- Do not delete `api/gemini.js` in this pass; keep it as a compatibility re-export unless a separate removal task is requested.
- Do not add React, TypeScript, bundlers, DOMPurify, express-rate-limit, or other new product dependencies for this first pass.
- Do not claim full medical diagnosis, emergency triage, or durable production rate limiting.
- Do not redesign the UI; CSS splitting is file organization plus load order, not a visual rewrite.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: TDD + Vitest/jsdom guard tests first, tests-after for server/status/rate-limit additions, Playwright real Chrome smoke QA for browser-visible flows.
- QA policy: every task has agent-executed scenarios
- Evidence: `.omo/evidence/task-<N>-<slug>.<ext>`

## Execution strategy
### Parallel execution waves
> Target 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks to maximize parallelism.

Wave 1 (no dependencies):
- Task 3: remove legacy provider aliases
- Task 4: finish config/env dedupe through canonical `lib/` modules
- Task 6: finish medical prompt extraction
- Task 7: complete browser state module
- Task 8: split CSS load order

Wave 2 (after Wave 1):
- Task 1: depends [3, 6, 7]
- Task 5: depends [4]
- Task 9: depends [3, 4, 5]

Wave 3 (after Wave 2):
- Task 2: depends [1, 6, 7]
- Task 10: depends [5, 9]

Critical path: Task 4 -> Task 5 -> Task 9 -> Task 10

### Dependency matrix
| Task | Depends on | Blocks | Can parallelize with |
|------|------------|--------|----------------------|
| 1    | 3, 6, 7    | 2      | 5, 9                |
| 2    | 1, 6, 7    | Final  | 10                  |
| 3    | none       | 1, 9   | 4, 6, 7, 8          |
| 4    | none       | 5, 9   | 3, 6, 7, 8          |
| 5    | 4          | 9, 10  | 1                   |
| 6    | none       | 1, 2   | 3, 4, 7, 8          |
| 7    | none       | 1, 2   | 3, 4, 6, 8          |
| 8    | none       | Final  | 3, 4, 6, 7          |
| 9    | 3, 4, 5    | 10     | 1                   |
| 10   | 5, 9       | Final  | 2                   |

## Todos
> Implementation + Test = ONE task. Never separate.
> Every task MUST have: References + Acceptance Criteria + QA Scenarios + Commit.

- [ ] 1. Split `script.js` into browser modules

  What to do: Turn `script.js` into a thin entry point that imports `src/browser/app-state.js`, `selection-ui.js`, `analysis-flow.js`, `notifications.js`, `guide-modal.js`, and `init.js`. Move selection/body-map logic, analysis orchestration, notifications/dialogs, and guide modal code into those modules. Keep `script.js` responsible only for bootstrapping on `DOMContentLoaded`. Continue using existing pure helpers from `lib/utils.js` and `lib/analysis.js`.
  Must NOT do: Do not change visible workflow, selectors, SVG data attributes, safety text, or OpenRouter request payloads. Do not introduce framework code.

  Parallelization: Can parallel: NO | Wave 2 | Blocks: [2] | Blocked by: [3, 6, 7]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `script.js:1` - current imports and partial state-module import to preserve.
  - Pattern:  `script.js:77` - current app event registration to move into `src/browser/init.js`.
  - Pattern:  `script.js:221` - body-map and selected-area behavior to move into `src/browser/selection-ui.js`.
  - Pattern:  `script.js:431` - analysis orchestration to move into `src/browser/analysis-flow.js`.
  - Pattern:  `script.js:871` - notification/dialog/loading behavior to move into `src/browser/notifications.js`.
  - Pattern:  `script.js:1084` - guide modal behavior to move into `src/browser/guide-modal.js`.
  - API/Type: `src/browser/app-state.js:1` - shared mutable browser state seed.
  - Test:     `tests/refactor-guards.test.js:10` - guard for state import and removing `window.currentGuide`.
  - Test:     `tests/runtime-config.test.js:21` - runtime browser config smoke flow.

  Acceptance criteria (agent-executable only):
  - [ ] `wc -l script.js` reports 250 lines or fewer.
  - [ ] `rg -n "function (setupBodyMapEvents|analyzePain|showNotification|startInteractiveGuide|getGuideSteps)" script.js` returns no matches.
  - [ ] `npm test -- tests/refactor-guards.test.js tests/runtime-config.test.js tests/script.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  > Name the exact tool AND its exact invocation - not "verify it works". Browser use: use Chrome to drive the page; if Chrome is not available, download and use agent-browser (https://github.com/vercel-labs/agent-browser). Computer use: OS-level GUI automation for a non-browser desktop app.
  ```
  Scenario: split entry still boots in Chrome and selection works
    Tool:     playwright(real Chrome)
    Steps:    PORT=3101 npm start > .omo/evidence/task-1-browser-server.log 2>&1 & echo $! > .omo/evidence/task-1-browser.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage(); await page.goto('http://127.0.0.1:3101', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); await page.fill('#pain-description', '컴퓨터 작업을 오래 하면 목이 아파요.'); const count = await page.locator('#selection-count').textContent(); const text = await page.locator('#live-selection-text').textContent(); console.log(JSON.stringify({ count, text })); if (!String(count).includes('1개') || !String(text).includes('1개')) process.exit(1); await browser.close();" | tee .omo/evidence/task-1-script-split.txt; kill $(cat .omo/evidence/task-1-browser.pid)
    Expected: command exits 0; evidence JSON includes `"count"` and `"text"` values containing `1개`
    Evidence: .omo/evidence/task-1-script-split.txt

  Scenario: invalid Step 1 still fails without selected area
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/script.test.js -t "should fail with no selected areas" | tee .omo/evidence/task-1-script-split-error.txt
    Expected: command exits 0; assertion message remains "아픈 곳을 선택해 주세요."
    Evidence: .omo/evidence/task-1-script-split-error.txt
  ```

  Commit: YES | Message: `refactor(browser): split script entry into modules` | Files: [script.js, src/browser/app-state.js, src/browser/init.js, src/browser/selection-ui.js, src/browser/analysis-flow.js, src/browser/notifications.js, src/browser/guide-modal.js, tests/refactor-guards.test.js, tests/runtime-config.test.js]

- [ ] 2. Remove unsafe `innerHTML` and inline handlers

  What to do: Replace all inline `onclick=` templates and unsafe `innerHTML` assignments in browser app modules with DOM construction and `addEventListener`. Add a dedicated safe renderer for AI markdown output, e.g. `src/browser/safe-html.js`, that accepts the HTML returned by `formatAIResponse`, parses it with `DOMParser`, allowlists expected tags/classes, and appends nodes. Use `textContent` for all user input, error messages, guide content, selected area names, and notification text.
  Must NOT do: Do not remove markdown formatting support from AI results. Do not pass raw AI output, user text, or `error.message` into `innerHTML`.

  Parallelization: Can parallel: NO | Wave 3 | Blocks: [] | Blocked by: [1, 6, 7]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `script.js:64` - startup error overlay currently uses `innerHTML` and inline handlers.
  - Pattern:  `script.js:203` - AI answer container currently inserts dynamic HTML.
  - Pattern:  `script.js:521` - GPT result rendering currently assigns formatted HTML.
  - Pattern:  `script.js:629` - red-flag AI reason currently inserts dynamic text through `innerHTML`.
  - Pattern:  `script.js:706` - trigger-point card currently templates multiple dynamic fields and inline guide button.
  - Pattern:  `script.js:902` - notification currently inserts dynamic message and inline close handler.
  - Pattern:  `script.js:972` - server proxy dialog currently templates error text and buttons.
  - Pattern:  `script.js:1090` - guide modal currently templates dynamic guide content and inline close handler.
  - Test:     `tests/refactor-guards.test.js:10` - guard checks no `onclick=`.
  - Test:     `tests/script.test.js:35` - `formatAIResponse` tests define the HTML formatting surface to preserve.
  - External: `https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML` - `innerHTML` is an injection sink.
  - External: `https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement` - DOM construction API to follow.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "onclick=|\\.innerHTML\\s*=" script.js src/browser --glob '!src/browser/safe-html.js'` returns no matches.
  - [ ] `npm test -- tests/refactor-guards.test.js tests/script.test.js` exits 0.
  - [ ] Add a test proving `<script>` or `onerror=` in AI output is not rendered as executable markup by the safe renderer.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: safe renderer preserves AI formatting without inline handlers
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/refactor-guards.test.js tests/script.test.js | tee .omo/evidence/task-2-safe-dom.txt
    Expected: command exits 0; guard test passes and markdown formatting tests still pass
    Evidence: .omo/evidence/task-2-safe-dom.txt

  Scenario: injected event attributes are stripped
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/safe-html.test.js -t "strips unsafe tags and attributes" | tee .omo/evidence/task-2-safe-dom-error.txt
    Expected: command exits 0; rendered output contains no script tag and no onerror attribute
    Evidence: .omo/evidence/task-2-safe-dom-error.txt
  ```

  Commit: YES | Message: `refactor(browser): replace unsafe html rendering` | Files: [script.js, src/browser/safe-html.js, src/browser/notifications.js, src/browser/guide-modal.js, src/browser/analysis-flow.js, src/browser/selection-ui.js, tests/refactor-guards.test.js, tests/safe-html.test.js]

- [ ] 3. Remove legacy provider aliases

  What to do: Complete the OpenRouter-only runtime rename. Use `window.openRouterConfig` everywhere in browser runtime and tests. Remove `window.openaiConfig`, `window.geminiConfig`, and exported `OpenAIConfig` compatibility names. Rename API-key-facing method names only where tests and call sites are updated together: prefer `isServerProxyReady()` and `testServerProxy()` while preserving `getApiKey()`/`setApiKey()` only if they remain as hard-failing safety methods in `EnvLoader` for compatibility with existing tests. Keep `OPENAI_API_KEY` and `GEMINI_API_KEY` scrubbing as defensive storage cleanup even after runtime aliases are removed.
  Must NOT do: Do not delete `api/gemini.js`; it remains a server endpoint compatibility re-export. Do not stop stripping old secret names from localStorage.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [1, 9] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `config.js:1` - current thin runtime wrapper sets `window.openRouterConfig`.
  - Pattern:  `lib/config.js:37` - partial replacement methods `isServerProxyReady()` and `testServerProxy()`.
  - Pattern:  `script.js:48` - browser runtime already uses `window.openRouterConfig`.
  - Pattern:  `api/gemini.js:1` - compatibility endpoint to keep.
  - Test:     `tests/refactor-guards.test.js:18` - guard expects no `openaiConfig`, `geminiConfig`, or `OpenAIConfig`.
  - Test:     `tests/runtime-config.test.js:12` - runtime config test was partially updated to delete/use `openRouterConfig`.
  - Test:     `tests/config.test.js:76` - existing tests still use old `hasApiKey` semantics and must be aligned.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "openaiConfig|geminiConfig|OpenAIConfig" config.js script.js lib tests --glob '!tests/refactor-guards.test.js'` returns no matches.
  - [ ] `rg -n "OPENAI_API_KEY|GEMINI_API_KEY" lib/env-loader.js env-loader.js tests/env-loader.test.js` still shows defensive scrubbing/tests.
  - [ ] `npm test -- tests/refactor-guards.test.js tests/runtime-config.test.js tests/config.test.js tests/env-loader.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: runtime exposes only OpenRouter config
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/refactor-guards.test.js tests/runtime-config.test.js | tee .omo/evidence/task-3-provider-aliases.txt
    Expected: command exits 0; guard confirms OpenRouter names and runtime config initializes
    Evidence: .omo/evidence/task-3-provider-aliases.txt

  Scenario: old secret names remain scrubbed from storage
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/env-loader.test.js -t "should save config without server proxy" | tee .omo/evidence/task-3-provider-aliases-error.txt
    Expected: command exits 0; saved localStorage config omits OPENAI_API_KEY, GEMINI_API_KEY, and OPENROUTER_API_KEY when present
    Evidence: .omo/evidence/task-3-provider-aliases-error.txt
  ```

  Commit: YES | Message: `refactor(config): use openrouter runtime names` | Files: [config.js, lib/config.js, script.js, tests/config.test.js, tests/runtime-config.test.js, tests/refactor-guards.test.js, tests/env-loader.test.js]

- [ ] 4. Finish root-vs-`lib` config/env dedupe

  What to do: Make `lib/config.js` and `lib/env-loader.js` the canonical browser implementations. Keep root `config.js` and `env-loader.js` as ESM wrappers that instantiate globals. Change `index.html` to load both as `type="module"` before `script.js`. Ensure `lib/env-loader.js` contains the complete safety scrub set (`OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`) and compatibility helpers (`getMaxOutputTokens()` if tests or runtime need it).
  Must NOT do: Do not duplicate class definitions back into root files. Do not expose secret values in the wrapper globals.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [5, 9] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `config.js:1` - current root wrapper imports from `./lib/config.js`.
  - Pattern:  `env-loader.js:1` - current root wrapper imports from `./lib/env-loader.js`.
  - Pattern:  `index.html:344` - current non-module script tags that must become module scripts.
  - API/Type: `lib/config.js:3` - canonical `OpenRouterConfig` class.
  - API/Type: `lib/env-loader.js:1` - canonical `EnvLoader` and `UsageTracker`.
  - Test:     `tests/refactor-guards.test.js:39` - guard expects root wrappers and module script tags.
  - Test:     `tests/runtime-config.test.js:5` - runtime loader currently evals scripts and must be updated for ESM import semantics.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "^class OpenRouterConfig|^class EnvLoader|^class UsageTracker" config.js env-loader.js` returns no matches.
  - [ ] `rg -n "type=\"module\" src=\"env-loader.js\"|type=\"module\" src=\"config.js\"" index.html` returns both module script tags before `script.js`.
  - [ ] `npm test -- tests/refactor-guards.test.js tests/runtime-config.test.js tests/config.test.js tests/env-loader.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: root wrappers delegate to canonical lib modules
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/refactor-guards.test.js tests/runtime-config.test.js | tee .omo/evidence/task-4-config-dedupe.txt
    Expected: command exits 0; root wrappers import lib modules and runtime globals initialize
    Evidence: .omo/evidence/task-4-config-dedupe.txt

  Scenario: failed public env fetch still falls back safely
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/env-loader.test.js -t "should fallback to localStorage when both APIs fail" | tee .omo/evidence/task-4-config-dedupe-error.txt
    Expected: command exits 0; fallback loads non-secret config from localStorage only
    Evidence: .omo/evidence/task-4-config-dedupe-error.txt
  ```

  Commit: YES | Message: `refactor(config): canonicalize env and runtime modules` | Files: [config.js, env-loader.js, index.html, lib/config.js, lib/env-loader.js, tests/runtime-config.test.js, tests/refactor-guards.test.js, tests/config.test.js, tests/env-loader.test.js]

- [ ] 5. Share OpenRouter proxy logic

  What to do: Create `lib/server/openrouter-proxy.cjs` with pure helpers for public config, base URL normalization, message validation, headers, request body, upstream response mapping, and error envelopes. Use it from both `server.js` and `api/chat.js`. For `api/chat.js`, import the CommonJS helper without changing `package.json` module type. Keep `api/gemini.js` as `export { default } from './chat.js';`.
  Must NOT do: Do not change the `/api/chat` response shape for successful requests: `{ output, usage }`. Do not change 400/401 semantics.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [9, 10] | Blocked by: [4]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `server.js:56` - local base URL and proxy helper duplication.
  - Pattern:  `server.js:74` - local message validation duplication.
  - Pattern:  `server.js:85` - local OpenRouter header construction duplication.
  - Pattern:  `server.js:102` - local OpenRouter body construction duplication.
  - Pattern:  `server.js:133` - local `/api/chat` route to refactor through helper.
  - Pattern:  `api/chat.js:7` - Vercel base URL duplication.
  - Pattern:  `api/chat.js:19` - Vercel message validation duplication.
  - Pattern:  `api/chat.js:30` - Vercel header construction duplication.
  - Pattern:  `api/chat.js:47` - Vercel body construction duplication.
  - Test:     `tests/openrouter-api.test.js:54` - proxy contract and secret non-exposure tests.
  - External: `https://openrouter.ai/docs/api-reference/chat-completion` - OpenRouter chat completion contract.
  - External: `https://vercel.com/docs/functions/functions-api-reference` - Vercel handler reference.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "function (buildOpenRouterHeaders|buildHeaders|buildOpenRouterBody|buildRequestBody|validateMessages)" server.js api/chat.js` returns no matches.
  - [ ] `npm test -- tests/openrouter-api.test.js tests/api-env.test.js` exits 0.
  - [ ] New tests cover helper behavior for invalid messages, missing key, upstream error, and successful output extraction.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: serverless proxy still forwards valid chat requests
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/openrouter-api.test.js -t "proxies chat messages to OpenRouter without exposing the key" | tee .omo/evidence/task-5-shared-proxy.txt
    Expected: command exits 0; forwarded URL is /chat/completions and response body has output and usage only
    Evidence: .omo/evidence/task-5-shared-proxy.txt

  Scenario: invalid requests never call upstream or leak key
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/openrouter-api.test.js -t "rejects invalid messages and never exposes OpenRouter keys" | tee .omo/evidence/task-5-shared-proxy-error.txt
    Expected: command exits 0; invalid messages return 400, missing key returns 401, fetch is not called for invalid input
    Evidence: .omo/evidence/task-5-shared-proxy-error.txt
  ```

  Commit: YES | Message: `refactor(api): share openrouter proxy helpers` | Files: [lib/server/openrouter-proxy.cjs, server.js, api/chat.js, api/gemini.js, tests/openrouter-api.test.js]

- [ ] 6. Finish medical prompt extraction

  What to do: Use `lib/prompts.js` as the only source for `MEDICAL_PROMPTS`. `lib/config.js` should import and re-export it. Root `config.js` should attach imported prompts to `window.MEDICAL_PROMPTS`. Move the inline AI question helper system prompt from `script.js:1071` into the prompt module as `AI_QUESTION`. Ensure prompt tests assert red-flag language, self-care framing, and no diagnosis framing.
  Must NOT do: Do not weaken red-flag wording, remove "즉시 병원 방문", or remove "의학적 진단은 하지 말고" safety guidance.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [1, 2] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `lib/prompts.js:1` - current extracted medical prompt seed.
  - Pattern:  `lib/config.js:1` - current import from prompt module.
  - Pattern:  `config.js:1` - root wrapper imports prompts through config module.
  - Pattern:  `script.js:554` - red-flag prompt usage.
  - Pattern:  `script.js:582` - pain-analysis prompt usage.
  - Pattern:  `script.js:1071` - inline AI question prompt to extract.
  - Test:     `tests/prompts.test.js:1` - prompt safety tests.
  - Test:     `tests/config.test.js:260` - legacy prompt export tests to keep aligned.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "당신은 트리거 포인트 치료 전문가|근골격계 물리치료 전문가|의료 응급상황 판단 전문가" script.js lib/config.js config.js` returns no matches.
  - [ ] `npm test -- tests/prompts.test.js tests/config.test.js tests/runtime-config.test.js` exits 0.
  - [ ] `tests/prompts.test.js` asserts `RED_FLAG_CHECK`, `PAIN_ANALYSIS`, and `AI_QUESTION` safety language.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: prompt module exports safety prompts
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/prompts.test.js tests/config.test.js -t "MEDICAL_PROMPTS" | tee .omo/evidence/task-6-prompts.txt
    Expected: command exits 0; prompt tests include red-flag and self-care assertions
    Evidence: .omo/evidence/task-6-prompts.txt

  Scenario: runtime still attaches prompts without exposing keys
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/runtime-config.test.js | tee .omo/evidence/task-6-prompts-error.txt
    Expected: command exits 0; `window.MEDICAL_PROMPTS.RED_FLAG_CHECK` is available and request body contains no API key
    Evidence: .omo/evidence/task-6-prompts-error.txt
  ```

  Commit: YES | Message: `refactor(prompts): centralize medical prompt templates` | Files: [lib/prompts.js, lib/config.js, config.js, script.js, tests/prompts.test.js, tests/config.test.js, tests/runtime-config.test.js]

- [ ] 7. Complete state module and remove window guide state

  What to do: Expand `src/browser/app-state.js` so it owns `currentStep`, `painData`, and `currentGuide` with small setter/reset helpers. Replace `const painData = appState.painData` patterns that break when reset replaces nested state; either mutate stable nested objects or always read via accessors. Replace all `window.currentGuide` uses with state helpers. Add focused tests for reset preserving access semantics and guide navigation state.
  Must NOT do: Do not attach app state to `window`. Do not leave stale object references after reset.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [1, 2] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - API/Type: `src/browser/app-state.js:1` - current state module seed.
  - Pattern:  `script.js:6` - current local `painData` alias risk after reset.
  - Pattern:  `script.js:868` - current step reset assignment.
  - Pattern:  `script.js:1117` - current `window.currentGuide` assignment.
  - Pattern:  `script.js:1213` - current guide read from `window`.
  - Pattern:  `script.js:1256` - current guide navigation writes to `window`.
  - Pattern:  `script.js:1280` - current guide clear writes to `window`.
  - Test:     `tests/refactor-guards.test.js:10` - guard requires `window.currentGuide` removal.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "window\\.currentGuide|const painData = appState\\.painData" script.js src/browser` returns no matches.
  - [ ] `npm test -- tests/app-state.test.js tests/refactor-guards.test.js` exits 0.
  - [ ] A state test proves `resetPainData()` clears questionnaire, selected areas, and analysis without leaving stale selected-area references in selection UI code.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: state reset clears pain data and guide state
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/app-state.test.js tests/refactor-guards.test.js | tee .omo/evidence/task-7-state.txt
    Expected: command exits 0; app-state tests pass and guard finds no window.currentGuide
    Evidence: .omo/evidence/task-7-state.txt

  Scenario: stale selected-area references cannot survive reset
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/app-state.test.js -t "reset keeps state accessors fresh" | tee .omo/evidence/task-7-state-error.txt
    Expected: command exits 0; selected areas are empty after reset when read through exported accessor
    Evidence: .omo/evidence/task-7-state-error.txt
  ```

  Commit: YES | Message: `refactor(browser): centralize mutable app state` | Files: [src/browser/app-state.js, script.js, src/browser/guide-modal.js, src/browser/selection-ui.js, tests/app-state.test.js, tests/refactor-guards.test.js]

- [ ] 8. Split `styles.css`

  What to do: Finish a conservative CSS split. Load `styles/base.css` before `styles.css`. Move only reset/base/layout tokens from `styles.css` into `styles/base.css` and keep feature selectors in `styles.css` for this pass. If further split is useful, add `styles/status.css` and `styles/guide.css`, but preserve cascade by loading base first, feature files next, and the existing `styles.css` last until visual QA passes.
  Must NOT do: Do not redesign palette, spacing, component shapes, or responsive behavior. Do not remove selectors used by existing HTML/script modules.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `styles.css:1` - reset and base styles currently duplicated with new base file.
  - Pattern:  `styles/base.css:1` - current base stylesheet seed.
  - Pattern:  `styles.css:55` - AI status selectors to keep available.
  - Pattern:  `styles.css:408` - body map selectors to keep available.
  - Pattern:  `styles.css:856` - `.hidden` utility selector required by red-flag UI.
  - Pattern:  `styles.css:1019` - loading overlay selectors.
  - Pattern:  `styles.css:1114` - notification selectors.
  - Pattern:  `styles.css:2749` - guide modal selectors.
  - Pattern:  `index.html:8` - current single stylesheet link.
  - Test:     `tests/refactor-guards.test.js:46` - CSS split/load-order guard.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "href=\"styles/base.css\"|href=\"styles.css\"" index.html` shows base before styles.
  - [ ] `npm test -- tests/refactor-guards.test.js` exits 0.
  - [ ] `node -e "const fs=require('fs'); const i=fs.readFileSync('index.html','utf8'); process.exit(i.indexOf('styles/base.css') < i.indexOf('styles.css') ? 0 : 1)"` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: stylesheet load order is base before feature styles
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/refactor-guards.test.js -t "splits CSS" | tee .omo/evidence/task-8-css-split.txt
    Expected: command exits 0; guard verifies `styles/base.css` is linked before `styles.css`
    Evidence: .omo/evidence/task-8-css-split.txt

  Scenario: required feature selectors remain present
    Tool:     bash
    Steps:    (rg -n "^\\.hidden|^\\.body-map|^\\.notification-message|^\\.interactive-guide-modal|^\\.ai-status" styles.css styles/*.css && printf "selectors present\n") | tee .omo/evidence/task-8-css-split-error.txt
    Expected: command exits 0; output includes all five selector families
    Evidence: .omo/evidence/task-8-css-split-error.txt
  ```

  Commit: YES | Message: `refactor(styles): split base stylesheet` | Files: [index.html, styles.css, styles/base.css, tests/refactor-guards.test.js]

- [ ] 9. Add server proxy status endpoint and UI

  What to do: Add non-sensitive `/api/status` to both Express (`server.js`) and Vercel (`api/status.js`). Response shape: `{ success: true, data: { proxyConfigured: boolean, model: string, limits: { daily, monthly }, rateLimit: { windowSeconds, maxRequests }, environment: "local"|"vercel" } }`. Update `updateAIStatus()` and header status UI to fetch `/api/status` after env initialization and display one of: "서버 프록시 준비됨", "서버 프록시 설정 필요", or "요청 제한 적용 중". Do not perform a live OpenRouter test request automatically.
  Must NOT do: Do not expose `OPENROUTER_API_KEY`, partial key strings, or upstream account data. Do not block app bootstrap solely because `/api/status` fails if `/api/env` succeeded.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [10] | Blocked by: [3, 4, 5]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `index.html:16` - existing AI/server status mount point.
  - Pattern:  `script.js:142` - current status updater based only on runtime readiness.
  - Pattern:  `lib/config.js:37` - current server proxy readiness helper seed.
  - Pattern:  `server.js:119` - local public env endpoint pattern.
  - Pattern:  `api/env.js:19` - Vercel public env endpoint pattern.
  - Test:     `tests/api-env.test.js:42` - public config must not expose keys.
  - Test:     `tests/runtime-config.test.js:21` - runtime config fetch/test pattern.
  - External: `https://expressjs.com/en/guide/using-middleware` - Express route/middleware ordering reference.

  Acceptance criteria (agent-executable only):
  - [ ] `curl -s http://localhost:3000/api/status` during local server QA returns JSON with `proxyConfigured` and no `OPENROUTER_API_KEY`.
  - [ ] `npm test -- tests/api-status.test.js tests/api-env.test.js tests/runtime-config.test.js` exits 0.
  - [ ] A runtime test covers status failure fallback without throwing during initialization.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: status endpoint returns non-sensitive local config
    Tool:     bash | curl
    Steps:    PORT=3109 npm start > .omo/evidence/task-9-status-server.log 2>&1 & echo $! > .omo/evidence/task-9-status.pid; sleep 2; curl -s http://localhost:3109/api/status | tee .omo/evidence/task-9-status.txt; kill $(cat .omo/evidence/task-9-status.pid)
    Expected: JSON contains `"success":true` and `"proxyConfigured"`; JSON does not contain `OPENROUTER_API_KEY` or `sk-`
    Evidence: .omo/evidence/task-9-status.txt

  Scenario: missing proxy is shown as configured false without leaking key
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/api-status.test.js -t "returns proxyConfigured false without a key" | tee .omo/evidence/task-9-status-error.txt
    Expected: command exits 0; body has `proxyConfigured: false` and no key material
    Evidence: .omo/evidence/task-9-status-error.txt
  ```

  Commit: YES | Message: `feat(status): expose non-sensitive proxy status` | Files: [server.js, api/status.js, lib/server/openrouter-proxy.cjs, script.js, src/browser/status-ui.js, tests/api-status.test.js, tests/runtime-config.test.js]

- [ ] 10. Add server-side rate limiting

  What to do: Add `lib/server/rate-limit.cjs` with a small fixed-window limiter. Apply it to Express `/api/chat` and the Vercel `api/chat.js` handler after method/message validation and missing-key checks, before the upstream OpenRouter fetch. Default max requests should come from `SERVER_RATE_LIMIT_MAX` if set, else `DAILY_REQUEST_LIMIT`, else `50`; window defaults to `SERVER_RATE_LIMIT_WINDOW_SECONDS` else `86400`. Return HTTP 429 with body `{ error: "서버 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.", retryAfterSeconds, limit, windowSeconds }` and `Retry-After`.
  Must NOT do: Do not rate-limit `/api/env`, `/api/config`, `/api/status`, static assets, 400 invalid-message requests, or 401 missing-key responses in this first pass. Do not claim persistence across Vercel cold starts.

  Parallelization: Can parallel: YES | Wave 3 | Blocks: [] | Blocked by: [5, 9]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `server.js:133` - local chat route integration point.
  - Pattern:  `api/chat.js:71` - serverless validation and missing-key integration point.
  - Pattern:  `lib/env-loader.js:201` - existing client-side usage limiting; server limiter is additive.
  - Pattern:  `tests/openrouter-api.test.js:110` - invalid and missing-key behavior that must remain before rate limiting.
  - Pattern:  `package.json:23` - only Express dependency exists; do not add package dependency.
  - External: `https://expressjs.com/en/guide/writing-middleware.html` - Express middleware contract.

  Acceptance criteria (agent-executable only):
  - [ ] `npm test -- tests/rate-limit.test.js tests/openrouter-api.test.js` exits 0.
  - [ ] Rate-limit tests prove first valid request passes, request over limit returns 429 with `Retry-After`, invalid messages still return 400 without consuming quota, missing key still returns 401 without consuming quota.
  - [ ] `rg -n "express-rate-limit|rateLimit\\(" package.json package-lock.json` returns no matches.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: over-limit chat request returns 429
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/rate-limit.test.js -t "returns 429 after the configured valid request limit" | tee .omo/evidence/task-10-rate-limit.txt
    Expected: command exits 0; response status is 429 and body includes retryAfterSeconds, limit, and windowSeconds
    Evidence: .omo/evidence/task-10-rate-limit.txt

  Scenario: invalid and missing-key requests keep existing behavior
    Tool:     bash
    Steps:    set -o pipefail; npm test -- tests/rate-limit.test.js -t "does not consume quota for invalid or missing-key requests" | tee .omo/evidence/task-10-rate-limit-error.txt
    Expected: command exits 0; invalid request returns 400, missing-key returns 401, next valid request is not prematurely limited
    Evidence: .omo/evidence/task-10-rate-limit-error.txt
  ```

  Commit: YES | Message: `feat(api): rate limit server proxy requests` | Files: [lib/server/rate-limit.cjs, server.js, api/chat.js, tests/rate-limit.test.js, tests/openrouter-api.test.js, api/status.js]

## Final verification wave (MANDATORY - after all implementation tasks)
> Runs in PARALLEL. ALL must APPROVE. Surface results to the caller and wait for an explicit "okay" before declaring complete.
- [ ] F1. Plan compliance audit - every task done, every acceptance criterion met
- [ ] F2. Code quality review - diagnostics clean, idioms match, no dead code
- [ ] F3. Real manual QA - every QA scenario executed with evidence captured
- [ ] F4. Scope fidelity - nothing extra shipped beyond Must-Have, nothing Must-NOT-Have introduced

## Commit strategy
- One logical change per commit. Conventional Commits (`<type>(<scope>): <subject>` body + footer).
- Atomic: every commit builds and passes tests on its own.
- No "WIP" / "fix typo squash later" commits on the final branch - clean up before merge.
- Reference the plan file path in the final commit footer: `Plan: .omo/plans/refactor10-first-pass.md`.

## Success criteria
- All 10 refactor tasks are complete, `npm test` and task-specific Vitest suites pass, and no guard test remains expected-failing.
- The app still loads, selects body areas, submits analysis through `/api/chat`, displays safety/status states, and never exposes API keys in browser/public API responses.
- F1-F4 approve with evidence under `.omo/evidence/`, and commit history contains one clean conventional commit per task with the plan footer.
