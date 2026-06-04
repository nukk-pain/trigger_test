# Task 4 Playwright E2E Scaffold

Plan: `.omo/plans/mvp-stabilization-from-assessment.md`
Task: `4. Add Playwright E2E Scaffold`
Session: `codex:019e914d-6c28-70d0-9c5a-3a97c418d75c`

## RED -> GREEN

- RED command: `npm run test:e2e -- --grep "homepage smoke"`
  - Artifact: `.omo/evidence/task-4-red-e2e.txt`
  - Result: exit 1.
  - Expected failure: missing `test:e2e` script.
- Intermediate browser failure:
  - Artifact: `.omo/evidence/task-4-green-e2e.txt`
  - Result: exit 1 before port isolation.
  - Root cause: Playwright reused an unrelated existing server on port 3000 showing `SMPain+`.
  - Fix: `test:e2e` scripts set `PORT=3104` so the scaffold drives this repo.
- GREEN command: `npm run test:e2e -- --grep "homepage smoke"`
  - Artifact: `.omo/evidence/task-4-green-e2e.txt`
  - Result: exit 0.
  - Screenshot: `.omo/evidence/task-4-homepage.png`.
- Full Task 4 transcript:
  - Artifact: `.omo/evidence/task-4-e2e-tmux.txt`
  - `npm run test:e2e`: exit 0.
  - `npm test`: exit 0.

## Implementation

- Added `@playwright/test`.
- Added `test:e2e` and `test:e2e:headed` scripts.
- Added `playwright.config.js` with Chromium project and local web server.
- Added `tests/e2e/homepage-smoke.spec.js`.
- Added `tests/e2e/README.md`.
- Updated `vitest.config.js` to exclude `tests/e2e/**` from Vitest.

## Manual QA

- Channel: Browser use through Playwright Chromium.
- Exact test: `npm run test:e2e -- --grep "homepage smoke"`.
- Observable: H1 `AI 셀프 마사지 가이드` visible on the real page.
- Evidence: `.omo/evidence/task-4-homepage.png`.

## Cleanup

- Tmux session `ulw-qa-e2e` killed.
- Cleanup receipt: `.omo/evidence/task-4-cleanup-tmux-ls.txt`.
- Generated Playwright temp folders `test-results` and `playwright-report` removed.
- Cleanup receipt: `.omo/evidence/task-4-cleanup-generated.txt`.

## Adversarial QA

- Malformed input: not applicable. Smoke test has no user input.
- Prompt injection: not applicable. No LLM surface exercised.
- Cancel/resume: Boulder state remains active and evidence is durable.
- Stale state: probed by port-collision failure and isolated-port fix.
- Dirty worktree: task touched package files, Playwright config, E2E files, and Vitest config.
- Hung or long commands: probed through tmux transcript and `.done` sentinel.
- Flaky tests: probed by direct E2E run and tmux E2E run.
- Misleading success output: exit statuses captured for E2E and Vitest.
- Repeated interruptions: not applicable; no interruption occurred.
