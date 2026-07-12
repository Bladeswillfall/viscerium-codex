import { mkdirSync, writeFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const eras = ['citadel', 'smog', 'nearsight', 'entropy'];
mkdirSync('timeline-browser-diagnostics', { recursive: true });

function collectErrors(page, label) {
  const messages = [];
  page.on('console', (message) => {
    const entry = `console:${message.type()}: ${message.text()}`;
    messages.push(entry);
    console.log(`[${label}] ${entry}`);
  });
  page.on('pageerror', (error) => {
    const entry = `pageerror: ${error.stack || error.message}`;
    messages.push(entry);
    console.log(`[${label}] ${entry}`);
  });
  page.on('requestfailed', (request) => {
    const entry = `requestfailed: ${request.url()} — ${request.failure()?.errorText}`;
    messages.push(entry);
    console.log(`[${label}] ${entry}`);
  });
  return messages;
}

async function waitForTimeline(page) {
  await expect(page.locator('[data-vc-island-mounted="true"]')).toHaveCount(1, { timeout: 5_000 });
  await expect(page.locator('[data-vc-canvas]')).toBeVisible();
  await expect(page.locator('[data-vc-fallback]')).toBeHidden();
  await expect(page.locator('[data-vc-timeline-mount]')).not.toBeEmpty();
  await page.waitForTimeout(2_100);
}

async function openEra(page, era) {
  await page.goto(`http://127.0.0.1:4321/eras/${era}/`, { waitUntil: 'networkidle' });
  await waitForTimeline(page);
}

function measureViewport(canvas) {
  const canvasRect = canvas.getBoundingClientRect();
  const timeline = canvas.querySelector(':scope > .vis-timeline');
  const timelineRect = timeline?.getBoundingClientRect();
  const canvasStyle = getComputedStyle(canvas);
  const scroller = canvas.querySelector('.vis-panel.vis-left.vis-vertical-scroll');
  const marker = canvas.querySelector('.vc-timeline-row-end-cap-marker');
  const spacerLabel = marker?.closest('.vis-label');
  const labels = [...canvas.querySelectorAll('.vis-labelset > .vis-label')];
  const centreGroups = [...canvas.querySelectorAll('.vis-panel.vis-center .vis-foreground > .vis-group')];
  const spacerIndex = spacerLabel ? labels.indexOf(spacerLabel) : -1;
  const spacerGroup = spacerIndex >= 0 ? centreGroups[spacerIndex] : undefined;
  const items = [...canvas.querySelectorAll('.vis-item.vc-timeline-item')]
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  const allItemBounds = items.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      text: element.textContent?.trim() ?? '',
      top: rect.top,
      bottom: rect.bottom,
    };
  });
  const intersectingItems = allItemBounds.filter(({ top, bottom }) => (
    bottom > canvasRect.top && top < canvasRect.bottom
  ));
  return {
    canvasHeight: canvasRect.height,
    canvasClientHeight: canvas.clientHeight,
    canvasScrollHeight: canvas.scrollHeight,
    canvasOverflowY: canvasStyle.overflowY,
    timelineHeight: timelineRect?.height ?? 0,
    viewportHeightToken: canvas.dataset.vcViewportHeight ?? null,
    initialRowScrollToken: canvas.dataset.vcInitialRowScroll ?? null,
    rowRangeToken: canvas.dataset.vcRowScrollRange ?? null,
    scrollerClientHeight: scroller?.clientHeight ?? 0,
    scrollerScrollHeight: scroller?.scrollHeight ?? 0,
    scrollerScrollTop: scroller?.scrollTop ?? 0,
    scrollerScrollMaximum: scroller
      ? Math.max(0, scroller.scrollHeight - scroller.clientHeight)
      : 0,
    markerHeight: marker?.getBoundingClientRect().height ?? 0,
    spacerLabelHeight: spacerLabel?.getBoundingClientRect().height ?? 0,
    spacerGroupHeight: spacerGroup?.getBoundingClientRect().height ?? 0,
    spacerIndex,
    spacerIsLastLabel: spacerIndex >= 0 && spacerIndex === labels.length - 1,
    visibleEventCount: intersectingItems.length,
    firstVisibleEventTop: intersectingItems.length
      ? Math.min(...intersectingItems.map(({ top }) => top))
      : null,
    lastVisibleEventBottom: intersectingItems.length
      ? Math.max(...intersectingItems.map(({ bottom }) => bottom))
      : null,
    lowestRenderedEventBottom: allItemBounds.length
      ? Math.max(...allItemBounds.map(({ bottom }) => bottom))
      : null,
    canvasTop: canvasRect.top,
    canvasBottom: canvasRect.bottom,
  };
}

async function moveRowScrollerTo(page, edge) {
  return page.locator('[data-vc-canvas]').evaluate((canvas, requestedEdge) => {
    const scroller = canvas.querySelector('.vis-panel.vis-left.vis-vertical-scroll');
    if (!scroller) return null;
    const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    scroller.scrollTop = requestedEdge === 'top' ? 0 : maximum;
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
    return { maximum, applied: scroller.scrollTop };
  }, edge);
}

