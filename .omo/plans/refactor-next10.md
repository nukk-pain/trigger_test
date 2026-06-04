# Next 10 Refactor Targets

## TL;DR
> Summary:      Execute the next 10 refactoring targets in the requested order while preserving the static JS/Express/Vercel architecture, medical safety messaging, and API-key secrecy. Defaults applied: `/api/config` becomes a deprecated local compatibility alias, and `/api/gemini` is deprecated rather than removed because external consumers cannot be proven absent from repo-only evidence.
> Deliverables:
> - Further split CSS into ordered feature files with `styles.css` as the manifest
> - Split browser analysis flow, utility helpers, static data, and EnvLoader tests by responsibility
> - Share status payload logic across Express and Vercel handlers
> - Document and test client usage estimates versus server-enforced rate limits
> - Harden the safe HTML allowlist and deprecate legacy API surfaces without leaking secrets
> Effort:       Large
> Risk:         Medium - endpoint compatibility and CSS cascade order are easy to regress without contract tests and real browser evidence.

## Scope
### Must have
- Preserve the requested target order: task numbers 1-10 are the intended commit order even when read-only prep can happen in parallel.
- Before each task, re-read the current dirty worktree. If another agent or the user has already started that target, reconcile with those changes and judge completion by this plan's acceptance criteria instead of overwriting or restarting the work.
- Preserve the current vanilla HTML/CSS/ESM browser app and Express/Vercel API architecture; do not migrate to React, TypeScript, Vite, or a bundler.
- Preserve API-key secrecy: no client response, browser storage, logs used as evidence, or test fixture may expose `OPENROUTER_API_KEY`.
- Keep `/api/env` as the canonical non-sensitive runtime config endpoint.
- Keep medical safety copy and red-flag UI visible when analysis flow code moves.
- Keep generated guidance framed as self-care guidance, not medical diagnosis.
- Preserve existing untracked local artifacts unless a task explicitly owns a file: `.omo/ulw-loop/`, `AGENTS.md`, and `codemaps/data.md` are read-only context for this plan.
- Use characterization tests before moving behavior where coverage is currently thin.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do not remove `/api/config` in this pass; deprecate it and remove browser dependency on it.
- Do not delete `/api/gemini` in this pass; deprecate it and prove the alias remains secret-safe.
- Do not add product dependencies such as DOMPurify, sanitize-html, express-rate-limit, Playwright, React, TypeScript, or CSS build tools.
- Do not change `package.json` module type.
- Do not rewrite visual design while splitting CSS.
- Do not reorder CSS rules casually; preserve current override order for duplicate selectors and responsive blocks.
- Do not remove localStorage `UsageTracker`; clarify that it is a client-side estimate, not a security control.
- Do not claim durable production abuse protection for the in-memory server rate limit.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: TDD for API contracts, sanitizer hardening, usage/rate-limit semantics, and test splitting; characterization-then-refactor for CSS, analysis flow, `lib/utils.js`, and `lib/data.js`; framework is Vitest + jsdom with real Chrome smoke QA through Playwright CLI.
- QA policy: every task has agent-executed scenarios
- Evidence: `.omo/evidence/task-<N>-<slug>.<ext>`

## Execution strategy
### Parallel execution waves
> Target 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks to maximize parallelism.

Wave 1 (no dependencies):
- Task 1: further split `styles.css`
- Task 3: split `lib/utils.js` behind a compatibility barrel
- Task 5: split `tests/env-loader.test.js`
- Task 8: tighten `safe-html` allowlist and tests

Wave 2 (after Wave 1):
- Task 2: depends [1, 3, 8]
- Task 4: depends [3]
- Task 6: depends [5]
- Task 7: depends [5, 6]

Wave 3 (after Wave 2):
- Task 9: depends [5, 6, 7]
- Task 10: depends [6, 9]

Critical path: Task 5 -> Task 6 -> Task 7 -> Task 9 -> Task 10

### Dependency matrix
| Task | Depends on | Blocks | Can parallelize with |
|------|------------|--------|----------------------|
| 1    | none       | 2      | 3, 5, 8              |
| 2    | 1, 3, 8    | Final  | 4, 6, 7              |
| 3    | none       | 2, 4   | 1, 5, 8              |
| 4    | 3          | Final  | 2, 6, 7              |
| 5    | none       | 6, 7, 9 | 1, 3, 8             |
| 6    | 5          | 7, 9, 10 | 2, 4               |
| 7    | 5, 6       | 9      | 2, 4                |
| 8    | none       | 2      | 1, 3, 5              |
| 9    | 5, 6, 7    | 10     | none                 |
| 10   | 6, 9       | Final  | none                 |

## Todos
> Implementation + Test = ONE task. Never separate.
> Every task MUST have: References + Acceptance Criteria + QA Scenarios + Commit.

