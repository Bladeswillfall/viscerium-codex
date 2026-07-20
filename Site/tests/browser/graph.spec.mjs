import { mkdirSync } from 'node:fs';
import { test, expect } from '@playwright/test';

mkdirSync('timeline-browser-diagnostics', { recursive: true });

async function inspectGraph(page, viewport, screenshot) {
  await page.setViewportSize(viewport);
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto('http://127.0.0.1:4321/graph/', { waitUntil: 'networkidle' });

  const graph = page.locator('.world-graph graph-component');
  const canvas = graph.locator('canvas');
  await expect.poll(() => graph.getAttribute('data-sitemap')).not.toBe('{}');
  await page.waitForTimeout(250);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  await expect(graph).toBeVisible({ timeout: 10_000 });
  await expect(canvas).toBeVisible({ timeout: 10_000 });
  await expect(graph.locator('button')).not.toHaveCount(0);
  await page.waitForTimeout(500);

  const geometry = await canvas.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      bitmapWidth: element.width,
      bitmapHeight: element.height,
      dataLength: element.toDataURL('image/png').length,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });

  await canvas.screenshot({ path: `timeline-browser-diagnostics/${screenshot}` });
  expect(geometry.width).toBeGreaterThan(240);
  expect(geometry.height).toBeGreaterThan(180);
  expect(geometry.bitmapWidth).toBeGreaterThan(240);
  expect(geometry.bitmapHeight).toBeGreaterThan(180);
  expect(geometry.dataLength).toBeGreaterThan(1_000);
  expect(geometry.documentOverflow).toBe(false);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
}

test('world graph renders and fits desktop and mobile viewports', async ({ page }) => {
  await inspectGraph(page, { width: 1440, height: 1000 }, 'world-graph-desktop.png');
  await inspectGraph(page, { width: 390, height: 844 }, 'world-graph-mobile.png');
});
