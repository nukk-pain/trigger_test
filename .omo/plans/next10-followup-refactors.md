# Next 10 Follow-Up Refactors

## TL;DR
> Summary:      Execute the next 10 requested refactor/doc targets while preserving the current vanilla HTML/CSS/ESM browser app, Express local server, Vercel API handlers, medical safety flow, and API-key secrecy.
> Deliverables:
> - Residual `styles.css` split into ordered feature stylesheets
> - Stale `AGENTS.md` and `codemaps/data.md` guidance synchronized with current files and data counts
> - Selection UI, guide modal, EnvLoader/UsageTracker, public env config, proxy rate-limit semantics, and OpenRouterConfig split behind compatibility surfaces
> - Focused Vitest coverage plus browser/API QA evidence for every task
> Effort:       Large
> Risk:         Medium - CSS cascade, compatibility barrels, and API payload semantics can regress unless tests and real browser/API checks run after each split.

## Scope
### Must have
- Preserve the requested target identities and numbering: tasks 1-10 below map exactly to the caller's ordered list.
- Preserve public browser imports until the plan explicitly narrows them: `src/browser/app.js` must keep working through `src/browser/selection-ui.js`, `src/browser/guide-modal.js`, root `env-loader.js`, and root `config.js`.
- Preserve API-key secrecy: no client config, API response, browser storage, log evidence, or screenshot artifact may expose `OPENROUTER_API_KEY` or a value matching `sk-or-`.
- Keep `/api/env` as a non-sensitive runtime config endpoint exposing model, limits, flags, and OpenRouter site/app metadata only.
- Preserve the visible medical red-flag path and all "not a diagnosis" safety framing when UI modules move.
- Use characterization/TDD before production edits for every task that moves behavior.
- Inspect `git status --short` before each task. `AGENTS.md`, `codemaps/data.md`, `.omo/plans/refactor-next10.md`, and `.omo/ulw-loop/` are currently untracked; only touch the files owned by the active task.
- Leave the existing untracked `.omo/plans/refactor-next10.md` untouched; this plan supersedes it for the follow-up target set.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do not migrate to React, TypeScript, Vite, a bundler, or CSS tooling.
- Do not add runtime dependencies or change `package.json` module type.
- Do not remove the Express dev server, Vercel handlers, `/api/env`, `/api/status`, or `/api/chat`.
- Do not recreate `api/gemini.js` or any legacy provider alias.
- Do not redesign UI, change medical content, rename public classes/selectors casually, or alter SVG geometry.
- Do not query OpenRouter `/api/v1/key` in this pass; official docs inform semantics only.
- Do not claim the in-memory server proxy rate limiter is durable production abuse protection.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: TDD/characterization-first + Vitest/jsdom; browser smoke QA uses real Chrome through temporary Playwright CLI; API QA uses Node/http or curl.
- QA policy: every task has agent-executed scenarios
- Evidence: `.omo/evidence/task-<N>-<slug>.<ext>`

## Execution strategy
### Parallel execution waves
> Target 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks to maximize parallelism.

Wave 1 (no dependencies):
- Task 1: split residual `styles.css`
- Task 2: update stale `AGENTS.md` API surface guidance
- Task 3: sync `codemaps/data.md` with split data modules and current counts
- Task 4: split `src/browser/selection-ui.js` by state/render/events
- Task 6: split guide data from guide modal/controller
- Task 7: split EnvLoader and UsageTracker implementations behind a compatibility barrel
- Task 8: share `/api/env` public config payload between Express and Vercel

Wave 2 (after Wave 1):
- Task 5: depends [1, 4]
- Task 9: depends [8]
- Task 10: depends [7]

Wave 3 (after Wave 2):
- Final verification wave

Critical path: Task 4 -> Task 5; Task 8 -> Task 9; Task 7 -> Task 10

### Dependency matrix
| Task | Depends on | Blocks | Can parallelize with |
|------|------------|--------|----------------------|
| 1    | none       | 5      | 2, 3, 4, 6, 7, 8    |
| 2    | none       | Final  | 1, 3, 4, 6, 7, 8    |
| 3    | none       | Final  | 1, 2, 4, 6, 7, 8    |
| 4    | none       | 5      | 1, 2, 3, 6, 7, 8    |
| 5    | 1, 4       | Final  | 9, 10               |
| 6    | none       | Final  | 1, 2, 3, 4, 7, 8    |
| 7    | none       | 10     | 1, 2, 3, 4, 6, 8    |
| 8    | none       | 9      | 1, 2, 3, 4, 6, 7    |
| 9    | 8          | Final  | 5, 10               |
| 10   | 7          | Final  | 5, 9                |

## Todos
> Implementation + Test = ONE task. Never separate.
> Every task MUST have: References + Acceptance Criteria + QA Scenarios + Commit.

