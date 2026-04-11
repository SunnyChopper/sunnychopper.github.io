/**
 * Debug: detect redirect loops on admin routes when logged out.
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5174';

test.describe('admin auth redirect (logged out)', () => {
  test('no redirect storm on /admin/dashboard', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const urls: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        urls.push(frame.url());
      }
    });
    await page.goto(`${BASE}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const unique = [...new Set(urls.map((u) => new URL(u).pathname + new URL(u).search))];
    expect(unique.length).toBeLessThan(15);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('no redirect storm on /admin/login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const urls: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        urls.push(frame.url());
      }
    });
    await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const unique = [...new Set(urls.map((u) => new URL(u).pathname + new URL(u).search))];
    expect(unique.length).toBeLessThan(15);
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