async function revealRowItem(page, item) {
  await item.evaluate((element) => {
    const canvas = element.closest('[data-vc-canvas]');
    const scroller = canvas?.querySelector('.vis-panel.vis-left.vis-vertical-scroll');
    if (!canvas || !scroller) return;
    const canvasRect = canvas.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const target = scroller.scrollTop
      + itemRect.top
      - canvasRect.top
      - Math.max(12, (canvas.clientHeight - itemRect.height) / 2);
    scroller.scrollTop = Math.max(0, Math.min(maximum, target));
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await page.waitForTimeout(250);
}

for (const era of eras) {
  test(`${era} hydrates the Chronos timeline island`, async ({ page }) => {
    const messages = collectErrors(page, era);
    await openEra(page, era);

    if (era === 'citadel') {
      await page.locator('[data-vc-lane]').selectOption('lane');
      await expect.poll(() => new URL(page.url()).searchParams.get('lane')).toBe('lane');
      await page.waitForTimeout(2_100);

      const metrics = await page.locator('[data-vc-canvas]').evaluate(measureViewport);
      const labels = await page.locator('[data-vc-canvas]').evaluate((canvas) => (
        [...canvas.querySelectorAll('.vis-labelset > .vis-label')]
          .filter((element) => element.getClientRects().length > 0)
          .map((element) => ({
            text: element.textContent?.trim() ?? '',
            className: element.className,
            hasSpacerMarker: Boolean(element.querySelector('.vc-timeline-row-end-cap-marker')),
            marginTop: getComputedStyle(element).marginTop,
            marginBottom: getComputedStyle(element).marginBottom,
          }))
      ));
      writeFileSync(
        'timeline-browser-diagnostics/citadel-chronos-layout.json',
        JSON.stringify({ metrics, labels, messages }, null, 2),
      );
      await page.screenshot({ path: 'timeline-browser-diagnostics/citadel-chronos-layout.png', fullPage: true });

      expect(metrics.canvasHeight).toBeLessThanOrEqual(674);
      expect(Math.abs(metrics.timelineHeight - metrics.canvasHeight)).toBeLessThanOrEqual(2);
      expect(metrics.canvasScrollHeight).toBeLessThanOrEqual(metrics.canvasClientHeight + 2);
      expect(metrics.canvasOverflowY).toBe('hidden');
      expect(Number(metrics.viewportHeightToken)).toBeCloseTo(metrics.canvasHeight, 0);
      expect(metrics.scrollerScrollMaximum).toBeGreaterThan(20);
      expect(metrics.markerHeight).toBeCloseTo(24, 0);
      expect(metrics.spacerLabelHeight).toBeCloseTo(24, 0);
      expect(metrics.spacerGroupHeight).toBeCloseTo(24, 0);
      expect(metrics.spacerIsLastLabel).toBe(true);
      expect(metrics.visibleEventCount).toBeGreaterThan(1);
      expect(metrics.firstVisibleEventTop - metrics.canvasTop).toBeLessThanOrEqual(32);
      expect(labels.some(({ text }) => text === 'Veyr Court')).toBe(true);
      expect(labels.at(-1)?.hasSpacerMarker).toBe(true);
      expect(labels.every(({ marginTop, marginBottom }) => marginTop === '0px' && marginBottom === '0px')).toBe(true);
    }

    if (era === 'smog') {
      const search = page.locator('[data-vc-search]');
      await search.fill('Black Furnace');
      await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Black Furnace');
      await page.locator('[data-vc-lane]').selectOption('category');
      await expect.poll(() => new URL(page.url()).searchParams.get('lane')).toBe('category');
      await page.locator('[data-vc-filters] summary').click();
      await page.locator('[data-vc-clear]').click();
      await expect(search).toHaveValue('');
    }

    if (era === 'entropy') {
      await page.locator('[data-vc-lane]').selectOption('lane');
      await expect.poll(() => new URL(page.url()).searchParams.get('lane')).toBe('lane');
      await page.waitForTimeout(2_100);

      const axis = await page.evaluate(() => {
        const ruler = document.querySelector('[data-vc-axis]');
        const center = document.querySelector('[data-vc-canvas] .vis-panel.vis-center');
        const rulerRect = ruler?.getBoundingClientRect();
        const centerRect = center?.getBoundingClientRect();
        const ticks = [...(ruler?.querySelectorAll(':scope > span') ?? [])].map((tick) => {
          const rect = tick.getBoundingClientRect();
          const percent = Number(tick.dataset.vcAxisPercent);
          const expected = (centerRect?.left ?? 0) + ((centerRect?.width ?? 0) * percent) / 100;
          return { percent, error: Math.abs(rect.left + rect.width / 2 - expected) };
        });
        return {
          rulerLeft: rulerRect?.left ?? 0,
          centerLeft: centerRect?.left ?? 0,
          ticks,
        };
      });
      expect(axis.centerLeft).toBeGreaterThan(axis.rulerLeft);
      expect(axis.ticks.length).toBeGreaterThan(2);
      expect(axis.ticks.every(({ percent, error }) => Number.isFinite(percent) && error <= 2)).toBe(true);

      const pathfinder = page.locator('.vis-item.vc-timeline-item', { hasText: 'The Pathfinder Exodus' }).first();
      await expect(pathfinder).toBeAttached();
      await revealRowItem(page, pathfinder);
      await expect(pathfinder).toBeVisible();
      await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
      await pathfinder.hover();
      await page.waitForTimeout(500);

      const tooltip = await page.evaluate(() => {
        const item = [...document.querySelectorAll('.vis-item.vc-timeline-item')]
          .find((element) => element.textContent?.includes('The Pathfinder Exodus'));
        const visible = [...document.querySelectorAll('body > .vc-timeline-hovercard')]
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          });
        const card = visible[0];
        const style = card ? getComputedStyle(card) : null;
        return {
          itemTitle: item?.getAttribute('title') ?? null,
          count: visible.length,
          text: visible.map((element) => element.textContent ?? '').join(' '),
          background: style?.backgroundColor ?? null,
          color: style?.color ?? null,
        };
      });
      writeFileSync(
        'timeline-browser-diagnostics/entropy-axis-tooltip.json',
        JSON.stringify({ axis, viewport: await page.locator('[data-vc-canvas]').evaluate(measureViewport), tooltip, messages }, null, 2),
      );
      await page.screenshot({ path: 'timeline-browser-diagnostics/entropy-axis-tooltip.png', fullPage: true });

      expect(tooltip.itemTitle).toBeNull();
      expect(tooltip.count).toBe(1);
      expect(tooltip.text).toContain('11,431');
      expect(tooltip.text).toContain('The Pathfinder Exodus');
      expect(tooltip.text).not.toMatch(/2030|2036/);
      expect(tooltip.background).toMatch(/21,\s*19,\s*16/);
      expect(tooltip.color).toMatch(/244,\s*239,\s*229/);
    }

    writeFileSync(
      `timeline-browser-diagnostics/${era}.json`,
      JSON.stringify({ messages, href: page.url() }, null, 2),
    );
    await page.screenshot({ path: `timeline-browser-diagnostics/${era}.png`, fullPage: true });
    expect(messages.filter((entry) => entry.startsWith('pageerror:'))).toEqual([]);
    expect(messages.filter((entry) => entry.includes('failed to mount'))).toEqual([]);
  });
}