- [ ] 1. Further split `styles.css`

  What to do: Convert `styles.css` into an ordered manifest containing only `@import` statements, then extract current rules into feature files without changing selectors or visual values. Create `styles/components/content.css`, `styles/components/questionnaire.css`, `styles/components/body-map.css`, `styles/components/results.css`, `styles/components/overlays.css`, `styles/components/guides.css`, and `styles/responsive.css`. Preserve the existing cascade by keeping duplicate selector overrides and all media-query blocks in their current relative order; the manifest order must be content, questionnaire, body-map, results, overlays, guides, responsive. Add or update guard tests so the import order is locked.
  Must NOT do: Do not redesign UI, change colors, rename classes, remove existing duplicate selector overrides, or add a CSS processor.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [2] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `index.html:8` - `styles/base.css` already loads before feature styles.
  - Pattern:  `index.html:9` - `styles.css` is the current second stylesheet and should remain the manifest URL.
  - Pattern:  `styles/base.css:1` - reset/base layer already split.
  - Pattern:  `styles.css:1` - pain input, AI status, markdown/content, header, progress, and step-section rules begin here.
  - Pattern:  `styles.css:353` - body-map, tabs, clickable areas, tooltip, and selected-area panel rules begin here.
  - Pattern:  `styles.css:839` - AI/server setup, dialogs, loading, notifications, startup error, troubleshooting, and usage display rules begin here.
  - Pattern:  `styles.css:1401` - enhanced questionnaire form/card/grid controls begin here.
  - Pattern:  `styles.css:2218` - live selection status, clickable-area improvements, and mobile body-map overrides begin here.
  - Pattern:  `styles.css:2659` - trigger-point guide, modal, and massage step-card rules begin here.
  - Pattern:  `styles.css:3039` - final mobile massage-card media block begins here.
  - Test:     `tests/refactor-guards.test.js:54` - existing guard verifies base stylesheet order.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f styles/components/content.css -a -f styles/components/questionnaire.css -a -f styles/components/body-map.css -a -f styles/components/results.css -a -f styles/components/overlays.css -a -f styles/components/guides.css -a -f styles/responsive.css` exits 0.
  - [ ] `node -e "const fs=require('fs'); const css=fs.readFileSync('styles.css','utf8').trim(); if(!css.startsWith('@import')) process.exit(1); if(!css.includes('components/body-map.css')||!css.includes('responsive.css')) process.exit(1); if(css.split('\\n').some(l=>l.trim() && !l.trim().startsWith('@import'))) process.exit(1);"` exits 0.
  - [ ] `npx vitest run tests/refactor-guards.test.js` exits 0 after adding assertions for the new CSS manifest order.

  QA scenarios (MANDATORY - task incomplete without these):
  > Name the exact tool AND its exact invocation - not "verify it works". Browser use: use Chrome to drive the page; if Chrome is not available, download and use agent-browser (https://github.com/vercel-labs/agent-browser). Computer use: OS-level GUI automation for a non-browser desktop app.
  ```
  Scenario: desktop CSS split preserves body-map selection
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3101 npm start > .omo/evidence/task-1-css-server.log 2>&1 & echo $! > .omo/evidence/task-1-css-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }); await page.goto('http://127.0.0.1:3101', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); const text = await page.locator('#live-selection-text').textContent(); await page.screenshot({ path: '.omo/evidence/task-1-css-desktop.png', fullPage: true }); if (!String(text).includes('1개')) process.exit(1); await browser.close();"; kill $(cat .omo/evidence/task-1-css-server.pid)
    Expected: command exits 0; screenshot shows the body map and selected-area state; `#live-selection-text` contains `1개`
    Evidence: .omo/evidence/task-1-css-desktop.png

  Scenario: mobile CSS split preserves responsive layout
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3102 npm start > .omo/evidence/task-1-css-mobile-server.log 2>&1 & echo $! > .omo/evidence/task-1-css-mobile-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); await page.goto('http://127.0.0.1:3102', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); await page.screenshot({ path: '.omo/evidence/task-1-css-mobile.png', fullPage: true }); const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth); if (overflow) process.exit(1); await browser.close();"; kill $(cat .omo/evidence/task-1-css-mobile-server.pid)
    Expected: command exits 0; no horizontal document overflow; screenshot captures a usable mobile body-map layout
    Evidence: .omo/evidence/task-1-css-mobile.png
  ```

  Commit: YES | Message: `refactor(styles): split feature stylesheets` | Files: [styles.css, styles/base.css, styles/components/content.css, styles/components/questionnaire.css, styles/components/body-map.css, styles/components/results.css, styles/components/overlays.css, styles/components/guides.css, styles/responsive.css, tests/refactor-guards.test.js]

- [ ] 2. Split `src/browser/analysis-flow.js`

  What to do: Add characterization tests for the current analysis happy path, quota failure, and red-flag warning renderer before moving code. Extract AI request/prompt assembly into `src/browser/analysis-service.js` and result/red-flag rendering into `src/browser/analysis-results.js`. Keep `src/browser/analysis-flow.js` focused on `analyzePain()` orchestration, loading/error handling, and usage display updates. Export renderer functions only where tests need them; keep the app import in `src/browser/app.js` unchanged. Remove or isolate dead helpers only after `rg` proves no call sites and tests prove behavior is unchanged.
  Must NOT do: Do not remove `#red-flag-warning`, weaken prompt safety strings, change `/api/chat` messages, or display generated guidance as diagnosis.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [] | Blocked by: [1, 3, 8]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/browser/app.js:3` - only imports `analyzePain` from `analysis-flow.js`.
  - Pattern:  `src/browser/app.js:95` - analysis starts after `validateStep1()` and `collectActionData()`.
  - Pattern:  `src/browser/analysis-flow.js:16` - public `analyzePain()` orchestration export to keep.
  - Pattern:  `src/browser/analysis-flow.js:80` - AI-only analysis path.
  - Pattern:  `src/browser/analysis-flow.js:95` - GPT result renderer to move.
  - Pattern:  `src/browser/analysis-flow.js:158` - prompt assembly and `window.openRouterConfig.makeRequest(...)` call to move into service.
  - Pattern:  `src/browser/analysis-flow.js:202` - red-flag warning renderer to preserve and test.
  - Pattern:  `src/browser/analysis-flow.js:274` - trigger-point DOM builder to move into result rendering module.
  - Pattern:  `index.html:330` - visible Korean red-flag warning panel.
  - API/Type: `lib/prompts.js:40` - red-flag safety prompt wording.
  - Test:     `tests/prompts.test.js:5` - prompt safety guard.
  - Test:     `tests/refactor-guards.test.js:18` - guard expects `analysis-flow.js` to export `analyzePain`.

  Acceptance criteria (agent-executable only):
  - [ ] `node -e "const fs=require('fs'); const n=fs.readFileSync('src/browser/analysis-flow.js','utf8').split('\\n').length; if(n>250){console.error(n);process.exit(1)}"` exits 0.
  - [ ] `rg -n "function (displayGPTResults|createTriggerPointElement|createFascialLineElement|displayMassageInstructions|displayAIAnalysis)" src/browser/analysis-flow.js` returns no matches.
  - [ ] `npx vitest run tests/analysis-flow.test.js tests/prompts.test.js tests/refactor-guards.test.js tests/runtime-config.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: analysis still renders mocked AI result
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3103 npm start > .omo/evidence/task-2-analysis-server.log 2>&1 & echo $! > .omo/evidence/task-2-analysis-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage(); await page.route('**/api/chat', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ output: '## 마사지 방법\\n- 부드럽게 중단 기준을 지키세요.' }) })); await page.goto('http://127.0.0.1:3103', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); await page.fill('#pain-description', '컴퓨터 작업을 오래 하면 목이 뻣뻣하고 어깨가 결립니다.'); await page.click('#analyze-pain'); await page.waitForSelector('.ai-analysis-result'); const text = await page.locator('#massage-steps').textContent(); await page.screenshot({ path: '.omo/evidence/task-2-analysis-happy.png', fullPage: true }); if (!text.includes('마사지 방법')) process.exit(1); await browser.close();"; kill $(cat .omo/evidence/task-2-analysis-server.pid)
    Expected: command exits 0; result view contains `마사지 방법` and screenshot captures the rendered analysis
    Evidence: .omo/evidence/task-2-analysis-happy.png

  Scenario: red-flag renderer remains visible and hides massage guide
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/analysis-flow.test.js -t "shows red flag warning" | tee .omo/evidence/task-2-analysis-red-flag.txt
    Expected: command exits 0; test proves `#red-flag-warning` loses `hidden` and `#massage-guide` is hidden
    Evidence: .omo/evidence/task-2-analysis-red-flag.txt
  ```

  Commit: YES | Message: `refactor(browser): split analysis flow modules` | Files: [src/browser/analysis-flow.js, src/browser/analysis-service.js, src/browser/analysis-results.js, tests/analysis-flow.test.js, tests/refactor-guards.test.js]

- [ ] 3. Split `lib/utils.js`

  What to do: Add characterization tests if any helper lacks focused coverage, then split pure utility concerns into `lib/utils/area-display-names.js`, `lib/utils/location-descriptions.js`, `lib/utils/format-ai-response.js`, `lib/utils/area-groups.js`, and `lib/utils/validation.js`. Keep `lib/utils.js` as a compatibility barrel that re-exports the same five public functions so existing imports continue to work. Update direct imports only where it materially reduces coupling without forcing churn across the browser modules.
  Must NOT do: Do not change helper names, Korean validation messages, markdown output shape, or unknown-code fallback behavior.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [2, 4] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - API/Type: `lib/utils.js:4` - `getAreaDisplayName(area)` lookup contract.
  - API/Type: `lib/utils.js:156` - `getLocationDescription(location)` lookup contract.
  - API/Type: `lib/utils.js:169` - `formatAIResponse(response)` markdown-to-HTML contract.
  - API/Type: `lib/utils.js:303` - `mapAreaToGroup(area)` contract used by analysis.
  - API/Type: `lib/utils.js:326` - `validateStep1(selectedAreas, painDescription)` validation contract.
  - Pattern:  `src/browser/analysis-flow.js:2` - browser analysis imports formatting and area display helpers.
  - Pattern:  `src/browser/selection-ui.js:1` - selection UI imports display and validation helpers.
  - Pattern:  `lib/analysis.js:4` - shared analysis imports `mapAreaToGroup`.
  - Test:     `tests/script.test.js:6` - area display tests.
  - Test:     `tests/script.test.js:35` - `formatAIResponse` tests.
  - Test:     `tests/script.test.js:80` - area group tests.
  - Test:     `tests/script.test.js:118` - validation tests.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f lib/utils/area-display-names.js -a -f lib/utils/location-descriptions.js -a -f lib/utils/format-ai-response.js -a -f lib/utils/area-groups.js -a -f lib/utils/validation.js` exits 0.
  - [ ] `node -e "const fs=require('fs'); const n=fs.readFileSync('lib/utils.js','utf8').split('\\n').length; if(n>40){console.error(n);process.exit(1)}"` exits 0.
  - [ ] `npx vitest run tests/script.test.js tests/runtime-config.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: utility barrel preserves all public exports
    Tool:     bash
    Steps:    set -o pipefail; node --input-type=module -e "import * as utils from './lib/utils.js'; const names=['getAreaDisplayName','getLocationDescription','formatAIResponse','mapAreaToGroup','validateStep1']; for (const name of names) { if (typeof utils[name] !== 'function') throw new Error(name); } console.log(names.join(','));" | tee .omo/evidence/task-3-utils-exports.txt
    Expected: command exits 0; output lists all five utility functions
    Evidence: .omo/evidence/task-3-utils-exports.txt

  Scenario: validation fallback messages stay unchanged
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/script.test.js -t "validateStep1" | tee .omo/evidence/task-3-utils-validation.txt
    Expected: command exits 0; Korean validation messages remain unchanged
    Evidence: .omo/evidence/task-3-utils-validation.txt
  ```

  Commit: YES | Message: `refactor(utils): split helper modules` | Files: [lib/utils.js, lib/utils/area-display-names.js, lib/utils/location-descriptions.js, lib/utils/format-ai-response.js, lib/utils/area-groups.js, lib/utils/validation.js, tests/script.test.js]

