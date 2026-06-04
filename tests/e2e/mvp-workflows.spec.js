const { mkdirSync } = require('node:fs');
const { test, expect } = require('@playwright/test');

const evidenceDir = '.omo/evidence';

function structuredOutput() {
  return JSON.stringify({
    targetMuscles: ['상부 승모근'],
    summary: '목 뒤 긴장 완화를 위한 안전한 자가 관리 안내입니다.',
    steps: [{
      title: '상부 승모근 이완',
      method: '손가락 끝으로 불편하지 않은 압력만 사용해 천천히 누릅니다.',
      duration: '30초',
      caution: '저림이나 통증 증가가 있으면 즉시 중단하세요.'
    }],
    stopIf: ['통증이 날카롭게 심해지면 중단하세요.'],
    seekCareIf: ['증상이 빠르게 악화되면 의료기관에 문의하세요.'],
    disclaimer: '이 안내는 진단이 아니라 일반적인 셀프 케어 정보입니다.'
  });
}

test.beforeEach(async ({ page }) => {
  mkdirSync(evidenceDir, { recursive: true });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('safe happy path renders structured guidance', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ output: structuredOutput() })
  }));

  await page.locator('[data-area="neck-front"]').click();
  await page.locator('#pain-description').fill('컴퓨터 작업 뒤 목 뒤가 뻐근합니다.');
  await page.locator('#analyze-pain').click();

  await expect(page.locator('.structured-step-card')).toContainText('상부 승모근 이완');
  await expect(page.locator('#medical-safety-notice')).toContainText('이 도구는 진단이 아니며');
  await page.screenshot({ path: `${evidenceDir}/task-11-happy.png`, fullPage: true });
});

test('red flag path blocks chat requests', async ({ page }) => {
  let chatCalls = 0;
  await page.route('**/api/chat', route => {
    chatCalls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ output: 'unexpected' }) });
  });

  await page.locator('[data-area="neck-front"]').click();
  await page.locator('#pain-description').fill('목이 아프고 숨이 차며 가슴 통증이 있습니다.');
  await page.locator('#analyze-pain').click();

  await expect(page.locator('#red-flag-warning')).not.toHaveClass(/hidden/);
  expect(chatCalls).toBe(0);
  await page.screenshot({ path: `${evidenceDir}/task-11-red-flag.png`, fullPage: true });
});

test('unsupported area path shows MVP notice without selecting area', async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector('[data-area="wrist-left"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  await expect(page.locator('#mvp-area-notice')).toContainText('현재 MVP에서 지원 준비 중입니다');
  await expect(page.locator('#live-selection-text')).toHaveText('아픈 곳을 클릭하세요');
  await page.screenshot({ path: `${evidenceDir}/task-11-unsupported-area.png`, fullPage: true });
});

test('unsupported area with red-flag text still shows emergency warning', async ({ page }) => {
  let chatCalls = 0;
  await page.route('**/api/chat', route => {
    chatCalls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ output: 'unexpected' }) });
  });

  await page.evaluate(() => {
    document.querySelector('[data-area="wrist-left"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.locator('#pain-description').fill('손목도 아프고 숨이 차며 가슴 통증이 있습니다.');
  await page.locator('#analyze-pain').click();

  await expect(page.locator('#red-flag-warning')).not.toHaveClass(/hidden/);
  await expect(page.locator('#massage-guide')).toBeHidden();
  expect(chatCalls).toBe(0);
  await page.screenshot({ path: `${evidenceDir}/task-11-unsupported-red-flag.png`, fullPage: true });
});

test('malformed AI output renders safe fallback', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ output: '<script>alert(1)</script>bad' })
  }));

  await page.locator('[data-area="neck-front"]').click();
  await page.locator('#pain-description').fill('목 뒤가 뻐근합니다.');
  await page.locator('#analyze-pain').click();

  await expect(page.locator('.fallback-guidance')).toContainText('안전하게 형식화할 수 없습니다');
  await expect(page.locator('#massage-guide')).not.toContainText('<script>');
  await page.screenshot({ path: `${evidenceDir}/task-11-malformed-fallback.png`, fullPage: true });
});
