import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1174, height: 900 } });

function sidebarState(element) {
  const ancestry = [];
  let current = element;
  while (current) {
    const style = getComputedStyle(current);
    const rect = current.getBoundingClientRect();
    ancestry.push({
      element: `${current.tagName.toLowerCase()}${current.id ? `#${current.id}` : ''}${current.className ? `.${String(current.className).trim().replaceAll(/\s+/g, '.')}` : ''}`,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      pointerEvents: style.pointerEvents,
      position: style.position,
      transform: style.transform,
      width: rect.width,
      height: rect.height,
    });
    current = current.parentElement;
  }
  return ancestry;
}

test('left navigation opens, collapses, persists and restores', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/start-here/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('viscerium-sidebar-collapsed');
  });
  await page.reload({ waitUntil: 'networkidle' });

  const sidebar = page.locator('#starlight__sidebar');
  const hideButton = page.getByRole('button', { name: 'Hide sidebar' });
  const openAncestry = await sidebar.evaluate(sidebarState);
  console.log(`[sidebar-open-state] ${JSON.stringify(openAncestry)}`);

  await expect(hideButton).toBeVisible();
  expect(openAncestry[0]?.width).toBeGreaterThan(200);
  expect(openAncestry[0]?.height).toBeGreaterThan(200);
  expect(openAncestry.every((entry) => entry.display !== 'none')).toBe(true);
  expect(openAncestry.every((entry) => entry.visibility !== 'hidden')).toBe(true);
  expect(openAncestry[0]?.opacity).toBe('1');
  expect(openAncestry[0]?.pointerEvents).toBe('auto');
  expect(await sidebar.getByRole('link').count()).toBeGreaterThan(3);

  await hideButton.click();
  const showButton = page.getByRole('button', { name: 'Show sidebar' });
  await expect(showButton).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/codex-sidebar-collapsed/);

  await expect.poll(async () => sidebar.evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.visibility}:${style.opacity}:${style.pointerEvents}`;
  })).toBe('hidden:0:none');

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Show sidebar' })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/codex-sidebar-collapsed/);

  await page.getByRole('button', { name: 'Show sidebar' }).click();
  await expect(page.getByRole('button', { name: 'Hide sidebar' })).toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/codex-sidebar-collapsed/);
  await expect.poll(async () => sidebar.evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.visibility}:${style.opacity}:${style.pointerEvents}`;
  })).toBe('visible:1:auto');
});

test('homepage renders the restored desktop navigation rail', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('viscerium-sidebar-collapsed');
  });
  await page.reload({ waitUntil: 'networkidle' });

  const sidebar = page.locator('#starlight__sidebar');
  const homeGateway = page.locator('.home-gateway');

  await expect(sidebar).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide sidebar' })).toBeVisible();
  await expect(homeGateway).toBeVisible();
  expect(await sidebar.getByRole('link').count()).toBeGreaterThan(3);

  const geometry = await page.evaluate(() => {
    const sidebarRect = document.getElementById('starlight__sidebar')?.getBoundingClientRect();
    const homeRect = document.querySelector('.home-gateway')?.getBoundingClientRect();
    return {
      sidebarRight: sidebarRect?.right ?? 0,
      homeLeft: homeRect?.left ?? 0,
    };
  });

  expect(geometry.sidebarRight).toBeGreaterThan(200);
  expect(geometry.homeLeft).toBeGreaterThanOrEqual(geometry.sidebarRight - 1);
});

test('mobile On this page control only appears below the desktop breakpoint', async ({ page }) => {
  const mobileToc = page.locator('mobile-starlight-toc nav[aria-label="On this page"]');

  await page.goto('http://127.0.0.1:4321/start-here/', { waitUntil: 'networkidle' });
  await expect(mobileToc).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(mobileToc).toBeVisible();
});
