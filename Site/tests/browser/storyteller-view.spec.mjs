import { test, expect } from '@playwright/test';

const storytellerDemoUrl = 'http://127.0.0.1:4321/demo/demo-trade-port/';

test.use({ viewport: { width: 1280, height: 900 } });

test('Lore is the default and Storyteller replaces the article body without becoming a second route', async ({ page }) => {
  await page.goto(storytellerDemoUrl, { waitUntil: 'networkidle' });

  const loreTab = page.getByRole('tab', { name: 'Lore' });
  const storytellerTab = page.getByRole('tab', { name: 'Storyteller' });
  const loreBody = page.locator('.sl-markdown-content');
  const storytellerPanel = page.locator('[data-codex-storyteller-panel]');
  const toc = page.locator('.right-sidebar-container');

  await expect(loreTab).toHaveAttribute('aria-selected', 'true');
  await expect(storytellerTab).toHaveAttribute('aria-selected', 'false');
  await expect(loreBody).toBeVisible();
  await expect(loreBody.getByRole('heading', { name: 'Port function' })).toBeVisible();
  await expect(storytellerPanel).toBeHidden();
  await expect(toc).toBeVisible();

  await storytellerTab.click();

  await expect(storytellerTab).toHaveAttribute('aria-selected', 'true');
  await expect(loreTab).toHaveAttribute('aria-selected', 'false');
  await expect(loreBody).toBeHidden();
  await expect(storytellerPanel).toBeVisible();
  await expect(storytellerPanel.getByRole('heading', { name: 'Experience' })).toBeVisible();
  await expect(storytellerPanel.getByRole('heading', { name: 'Use' })).toBeVisible();
  await expect(storytellerPanel.getByRole('heading', { name: 'Knowledge' })).toBeVisible();
  await expect(storytellerPanel.getByRole('heading', { name: 'Local pressure' })).toBeVisible();
  await expect(toc).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-codex-article-view', 'storyteller');
  await expect(page).toHaveURL(storytellerDemoUrl);

  await loreTab.click();
  await expect(loreBody).toBeVisible();
  await expect(storytellerPanel).toBeHidden();
  await expect(toc).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-codex-article-view', 'lore');
});

test('Lore and Storyteller tabs support keyboard navigation', async ({ page }) => {
  await page.goto(storytellerDemoUrl, { waitUntil: 'networkidle' });

  const loreTab = page.getByRole('tab', { name: 'Lore' });
  const storytellerTab = page.getByRole('tab', { name: 'Storyteller' });

  await loreTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(storytellerTab).toBeFocused();
  await expect(storytellerTab).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Home');
  await expect(loreTab).toBeFocused();
  await expect(loreTab).toHaveAttribute('aria-selected', 'true');
});
