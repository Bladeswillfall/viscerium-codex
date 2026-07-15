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
  await page.evaluate(() => localStorage.removeItem('viscerium-sidebar-collapsed'));
  await page.reload({ waitUntil: 'networkidle' });

  const sidebar = page.locator('#starlight__sidebar');
  const hideButton = page.getByRole('button', { name: 'Hide sidebar' });
  const openAncestry = await sidebar.evaluate(sidebarState);

  await expect(hideButton).toBeVisible();
  expect(openAncestry[0]?.width).toBeGreaterThan(200);
  expect(openAncestry[0]?.height).toBeGreaterThan(200);
  expect(openAncestry.every((entry) => entry.display !== 'none')).toBe(true);
  expect(openAncestry.every((entry) => entry.visibility !== 'hidden')).toBe(true);
  expect(openAncestry[0]?.opacity).toBe('1');
  expect(openAncestry[0]?.pointerEvents).toBe('auto');
  expect(await sidebar.getByRole('link').count()).toBeGreaterThan(3);

  await hideButton.click();
  await expect(page.getByRole('button', { name: 'Show sidebar' })).toBeVisible();
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

test('homepage renders clear of the restored desktop navigation rail', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('viscerium-sidebar-collapsed'));
  await page.reload({ waitUntil: 'networkidle' });

  const sidebar = page.locator('#starlight__sidebar');
  const home = page.locator('.vc-home');

  await expect(sidebar).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide sidebar' })).toBeVisible();
  await expect(home).toBeVisible();
  await expect(page.getByRole('heading', { name: 'VISCERIUM', exact: true })).toBeVisible();
  expect(await sidebar.getByRole('link').count()).toBeGreaterThan(3);

  const geometry = await page.evaluate(() => {
    const sidebarRect = document.getElementById('starlight__sidebar')?.getBoundingClientRect();
    const homeRect = document.querySelector('.vc-home')?.getBoundingClientRect();
    return {
      sidebarRight: sidebarRect?.right ?? 0,
      homeLeft: homeRect?.left ?? 0,
    };
  });

  expect(geometry.sidebarRight).toBeGreaterThan(200);
  expect(geometry.homeLeft).toBeGreaterThanOrEqual(geometry.sidebarRight - 1);
});

test('top ribbon keeps real search, Telescope and the aperture colour control', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/start-here/', { waitUntil: 'networkidle' });

  const searchButton = page.locator('[data-vc-header-search] button[data-open-modal]');
  const telescopeButton = page.locator('.right-group telescope-search .telescope__trigger-btn');
  const themeButton = page.locator('[data-vc-theme-switch]');

  await expect(searchButton).toBeVisible();
  await expect(telescopeButton).toBeVisible();
  await expect(themeButton).toBeVisible();
  await expect(page.locator('#starlight__sidebar starlight-theme-select')).toHaveCount(0);
  await expect(page.locator('.vc-header .social-icons')).toHaveCount(0);
  await expect(page.locator('.vc-header a[href*="github.com"]')).toHaveCount(0);

  const ribbon = await page.evaluate(() => {
    const header = document.querySelector('.vc-header');
    const search = document.querySelector('[data-vc-header-search] button[data-open-modal]');
    const theme = document.querySelector('[data-vc-theme-switch]');

    if (!(header instanceof HTMLElement) || !(search instanceof HTMLElement) || !(theme instanceof HTMLElement)) {
      throw new Error('Missing clean-slate header controls');
    }

    const headerRect = header.getBoundingClientRect();
    const searchRect = search.getBoundingClientRect();
    const themeRect = theme.getBoundingClientRect();

    return {
      searchWidth: searchRect.width,
      searchInsideHeader: searchRect.left >= headerRect.left && searchRect.right <= headerRect.right,
      themeInsideHeader: themeRect.left >= headerRect.left && themeRect.right <= headerRect.right,
      themeBackgroundImage: getComputedStyle(theme).backgroundImage,
    };
  });

  expect(ribbon.searchWidth).toBeGreaterThanOrEqual(28);
  expect(ribbon.searchInsideHeader).toBe(true);
  expect(ribbon.themeInsideHeader).toBe(true);
  expect(ribbon.themeBackgroundImage).toBe('none');

  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await themeButton.click();
  await expect.poll(() => page.locator('html').getAttribute('data-theme')).not.toBe(initialTheme);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('starlight-theme'))).not.toBe(initialTheme);
});

test('homepage era and route links are visible without animation gating', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });

  await expect(page.getByRole('link', { name: 'Explore CITADEL' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore SMOG' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore NEARSIGHT' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore ENTROPY' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Start Here/ }).last()).toBeVisible();
});

test('mobile On this page control only appears below the desktop breakpoint', async ({ page }) => {
  const mobileToc = page.locator('#starlight__on-this-page--mobile');

  await page.goto('http://127.0.0.1:4321/start-here/', { waitUntil: 'networkidle' });
  await expect(mobileToc).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(mobileToc).toBeVisible();
});
