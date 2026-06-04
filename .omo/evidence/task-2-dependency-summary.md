# Task 2 Dependency Security Baseline

Plan: `.omo/plans/mvp-stabilization-from-assessment.md`
Task: `2. Patch Dependency Security Baseline`
Session: `codex:019e914d-6c28-70d0-9c5a-3a97c418d75c`

## Scope

Only dependency files were changed:

- `package.json`
- `package-lock.json`

No production source files were changed for this task.

## TDD Exemption

This task is a dependency version bump with no intended behavior delta. The plan explicitly allows dependency-only bumps to skip new RED tests when no production behavior changes occur. Verification is before/after command evidence instead of a new failing test.

## Changes

- `express`: `^4.18.0` -> `^4.22.2`
- `vitest`: `^4.0.18` -> `^4.1.8`
- `@vitest/coverage-v8`: `^4.0.18` -> `^4.1.8`
- `jsdom`: `^27.4.0` -> `^29.1.1`
- Transitive `path-to-regexp`: patched to `0.1.13` through `npm audit fix`.

## Verification

- `npm test`: exit 0.
- Test summary: 16 files passed, 179 tests passed.
- `npm audit --audit-level=high`: exit 0.
- Final audit JSON: `.omo/evidence/task-2-audit-after.json` reports 0 vulnerabilities.
- Express major check: exit 0, dependency remains `^4.22.2`.
- `npm ls express path-to-regexp`: exit 0, `express@4.22.2` uses `path-to-regexp@0.1.13`.

## Manual QA

- Channel: tmux.
- Session: `ulw-qa-deps`.
- Artifact: `.omo/evidence/task-2-deps-tmux.txt`.
- Cleanup: `.omo/evidence/task-2-cleanup-tmux-ls.txt` shows no tmux server running after teardown.

## Residual Status

- `npm outdated --json`: only `express` remains listed because `latest` is 5.2.1.
- This is intentional: Express 5 migration is explicitly out of scope for this stabilization task.

## Adversarial QA

- Malformed input: not applicable. No runtime input behavior changed.
- Prompt injection: not applicable. No LLM/prompt surface changed.
- Cancel/resume: Boulder state remains active and task evidence is durable.
- Stale state: probed by final audit/outdated/package summaries after install.
- Dirty worktree: task touched only `package.json` and `package-lock.json`.
- Hung or long commands: probed through tmux transcript and `.done` sentinel.
- Flaky tests: full `npm test` rerun captured after dependency changes.
- Misleading success output: exit statuses for test, audit, major check, and `npm ls` captured.
- Repeated interruptions: not applicable; no interruption occurred.