- [ ] 1. Split residual `styles.css`

  What to do: Add characterization assertions for the stylesheet manifest order, then convert `styles.css` into an ordered manifest that imports new residual feature files. Create `styles/controls.css` for current button/general/hidden rules, `styles/status.css` for AI status/server-proxy/loading/message/startup/usage rules, `styles/questionnaire.css` for the form and safety/result form blocks, `styles/responsive.css` for the global responsive/accessibility/high-contrast block, `styles/selection.css` for live selection/body-map residual rules, and `styles/guides.css` for footer/guide/modal/massage-card rules. Preserve current selector text and cascade order: controls, status, questionnaire, responsive, selection, guides. Keep existing `styles/base.css`, `styles/layout.css`, `styles/body-map.css`, and `styles/analysis.css` linked before `styles.css` in `index.html`.
  Must NOT do: Do not redesign UI, rename selectors, move rules into a CSS build system, or preempt Task 5 by changing selection JS behavior.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [5] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `index.html:8` - existing `styles/base.css` link.
  - Pattern:  `index.html:9` - existing `styles/layout.css` link.
  - Pattern:  `index.html:10` - existing `styles/body-map.css` link.
  - Pattern:  `index.html:11` - existing `styles/analysis.css` link.
  - Pattern:  `index.html:12` - current residual `styles.css` link to keep as manifest URL.
  - Pattern:  `styles.css:1` - residual button rules begin.
  - Pattern:  `styles.css:79` - residual AI status/server-proxy rules begin.
  - Pattern:  `styles.css:641` - residual questionnaire/form rules begin.
  - Pattern:  `styles.css:1373` - global responsive/accessibility block begins.
  - Pattern:  `styles.css:1458` - live selection/body-map residual rules begin.
  - Pattern:  `styles.css:1869` - footer/guide/modal/massage-card rules begin.
  - Pattern:  `styles/body-map.css:105` - existing clickable-area base styles to keep separate from residual extraction.
  - Test:     `tests/refactor-guards.test.js:54` - current CSS split guard to extend for manifest imports and new files.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f styles/controls.css -a -f styles/status.css -a -f styles/questionnaire.css -a -f styles/responsive.css -a -f styles/selection.css -a -f styles/guides.css` exits 0.
  - [ ] `node -e "const fs=require('fs'); const css=fs.readFileSync('styles.css','utf8').trim().split(/\n+/).map(s=>s.trim()).filter(Boolean); const expected=['@import url(\"styles/controls.css\");','@import url(\"styles/status.css\");','@import url(\"styles/questionnaire.css\");','@import url(\"styles/responsive.css\");','@import url(\"styles/selection.css\");','@import url(\"styles/guides.css\");']; if (JSON.stringify(css)!==JSON.stringify(expected)) { console.error(css); process.exit(1); }"` exits 0.
  - [ ] `npx vitest run tests/refactor-guards.test.js` exits 0 after assertions lock the new residual stylesheet files and import order.

  QA scenarios (MANDATORY - task incomplete without these):
  > Name the exact tool AND its exact invocation - not "verify it works". Browser use: use Chrome to drive the page; if Chrome is not available, download and use agent-browser (https://github.com/vercel-labs/agent-browser). Computer use: OS-level GUI automation for a non-browser desktop app.
  ```
  Scenario: desktop CSS split preserves selection UI
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3101 npm start > .omo/evidence/task-1-css-server.log 2>&1 & echo $! > .omo/evidence/task-1-css-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }); await page.goto('http://127.0.0.1:3101', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); const selected = await page.locator('[data-area=\"neck-front\"]').evaluate(el => el.classList.contains('selected')); const visible = await page.locator('#live-selection-text').isVisible(); await page.screenshot({ path: '.omo/evidence/task-1-css-desktop.png', fullPage: true }); await browser.close(); if (!selected || !visible) process.exit(1);"; kill $(cat .omo/evidence/task-1-css-server.pid)
    Expected: command exits 0; selected body-map area has class `selected`; screenshot captures the desktop selection UI
    Evidence: .omo/evidence/task-1-css-desktop.png

  Scenario: mobile CSS split has no horizontal overflow
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3102 npm start > .omo/evidence/task-1-css-mobile-server.log 2>&1 & echo $! > .omo/evidence/task-1-css-mobile-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); await page.goto('http://127.0.0.1:3102', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth); await page.screenshot({ path: '.omo/evidence/task-1-css-mobile.png', fullPage: true }); await browser.close(); if (overflow) process.exit(1);"; kill $(cat .omo/evidence/task-1-css-mobile-server.pid)
    Expected: command exits 0; no horizontal document overflow; screenshot captures the mobile body-map layout
    Evidence: .omo/evidence/task-1-css-mobile.png
  ```

  Commit: YES | Message: `refactor(styles): split residual stylesheet` | Files: [styles.css, styles/controls.css, styles/status.css, styles/questionnaire.css, styles/responsive.css, styles/selection.css, styles/guides.css, tests/refactor-guards.test.js]

- [ ] 2. Update stale `AGENTS.md` API guidance

  What to do: Update `AGENTS.md` so the API surface list names current files: `api/env.js`, `api/chat.js`, and `api/status.js`. Remove the stale `api/gemini.js` reference and keep the safety invariants unchanged. Add a refactor guard assertion that fails if `AGENTS.md` mentions `api/gemini.js` or omits `api/chat.js`.
  Must NOT do: Do not rewrite project orientation wholesale, change commands, or weaken API-key/medical safety invariants.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [Final] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `AGENTS.md:7` - safety invariants begin.
  - Pattern:  `AGENTS.md:9` - `/api/env` secret-safety invariant to preserve.
  - Pattern:  `AGENTS.md:13` - "Where To Look" section begins.
  - Pattern:  `AGENTS.md:16` - stale `api/gemini.js` reference to replace.
  - Pattern:  `api/chat.js:1` - current Vercel chat API file exists.
  - Pattern:  `api/status.js:1` - current Vercel status API file exists.
  - Pattern:  `api/env.js:1` - current Vercel env API file exists.
  - Test:     `tests/refactor-guards.test.js:106` - legacy API alias guard to extend for docs.

  Acceptance criteria (agent-executable only):
  - [ ] `node -e "const fs=require('fs'); const text=fs.readFileSync('AGENTS.md','utf8'); if (text.includes('api/gemini.js')) process.exit(1); if (!text.includes('api/chat.js') || !text.includes('api/status.js') || !text.includes('api/env.js')) process.exit(1); if (!text.includes('Never expose API keys client-side')) process.exit(1);"` exits 0.
  - [ ] `npx vitest run tests/refactor-guards.test.js` exits 0 after adding the documentation guard.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: current API guidance is listed
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; node -e "const fs=require('fs'); const text=fs.readFileSync('AGENTS.md','utf8'); const checks=['api/env.js','api/chat.js','api/status.js']; for (const c of checks) if (!text.includes(c)) throw new Error(c); console.log(checks.join('\n'));" | tee .omo/evidence/task-2-agents-current.txt
    Expected: command exits 0; evidence lists the three current API files
    Evidence: .omo/evidence/task-2-agents-current.txt

  Scenario: stale Gemini API guidance is absent
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; if rg -n "api/gemini\.js" AGENTS.md; then exit 1; else echo "no stale api/gemini.js reference" | tee .omo/evidence/task-2-agents-stale.txt; fi
    Expected: command exits 0; evidence states the stale reference is absent
    Evidence: .omo/evidence/task-2-agents-stale.txt
  ```

  Commit: YES | Message: `docs(agents): update api surface guidance` | Files: [AGENTS.md, tests/refactor-guards.test.js]

