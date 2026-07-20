import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test('article headings render the Era Spine hierarchy', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/degel-system/okse-dominion/', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const h2 = document.querySelector('.sl-markdown-content h2');
    const h3 = document.querySelector('.sl-markdown-content h3');
    const h4 = document.querySelector('.sl-markdown-content h4');
    if (!(h2 instanceof HTMLElement) || !(h3 instanceof HTMLElement) || !(h4 instanceof HTMLElement)) {
      throw new Error('Expected H2, H3 and H4 examples in the Okse Dominion article');
    }

    const h2Style = getComputedStyle(h2);
    const spine = getComputedStyle(h2, '::before');
    const h3Style = getComputedStyle(h3);
    const h4Style = getComputedStyle(h4);

    return {
      h2: {
        fontFamily: h2Style.fontFamily,
        paddingInlineStart: h2Style.paddingInlineStart,
        borders: [h2Style.borderTopWidth, h2Style.borderRightWidth, h2Style.borderBottomWidth, h2Style.borderLeftWidth],
      },
      spine: {
        content: spine.content,
        width: spine.width,
        clipPath: spine.clipPath,
        backgroundColor: spine.backgroundColor,
      },
      h3: {
        textTransform: h3Style.textTransform,
        fontWeight: h3Style.fontWeight,
      },
      h4: {
        fontFamily: h4Style.fontFamily,
        fontStyle: h4Style.fontStyle,
      },
    };
  });

  expect(result.h2.fontFamily).toContain('Cinzel');
  expect(parseFloat(result.h2.paddingInlineStart)).toBeGreaterThan(0);
  expect(result.h2.borders).toEqual(['0px', '0px', '0px', '0px']);
  expect(result.spine.content).not.toBe('none');
  expect(parseFloat(result.spine.width)).toBeGreaterThan(0);
  expect(result.spine.clipPath).not.toBe('none');
  expect(result.spine.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(result.h3.textTransform).toBe('uppercase');
  expect(Number(result.h3.fontWeight)).toBeGreaterThanOrEqual(700);
  expect(result.h4.fontFamily).toContain('Source Serif 4');
  expect(result.h4.fontStyle).toBe('italic');
});
