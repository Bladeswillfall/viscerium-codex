import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceUsesMath } from '../src/lib/math-source.mjs';

test('detects supported mathematical source forms', () => {
  assert.equal(sourceUsesMath('Inline $a^2+b^2=c^2$ notation.'), true);
  assert.equal(sourceUsesMath('$$\nR(t)=R_0e^{-\\lambda t}\n$$'), true);
  assert.equal(sourceUsesMath('Use \\(x+y\\) inline notation.'), true);
  assert.equal(sourceUsesMath('\\[x+y=z\\]'), true);
  assert.equal(sourceUsesMath('```math\nR(t)=R_0e^{-\\lambda t}\n```'), true);
  assert.equal(sourceUsesMath('[equation:title="Model"]\nPlain equation content.\n[/equation]'), true);
});

test('ignores code examples and ordinary dollar usage', () => {
  assert.equal(sourceUsesMath('A ticket costs $5 and another costs $12.50.'), false);
  assert.equal(sourceUsesMath('Use `$a+b$` as an example.'), false);
  assert.equal(sourceUsesMath('```md\nInline $a+b$ example.\n```'), false);
  assert.equal(sourceUsesMath('```txt\n$$\nnot rendered\n$$\n```'), false);
  assert.equal(sourceUsesMath('No mathematical notation here.'), false);
});
