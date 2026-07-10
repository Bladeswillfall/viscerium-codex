import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTimelinePageRuntime } from '../src/lib/timeline/page-runtime.mjs';

test('mounts connected timeline roots once without clearing a live page', () => {
  const root = { isConnected: true };
  let mounts = 0;
  let cleanups = 0;
  const runtime = createTimelinePageRuntime({
    getRoots: () => [root],
    mountRoot: () => {
      mounts += 1;
      return () => {
        cleanups += 1;
      };
    },
  });

  runtime.mountAll();
  runtime.mountAll();

  assert.equal(mounts, 1);
  assert.equal(cleanups, 0);
  assert.equal(runtime.isMounted(root), true);
});

test('prunes only detached roots and mounts the replacement Starlight page', () => {
  const first = { isConnected: true };
  const second = { isConnected: true };
  let roots = [first];
  const mounted = [];
  const cleaned = [];
  const runtime = createTimelinePageRuntime({
    getRoots: () => roots,
    mountRoot: (root) => {
      mounted.push(root);
      return () => cleaned.push(root);
    },
  });

  runtime.mountAll();
  first.isConnected = false;
  roots = [second];
  runtime.mountAll();

  assert.deepEqual(mounted, [first, second]);
  assert.deepEqual(cleaned, [first]);
  assert.equal(runtime.isMounted(first), false);
  assert.equal(runtime.isMounted(second), true);
});

test('a failed mount is not cached and can retry on a later page-load', () => {
  const root = { isConnected: true };
  const errors = [];
  let attempts = 0;
  const runtime = createTimelinePageRuntime({
    getRoots: () => [root],
    mountRoot: () => {
      attempts += 1;
      if (attempts === 1) throw new Error('renderer unavailable');
      return () => {};
    },
    onError: (error) => errors.push(error.message),
  });

  runtime.mountAll();
  runtime.mountAll();

  assert.deepEqual(errors, ['renderer unavailable']);
  assert.equal(attempts, 2);
  assert.equal(runtime.isMounted(root), true);
});

test('Astro keeps the proven direct div mount and only remounts after page-load', () => {
  const app = readFileSync(new URL('../src/components/timeline/TimelineApp.astro', import.meta.url), 'utf8');

  assert.match(app, /<div class="vc-timeline-shell" data-vc-timeline-root>/);
  assert.match(app, /mountTimeline\(mount, dataset, options\)/);
  assert.match(app, /createTimelinePageRuntime/);
  assert.match(app, /astro:page-load/);
  assert.doesNotMatch(app, /viscerium-timeline|TimelineHydrator|astro:before-swap/);
});
