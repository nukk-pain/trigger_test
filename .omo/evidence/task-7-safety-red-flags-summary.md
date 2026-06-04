# Task 7 Safety And Red-Flag Summary

## Scope
- Added `src/browser/red-flags.js` with deterministic Korean/English red-flag text and condition matching.
- Updated `src/browser/analysis-flow.js` to block red-flag cases before usage checks or AI calls.
- Added always-visible non-diagnosis, stop, and care-seeking copy to safe result rendering.
- Updated the red-flag warning markup to include the non-diagnosis emergency copy.

## RED
- `.omo/evidence/task-7-red-safety-tests.txt`
- Failing cases covered breathing trouble variants, fever, trauma, severe numbness, bowel/bladder changes, rapidly worsening pain, and missing safe-result safety copy.

## GREEN
- `.omo/evidence/task-7-green-safety-tests.txt`: 2 files, 12 tests passed.
- `.omo/evidence/task-7-full-test.txt`: 18 files, 202 tests passed.

## Browser QA
- `.omo/evidence/task-7-browser-qa.txt`: browser QA returned `task-7 browser QA PASS`.
- `.omo/evidence/task-7-red-flag.png`: red-flag path screenshot; `/api/chat` call count was 0.
- `.omo/evidence/task-7-safe-disclaimer.png`: safe path screenshot with non-diagnosis, stop, and care-seeking copy.

## Cleanup
- `.omo/evidence/task-7-safety-server-tmux.txt`
- `.omo/evidence/task-7-cleanup-tmux-ls.txt`: no tmux server remained.