- [ ] 4. Split `lib/data.js`

  What to do: Split static data into `lib/data/trigger-points.js`, `lib/data/fascial-lines.js`, and `lib/data/red-flags.js`. Keep `lib/data.js` as a compatibility barrel re-exporting `triggerPointsDB`, `fascialLinesDB`, and `redFlagConditions`. Update `lib/analysis.js` only if importing from narrower modules makes dependencies clearer without breaking the barrel contract. Add or keep data integrity tests for minimum trigger-point coverage, required record fields, fascial-line shape, and red-flag condition export.
  Must NOT do: Do not edit medical content, rename data keys, shrink trigger-point coverage, or remove safety precautions.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [] | Blocked by: [3]

  References (executor has NO interview context - be exhaustive):
  - API/Type: `lib/data.js:4` - `triggerPointsDB` array export.
  - API/Type: `lib/data.js:280` - `fascialLinesDB` object export.
  - API/Type: `lib/data.js:305` - `redFlagConditions` export.
  - Pattern:  `lib/analysis.js:3` - analysis imports trigger/fascial data.
  - Test:     `tests/script.test.js:148` - trigger-point data shape tests.
  - Test:     `tests/script.test.js:198` - fascial-line data shape tests.
  - Test:     `tests/script.test.js:214` - trigger-point analysis depends on data.
  - Test:     `tests/script.test.js:305` - fascial-line analysis depends on data.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f lib/data/trigger-points.js -a -f lib/data/fascial-lines.js -a -f lib/data/red-flags.js` exits 0.
  - [ ] `node -e "const fs=require('fs'); const n=fs.readFileSync('lib/data.js','utf8').split('\\n').length; if(n>30){console.error(n);process.exit(1)}"` exits 0.
  - [ ] `npx vitest run tests/script.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: data barrel preserves trigger and fascial exports
    Tool:     bash
    Steps:    set -o pipefail; node --input-type=module -e "import { triggerPointsDB, fascialLinesDB, redFlagConditions } from './lib/data.js'; if (triggerPointsDB.length < 15) throw new Error('trigger coverage'); if (!Object.keys(fascialLinesDB).length) throw new Error('fascial lines'); if (!redFlagConditions.includes('chest-pain')) throw new Error('red flags'); console.log(JSON.stringify({ triggerPoints: triggerPointsDB.length, fascialLines: Object.keys(fascialLinesDB).length, redFlags: redFlagConditions.length }));" | tee .omo/evidence/task-4-data-exports.txt
    Expected: command exits 0; JSON reports at least 15 trigger points and includes red flags
    Evidence: .omo/evidence/task-4-data-exports.txt

  Scenario: data split preserves lower-back fascial analysis
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/script.test.js -t "should find matching fascial lines for lower-back" | tee .omo/evidence/task-4-data-fascial.txt
    Expected: command exits 0; lower-back still matches a fascial line
    Evidence: .omo/evidence/task-4-data-fascial.txt
  ```

  Commit: YES | Message: `refactor(data): split static datasets` | Files: [lib/data.js, lib/data/trigger-points.js, lib/data/fascial-lines.js, lib/data/red-flags.js, lib/analysis.js, tests/script.test.js]

- [ ] 5. Split `tests/env-loader.test.js`

  What to do: Split the 503-line mixed EnvLoader/UsageTracker suite into focused test files. Create `tests/env-loader-load.test.js` for `loadEnv()`, fetch fallback, and validation behavior; `tests/env-loader-accessors.test.js` for constructor, getters, storage scrubbing, and compatibility methods; and `tests/usage-tracker.test.js` for localStorage usage accounting. If helpers are needed, create `tests/helpers/env-loader-fixtures.js`; otherwise keep fixtures local. Delete or reduce `tests/env-loader.test.js` to zero duplicate tests.
  Must NOT do: Do not change production behavior only to make the split easy. Do not weaken API-key scrubbing assertions.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [6, 7, 9] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `tests/env-loader.test.js:4` - current `EnvLoader` suite begins.
  - Pattern:  `tests/env-loader.test.js:47` - env parsing tests.
  - Pattern:  `tests/env-loader.test.js:217` - localStorage load/scrub tests.
  - Pattern:  `tests/env-loader.test.js:272` - `loadEnv()` API fallback tests.
  - Pattern:  `tests/env-loader.test.js:320` - current `UsageTracker` suite begins.
  - API/Type: `lib/env-loader.js:14` - `EnvLoader.loadEnv()` implementation under test.
  - API/Type: `lib/env-loader.js:81` - localStorage config scrubbing.
  - API/Type: `lib/env-loader.js:158` - `UsageTracker` implementation.
  - Test:     `tests/setup.js:1` - shared Vitest/jsdom reset file configured globally.
  - External: `https://main.vitest.dev/guide/filtering` - official Vitest file and name filtering.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f tests/env-loader-load.test.js -a -f tests/env-loader-accessors.test.js -a -f tests/usage-tracker.test.js` exits 0.
  - [ ] `node -e "const fs=require('fs'); if (fs.existsSync('tests/env-loader.test.js') && fs.readFileSync('tests/env-loader.test.js','utf8').includes('describe(')) process.exit(1);"` exits 0.
  - [ ] `npx vitest run tests/env-loader-load.test.js tests/env-loader-accessors.test.js tests/usage-tracker.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: split EnvLoader suites pass together
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/env-loader-load.test.js tests/env-loader-accessors.test.js tests/usage-tracker.test.js | tee .omo/evidence/task-5-env-tests-split.txt
    Expected: command exits 0; all moved EnvLoader and UsageTracker tests pass
    Evidence: .omo/evidence/task-5-env-tests-split.txt

  Scenario: secret scrubbing regression remains covered
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/env-loader-accessors.test.js -t "without server proxy" | tee .omo/evidence/task-5-env-tests-secret.txt
    Expected: command exits 0; saved localStorage config omits `OPENROUTER_API_KEY` and legacy secret names
    Evidence: .omo/evidence/task-5-env-tests-secret.txt
  ```

  Commit: YES | Message: `test(env): split env loader suites` | Files: [tests/env-loader.test.js, tests/env-loader-load.test.js, tests/env-loader-accessors.test.js, tests/usage-tracker.test.js, tests/helpers/env-loader-fixtures.js]

