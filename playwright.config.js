const { defineConfig, devices } = require('@playwright/test');

const port = Number(process.env.PORT || 3000);

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL || `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  ...(process.env.BASE_URL ? {} : {
    webServer: {
      command: `PORT=${port} OPENROUTER_MODEL=test/model npm start`,
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000
    }
  })
});
