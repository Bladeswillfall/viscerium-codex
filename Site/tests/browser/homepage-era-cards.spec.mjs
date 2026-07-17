import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

async function cardState(items) {
  return items.evaluateAll((elements) => elements.map((element) => ({
    width: element.getBoundingClientRect().width,
    flexBasis: getComputedStyle(element).flexBasis,
    filter: getComputedStyle(element).filter,
  })));
}

test('homepage era cards expand on hover and keyboard focus', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });

  const items = page.locator('.home-era-gateway > li');
  const cards = page.locator('.home-era-card');
  await expect(items).toHaveCount(4);

  const initial = await cardState(items);
  expect(initial.map(({ flexBasis }) => flexBasis)).toEqual(['25%', '25%', '25%', '25%']);

  await cards.first().hover();
  await expect.poll(async () => items.first().evaluate((element) => getComputedStyle(element).flexBasis)).toBe('46%');
  await expect.poll(async () => items.nth(1).evaluate((element) => getComputedStyle(element).flexBasis)).toBe('18%');

  const hovered = await cardState(items);
  expect(hovered[0].width).toBeGreaterThan(initial[0].width * 1.5);
  for (const [index, state] of hovered.slice(1).entries()) {
    expect(state.width, `inactive card ${index + 2} should contract`).toBeLessThan(initial[index + 1].width * .85);
    expect(state.filter).toContain('brightness(0.56)');
  }

  await page.mouse.move(8, 8);
  await cards.nth(1).focus();
  await expect.poll(async () => items.nth(1).evaluate((element) => getComputedStyle(element).flexBasis)).toBe('46%');
  await expect.poll(async () => items.first().evaluate((element) => getComputedStyle(element).flexBasis)).toBe('18%');
});
