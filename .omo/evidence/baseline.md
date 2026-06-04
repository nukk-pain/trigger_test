# Task 1 Baseline And Ownership Ledger

Plan: `.omo/plans/mvp-stabilization-from-assessment.md`
Task: `1. Capture Baseline And Ownership Ledger`
Session: `codex:019e914d-6c28-70d0-9c5a-3a97c418d75c`

## Command Baseline

- `git status --short` captured to `.omo/evidence/task-1-git-status.txt`.
- `npm test` captured through tmux transcript `.omo/evidence/task-1-baseline-tmux.txt`.
- `npm audit --json` captured to `.omo/evidence/task-1-audit.json`.
- `npm outdated --json` captured to `.omo/evidence/task-1-outdated.json`.

## Results

- `npm test`: exit 0.
- Test summary: 16 files passed, 179 tests passed.
- `npm audit --json`: exit 1.
- Audit summary: 11 vulnerabilities total, including 2 critical, 5 high, 4 moderate.
- `npm outdated --json`: exit 1.
- Outdated direct packages:
  - `@vitest/coverage-v8`: 4.0.18 -> wanted/latest 4.1.8.
  - `express`: installed 4.21.2 -> wanted 4.22.2, latest 5.2.1.
  - `jsdom`: installed/wanted 27.4.0, latest 29.1.1.
  - `vitest`: 4.0.18 -> wanted/latest 4.1.8.

## Dirty Worktree Ownership

All pre-existing modified and untracked files in `.omo/evidence/task-1-git-status.txt` are treated as user-owned unless a later plan task explicitly assigns them. Executors must not revert, reset, delete, or overwrite unrelated changes.

Task 1 introduced these orchestration/evidence files:

- `.omo/boulder.json`
- `.omo/evidence/baseline.md`
- `.omo/evidence/task-1-audit.json`
- `.omo/evidence/task-1-baseline.done`
- `.omo/evidence/task-1-baseline-tmux.txt`
- `.omo/evidence/task-1-cleanup-tmux-ls.txt`
- `.omo/evidence/task-1-git-status.txt`
- `.omo/evidence/task-1-outdated.json`

## Manual QA

- Channel: tmux.
- Session: `ulw-qa-baseline`.
- Artifact: `.omo/evidence/task-1-baseline-tmux.txt`.
- Cleanup: `.omo/evidence/task-1-cleanup-tmux-ls.txt` shows no tmux server running after teardown.

## Adversarial QA

- Malformed input: not applicable. Task 1 captures baseline command state only.
- Prompt injection: not applicable. No LLM/user prompt surface exercised.
- Cancel/resume: probed by Boulder state creation in `.omo/boulder.json`.
- Stale state: probed by fresh `git status --short` and plan reread.
- Dirty worktree: probed by `.omo/evidence/task-1-git-status.txt`; unrelated changes preserved.
- Hung or long commands: probed through tmux transcript and `.done` sentinel.
- Flaky tests: baseline `npm test` captured with pass summary.
- Misleading success output: command exit statuses captured in transcript.
- Repeated interruptions: not applicable beyond Boulder continuation state; no interruption occurred during Task 1.
