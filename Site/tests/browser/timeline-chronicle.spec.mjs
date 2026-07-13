import { mkdirSync, writeFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

mkdirSync('timeline-browser-diagnostics', { recursive: true });
test.use({ viewport: { width: 1326, height: 1184 } });

async function openGlobalTimeline(page) {
  await page.goto('http://127.0.0.1:4321/timelines/', { waitUntil: 'networkidle' });
  const globalLink = page.getByRole('link', { name: 'The VISCERIUM Timeline', exact: true }).first();
  await expect(globalLink).toBeVisible();
  await globalLink.click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-vc-island-mounted="true"]')).toHaveCount(1, { timeout: 5_000 });
  await expect(page.locator('[data-vc-canvas] > .vis-timeline')).toBeVisible();
  await expect(page.locator('[data-vc-list]')).toHaveText('Chronicle');
}

test('list view reads as an expandable archival chronicle and returns to the graph', async ({ page }) => {
  await openGlobalTimeline(page);

  const toggle = page.locator('[data-vc-list]');
  const stage = page.locator('.vc-timeline-stage');
  const minimap = page.locator('[data-vc-minimap-wrap]');
  const list = page.locator('[data-vc-list-panel]');

  await toggle.click();
  await expect(toggle).toHaveText('Graph view');
  await expect(stage).toBeHidden();
  await expect(minimap).toBeHidden();
  await expect(list).toBeVisible();
  await expect(list.locator(':scope > .vc-chronicle')).toBeVisible();
  await expect(list.locator(':scope > ol')).toHaveCount(0);
  await expect(list.locator('.vc-chronicle-masthead h2')).toHaveText('The VISCERIUM Timeline');

  const chapters = list.locator('.vc-chronicle-chapter');
  const records = list.locator('.vc-chronicle-item');
  expect(await chapters.count()).toBeGreaterThan(1);
  expect(await records.count()).toBeGreaterThan(6);
  await expect(list.locator('.vc-chronicle-chapter-header').first()).toBeVisible();
  await expect(list.locator('.vc-chronicle-date').first()).not.toBeEmpty();
  await expect(list.locator('.vc-chronicle-title').first()).not.toBeEmpty();
  await expect(list.locator('.vc-chronicle-excerpt').first()).not.toBeEmpty();
  await expect(list.locator('.vc-chronicle-tag').first()).toBeVisible();

  const firstRecord = records.first();
  const firstTitle = (await firstRecord.locator('.vc-chronicle-title').textContent())?.trim() ?? '';
  await firstRecord.locator('summary').click();
  await expect(firstRecord.locator('.vc-chronicle-entry')).toHaveAttribute('open', '');
  await expect(firstRecord.locator('.vc-chronicle-dossier')).toBeVisible();
  await expect(firstRecord.locator('.vc-chronicle-dossier')).toContainText('Importance');
  await expect(firstRecord.locator('.vc-chronicle-dossier')).toContainText('Certainty');
  await expect(firstRecord.locator('[data-vc-chronicle-article]')).toHaveAttribute('href', /.+/);

  await page.screenshot({
    path: 'timeline-browser-diagnostics/global-chronicle-expanded.png',
    fullPage: true,
  });

  await firstRecord.locator('[data-vc-chronicle-locate]').click();
  await expect(toggle).toHaveText('Chronicle');
  await expect(list).toBeHidden();
  await expect(stage).toBeVisible();
  await expect(minimap).toBeVisible();
  await expect(page.locator('[data-vc-canvas] .vis-item.vc-timeline-item.vis-selected')).toBeVisible();
  await expect(page.locator('[data-vc-details]')).toContainText(firstTitle);

  await page.locator('[data-vc-close]').click();
  await toggle.click();
  await expect(list.locator(':scope > .vc-chronicle')).toBeVisible();

  const search = page.locator('[data-vc-search]');
  await search.fill('Lorndale');
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Lorndale');
  await expect(list.locator('.vc-chronicle-item', { hasText: 'Lorndale' })).toHaveCount(1);
  await expect(list.locator('.vc-chronicle-item')).toHaveCount(1);

  const metrics = await list.evaluate((panel) => ({
    chapterCount: panel.querySelectorAll('.vc-chronicle-chapter').length,
    recordCount: panel.querySelectorAll('.vc-chronicle-item').length,
    dossierCount: panel.querySelectorAll('.vc-chronicle-dossier').length,
    plainListCount: panel.querySelectorAll(':scope > ol').length,
    enhanced: panel.dataset.vcChronicleEnhanced,
  }));
  writeFileSync(
    'timeline-browser-diagnostics/global-chronicle.json',
    JSON.stringify(metrics, null, 2),
  );

  expect(metrics.enhanced).toBe('true');
  expect(metrics.plainListCount).toBe(0);
});
