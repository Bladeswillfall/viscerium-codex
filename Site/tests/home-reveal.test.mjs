import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('homepage mounts a non-blocking Preact reveal island', () => {
  const gateway = read('../src/components/home/HomeGateway.astro');
  const reveal = read('../src/components/home/HomeReveal.tsx');

  assert.match(gateway, /import HomeReveal from '\.\/HomeReveal';/);
  assert.match(gateway, /<HomeReveal\s+client:load/);
  assert.match(reveal, /aria-hidden="true"/);
  assert.match(reveal, /prefers-reduced-motion: reduce/);
  assert.match(reveal, /globalCompositeOperation = 'destination-out'/);
  assert.match(reveal, /return null/);
});

test('spiral silhouette is a replaceable SVG asset with a procedural fallback', () => {
  const reveal = read('../src/components/home/HomeReveal.tsx');
  const mask = read('../public/images/home/reveal-spiral-mask.svg');

  assert.match(reveal, /maskSrc = '\/images\/home\/reveal-spiral-mask\.svg'/);
  assert.match(reveal, /context\.drawImage\(maskImage/);
  assert.match(reveal, /traceFallbackSpiral/);
  assert.match(mask, /Replace this file to change the homepage reveal silhouette/);
  assert.match(mask, /stroke-linecap="round"/);
});

test('canvas transparency cannot conceal the erased spiral mask', () => {
  const styles = read('../src/styles/homepage-reveal.css');

  assert.match(styles, /\.home-reveal-canvas\s*\{[^}]*background:\s*transparent;/s);
  assert.match(styles, /pointer-events:\s*none/);
  assert.doesNotMatch(styles, /\.home-reveal-canvas\s*\{[^}]*background:\s*#(?:000|000000);/s);
});
