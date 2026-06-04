const { mkdirSync } = require('node:fs');
const { test, expect } = require('@playwright/test');

test('homepage smoke shows the AI self massage guide heading', async ({ page }) => {
  mkdirSync('.omo/evidence', { recursive: true });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI 셀프 마사지 가이드' })).toBeVisible();
  await expect(page.locator('.initial-safety-notice')).toContainText('이 도구는 진단이 아니며');
  await expect(page.locator('.initial-safety-notice')).toContainText('중단 기준');
  await expect(page.locator('.initial-safety-notice')).toContainText('진료 기준');
  await page.screenshot({ path: '.omo/evidence/task-4-homepage.png', fullPage: true });
});
