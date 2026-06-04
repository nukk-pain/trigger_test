#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT:-3111}}"
EVIDENCE_DIR="${EVIDENCE_DIR:-.omo/evidence}"

mkdir -p "$EVIDENCE_DIR"

curl -i "$BASE_URL/api/env" > "$EVIDENCE_DIR/task-11-env-http.txt"
curl -i "$BASE_URL/api/status" > "$EVIDENCE_DIR/task-11-status-http.txt"
curl -i -X OPTIONS "$BASE_URL/api/chat" > "$EVIDENCE_DIR/task-11-options-http.txt"
curl -i -X GET "$BASE_URL/api/chat" > "$EVIDENCE_DIR/task-11-method-http.txt"
curl -i -X POST "$BASE_URL/api/chat" \
  -H 'Origin: https://evil.example' \
  -H 'Content-Type: application/json' \
  --data '{"messages":[{"role":"user","content":"목 통증"}]}' \
  > "$EVIDENCE_DIR/task-11-origin-http.txt"
curl -i -X POST "$BASE_URL/api/chat" \
  -H 'Content-Type: application/json' \
  --data '{"messages":[{"role":"hacker","content":"목 통증"}]}' \
  > "$EVIDENCE_DIR/task-11-validation-http.txt"
curl -i -X POST "$BASE_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: 203.0.113.77, 10.0.0.1' \
  --data '{"messages":[{"role":"user","content":"목 통증"}]}' \
  > "$EVIDENCE_DIR/task-11-rate-first-http.txt"
curl -i -X POST "$BASE_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: 203.0.113.77, 10.0.0.1' \
  --data '{"messages":[{"role":"user","content":"목 통증"}]}' \
  > "$EVIDENCE_DIR/task-11-rate-second-http.txt"

grep -q 'CHAT_VALIDATION_FAILED' "$EVIDENCE_DIR/task-11-validation-http.txt"
grep -Eq 'RATE_LIMIT|429 Too Many Requests' "$EVIDENCE_DIR/task-11-rate-second-http.txt"
grep -q '200 OK' "$EVIDENCE_DIR/task-11-env-http.txt"
grep -q '200 OK' "$EVIDENCE_DIR/task-11-status-http.txt"
grep -q '200 OK' "$EVIDENCE_DIR/task-11-options-http.txt"
grep -q '405 Method Not Allowed' "$EVIDENCE_DIR/task-11-method-http.txt"
grep -q '403 Forbidden' "$EVIDENCE_DIR/task-11-origin-http.txt"
grep -q '400 Bad Request' "$EVIDENCE_DIR/task-11-validation-http.txt"
grep -q '200 OK' "$EVIDENCE_DIR/task-11-rate-first-http.txt"
grep -q '429 Too Many Requests' "$EVIDENCE_DIR/task-11-rate-second-http.txt"

if grep -R -E 'sk-[A-Za-z0-9]{12,}|redis-review-secret-value|sk-review-secret-value' \
  "$EVIDENCE_DIR"/task-11-*-http.txt; then
  echo 'Secret leaked in HTTP QA artifacts' >&2
  exit 1
fi
