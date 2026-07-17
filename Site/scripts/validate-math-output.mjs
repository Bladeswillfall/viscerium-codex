import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import fg from 'fast-glob';

const distDir = path.resolve(process.cwd(), 'dist');
const files = (await fg('**/*.html', { cwd: distDir, absolute: true })).sort();
let mathPages = 0;
let ordinaryPages = 0;
let failed = false;

function fail(message) {
  console.error(message);
  failed = true;
}

for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  const relative = path.relative(distDir, file).replace(/\\/g, '/');
  const hasMathMarker = html.includes('data-codex-math-page');
  const hasDeferredLoader = html.includes('__visceriumMathLoader');
  const hasIntersectionGate = html.includes('IntersectionObserver');
  const hasEagerMathJaxScript = /<script\b[^>]*\bsrc=["'][^"']*mathjax[^"']*["'][^>]*>/i.test(html);

  if (hasMathMarker) {
    mathPages += 1;
    if (!hasDeferredLoader) fail(`Math page is missing its deferred loader: ${relative}`);
    if (!hasIntersectionGate) fail(`Math page is missing its viewport gate: ${relative}`);
    if (hasEagerMathJaxScript) fail(`Math page contains an eager MathJax script: ${relative}`);
    continue;
  }

  ordinaryPages += 1;
  if (hasDeferredLoader) fail(`Non-math page contains the MathJax loader: ${relative}`);
  if (hasEagerMathJaxScript) fail(`Non-math page contains a MathJax script: ${relative}`);
}

if (files.length === 0) fail('No built HTML files were found for MathJax validation.');
if (mathPages === 0) fail('No built math page was found; conditional MathJax detection may have failed.');
if (ordinaryPages === 0) fail('No non-math page was found for conditional MathJax validation.');

if (failed) process.exit(1);
console.log(`Validated conditional, viewport-lazy MathJax output across ${mathPages} math page(s) and ${ordinaryPages} non-math page(s).`);
