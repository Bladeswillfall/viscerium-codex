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
  await page.waitForTimeout(1_000);
}

function visibleEventMetrics(canvas) {
  const canvasRect = canvas.getBoundingClientRect();
  const items = [...canvas.querySelectorAll('.vis-item.vc-timeline-item')]
    .map((element) => ({
      rect: element.getBoundingClientRect(),
      style: getComputedStyle(element),
    }))
    .filter(({ rect, style }) => (
      rect.width > 0
      && rect.height > 0
      && style.display !== 'none'
      && style.visibility !== 'hidden'
    ));
  const visibleItems = items.filter(({ rect }) => (
    rect.bottom > canvasRect.top
    && rect.top < canvasRect.bottom
  ));

  return {
    canvasTop: canvasRect.top,
    canvasBottom: canvasRect.bottom,
    canvasHeight: canvasRect.height,
    count: visibleItems.length,
    totalCount: items.length,
    firstTop: visibleItems.length ? Math.min(...visibleItems.map(({ rect }) => rect.top)) : null,
    lastBottom: visibleItems.length ? Math.max(...visibleItems.map(({ rect }) => rect.bottom)) : null,
    allFirstTop: items.length ? Math.min(...items.map(({ rect }) => rect.top)) : null,
    allLastBottom: items.length ? Math.max(...items.map(({ rect }) => rect.bottom)) : null,
  };
}

test('the unified chronology starts at the top and its final rows remain reachable', async ({ page }) => {
  await openGlobalTimeline(page);

  const canvas = page.locator('[data-vc-canvas]');
  await expect(canvas).toHaveAttribute('data-vc-measured-content-height', /\d+/);
  await expect(canvas).toHaveAttribute('data-vc-applied-adaptive-height', /\d+/);

  const initialMetrics = await canvas.evaluate(visibleEventMetrics);
  const initialScroll = await canvas.evaluate((element) => {
    const scroller = element.querySelector('.vis-panel.vis-left.vis-vertical-scroll');
    return {
      scrollTop: scroller?.scrollTop ?? null,
      scrollMaximum: scroller
        ? Math.max(0, scroller.scrollHeight - scroller.clientHeight)
        : null,
    };
  });
  const initial = { ...initialMetrics, ...initialScroll };

  mkdirSync('timeline-browser-diagnostics', { recursive: true });
  writeFileSync(
    'timeline-browser-diagnostics/unified-content-fit.json',
    JSON.stringify(initial, null, 2),
  );
  await page.screenshot({
    path: 'timeline-browser-diagnostics/unified-content-fit.png',
    fullPage: true,
  });

  expect(initial.count).toBeGreaterThan(1);
  expect(initial.totalCount).toBeGreaterThan(1);
  expect(initial.scrollTop).toBe(0);
  expect(initial.firstTop - initial.canvasTop).toBeLessThan(Math.min(96, initial.canvasHeight * 0.2));

  const allRowsFitInitially = (
    initial.allFirstTop >= initial.canvasTop - 2
    && initial.allLastBottom <= initial.canvasBottom + 2
  );
  if (allRowsFitInitially) {
    expect(initial.canvasBottom - initial.allLastBottom).toBeLessThanOrEqual(56);
  } else {
    expect(initial.scrollMaximum).toBeGreaterThan(0);
  }

  const bottomScroll = await canvas.evaluate((element) => {
    const scroller = element.querySelector('.vis-panel.vis-left.vis-vertical-scroll');
    if (!scroller) return null;
    const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    scroller.scrollTop = maximum;
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
    return { maximum, applied: scroller.scrollTop };
  });

  expect(bottomScroll).not.toBeNull();
  expect(bottomScroll.applied).toBe(bottomScroll.maximum);
  await page.waitForTimeout(200);

  const atBottom = await canvas.evaluate(visibleEventMetrics);
  expect(atBottom.count).toBeGreaterThan(0);
  expect(atBottom.lastBottom).toBeLessThanOrEqual(atBottom.canvasBottom + 24);
  expect(atBottom.canvasBottom - atBottom.lastBottom).toBeLessThanOrEqual(72);
});
