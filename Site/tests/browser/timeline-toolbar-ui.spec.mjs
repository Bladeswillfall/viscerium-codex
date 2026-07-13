import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 980 } });

async function openTimeline(page) {
  await page.goto('http://127.0.0.1:4321/timelines/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'The VISCERIUM Timeline', exact: true }).first().click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-vc-island-mounted="true"]')).toHaveCount(1, { timeout: 5_000 });
}

test('toolbar exposes clear field and action labels with icons', async ({ page }) => {
  await openTimeline(page);
  const toolbar = page.locator('.vc-timeline-toolbar[data-vc-toolbar-enhanced="true"]');
  await expect(toolbar).toBeVisible();
  await expect(toolbar.locator('.vc-timeline-field-label')).toHaveText(['Calendar', 'Search events', 'Grouping']);
  await expect(toolbar.locator('.vc-timeline-field-hint')).toHaveText(['Date system', 'Filter records', 'Arrange rows']);
  await expect(toolbar.locator('.vc-timeline-action-heading')).toHaveText(['View', 'Navigate', 'Scale']);
  await expect(toolbar.locator('.vc-timeline-control-icon')).toHaveCount(9);
  await expect(toolbar.locator('[data-vc-search]')).toHaveAttribute('placeholder', 'Search titles, factions, locations…');
});

test('toolbar buttons align to one height without a large top gutter', async ({ page }) => {
  await openTimeline(page);
  const toolbar = page.locator('.vc-timeline-toolbar[data-vc-toolbar-enhanced="true"]');
  const geometry = await toolbar.evaluate((element) => {
    const toolbarBox = element.getBoundingClientRect();
    const buttons = [...element.querySelectorAll('.vc-timeline-command')];
    const headings = [...element.querySelectorAll('.vc-timeline-field-heading, .vc-timeline-action-heading')];
    const heights = buttons.map((button) => button.getBoundingClientRect().height);
    const firstHeadingTop = Math.min(...headings.map((heading) => heading.getBoundingClientRect().top));
    return {
      heightSpread: Math.max(...heights) - Math.min(...heights),
      topGap: firstHeadingTop - toolbarBox.top,
      firstAction: element.querySelector('.vc-timeline-action-group')?.getAttribute('aria-label'),
      firstCommand: element.querySelector('.vc-timeline-command')?.getAttribute('data-vc-list') !== null,
    };
  });

  expect(geometry.heightSpread).toBeLessThanOrEqual(1);
  expect(geometry.topGap).toBeLessThan(28);
  expect(geometry.firstAction).toBe('View');
  expect(geometry.firstCommand).toBe(true);
});

test('chronicle control retains its icon and mode label', async ({ page }) => {
  await openTimeline(page);
  const toggle = page.locator('[data-vc-list]');
  await expect(toggle.locator('.vc-timeline-command-label')).toHaveText('Chronicle');
  await toggle.click();
  await expect(toggle.locator('.vc-timeline-command-label')).toHaveText('Graph view');
  await expect(toggle.locator('.vc-timeline-control-icon')).toBeVisible();
  await toggle.click();
  await expect(toggle.locator('.vc-timeline-command-label')).toHaveText('Chronicle');
});

test('toolbar avoids horizontal overflow at compact width', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 980 });
  await openTimeline(page);
  const toolbar = page.locator('.vc-timeline-toolbar[data-vc-toolbar-enhanced="true"]');
  const size = await toolbar.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  await expect(toolbar.locator('.vc-timeline-action-group')).toHaveCount(3);
});
