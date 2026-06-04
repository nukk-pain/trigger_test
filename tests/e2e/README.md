# E2E Evidence Policy

Playwright tests drive the real local page through `npm start`.

Required evidence for plan tasks:

- Save browser screenshots under `.omo/evidence/`.
- Use route mocks for AI responses unless a task explicitly requires live OpenRouter.
- Keep tests deterministic and independent of real API keys.
