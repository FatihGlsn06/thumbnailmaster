import { test, expect } from '@playwright/test';

test.describe('ThumbnailMAX Smoke Tests', () => {

  test('sayfa yükleniyor ve React render oluyor', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Thumbnail/i);
    const rootHtml = await page.locator('#root').innerHTML();
    expect(rootHtml.length).toBeGreaterThan(100);
  });

  test('TEST_MODE: Pro badge ve pricing section gizli', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Planını Seç')).toHaveCount(0);
    await expect(page.locator('text=Pro\'ya Yükselt')).toHaveCount(0);
  });

  test('nav bar görünüyor', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('responsive: mobil görünüm crash etmiyor', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    await expect(page.locator('#root')).toBeVisible();
    const rootHtml = await page.locator('#root').innerHTML();
    expect(rootHtml.length).toBeGreaterThan(100);
  });

  test('WebGL hatası uygulama crash etmiyor', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));
    await page.goto('/');
    await page.waitForTimeout(2000);
    const rootHtml = await page.locator('#root').innerHTML();
    expect(rootHtml.length).toBeGreaterThan(100);
    const criticalErrors = pageErrors.filter(e =>
      !e.includes('WebGL') && !e.includes('THREE')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('tablet görünüm render oluyor', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    const rootHtml = await page.locator('#root').innerHTML();
    expect(rootHtml.length).toBeGreaterThan(100);
  });

});
