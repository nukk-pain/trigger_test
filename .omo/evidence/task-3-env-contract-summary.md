# Task 3 Public/Private Runtime Env Contract

Plan: `.omo/plans/mvp-stabilization-from-assessment.md`
Task: `3. Add Public/Private Runtime Env Contract`
Session: `codex:019e914d-6c28-70d0-9c5a-3a97c418d75c`

## RED -> GREEN

- RED test: `.omo/evidence/task-3-red-api-env-test.txt`
  - Command: `npm test -- tests/api-env.test.js`
  - Result: exit 1.
  - Expected failure: `.env.example` did not exist.
- GREEN targeted test: `.omo/evidence/task-3-green-api-env-test.txt`
  - Command: `npm test -- tests/api-env.test.js`
  - Result: exit 0.
  - Summary: 1 file passed, 4 tests passed.
- GREEN full suite: `.omo/evidence/task-3-full-test.txt`
  - Command: `npm test`
  - Result: exit 0.
  - Summary: 16 files passed, 180 tests passed.

## Implementation

- Added `.env.example` with placeholder-only MVP runtime config.
- Added `.gitignore` exception so `.env.example` can be tracked.
- Updated README environment and deployment notes to state this stabilization path is Vercel-only.
- Added test coverage proving required env example keys exist and server-only secrets stay out of public payloads.

## Manual QA

- Channel: HTTP call.
- Server session: `ulw-qa-env`.
- Request artifact: `.omo/evidence/task-3-env-http.txt`.
- Check artifact: `.omo/evidence/task-3-env-http-check.txt`.
- Contract artifact: `.omo/evidence/task-3-env-contract.txt`.
- Result: `/api/env` returned HTTP 200 and did not contain fake `sk-secret` or `redis-secret` values.
- Cleanup: `.omo/evidence/task-3-cleanup-tmux-ls.txt` shows no tmux server running after teardown.

## Adversarial QA

- Malformed input: not applicable. `/api/env` accepts GET without body.
- Prompt injection: not applicable. No LLM surface changed.
- Cancel/resume: Boulder state remains active and evidence is durable.
- Stale state: probed by full `npm test` after changes.
- Dirty worktree: task touched `.env.example`, `.gitignore`, `README.md`, and `tests/api-env.test.js`; unrelated changes preserved.
- Hung or long commands: probed by tmux server startup and cleanup receipt.
- Flaky tests: probed by targeted and full Vitest runs.
- Misleading success output: RED and GREEN exit code files captured.
- Repeated interruptions: not applicable; no interruption occurred.