- [ ] 6. Deduplicate `api/status.js` and `server.js` status payload

  What to do: Write tests first for a shared status payload contract. Add `lib/status-payload.cjs` exporting `getStatusPayload(env)` and use it from `server.js` with `envConfig` and from `api/status.js` with `process.env`. Keep Express `.env.local` support intact by passing the merged `envConfig` from `server.js`; do not make the shared helper read files. Preserve the existing response shape, numeric parsing, method handling, and key secrecy.
  Must NOT do: Do not change `/api/status` response shape, call OpenRouter from status, or expose any key material.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [7, 9, 10] | Blocked by: [5]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `server.js:55` - Express builds merged `envConfig` from `process.env` and `.env.local`.
  - Pattern:  `server.js:92` - local `/api/status` duplicate payload.
  - Pattern:  `api/status.js:1` - serverless duplicate payload builder.
  - Test:     `tests/api-env.test.js:57` - current serverless status contract tests.
  - Test:     `tests/api-env.test.js:64` - key secrecy and payload shape assertions.
  - Test:     `tests/openrouter-api.test.js:144` - server-side rate-limit test depends on the same limit fields.
  - External: `https://expressjs.com/en/guide/routing/` - Express method route pattern.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f lib/status-payload.cjs` exits 0.
  - [ ] `rg -n "rateLimit:\\s*\\{" server.js api/status.js` returns no matches because the duplicate object lives in `lib/status-payload.cjs`.
  - [ ] `npx vitest run tests/api-env.test.js tests/openrouter-api.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: Express status endpoint uses shared payload and hides key
    Tool:     curl
    Steps:    mkdir -p .omo/evidence; OPENROUTER_API_KEY=sk-or-secret-value OPENROUTER_MODEL=openrouter/auto DAILY_REQUEST_LIMIT=7 MONTHLY_REQUEST_LIMIT=70 SERVER_RATE_LIMIT_MAX=3 SERVER_RATE_LIMIT_WINDOW_SECONDS=60 PORT=3104 npm start > .omo/evidence/task-6-status-server.log 2>&1 & echo $! > .omo/evidence/task-6-status-server.pid; sleep 2; curl -sS http://127.0.0.1:3104/api/status | tee .omo/evidence/task-6-status-curl.json; node -e "const fs=require('fs'); const body=fs.readFileSync('.omo/evidence/task-6-status-curl.json','utf8'); const json=JSON.parse(body); if(!json.success||json.data.rateLimit.limit!==3||body.includes('sk-or-secret-value')) process.exit(1);"; kill $(cat .omo/evidence/task-6-status-server.pid)
    Expected: command exits 0; JSON reports `rateLimit.limit` 3 and does not contain `sk-or-secret-value`
    Evidence: .omo/evidence/task-6-status-curl.json

  Scenario: serverless status rejects non-GET
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/api-env.test.js -t "api/status handler" | tee .omo/evidence/task-6-status-method.txt
    Expected: command exits 0; tests cover GET success and non-GET 405 behavior
    Evidence: .omo/evidence/task-6-status-method.txt
  ```

  Commit: YES | Message: `refactor(api): share status payload` | Files: [lib/status-payload.cjs, server.js, api/status.js, tests/api-env.test.js]

- [ ] 7. Clarify client `UsageTracker` versus server rate-limit semantics

  What to do: Make the code and tests explicit that `UsageTracker` is a client-side display/preflight estimate stored in localStorage, while `lib/openrouter-proxy.cjs` is the server-side enforcement boundary. Add constants or comments in `lib/env-loader.js` and `lib/config.js` only where they clarify behavior. Add tests proving client usage can block a request before `/api/chat`, server 429 is handled as an enforced limit, and successful requests are recorded only after a 200 response. Update visible copy in `src/browser/notifications.js` if it currently implies localStorage limits are authoritative.
  Must NOT do: Do not remove client usage tracking, trust client counters for security, or change server rate-limit response shape.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [9] | Blocked by: [5, 6]

  References (executor has NO interview context - be exhaustive):
  - API/Type: `lib/env-loader.js:158` - `UsageTracker` class starts.
  - API/Type: `lib/env-loader.js:200` - client-side `canMakeRequest(envLoader)` preflight.
  - API/Type: `lib/env-loader.js:210` - `recordRequest()` increments localStorage counts.
  - Pattern:  `lib/config.js:81` - client preflight check before `/api/chat`.
  - Pattern:  `lib/config.js:92` - browser posts to `/api/chat`.
  - Pattern:  `lib/config.js:105` - client records successful request after response.
  - API/Type: `lib/openrouter-proxy.cjs:76` - server-side rate-limit enforcement.
  - API/Type: `lib/openrouter-proxy.cjs:120` - server checks rate limit before upstream call.
  - Test:     `tests/usage-tracker.test.js` - created by Task 5.
  - Test:     `tests/openrouter-api.test.js:144` - server-side daily request limit test.
  - Test:     `tests/config.test.js:113` - client request error handling patterns.

  Acceptance criteria (agent-executable only):
  - [ ] `npx vitest run tests/usage-tracker.test.js tests/config.test.js tests/openrouter-api.test.js` exits 0.
  - [ ] Add a test named `client usage tracker is a local preflight estimate` in `tests/usage-tracker.test.js`.
  - [ ] Add a test named `server rate limit remains authoritative after client preflight passes` in `tests/openrouter-api.test.js`.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: client preflight blocks without posting when local estimate is exhausted
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/config.test.js -t "usage" | tee .omo/evidence/task-7-usage-client-preflight.txt
    Expected: command exits 0; test proves exhausted client estimate prevents `/api/chat` fetch
    Evidence: .omo/evidence/task-7-usage-client-preflight.txt

  Scenario: server 429 is enforced independently of client usage estimate
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/openrouter-api.test.js -t "server-side daily request limit" | tee .omo/evidence/task-7-usage-server-limit.txt
    Expected: command exits 0; second server request returns 429 with `Retry-After`
    Evidence: .omo/evidence/task-7-usage-server-limit.txt
  ```

  Commit: YES | Message: `refactor(usage): clarify client and server limits` | Files: [lib/env-loader.js, lib/config.js, src/browser/notifications.js, tests/usage-tracker.test.js, tests/config.test.js, tests/openrouter-api.test.js]

