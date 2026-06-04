# Task 5 API Hardening Summary

## Scope
- Added shared chat payload validation in `lib/chat-validation.cjs`.
- Hardened `/api/chat` request validation and upstream/internal error responses in `lib/openrouter-proxy.cjs`.
- Added local Express JSON body limit and oversized payload error contract in `server.js`.
- Added local `OPTIONS /api/chat` handling.

## RED
- `.omo/evidence/task-5-red-validation-tests.txt`
- Failing cases covered invalid roles, empty content, too many messages, overlong content, raw upstream error leakage, and oversized local JSON bodies.

## GREEN
- `.omo/evidence/task-5-green-validation-tests.txt`
- `.omo/evidence/task-5-full-test.txt`
- Targeted suite passed: `tests/chat-validation.test.js`, `tests/server-routes.test.js`, `tests/openrouter-api.test.js`.
- Full Vitest suite passed: 17 files, 188 tests.

## Manual QA
- `.omo/evidence/task-5-invalid-chat-http.txt`: invalid chat payload returns `400` and `CHAT_VALIDATION_FAILED`.
- `.omo/evidence/task-5-large-body-http.txt`: oversized JSON body returns `413` and `PAYLOAD_TOO_LARGE`.
- `.omo/evidence/task-5-options-http.txt`: local chat preflight returns `200`.
- `.omo/evidence/task-5-http-check.txt`: HTTP checker returned `task-5 http PASS`.

## Cleanup
- `.omo/evidence/task-5-server-tmux.txt`: captured local server transcript.
- `.omo/evidence/task-5-cleanup-tmux-ls.txt`: server tmux session cleaned up.