- [ ] 3. Sync `codemaps/data.md` with split data modules and counts

  What to do: Update `codemaps/data.md` to state that `lib/data.js` is a compatibility barrel and definitions live in `lib/data/trigger-points.js`, `lib/data/fascial-lines.js`, and `lib/data/red-flags.js`. Update the "Last updated" value to `2026-06-04`. Update counts to 17 trigger points, 3 fascial lines, and 6 red flags. Add a guard that imports the live data modules and fails if the doc count claims drift.
  Must NOT do: Do not edit medical data values, translate the document wholesale, or add unsupported clinical claims.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [Final] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `codemaps/data.md:2` - stale last-updated date.
  - Pattern:  `codemaps/data.md:6` - stale claim that data is defined in `lib/data.js`.
  - Pattern:  `codemaps/data.md:33` - stale `triggerPointsDB` count.
  - Pattern:  `codemaps/data.md:83` - fascial-line count section.
  - Pattern:  `codemaps/data.md:110` - red-flag section.
  - API/Type: `lib/data.js:1` - compatibility barrel re-export for `triggerPointsDB`.
  - API/Type: `lib/data.js:2` - compatibility barrel re-export for `fascialLinesDB`.
  - API/Type: `lib/data.js:3` - compatibility barrel re-export for `redFlagConditions`.
  - API/Type: `lib/data/trigger-points.js:4` - live `triggerPointsDB` array source with 17 entries.
  - API/Type: `lib/data/fascial-lines.js:1` - live `fascialLinesDB` object source with 3 entries.
  - API/Type: `lib/data/red-flags.js:1` - live `redFlagConditions` array source with 6 entries.
  - Test:     `tests/refactor-guards.test.js:88` - existing data barrel guard to extend with doc-count checks.

  Acceptance criteria (agent-executable only):
  - [ ] `node --input-type=module -e "import { triggerPointsDB, fascialLinesDB, redFlagConditions } from './lib/data.js'; if (triggerPointsDB.length!==17) throw new Error('trigger count'); if (Object.keys(fascialLinesDB).length!==3) throw new Error('fascial count'); if (redFlagConditions.length!==6) throw new Error('red flag count');"` exits 0.
  - [ ] `node -e "const fs=require('fs'); const doc=fs.readFileSync('codemaps/data.md','utf8'); for (const s of ['Last updated: 2026-06-04','lib/data/trigger-points.js','lib/data/fascial-lines.js','lib/data/red-flags.js','Data (17 entries)']) if (!doc.includes(s)) { console.error(s); process.exit(1); }"` exits 0.
  - [ ] `npx vitest run tests/refactor-guards.test.js` exits 0 after adding doc-count drift assertions.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: documented counts match live modules
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; node --input-type=module -e "import { triggerPointsDB, fascialLinesDB, redFlagConditions } from './lib/data.js'; console.log(JSON.stringify({ triggerPoints: triggerPointsDB.length, fascialLines: Object.keys(fascialLinesDB).length, redFlags: redFlagConditions.length }, null, 2));" | tee .omo/evidence/task-3-data-counts.json
    Expected: command exits 0; JSON reports `{ triggerPoints: 17, fascialLines: 3, redFlags: 6 }`
    Evidence: .omo/evidence/task-3-data-counts.json

  Scenario: stale barrel-only wording is absent
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; node -e "const fs=require('fs'); const doc=fs.readFileSync('codemaps/data.md','utf8'); if (doc.includes('defined in lib/data.js') || doc.includes('Data (8 entries)')) process.exit(1); console.log('data codemap references split modules and current counts');" | tee .omo/evidence/task-3-data-stale.txt
    Expected: command exits 0; evidence states stale data wording is absent
    Evidence: .omo/evidence/task-3-data-stale.txt
  ```

  Commit: YES | Message: `docs(data): sync codemap with split datasets` | Files: [codemaps/data.md, tests/refactor-guards.test.js]

- [ ] 4. Split `src/browser/selection-ui.js` by state/render/events

  What to do: First add `tests/selection-ui.test.js` with jsdom fixtures covering selection add/remove, selected-list rendering, live badge rendering, quick-clear visibility, `collectActionData()`, `validateStep1()`, and view switching. Then split implementation into `src/browser/selection-state.js`, `src/browser/selection-renderer.js`, and `src/browser/selection-events.js`. Keep `src/browser/selection-ui.js` as a compatibility barrel/facade exporting `setupBodyMapEvents`, `validateStep1`, `collectActionData`, `clearSelection`, and `switchBodyView`. Task 4 may move existing SVG style writes but must preserve behavior; Task 5 removes those writes.
  Must NOT do: Do not remove compatibility exports, change `appState.painData` shape, change validation messages, or remove SVG inline style writes yet.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [5] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/browser/selection-ui.js:1` - imports display/validation utilities.
  - Pattern:  `src/browser/selection-ui.js:6` - current `painData` reference.
  - Pattern:  `src/browser/selection-ui.js:8` - `setupBodyMapEvents()` public export.
  - Pattern:  `src/browser/selection-ui.js:31` - `validateStep1()` public export.
  - Pattern:  `src/browser/selection-ui.js:45` - `collectActionData()` public export.
  - Pattern:  `src/browser/selection-ui.js:53` - `toggleAreaSelection()` state mutation.
  - Pattern:  `src/browser/selection-ui.js:76` - selected-list renderer.
  - Pattern:  `src/browser/selection-ui.js:125` - live selection renderer.
  - Pattern:  `src/browser/selection-ui.js:171` - remove-selected-area state/render flow.
  - Pattern:  `src/browser/selection-ui.js:190` - `clearSelection()` public export.
  - Pattern:  `src/browser/selection-ui.js:211` - `switchBodyView()` public export.
  - Pattern:  `src/browser/app.js:11` - app imports the compatibility selection exports.
  - Pattern:  `src/browser/app.js:95` - analysis starts only after `validateStep1()` and `collectActionData()`.
  - Test:     `tests/analysis-flow.test.js:4` - imports `collectActionData()` from `selection-ui.js`.
  - Test:     `tests/refactor-guards.test.js:17` - existing guard expects `selection-ui.js` to export `setupBodyMapEvents`.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f src/browser/selection-state.js -a -f src/browser/selection-renderer.js -a -f src/browser/selection-events.js -a -f tests/selection-ui.test.js` exits 0.
  - [ ] `node -e "const fs=require('fs'); const text=fs.readFileSync('src/browser/selection-ui.js','utf8'); for (const name of ['setupBodyMapEvents','validateStep1','collectActionData','clearSelection','switchBodyView']) if (!text.includes(name)) { console.error(name); process.exit(1); } if (text.split('\n').length > 90) process.exit(1);"` exits 0.
  - [ ] `npx vitest run tests/selection-ui.test.js tests/analysis-flow.test.js tests/refactor-guards.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: selection click renders list and badge
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3104 npm start > .omo/evidence/task-4-selection-server.log 2>&1 & echo $! > .omo/evidence/task-4-selection-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }); await page.goto('http://127.0.0.1:3104', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); const state = await page.evaluate(() => ({ selected: document.querySelector('[data-area=\"neck-front\"]').classList.contains('selected'), badges: document.querySelectorAll('.selection-badge').length, quickClear: getComputedStyle(document.querySelector('#quick-clear')).display })); await page.screenshot({ path: '.omo/evidence/task-4-selection-happy.png', fullPage: true }); await browser.close(); if (!state.selected || state.badges !== 1 || state.quickClear === 'none') process.exit(1);"; kill $(cat .omo/evidence/task-4-selection-server.pid)
    Expected: command exits 0; one badge is rendered and quick-clear is visible after a click
    Evidence: .omo/evidence/task-4-selection-happy.png

  Scenario: remove badge clears selected state
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3105 npm start > .omo/evidence/task-4-selection-remove-server.log 2>&1 & echo $! > .omo/evidence/task-4-selection-remove-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }); await page.goto('http://127.0.0.1:3105', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); await page.click('.selection-badge .remove-btn'); const selected = await page.locator('[data-area=\"neck-front\"]').evaluate(el => el.classList.contains('selected')); const badges = await page.locator('.selection-badge').count(); await page.screenshot({ path: '.omo/evidence/task-4-selection-remove.png', fullPage: true }); await browser.close(); if (selected || badges !== 0) process.exit(1);"; kill $(cat .omo/evidence/task-4-selection-remove-server.pid)
    Expected: command exits 0; selection class and badge are gone after badge removal
    Evidence: .omo/evidence/task-4-selection-remove.png
  ```

  Commit: YES | Message: `refactor(browser): split selection ui modules` | Files: [src/browser/selection-ui.js, src/browser/selection-state.js, src/browser/selection-renderer.js, src/browser/selection-events.js, tests/selection-ui.test.js, tests/refactor-guards.test.js]

- [ ] 5. Remove direct SVG inline style manipulation in selection UI

  What to do: After Task 1 and Task 4, update selection behavior so SVG area visual state is controlled by CSS classes and selectors only. Remove mouseover/mouseout handlers that assign `style.fill`. Remove direct assignments to SVG `style.fill`, `style.stroke`, `style.strokeWidth`, `style.opacity`, and `style.fillOpacity` from selection modules. Keep non-SVG display toggles, such as quick-clear visibility, only where renderer code needs them. Use `.clickable-area:hover` and `.clickable-area.selected` rules in `styles/body-map.css` plus `styles/selection.css` for visual states.
  Must NOT do: Do not change SVG geometry, remove `selected` class semantics, change data-area names, or edit `index.html` except adding a class if a test proves CSS cannot target the current SVG.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [Final] | Blocked by: [1, 4]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/browser/selection-ui.js:17` - current hover handler writes `style.fill`.
  - Pattern:  `src/browser/selection-ui.js:61` - current deselect path clears SVG inline styles.
  - Pattern:  `src/browser/selection-ui.js:70` - current select path writes SVG inline fill.
  - Pattern:  `src/browser/selection-ui.js:178` - remove path clears SVG inline styles.
  - Pattern:  `src/browser/selection-ui.js:195` - clear path clears SVG inline styles.
  - Pattern:  `styles/body-map.css:105` - current `.clickable-area` base style.
  - Pattern:  `styles/body-map.css:112` - current `.clickable-area:hover` rule.
  - Pattern:  `styles/body-map.css:121` - current `.clickable-area.selected` rule.
  - Pattern:  `styles.css:1567` - residual clickable-area rule that Task 1 moves to `styles/selection.css`.
  - Test:     `tests/selection-ui.test.js` - Task 4 selection behavior fixture to extend for no inline SVG style writes.

  Acceptance criteria (agent-executable only):
  - [ ] `node -e "const fs=require('fs'); const files=fs.readdirSync('src/browser').filter(f=>/^selection-.*\\.js$/.test(f)); const bad=[]; for (const f of files) { const text=fs.readFileSync('src/browser/'+f,'utf8'); if (/\\.style\\.(fill|stroke|strokeWidth|opacity|fillOpacity)\\b/.test(text)) bad.push(f); } if (bad.length) { console.error(bad.join(',')); process.exit(1); }"` exits 0.
  - [ ] `npx vitest run tests/selection-ui.test.js tests/refactor-guards.test.js` exits 0 with assertions that selected SVG elements have empty inline style attributes after select/remove/clear.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: selected body area uses class without inline fill
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3106 npm start > .omo/evidence/task-5-svg-server.log 2>&1 & echo $! > .omo/evidence/task-5-svg-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage(); await page.goto('http://127.0.0.1:3106', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); const state = await page.locator('[data-area=\"neck-front\"]').evaluate(el => ({ selected: el.classList.contains('selected'), inlineFill: el.style.fill, inlineStroke: el.style.stroke })); await page.screenshot({ path: '.omo/evidence/task-5-svg-class.png', fullPage: true }); await browser.close(); if (!state.selected || state.inlineFill || state.inlineStroke) process.exit(1);"; kill $(cat .omo/evidence/task-5-svg-server.pid)
    Expected: command exits 0; selected SVG area has class `selected` and empty inline fill/stroke values
    Evidence: .omo/evidence/task-5-svg-class.png

  Scenario: clearing selection leaves no inline SVG visual styles
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3107 npm start > .omo/evidence/task-5-svg-clear-server.log 2>&1 & echo $! > .omo/evidence/task-5-svg-clear-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage(); await page.goto('http://127.0.0.1:3107', { waitUntil: 'domcontentloaded' }); await page.click('[data-area=\"neck-front\"]'); await page.click('#clear-selection'); const state = await page.locator('[data-area=\"neck-front\"]').evaluate(el => ({ selected: el.classList.contains('selected'), inline: [el.style.fill, el.style.stroke, el.style.strokeWidth, el.style.opacity, el.style.fillOpacity].filter(Boolean).length })); await page.screenshot({ path: '.omo/evidence/task-5-svg-clear.png', fullPage: true }); await browser.close(); if (state.selected || state.inline !== 0) process.exit(1);"; kill $(cat .omo/evidence/task-5-svg-clear-server.pid)
    Expected: command exits 0; cleared SVG area has no `selected` class and no inline visual style values
    Evidence: .omo/evidence/task-5-svg-clear.png
  ```

  Commit: YES | Message: `refactor(browser): use css classes for selection svg state` | Files: [src/browser/selection-events.js, src/browser/selection-renderer.js, src/browser/selection-ui.js, styles/selection.css, styles/body-map.css, tests/selection-ui.test.js, tests/refactor-guards.test.js]

- [ ] 6. Split guide data from guide modal/controller

  What to do: Add `tests/guide-modal.test.js` covering known guide data, fallback guide data, modal rendering, navigation, and close/finish cleanup. Extract guide step data into `src/browser/guide-data.js`. Extract modal/controller/render/navigation behavior into `src/browser/guide-controller.js`. Keep `src/browser/guide-modal.js` as a compatibility facade exporting `configureGuideModal`, `startInteractiveGuide`, and `closeInteractiveGuide`.
  Must NOT do: Do not remove `startInteractiveGuide`, change the analysis-renderer button contract, remove safety tips, or change `appState.currentGuide` shape unless tests prove all consumers are updated.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [Final] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/browser/guide-modal.js:5` - current no-op `configureGuideModal()`.
  - Pattern:  `src/browser/guide-modal.js:7` - public `startInteractiveGuide()` entry point.
  - Pattern:  `src/browser/guide-modal.js:51` - inline `getGuideSteps()` data/function to extract.
  - Pattern:  `src/browser/guide-modal.js:53` - known `neck-shoulder-junction` guide.
  - Pattern:  `src/browser/guide-modal.js:81` - known `skull-base` guide.
  - Pattern:  `src/browser/guide-modal.js:111` - fallback guide generation.
  - Pattern:  `src/browser/guide-modal.js:135` - modal step renderer.
  - Pattern:  `src/browser/guide-modal.js:177` - navigation event binding.
  - Pattern:  `src/browser/guide-modal.js:199` - public `closeInteractiveGuide()` export.
  - Pattern:  `src/browser/app.js:5` - app imports `configureGuideModal`.
  - Pattern:  `src/browser/app.js:20` - app calls `configureGuideModal()`.
  - Pattern:  `src/browser/analysis-renderer.js:3` - analysis renderer imports `startInteractiveGuide()`.
  - Pattern:  `src/browser/analysis-renderer.js:165` - guide button starts the interactive guide.
  - Test:     `tests/refactor-guards.test.js:20` - existing guide-modal export guard to extend.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f src/browser/guide-data.js -a -f src/browser/guide-controller.js -a -f tests/guide-modal.test.js` exits 0.
  - [ ] `node -e "const fs=require('fs'); const facade=fs.readFileSync('src/browser/guide-modal.js','utf8'); for (const name of ['configureGuideModal','startInteractiveGuide','closeInteractiveGuide']) if (!facade.includes(name)) process.exit(1); if (facade.split('\n').length > 50) process.exit(1); const data=fs.readFileSync('src/browser/guide-data.js','utf8'); if (!data.includes('neck-shoulder-junction') || !data.includes('skull-base')) process.exit(1);"` exits 0.
  - [ ] `npx vitest run tests/guide-modal.test.js tests/refactor-guards.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: known guide opens and advances
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3108 npm start > .omo/evidence/task-6-guide-server.log 2>&1 & echo $! > .omo/evidence/task-6-guide-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage(); await page.goto('http://127.0.0.1:3108', { waitUntil: 'domcontentloaded' }); await page.addScriptTag({ type: 'module', content: \"import { startInteractiveGuide } from './src/browser/guide-modal.js'; window.__startGuide = startInteractiveGuide;\" }); await page.evaluate(() => window.__startGuide('Upper trapezius', 'neck-shoulder-junction')); await page.click('#next-step'); const state = await page.evaluate(() => ({ modal: !!document.querySelector('.interactive-guide-modal'), step: window.appState?.currentGuide?.currentStep ?? document.querySelectorAll('.progress-dot.completed').length })); await page.screenshot({ path: '.omo/evidence/task-6-guide-known.png', fullPage: true }); await browser.close(); if (!state.modal || state.step < 1) process.exit(1);"; kill $(cat .omo/evidence/task-6-guide-server.pid)
    Expected: command exits 0; modal opens and advances at least one step
    Evidence: .omo/evidence/task-6-guide-known.png

  Scenario: fallback guide renders for unknown location
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence; PORT=3109 npm start > .omo/evidence/task-6-guide-fallback-server.log 2>&1 & echo $! > .omo/evidence/task-6-guide-fallback-server.pid; sleep 2; npx --yes -p playwright node --input-type=module -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ channel: 'chrome', headless: true }); const page = await browser.newPage(); await page.goto('http://127.0.0.1:3109', { waitUntil: 'domcontentloaded' }); await page.addScriptTag({ type: 'module', content: \"import { startInteractiveGuide } from './src/browser/guide-modal.js'; window.__startGuide = startInteractiveGuide;\" }); await page.evaluate(() => window.__startGuide('Custom trigger point', 'unknown-location')); const dots = await page.locator('.progress-dot').count(); const text = await page.locator('.guide-content').textContent(); await page.screenshot({ path: '.omo/evidence/task-6-guide-fallback.png', fullPage: true }); await browser.close(); if (dots !== 3 || !text.includes('Custom trigger point')) process.exit(1);"; kill $(cat .omo/evidence/task-6-guide-fallback-server.pid)
    Expected: command exits 0; fallback modal has 3 steps and includes the trigger-point name
    Evidence: .omo/evidence/task-6-guide-fallback.png
  ```

  Commit: YES | Message: `refactor(browser): split guide modal data` | Files: [src/browser/guide-modal.js, src/browser/guide-data.js, src/browser/guide-controller.js, tests/guide-modal.test.js, tests/refactor-guards.test.js]

- [ ] 7. Split EnvLoader and UsageTracker implementations behind compatibility barrel

  What to do: Add or update tests so `EnvLoader` and `UsageTracker` can be imported from both their new direct implementation files and the existing `lib/env-loader.js` barrel. Move `EnvLoader` into `lib/env-loader/env-loader.js` and `UsageTracker` into `lib/env-loader/usage-tracker.js`. If shared secret-scrubbing logic is needed, put it in `lib/env-loader/sensitive-config.js`. Keep `lib/env-loader.js` as the compatibility barrel exporting `EnvLoader` and `UsageTracker`. Keep root `env-loader.js` importing from `./lib/env-loader.js`.
  Must NOT do: Do not change localStorage keys, expose API keys, change root `env-loader.js` unless a test requires it, or remove legacy secret-name scrubbing for `OPENAI_API_KEY` and `GEMINI_API_KEY`.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [10] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - API/Type: `lib/env-loader.js:1` - current `EnvLoader` class start.
  - API/Type: `lib/env-loader.js:14` - `/api/env` fetch behavior.
  - API/Type: `lib/env-loader.js:72` - `removeSensitiveConfig()` scrubs secrets.
  - API/Type: `lib/env-loader.js:102` - daily limit accessor.
  - API/Type: `lib/env-loader.js:106` - monthly limit accessor.
  - API/Type: `lib/env-loader.js:133` - current `UsageTracker` class start.
  - API/Type: `lib/env-loader.js:175` - client allowance check.
  - API/Type: `lib/env-loader.js:189` - request recording.
  - API/Type: `lib/env-loader.js:226` - usage stats.
  - Pattern:  `env-loader.js:1` - root browser wrapper imports from `./lib/env-loader.js`.
  - Pattern:  `env-loader.js:3` - root wrapper creates `window.envLoader`.
  - Pattern:  `env-loader.js:4` - root wrapper creates `window.usageTracker`.
  - Test:     `tests/env-loader/env-loader.test.js:2` - EnvLoader imports from compatibility barrel.
  - Test:     `tests/env-loader/usage-tracker.test.js:2` - UsageTracker imports from compatibility barrel.
  - Test:     `tests/refactor-guards.test.js:100` - existing split env-loader tests guard.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f lib/env-loader/env-loader.js -a -f lib/env-loader/usage-tracker.js` exits 0.
  - [ ] `node -e "const fs=require('fs'); const barrel=fs.readFileSync('lib/env-loader.js','utf8'); if (!barrel.includes('./env-loader/env-loader.js') || !barrel.includes('./env-loader/usage-tracker.js')) process.exit(1); if (/class\s+(EnvLoader|UsageTracker)/.test(barrel)) process.exit(1);"` exits 0.
  - [ ] `npx vitest run tests/env-loader/env-loader.test.js tests/env-loader/usage-tracker.test.js tests/runtime-config.test.js tests/refactor-guards.test.js` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: compatibility barrel exports both classes
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; node --input-type=module -e "import { EnvLoader, UsageTracker } from './lib/env-loader.js'; if (typeof EnvLoader !== 'function' || typeof UsageTracker !== 'function') throw new Error('missing export'); console.log(JSON.stringify({ EnvLoader: EnvLoader.name, UsageTracker: UsageTracker.name }));" | tee .omo/evidence/task-7-env-barrel.json
    Expected: command exits 0; JSON reports both exported class names
    Evidence: .omo/evidence/task-7-env-barrel.json

  Scenario: secret scrubbing still protects localStorage fallback
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; npx vitest run tests/env-loader/env-loader.test.js -t "should not load server proxy from localStorage" | tee .omo/evidence/task-7-env-secret-scrub.txt
    Expected: command exits 0; test proves `OPENROUTER_API_KEY` is not loaded from localStorage
    Evidence: .omo/evidence/task-7-env-secret-scrub.txt
  ```

  Commit: YES | Message: `refactor(env): split loader and usage tracker` | Files: [lib/env-loader.js, lib/env-loader/env-loader.js, lib/env-loader/usage-tracker.js, lib/env-loader/sensitive-config.js, env-loader.js, tests/env-loader/env-loader.test.js, tests/env-loader/usage-tracker.test.js, tests/refactor-guards.test.js]

- [ ] 8. Share `/api/env` public config payload between `server.js` and `api/env.js`

  What to do: Add `lib/public-env-config.cjs` modeled after `lib/server-status.cjs`. It must expose a pure helper, `getPublicEnvPayload(env)`, returning `{ success: true, data }` with the same non-sensitive data for local Express and Vercel: `OPENROUTER_MODEL`, numeric `MAX_TOKENS`, numeric `TEMPERATURE`, string compatibility `DAILY_REQUEST_LIMIT`, string compatibility `MONTHLY_REQUEST_LIMIT`, numeric `DAILY_LIMIT`, numeric `MONTHLY_LIMIT`, `ENABLE_AI_QA`, `ENABLE_DETAILED_ANALYSIS`, `OPENROUTER_SITE_URL`, and `OPENROUTER_APP_NAME`. Update `server.js` and `api/env.js` to use this helper. In `api/env.js`, use `createRequire` as `api/status.js` already does.
  Must NOT do: Do not include `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, arbitrary `process.env`, or base URLs that are not already public.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [9] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `lib/server-status.cjs:1` - existing shared CJS helper style.
  - Pattern:  `api/status.js:1` - ESM handler using `createRequire` to import CJS helper.
  - Pattern:  `server.js:4` - current CJS imports.
  - Pattern:  `server.js:58` - duplicated local `getClientConfig()` to replace.
  - Pattern:  `server.js:75` - local `/api/env` route to keep thin.
  - Pattern:  `api/env.js:1` - Vercel handler to keep platform-specific CORS/method handling.
  - Pattern:  `api/env.js:19` - duplicated Vercel env payload to replace.
  - Pattern:  `lib/env-loader.js:102` - client daily accessor currently reads `DAILY_REQUEST_LIMIT`.
  - Pattern:  `lib/env-loader.js:106` - client monthly accessor currently reads `MONTHLY_REQUEST_LIMIT`.
  - Test:     `tests/api-env.test.js:43` - secret-safety test for Vercel `/api/env`.
  - Test:     `tests/server-routes.test.js:39` - local server route contract pattern.
  - External: `https://expressjs.com/en/starter/basic-routing.html` - Express route handlers returning responses.
  - External: `https://vercel.com/docs/functions/runtimes/node-js` - Vercel Node.js functions.
  - External: `https://vercel.com/docs/environment-variables/managing-environment-variables` - sensitive environment variable boundary.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f lib/public-env-config.cjs` exits 0.
  - [ ] `node -e "const { getPublicEnvPayload } = require('./lib/public-env-config.cjs'); const env={OPENROUTER_API_KEY:'sk-or-secret',OPENROUTER_MODEL:'test/model',MAX_TOKENS:'321',TEMPERATURE:'0.4',DAILY_REQUEST_LIMIT:'12',MONTHLY_REQUEST_LIMIT:'34'}; const payload=getPublicEnvPayload(env); if (!payload.success || payload.data.OPENROUTER_API_KEY || payload.data.MAX_TOKENS!==321 || payload.data.DAILY_LIMIT!==12 || payload.data.MONTHLY_LIMIT!==34 || payload.data.DAILY_REQUEST_LIMIT!=='12') process.exit(1); if (JSON.stringify(payload).includes('sk-or-secret')) process.exit(1);"` exits 0.
  - [ ] `npx vitest run tests/api-env.test.js tests/server-routes.test.js tests/runtime-config.test.js tests/refactor-guards.test.js` exits 0 after adding equality coverage between local and Vercel payloads for the same env fixture.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: helper returns non-sensitive public config only
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; node -e "const { getPublicEnvPayload } = require('./lib/public-env-config.cjs'); const payload=getPublicEnvPayload({ OPENROUTER_API_KEY:'sk-or-secret', OPENROUTER_MODEL:'openrouter/auto', DAILY_REQUEST_LIMIT:'7', MONTHLY_REQUEST_LIMIT:'70' }); console.log(JSON.stringify(payload, null, 2)); if (JSON.stringify(payload).includes('sk-or-secret')) process.exit(1);" | tee .omo/evidence/task-8-public-env-helper.json
    Expected: command exits 0; JSON contains public model/limit data and no secret value
    Evidence: .omo/evidence/task-8-public-env-helper.json

  Scenario: local `/api/env` and Vercel handler share payload shape
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; npx vitest run tests/api-env.test.js tests/server-routes.test.js -t "env" | tee .omo/evidence/task-8-public-env-routes.txt
    Expected: command exits 0; route tests prove local and Vercel env payloads match shared helper semantics
    Evidence: .omo/evidence/task-8-public-env-routes.txt
  ```

  Commit: YES | Message: `refactor(api): share public env payload` | Files: [lib/public-env-config.cjs, server.js, api/env.js, tests/api-env.test.js, tests/server-routes.test.js, tests/refactor-guards.test.js]

- [ ] 9. Clarify and fix OpenRouter proxy daily/monthly rate-limit semantics

  What to do: Add failing tests first for daily and monthly server-side limits. Replace the current single day+month bucket key with separate calendar-day and calendar-month counters per client. Define concrete semantics: `SERVER_RATE_LIMIT_MAX` is a server daily override; `DAILY_REQUEST_LIMIT` is the fallback daily limit; `MONTHLY_REQUEST_LIMIT` is the monthly limit; counters reset by UTC calendar day/month; this is local in-memory request accounting, not upstream OpenRouter account telemetry. On 429, return a body with `scope: 'daily'` or `scope: 'monthly'`, `limits: { daily, monthly }`, `usage: { daily, monthly }`, `retryAfterSeconds`, and `resetAt`; keep a compatibility `limit` equal to the active breached limit. Update `/api/status` rateLimit fields if needed so status no longer suggests a rolling window. Cite OpenRouter docs in comments/tests only as semantics context for avoiding deprecated upstream `rate_limit`.
  Must NOT do: Do not call OpenRouter `/api/v1/key`, expose API keys, remove origin gating, or represent local counters as account-level OpenRouter usage.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [Final] | Blocked by: [8]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `lib/openrouter-proxy.cjs:1` - current in-memory usage map.
  - Pattern:  `lib/openrouter-proxy.cjs:60` - current UTC day/month key helper.
  - Pattern:  `lib/openrouter-proxy.cjs:67` - current bucket incorrectly keys monthly count by day+month.
  - Pattern:  `lib/openrouter-proxy.cjs:76` - current `checkRateLimit()` entry point.
  - Pattern:  `lib/openrouter-proxy.cjs:82` - current daily/monthly block condition.
  - Pattern:  `lib/openrouter-proxy.cjs:86` - current `Retry-After` uses `SERVER_RATE_LIMIT_WINDOW_SECONDS`.
  - Pattern:  `lib/openrouter-proxy.cjs:96` - current record increments daily and monthly together in one bucket.
  - Pattern:  `lib/openrouter-proxy.cjs:120` - handler checks rate limit before upstream fetch.
  - Pattern:  `api/chat.js:1` - Vercel chat handler and origin behavior must remain.
  - Pattern:  `lib/server-status.cjs:19` - current status `rateLimit` shape to align.
  - Test:     `tests/openrouter-api.test.js:144` - origin rejection must still pass.
  - Test:     `tests/openrouter-api.test.js:180` - current daily rate-limit test to update.
  - Test:     `tests/api-env.test.js:64` - status payload test to update if `rateLimit` shape changes.
  - External: `https://openrouter.ai/docs/api/reference/limits/` - OpenRouter limit docs; do not use deprecated upstream `rate_limit` object.
  - External: `https://openrouter.ai/docs/api/api-reference/api-keys/get-current-key` - current key fields include `limit`, `limit_remaining`, and usage buckets; this plan does not query them.
  - External: `https://openrouter.ai/docs/cookbook/administration/usage-accounting` - response usage accounting context.

  Acceptance criteria (agent-executable only):
  - [ ] `npx vitest run tests/openrouter-api.test.js tests/api-env.test.js` exits 0 with separate assertions for daily breach, monthly breach across two UTC days in the same month, and reset across a new month.
  - [ ] `node -e "const fs=require('fs'); const text=fs.readFileSync('lib/openrouter-proxy.cjs','utf8'); if (!text.includes('scope') || !text.includes('resetAt') || /rate_limit\\b/.test(text)) process.exit(1);"` exits 0.
  - [ ] `node -e "const fs=require('fs'); const text=fs.readFileSync('lib/openrouter-proxy.cjs','utf8'); if (!text.includes('SERVER_RATE_LIMIT_MAX') || !text.includes('MONTHLY_REQUEST_LIMIT')) process.exit(1);"` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: daily server limit returns daily scope
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; npx vitest run tests/openrouter-api.test.js -t "daily" | tee .omo/evidence/task-9-rate-daily.txt
    Expected: command exits 0; test proves second request gets 429 with `scope: daily`, `limits.daily`, `usage.daily`, `retryAfterSeconds`, and no upstream second fetch
    Evidence: .omo/evidence/task-9-rate-daily.txt

  Scenario: monthly server limit persists across days in same month
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; npx vitest run tests/openrouter-api.test.js -t "monthly" | tee .omo/evidence/task-9-rate-monthly.txt
    Expected: command exits 0; test proves monthly counter blocks a later-day request in the same UTC month and resets in the next UTC month
    Evidence: .omo/evidence/task-9-rate-monthly.txt
  ```

  Commit: YES | Message: `fix(api): clarify proxy usage limits` | Files: [lib/openrouter-proxy.cjs, lib/server-status.cjs, tests/openrouter-api.test.js, tests/api-env.test.js]

- [ ] 10. Refactor `OpenRouterConfig` wrapper responsibilities and formatting

  What to do: Keep `OpenRouterConfig` as the public browser facade but extract pure helpers into `lib/openrouter-config/runtime-options.js`, `lib/openrouter-config/request-messages.js`, `lib/openrouter-config/proxy-errors.js`, and `lib/openrouter-config/usage-allowance.js`. Fix the uneven indentation in `lib/config.js`. The class should coordinate initialization, readiness, `testServerProxy()`, `makeRequest()`, stats, and key-secrecy methods; helpers should read runtime options, build request messages, normalize proxy errors, and enforce client allowance. Preserve root `config.js` global wiring.
  Must NOT do: Do not rewrite networking from scratch, remove class name/public methods, return API keys, change `/api/chat` request body shape, or change medical prompt exports.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [Final] | Blocked by: [7]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `lib/config.js:1` - `MEDICAL_PROMPTS` import/export must stay available.
  - API/Type: `lib/config.js:3` - public `OpenRouterConfig` class name to preserve.
  - API/Type: `lib/config.js:12` - `initialize()` reads `window.envLoader`.
  - API/Type: `lib/config.js:27` - `setApiKey()` must continue throwing.
  - API/Type: `lib/config.js:31` - `getApiKey()` must continue returning empty string.
  - API/Type: `lib/config.js:43` - `testServerProxy()` behavior to preserve while formatting.
  - API/Type: `lib/config.js:76` - `makeRequest()` wrapper to decompose.
  - API/Type: `lib/config.js:81` - usage allowance gate to extract.
  - API/Type: `lib/config.js:91` - system prompt/request message construction to extract.
  - API/Type: `lib/config.js:102` - proxy error normalization to extract.
  - API/Type: `lib/config.js:119` - usage stats wrapper to preserve.
  - Pattern:  `config.js:1` - root browser wrapper imports `OpenRouterConfig`.
  - Pattern:  `config.js:3` - root wrapper creates `window.openRouterConfig`.
  - Test:     `tests/config.test.js:2` - imports `OpenRouterConfig` and `MEDICAL_PROMPTS`.
  - Test:     `tests/config.test.js:36` - initialization behavior.
  - Test:     `tests/config.test.js:96` - proxy test behavior.
  - Test:     `tests/config.test.js:166` - `makeRequest()` behavior.
  - Test:     `tests/runtime-config.test.js:21` - root wrappers initialize without client API key.

  Acceptance criteria (agent-executable only):
  - [ ] `test -f lib/openrouter-config/runtime-options.js -a -f lib/openrouter-config/request-messages.js -a -f lib/openrouter-config/proxy-errors.js -a -f lib/openrouter-config/usage-allowance.js` exits 0.
  - [ ] `node -e "const fs=require('fs'); const text=fs.readFileSync('lib/config.js','utf8'); for (const name of ['class OpenRouterConfig','initialize()','makeRequest(','testServerProxy(','getUsageStats(','getRemainingRequests(','setApiKey','getApiKey']) if (!text.includes(name)) process.exit(1); if (text.split('\n').length > 150) process.exit(1);"` exits 0.
  - [ ] `npx vitest run tests/config.test.js tests/runtime-config.test.js tests/refactor-guards.test.js` exits 0 with helper-level tests for request-message construction, proxy error normalization, and usage allowance.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: OpenRouterConfig still posts standard messages
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; npx vitest run tests/runtime-config.test.js -t "runtime config initializes" | tee .omo/evidence/task-10-openrouter-runtime.txt
    Expected: command exits 0; test proves root wrappers initialize globals, no client API key is stored, and `/api/chat` receives standard system/user messages
    Evidence: .omo/evidence/task-10-openrouter-runtime.txt

  Scenario: usage-limit failure remains graceful
    Tool:     bash
    Steps:    mkdir -p .omo/evidence; npx vitest run tests/config.test.js -t "usage limit reached" | tee .omo/evidence/task-10-openrouter-usage-limit.txt
    Expected: command exits 0; test proves client wrapper rejects when local usage allowance is exhausted without calling `/api/chat`
    Evidence: .omo/evidence/task-10-openrouter-usage-limit.txt
  ```

  Commit: YES | Message: `refactor(config): slim openrouter browser facade` | Files: [lib/config.js, lib/openrouter-config/runtime-options.js, lib/openrouter-config/request-messages.js, lib/openrouter-config/proxy-errors.js, lib/openrouter-config/usage-allowance.js, tests/config.test.js, tests/runtime-config.test.js, tests/refactor-guards.test.js]

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
- Reference the plan file path in the final commit footer: `Plan: .omo/plans/next10-followup-refactors.md`.

## Success criteria
- All Must-Have shipped; all QA scenarios pass with captured evidence; F1-F4 approved; commit history clean.
