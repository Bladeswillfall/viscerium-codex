import { mkdirSync, writeFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1174, height: 1320 } });

async function navigateToGlobalTimeline(page) {
  await page.goto('http://127.0.0.1:4321/timelines/', { waitUntil: 'networkidle' });
  const globalLink = page.getByRole('link', { name: 'The VISCERIUM Timeline', exact: true }).first();
  await expect(globalLink).toBeVisible();
  await globalLink.click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-vc-island-mounted="true"]')).toHaveCount(1, { timeout: 5_000 });
  await expect(page.locator('[data-vc-canvas]')).toBeVisible();
}

async function openGlobalTimeline(page) {
  await navigateToGlobalTimeline(page);
  const sidebarToggle = page.getByRole('button', { name: 'Hide sidebar' });
  if (await sidebarToggle.isVisible()) await sidebarToggle.click();
  await page.waitForTimeout(600);
}

function visibleItemMetrics(canvas) {
  const canvasRect = canvas.getBoundingClientRect();
  const items = [...canvas.querySelectorAll('.vis-item.vc-timeline-item')]
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => (
      rect.width > 0
      && rect.height > 0
      && rect.right > canvasRect.left
      && rect.left < canvasRect.right
      && rect.bottom > canvasRect.top
      && rect.top < canvasRect.bottom
    ));
  return {
    canvasTop: canvasRect.top,
    canvasBottom: canvasRect.bottom,
    count: items.length,
    firstTop: items.length ? Math.min(...items.map((rect) => rect.top)) : null,
    lastBottom: items.length ? Math.max(...items.map((rect) => rect.bottom)) : null,
  };
}

test('unified chronology uses compact stable Chronos and overview heights', async ({ page }) => {
  await openGlobalTimeline(page);

  const canvas = page.locator('[data-vc-canvas]');
  const metrics = await canvas.evaluate((element) => {
    const canvasRect = element.getBoundingClientRect();
    const timeline = element.querySelector(':scope > .vis-timeline');
    const timelineRect = timeline?.getBoundingClientRect();
    const items = [...element.querySelectorAll('.vis-item.vc-timeline-item')]
      .filter((item) => item.getClientRects().length > 0)
      .map((item) => item.getBoundingClientRect());
    const labels = [...element.querySelectorAll('.vis-labelset > .vis-label')]
      .filter((item) => item.getClientRects().length > 0)
      .map((item) => item.textContent?.trim() ?? '');

    return {
      canvasHeight: canvasRect.height,
      timelineHeight: timelineRect?.height ?? 0,
      eventCount: items.length,
      firstEventInset: items.length ? Math.min(...items.map((rect) => rect.top)) - canvasRect.top : null,
      labels,
      hasPinnedHeight: element.hasAttribute('data-vc-pinned-row-height'),
      hasAdaptiveHeight: element.hasAttribute('data-vc-applied-adaptive-height'),
    };
  });
  const visible = await canvas.evaluate(visibleItemMetrics);
  const overview = await page.locator('[data-vc-minimap]').evaluate((element) => ({
    hostHeight: element.getBoundingClientRect().height,
    timelineHeight: element.querySelector(':scope > .vis-timeline')?.getBoundingClientRect().height ?? 0,
  }));

  mkdirSync('timeline-browser-diagnostics', { recursive: true });
  writeFileSync(
    'timeline-browser-diagnostics/unified-native-layout.json',
    JSON.stringify({ metrics, visible, overview }, null, 2),
  );
  await page.screenshot({
    path: 'timeline-browser-diagnostics/unified-native-layout.png',
    fullPage: true,
  });

  expect(metrics.eventCount).toBeGreaterThan(1);
  expect(metrics.labels).toContain('Chronology');
  expect(metrics.canvasHeight).toBeLessThanOrEqual(386);
  expect(Math.abs(metrics.timelineHeight - metrics.canvasHeight)).toBeLessThanOrEqual(2);
  expect(metrics.hasPinnedHeight).toBe(false);
  expect(metrics.hasAdaptiveHeight).toBe(false);
  expect(visible.count).toBeGreaterThan(0);
  expect(visible.lastBottom).toBeLessThanOrEqual(visible.canvasBottom + 2);
  expect(visible.canvasBottom - visible.lastBottom).toBeLessThanOrEqual(48);
  expect(overview.hostHeight).toBeLessThanOrEqual(74);
  expect(overview.timelineHeight).toBeLessThanOrEqual(74);
});

test('grouped Chronos does not perform its delayed animated zoom jiggle', async ({ page }) => {
  await navigateToGlobalTimeline(page);

  const samples = await page.locator('[data-vc-canvas]').evaluate((canvas) => new Promise((resolve) => {
    const positions = [];
    const started = performance.now();

    function sample() {
      const canvasRect = canvas.getBoundingClientRect();
      const item = [...canvas.querySelectorAll('.vis-item.vc-timeline-item')].find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0
          && rect.height > 0
          && rect.right > canvasRect.left
          && rect.left < canvasRect.right;
      });
      if (item) positions.push(item.getBoundingClientRect().left);
      if (performance.now() - started < 850) window.requestAnimationFrame(sample);
      else resolve(positions);
    }

    window.requestAnimationFrame(sample);
  }));

  const drift = samples.length ? Math.max(...samples) - Math.min(...samples) : Number.POSITIVE_INFINITY;
  writeFileSync(
    'timeline-browser-diagnostics/unified-idle-drift.json',
    JSON.stringify({ samples, drift }, null, 2),
  );

  expect(samples.length).toBeGreaterThan(20);
  expect(drift).toBeLessThanOrEqual(3);
});
