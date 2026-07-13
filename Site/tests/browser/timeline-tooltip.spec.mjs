import { mkdirSync, writeFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

mkdirSync('timeline-browser-diagnostics', { recursive: true });
test.use({ viewport: { width: 1326, height: 1184 } });

async function openEntropyTimeline(page) {
  await page.goto('http://127.0.0.1:4321/eras/entropy/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-vc-island-mounted="true"]')).toHaveCount(1, { timeout: 5_000 });
  await expect(page.locator('[data-vc-canvas] > .vis-timeline')).toBeVisible();
  await page.locator('[data-vc-lane]').selectOption('lane');
  await expect.poll(() => new URL(page.url()).searchParams.get('lane')).toBe('lane');
  await page.waitForTimeout(500);
}

async function readHoverState(page, item) {
  return page.evaluate((element) => {
    const visible = (node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return !node.hidden
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && rect.width > 0
        && rect.height > 0;
    };

    const cards = [...document.querySelectorAll('body > .vc-timeline-hovercard')].filter(visible);
    const nativeTooltips = [...document.querySelectorAll('.vis-tooltip:not(.vc-timeline-hovercard)')].filter(visible);
    const card = cards[0];
    const style = card ? getComputedStyle(card) : null;
    return {
      cardCount: cards.length,
      nativeTooltipCount: nativeTooltips.length,
      titleAttributeCount: (element.hasAttribute('title') ? 1 : 0) + element.querySelectorAll('[title]').length,
      describedBy: element.getAttribute('aria-describedby'),
      text: card?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      date: card?.querySelector('.vc-timeline-hovercard-date')?.textContent ?? '',
      title: card?.querySelector('.vc-timeline-hovercard-title')?.textContent ?? '',
      description: card?.querySelector('.vc-timeline-hovercard-description')?.textContent ?? '',
      background: style?.backgroundColor ?? '',
      color: style?.color ?? '',
      position: style?.position ?? '',
    };
  }, await item.elementHandle());
}

test('event hover uses one VISCERIUM hovercard in dark and light themes', async ({ page }) => {
  await openEntropyTimeline(page);
  const item = page.locator('.vis-item.vc-timeline-item', { hasText: 'The Pathfinder Exodus' }).first();
  await expect(item).toBeVisible();
  await item.scrollIntoViewIfNeeded();

  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  await item.hover();
  await expect(page.locator('body > .vc-timeline-hovercard:not([hidden])')).toHaveCount(1);
  await page.waitForTimeout(350);
  const dark = await readHoverState(page, item);

  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await page.waitForTimeout(150);
  const light = await readHoverState(page, item);

  writeFileSync(
    'timeline-browser-diagnostics/entropy-themed-hovercard.json',
    JSON.stringify({ dark, light }, null, 2),
  );
  await page.screenshot({
    path: 'timeline-browser-diagnostics/entropy-themed-hovercard.png',
    fullPage: true,
  });

  expect(dark.cardCount).toBe(1);
  expect(dark.nativeTooltipCount).toBe(0);
  expect(dark.titleAttributeCount).toBe(0);
  expect(dark.describedBy).toMatch(/^vc-timeline-hovercard-/);
  expect(dark.date).toContain('11,431');
  expect(dark.title).toBe('The Pathfinder Exodus');
  expect(dark.description.length).toBeGreaterThan(20);
  expect(dark.text).not.toMatch(/2030|2036/);
  expect(dark.background).toMatch(/21,\s*19,\s*16/);
  expect(dark.color).toMatch(/244,\s*239,\s*229/);
  expect(dark.position).toBe('fixed');

  expect(light.cardCount).toBe(1);
  expect(light.nativeTooltipCount).toBe(0);
  expect(light.titleAttributeCount).toBe(0);
  expect(light.title).toBe('The Pathfinder Exodus');
  expect(light.background).toMatch(/247,\s*242,\s*234/);
  expect(light.color).toMatch(/32,\s*29,\s*25/);
  expect(light.background).not.toBe(dark.background);

  await page.locator('[data-vc-search]').hover();
  await expect(page.locator('body > .vc-timeline-hovercard:not([hidden])')).toHaveCount(0);
});
