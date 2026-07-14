import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1174, height: 900 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('viscerium-sidebar-collapsed');
  });
});

test('left navigation opens, collapses, persists and restores', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/start-here/', { waitUntil: 'networkidle' });

  const sidebar = page.locator('#starlight__sidebar');
  const hideButton = page.getByRole('button', { name: 'Hide sidebar' });

  await expect(sidebar).toBeVisible();
  await expect(hideButton).toBeVisible();
  expect(await sidebar.getByRole('link').count()).toBeGreaterThan(3);

  const openState = await sidebar.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      width: rect.width,
      opacity: style.opacity,
      pointerEvents: style.pointerEvents,
    };
  });

  expect(openState.width).toBeGreaterThan(200);
  expect(openState.opacity).toBe('1');
  expect(openState.pointerEvents).toBe('auto');

  await hideButton.click();
  const showButton = page.getByRole('button', { name: 'Show sidebar' });
  await expect(showButton).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/codex-sidebar-collapsed/);

  await expect.poll(async () => sidebar.evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.opacity}:${style.pointerEvents}`;
  })).toBe('0:none');

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Show sidebar' })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/codex-sidebar-collapsed/);

  await page.getByRole('button', { name: 'Show sidebar' }).click();
  await expect(page.getByRole('button', { name: 'Hide sidebar' })).toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/codex-sidebar-collapsed/);
  await expect.poll(async () => sidebar.evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.opacity}:${style.pointerEvents}`;
  })).toBe('1:auto');
});