test('global chronology wheel-scrolls its rows and fully reveals the final card', async ({ page }) => {
  const messages = collectErrors(page, 'global');
  await page.goto('http://127.0.0.1:4321/timelines/', { waitUntil: 'networkidle' });
  const globalLink = page.getByRole('link', { name: 'The VISCERIUM Timeline', exact: true }).first();
  await expect(globalLink).toBeVisible();
  await globalLink.click();
  await page.waitForLoadState('networkidle');
  await waitForTimeline(page);

  const canvas = page.locator('[data-vc-canvas]');
  await page.locator('[data-vc-lane]').selectOption('lane');
  await page.waitForTimeout(2_100);
  await canvas.scrollIntoViewIfNeeded();

  const before = await canvas.evaluate(measureViewport);
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 80);
  }
  await page.waitForTimeout(250);
  const afterWheel = await canvas.evaluate(measureViewport);

  const bottomScroll = await moveRowScrollerTo(page, 'bottom');
  await page.waitForTimeout(250);
  const after = await canvas.evaluate(measureViewport);

  writeFileSync(
    'timeline-browser-diagnostics/global-scroll-framing.json',
    JSON.stringify({ before, afterWheel, after, bottomScroll, messages }, null, 2),
  );
  await page.screenshot({ path: 'timeline-browser-diagnostics/global-scroll-framing.png', fullPage: true });

  expect(Math.abs(before.timelineHeight - before.canvasHeight)).toBeLessThanOrEqual(2);
  expect(before.canvasScrollHeight).toBeLessThanOrEqual(before.canvasClientHeight + 2);
  expect(before.scrollerScrollMaximum).toBeGreaterThan(20);
  expect(before.markerHeight).toBeCloseTo(24, 0);
  expect(before.spacerLabelHeight).toBeCloseTo(24, 0);
  expect(before.spacerGroupHeight).toBeCloseTo(24, 0);
  expect(before.spacerIsLastLabel).toBe(true);
  expect(before.visibleEventCount).toBeGreaterThan(1);
  expect(before.firstVisibleEventTop - before.canvasTop).toBeLessThanOrEqual(32);
  expect(afterWheel.scrollerScrollTop).toBeGreaterThan(before.scrollerScrollTop + 20);
  expect(bottomScroll).not.toBeNull();
  expect(bottomScroll.applied).toBe(bottomScroll.maximum);
  expect(after.visibleEventCount).toBeGreaterThan(0);
  expect(after.lowestRenderedEventBottom).toBeLessThanOrEqual(after.canvasBottom + 2);
  expect(after.canvasBottom - after.lowestRenderedEventBottom).toBeLessThanOrEqual(48);
  expect(messages.filter((entry) => entry.startsWith('pageerror:'))).toEqual([]);
  expect(messages.filter((entry) => entry.includes('failed to mount'))).toEqual([]);
});
