import { mkdirSync, writeFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1174, height: 1320 } });

async function openGlobalTimeline(page) {
  await page.goto('http://127.0.0.1:4321/timelines/', { waitUntil: 'networkidle' });
  const globalLink = page.getByRole('link', { name: 'The VISCERIUM Timeline', exact: true }).first();
  await expect(globalLink).toBeVisible();
  await globalLink.click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-vc-island-mounted="true"]')).toHaveCount(1, { timeout: 5_000 });
  await expect(page.locator('[data-vc-canvas]')).toBeVisible();
  const sidebarToggle = page.getByRole('button', { name: 'Hide sidebar' });
  if (await sidebarToggle.isVisible()) await sidebarToggle.click();
  await page.waitForTimeout(600);
}

test('unified chronology keeps one stable native Chronos group', async ({ page }) => {
  await openGlobalTimeline(page);

  const metrics = await page.locator('[data-vc-canvas]').evaluate((canvas) => {
    const canvasRect = canvas.getBoundingClientRect();
    const timeline = canvas.querySelector(':scope > .vis-timeline');
    const timelineRect = timeline?.getBoundingClientRect();
    const items = [...canvas.querySelectorAll('.vis-item.vc-timeline-item')]
      .filter((element) => element.getClientRects().length > 0)
      .map((element) => element.getBoundingClientRect());
    const labels = [...canvas.querySelectorAll('.vis-labelset > .vis-label')]
      .filter((element) => element.getClientRects().length > 0)
      .map((element) => element.textContent?.trim() ?? '');

    return {
      canvasHeight: canvasRect.height,
      timelineHeight: timelineRect?.height ?? 0,
      eventCount: items.length,
      firstEventInset: items.length ? Math.min(...items.map((rect) => rect.top)) - canvasRect.top : null,
      labels,
      hasPinnedHeight: canvas.hasAttribute('data-vc-pinned-row-height'),
      hasAdaptiveHeight: canvas.hasAttribute('data-vc-applied-adaptive-height'),
    };
  });

  mkdirSync('timeline-browser-diagnostics', { recursive: true });
  writeFileSync(
    'timeline-browser-diagnostics/unified-native-layout.json',
    JSON.stringify(metrics, null, 2),
  );
  await page.screenshot({
    path: 'timeline-browser-diagnostics/unified-native-layout.png',
    fullPage: true,
  });

  expect(metrics.eventCount).toBeGreaterThan(1);
  expect(metrics.labels).toContain('Chronology');
  expect(Math.abs(metrics.timelineHeight - metrics.canvasHeight)).toBeLessThanOrEqual(2);
  expect(metrics.hasPinnedHeight).toBe(false);
  expect(metrics.hasAdaptiveHeight).toBe(false);
});