- [ ] 8. Tighten `safe-html` allowlist and tests

  What to do: Add failing tests first for the sanitizer cases that must change. Remove `style` from the global allowed attribute set, add `rel` if needed for safe external links, preserve the tags/classes emitted by `formatAIResponse`, and constrain `href` to safe protocols used by the app (`https://` only unless a test justifies another protocol). Strip event attributes case-insensitively, dangerous URL attributes (`srcdoc`, `formaction`, `xlink:href`), and unsupported tags while preserving text content. Keep existing app templates functional.
  Must NOT do: Do not pass raw user input or AI output through `innerHTML`; do not add a sanitizer dependency.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [2] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - API/Type: `src/browser/safe-html.js:1` - current allowed tag list.
  - API/Type: `src/browser/safe-html.js:7` - current attribute allowlist includes `style`.
  - API/Type: `src/browser/safe-html.js:26` - current `href` allows only `https://`.
  - Pattern:  `lib/utils.js:252` - `formatAIResponse` emits headings, lists, blockquotes, code, paragraphs, and step-card markup.
  - Pattern:  `src/browser/notifications.js:105` - server proxy dialog uses allowed links, buttons, code, lists, and classes.
  - Pattern:  `src/browser/selection-ui.js:146` - selection badge template uses class and `data-area`.
  - Test:     `tests/safe-html.test.js:5` - current minimal unsafe tag/attribute test.
  - External: `https://github.com/cure53/DOMPurify` - official allowlist and `FORBID_ATTR` guidance, including blocking `style`.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "'style'|\"style\"" src/browser/safe-html.js` returns no matches.
  - [ ] `npx vitest run tests/safe-html.test.js tests/script.test.js` exits 0.
  - [ ] Add tests named `strips inline style attributes`, `strips dangerous URL-bearing attributes`, and `preserves formatted AI analysis markup` in `tests/safe-html.test.js`.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: sanitizer preserves expected AI formatting
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/safe-html.test.js -t "preserves formatted AI analysis markup" | tee .omo/evidence/task-8-safe-html-formatting.txt
    Expected: command exits 0; headings, lists, strong text, and step-card classes survive sanitization
    Evidence: .omo/evidence/task-8-safe-html-formatting.txt

  Scenario: sanitizer strips style and dangerous attributes
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/safe-html.test.js -t "strips inline style attributes|strips dangerous URL-bearing attributes" | tee .omo/evidence/task-8-safe-html-hardening.txt
    Expected: command exits 0; rendered output has no `style`, `srcdoc`, `formaction`, `xlink:href`, or event attributes
    Evidence: .omo/evidence/task-8-safe-html-hardening.txt
  ```

  Commit: YES | Message: `fix(security): tighten safe html allowlist` | Files: [src/browser/safe-html.js, tests/safe-html.test.js]

