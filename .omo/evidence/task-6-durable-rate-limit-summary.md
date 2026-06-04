# Task 6 Durable Rate And Cost Limiter Summary

## Scope
- Added `lib/rate-limit-store.cjs` as the shared limiter adapter.
- Kept local/test default on memory counters.
- Added Upstash REST pipeline support for production durable counters.
- Normalized client keys by taking the first comma-separated `x-forwarded-for` value, then `x-real-ip`, then socket address.
- Added estimated token budget checks from input character estimate plus `MAX_TOKENS`.
- Updated `lib/openrouter-proxy.cjs` to await limiter decisions and record only after a successful upstream response.

## RED
- `.omo/evidence/task-6-red-rate-limit-store.txt`
- Failing cases covered IP normalization, Upstash use, production fail-closed, and token budget exhaustion.

## GREEN
- `.omo/evidence/task-6-green-rate-limit-tests.txt`: 2 files, 14 tests passed.
- `.omo/evidence/task-6-full-test.txt`: 18 files, 193 tests passed.

## Manual QA
- `.omo/evidence/task-6-rate-first-http.txt`: first request through memory limiter returned `200` and mock output `ok`.
- `.omo/evidence/task-6-rate-second-http.txt`: second request from same normalized forwarded IP returned `429`, `Retry-After`, and `RATE_LIMIT_EXCEEDED`.
- `.omo/evidence/task-6-rate-http-check.txt`: checker returned `task-6 memory rate http PASS`.
- `.omo/evidence/task-6-durable-missing-http.txt`: production Upstash mode without credentials returned `503` and `RATE_LIMIT_STORE_UNAVAILABLE`.
- `.omo/evidence/task-6-durable-http-check.txt`: checker returned `task-6 durable missing http PASS`.

## Non-Persistence Check
- Upstash mock tests assert limiter request bodies include anonymous counter keys only.
- Limiter request bodies do not include OpenRouter API keys, Upstash tokens, or prompt/pain text.

## Cleanup
- `.omo/evidence/task-6-rate-app-tmux.txt`
- `.omo/evidence/task-6-openrouter-mock-tmux.txt`
- `.omo/evidence/task-6-durable-missing-tmux.txt`
- `.omo/evidence/task-6-cleanup-tmux-ls.txt`: no tmux server remained.
