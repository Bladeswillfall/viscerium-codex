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
  await page.waitForTimeout(1_000);
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
  const items = [...canvas.querySelectorAll('.vis-item.vc-timeline-item')]
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  const intersectingItems = items.filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.bottom > canvasRect.top && rect.top < canvasRect.bottom;
  });
  const itemBounds = intersectingItems.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      text: element.textContent?.trim() ?? '',
      top: rect.top,
      bottom: rect.bottom,
    };
  });
  const scrollCandidates = [...canvas.querySelectorAll(
    '.vis-panel.vis-center, .vis-panel.vis-left, .vis-content, .vis-itemset',
  )].map((element) => {
    const style = getComputedStyle(element);
    return {
      className: element.className,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
      overflowY: style.overflowY,
      transform: style.transform,
    };
  });
  return {
    canvasHeight: canvasRect.height,
    canvasClientHeight: canvas.clientHeight,
    canvasScrollHeight: canvas.scrollHeight,
    canvasOverflowY: canvasStyle.overflowY,
    timelineHeight: timelineRect?.height ?? 0,
    viewportHeightToken: canvas.dataset.vcViewportHeight ?? null,
    visibleEventCount: itemBounds.length,
    firstVisibleEventTop: itemBounds.length
      ? Math.min(...itemBounds.map(({ top }) => top))
      : null,
    lastVisibleEventBottom: itemBounds.length
      ? Math.max(...itemBounds.map(({ bottom }) => bottom))
      : null,
    canvasTop: canvasRect.top,
    canvasBottom: canvasRect.bottom,
    scrollCandidates,
  };
}

async function setRowScroll(page, edge) {
  return page.locator('[data-vc-canvas]').evaluate((canvas, requestedEdge) => {
    const scroller = canvas.querySelector('.vis-panel.vis-left.vis-vertical-scroll');
    if (!scroller) return null;
    const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    scroller.scrollTop = requestedEdge === 'top' ? 0 : maximum;
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
    return {
      maximum,
      applied: scroller.scrollTop,
      clientHeight: scroller.clientHeight,
      scrollHeight: scroller.scrollHeight,
    };
  }, edge);
}

for (const era of eras) {
  test(`${era} hydrates the Chronos timeline island`, async ({ page }) => {
    const messages = collectErrors(page, era);
    await openEra(page, era);

    if (era === 'citadel') {
      await page.locator('[data-vc-lane]').selectOption('lane');
      await expect.poll(() => new URL(page.url()).searchParams.get('lane')).toBe('lane');
      await page.waitForTimeout(750);

      const metrics = await page.locator('[data-vc-canvas]').evaluate(measureViewport);
      const labels = await page.locator('[data-vc-canvas]').evaluate((canvas) => (
        [...canvas.querySelectorAll('.vis-labelset > .vis-label')]
          .filter((element) => element.getClientRects().length > 0)
          .map((element) => ({
            text: element.textContent?.trim() ?? '',
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
      expect(metrics.visibleEventCount).toBeGreaterThan(1);
      expect(metrics.firstVisibleEventTop - metrics.canvasTop).toBeLessThan(metrics.canvasHeight * 0.45);
      expect(labels.some(({ text }) => text === 'Veyr Court')).toBe(true);
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
      await page.waitForTimeout(750);

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
      await expect(pathfinder).toBeVisible();
      await page.locator('[data-vc-canvas]').scrollIntoViewIfNeeded();
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

test('global chronology starts high and ends without an artificial floor', async ({ page }) => {
  const messages = collectErrors(page, 'global');
  await page.goto('http://127.0.0.1:4321/timelines/', { waitUntil: 'networkidle' });
  const globalLink = page.getByRole('link', { name: 'The VISCERIUM Timeline', exact: true }).first();
  await expect(globalLink).toBeVisible();
  await globalLink.click();
  await page.waitForLoadState('networkidle');
  await waitForTimeline(page);

  const canvas = page.locator('[data-vc-canvas]');
  await page.locator('[data-vc-lane]').selectOption('lane');
  await page.waitForTimeout(750);
  await canvas.scrollIntoViewIfNeeded();

  const before = await canvas.evaluate(measureViewport);
  const topScroll = await setRowScroll(page, 'top');
  await page.waitForTimeout(200);
  const atTop = await canvas.evaluate(measureViewport);
  const bottomScroll = await setRowScroll(page, 'bottom');
  await page.waitForTimeout(200);
  const after = await canvas.evaluate(measureViewport);

  writeFileSync(
    'timeline-browser-diagnostics/global-scroll-framing.json',
    JSON.stringify({ before, atTop, after, topScroll, bottomScroll, messages }, null, 2),
  );
  await page.screenshot({ path: 'timeline-browser-diagnostics/global-scroll-framing.png', fullPage: true });

  expect(Math.abs(before.timelineHeight - before.canvasHeight)).toBeLessThanOrEqual(2);
  expect(before.canvasScrollHeight).toBeLessThanOrEqual(before.canvasClientHeight + 2);
  expect(before.visibleEventCount).toBeGreaterThan(1);
  expect(before.firstVisibleEventTop - before.canvasTop).toBeLessThan(before.canvasHeight * 0.45);
  expect(topScroll).not.toBeNull();
  expect(topScroll.maximum).toBeGreaterThan(0);
  expect(topScroll.applied).toBe(0);
  expect(atTop.scrollCandidates.some((candidate, index) => (
    candidate.scrollTop !== (before.scrollCandidates[index]?.scrollTop ?? 0)
    || candidate.transform !== before.scrollCandidates[index]?.transform
  ))).toBe(true);
  expect(bottomScroll.applied).toBe(bottomScroll.maximum);
  expect(after.visibleEventCount).toBeGreaterThan(0);
  expect(after.canvasBottom - after.lastVisibleEventBottom).toBeLessThanOrEqual(72);
  expect(messages.filter((entry) => entry.startsWith('pageerror:'))).toEqual([]);
  expect(messages.filter((entry) => entry.includes('failed to mount'))).toEqual([]);
});
