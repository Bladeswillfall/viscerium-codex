import { mkdirSync } from 'node:fs';
import { test, expect } from '@playwright/test';

mkdirSync('timeline-browser-diagnostics', { recursive: true });

async function installTheme(page, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem('starlight-theme', selectedTheme);
    document.documentElement.dataset.theme = selectedTheme;
  }, theme);
}

async function inspectGraph(page, viewport, screenshot, theme) {
  await installTheme(page, theme);
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
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.waitForTimeout(500);

  const graphColors = await graph.evaluate((element) => {
    const styles = getComputedStyle(element);
    return Object.fromEntries([
      '--slsg-graph-minimized-bg-color',
      '--slsg-node-color',
      '--slsg-node-color-current',
      '--slsg-node-color-tag',
      '--slsg-link-color',
      '--slsg-label-color',
    ].map((name) => [name, styles.getPropertyValue(name).trim()]));
  });

  for (const [name, value] of Object.entries(graphColors)) {
    expect(value, `${theme} ${name} must resolve to RGB for the canvas renderer`).toMatch(/^rgb\(/i);
    expect(value, `${theme} ${name} must not fall back to black`).not.toMatch(/^rgb\(\s*0(?:\s*,\s*0){2}\s*\)$/i);
  }
  expect(graphColors['--slsg-node-color']).not.toBe(graphColors['--slsg-graph-minimized-bg-color']);
  expect(graphColors['--slsg-label-color']).not.toBe(graphColors['--slsg-graph-minimized-bg-color']);
  expect(graphColors['--slsg-link-color']).not.toBe(graphColors['--slsg-graph-minimized-bg-color']);

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

test('world graph renders with readable dark-theme colours', async ({ page }) => {
  await inspectGraph(page, { width: 1440, height: 1000 }, 'world-graph-dark.png', 'dark');
});

test('world graph renders with readable light-theme colours', async ({ page }) => {
  await inspectGraph(page, { width: 390, height: 844 }, 'world-graph-light.png', 'light');
});