- [ ] 9. Decide and clean `/api/config` surface

  What to do: Apply this decision: `/api/env` is canonical for browser runtime config; `/api/config` remains an Express-only deprecated local compatibility alias for this pass. Remove `/api/config` from the client fallback chain in `lib/env-loader.js`, so browser runtime tries `/api/env` then localStorage. Keep `server.js` `/api/config` returning the same non-sensitive legacy shape, add an `X-Deprecated-Endpoint: /api/env` response header, and add tests for secrecy and deprecation. Update tracked docs/codemaps that claim `/api/config` is part of the active browser flow.
  Must NOT do: Do not remove `/api/config` yet, do not create `api/config.js` for Vercel, and do not expose `OPENROUTER_API_KEY` through either endpoint.

  Parallelization: Can parallel: NO | Wave 3 | Blocks: [10] | Blocked by: [5, 6, 7]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `server.js:74` - current Express `/api/config` endpoint.
  - Pattern:  `server.js:78` - canonical local `/api/env` endpoint already exists.
  - Pattern:  `lib/env-loader.js:14` - client attempts `/api/env` first.
  - Pattern:  `lib/env-loader.js:40` - client currently falls back to `/api/config`; remove this dependency.
  - Pattern:  `codemaps/backend.md:30` - backend codemap lists `/api/config`.
  - Pattern:  `codemaps/backend.md:108` - codemap documents `/api/config` fallback chain.
  - Pattern:  `codemaps/architecture.md:60` - architecture codemap documents `/api/env || /api/config`.
  - Test:     `tests/env-loader-load.test.js` - created by Task 5 and must cover `/api/env` then localStorage.
  - Test:     `tests/api-env.test.js:43` - `/api/env` secrecy contract.
  - External: `https://vercel.com/docs/functions/functions-api-reference?framework=other` - each API file maps to a Vercel function; absence of `api/config.js` means no production `/api/config`.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "/api/config" lib src index.html tests --glob '!tests/api-env.test.js' --glob '!tests/env-loader-load.test.js'` returns no matches except tests intentionally asserting deprecation/no client fallback.
  - [ ] `npx vitest run tests/env-loader-load.test.js tests/api-env.test.js tests/runtime-config.test.js` exits 0.
  - [ ] `curl -sSI http://127.0.0.1:3105/api/config` during QA includes `X-Deprecated-Endpoint: /api/env`.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: browser runtime uses /api/env without /api/config fallback
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/env-loader-load.test.js -t "falls back to localStorage when api env fails" | tee .omo/evidence/task-9-api-config-loader.txt
    Expected: command exits 0; test proves `/api/config` is not fetched after `/api/env` failure
    Evidence: .omo/evidence/task-9-api-config-loader.txt

  Scenario: deprecated Express /api/config remains non-sensitive
    Tool:     curl
    Steps:    mkdir -p .omo/evidence; OPENROUTER_API_KEY=sk-or-secret-value PORT=3105 npm start > .omo/evidence/task-9-api-config-server.log 2>&1 & echo $! > .omo/evidence/task-9-api-config-server.pid; sleep 2; curl -sS -D .omo/evidence/task-9-api-config-headers.txt http://127.0.0.1:3105/api/config | tee .omo/evidence/task-9-api-config.json; node -e "const fs=require('fs'); const h=fs.readFileSync('.omo/evidence/task-9-api-config-headers.txt','utf8'); const b=fs.readFileSync('.omo/evidence/task-9-api-config.json','utf8'); if(!h.includes('X-Deprecated-Endpoint: /api/env')||b.includes('sk-or-secret-value')) process.exit(1);"; kill $(cat .omo/evidence/task-9-api-config-server.pid)
    Expected: command exits 0; deprecated header is present and body contains no API key
    Evidence: .omo/evidence/task-9-api-config.json
  ```

  Commit: YES | Message: `refactor(api): deprecate config endpoint` | Files: [server.js, lib/env-loader.js, tests/env-loader-load.test.js, tests/api-env.test.js, tests/runtime-config.test.js, codemaps/backend.md, codemaps/architecture.md]

- [ ] 10. Deprecate `api/gemini.js` compatibility endpoint if safe

  What to do: Apply this decision: repo search shows no internal `/api/gemini` consumers, but external deployed consumers cannot be proven absent, so do not remove the endpoint in this pass. Replace the bare re-export with a tiny wrapper that sets `X-Deprecated-Endpoint: /api/chat` and delegates to `api/chat.js`. Add tests proving the endpoint delegates to the chat handler, preserves CORS/method behavior through the delegated handler, does not expose keys, and returns the deprecation header. Update docs only if they mention Gemini compatibility.
  Must NOT do: Do not delete `api/gemini.js` without explicit user approval after evidence review. Do not reintroduce Gemini provider names in runtime code.

  Parallelization: Can parallel: NO | Wave 3 | Blocks: [] | Blocked by: [6, 9]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `api/gemini.js:1` - current compatibility re-export.
  - Pattern:  `api/chat.js:1` - current chat handler re-export to delegate to.
  - Pattern:  `lib/openrouter-proxy.cjs:109` - server-side chat proxy and key handling.
  - Test:     `tests/openrouter-api.test.js:59` - chat proxy success and key secrecy.
  - Test:     `tests/refactor-guards.test.js:26` - guard against legacy provider runtime aliases.
  - External: `https://vercel.com/docs/functions/` - Vercel API files are deployed as functions, so keeping the file preserves endpoint compatibility.

  Acceptance criteria (agent-executable only):
  - [ ] `rg -n "/api/gemini|api/gemini|geminiConfig|OpenAIConfig" src lib script.js config.js env-loader.js index.html server.js README.md codemaps tests --glob '!tests/gemini-api.test.js' --glob '!tests/refactor-guards.test.js'` returns no runtime consumer matches.
  - [ ] `npx vitest run tests/gemini-api.test.js tests/openrouter-api.test.js tests/refactor-guards.test.js` exits 0.
  - [ ] `api/gemini.js` sets `X-Deprecated-Endpoint` and delegates to `api/chat.js` without duplicating proxy logic.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: deprecated gemini endpoint delegates to chat without leaking key
    Tool:     bash
    Steps:    set -o pipefail; npx vitest run tests/gemini-api.test.js -t "delegates to chat with deprecation header" | tee .omo/evidence/task-10-gemini-deprecation.txt
    Expected: command exits 0; response includes `X-Deprecated-Endpoint: /api/chat` and body contains no OpenRouter key
    Evidence: .omo/evidence/task-10-gemini-deprecation.txt

  Scenario: no internal runtime consumer still points at /api/gemini
    Tool:     bash
    Steps:    set -o pipefail; (rg -n "/api/gemini|api/gemini|geminiConfig|OpenAIConfig" src lib script.js config.js env-loader.js index.html server.js README.md codemaps tests --glob '!tests/gemini-api.test.js' --glob '!tests/refactor-guards.test.js' || true) | tee .omo/evidence/task-10-gemini-consumers.txt; test "$(cat .omo/evidence/task-10-gemini-consumers.txt | wc -l | tr -d ' ')" = "0"
    Expected: command exits 0; evidence file is empty
    Evidence: .omo/evidence/task-10-gemini-consumers.txt
  ```

  Commit: YES | Message: `refactor(api): deprecate gemini compatibility endpoint` | Files: [api/gemini.js, tests/gemini-api.test.js, tests/openrouter-api.test.js, tests/refactor-guards.test.js, README.md, codemaps/backend.md]

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
- Reference the plan file path in the final commit footer: `Plan: .omo/plans/refactor-next10.md`.

## Success criteria
- All Must-Have shipped; all QA scenarios pass with captured evidence; F1-F4 approved; commit history clean.
