import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('page headers render title, breadcrumbs, then calendar date', () => {
  const pageTitle = read('../src/components/CodexPageTitle.astro');

  const titleIndex = pageTitle.indexOf('<h1 id="_top"');
  const breadcrumbsIndex = pageTitle.indexOf('<nav class="codex-breadcrumbs"');
  const calendarIndex = pageTitle.indexOf('<CalendarDateBadge');

  assert.ok(titleIndex >= 0, 'page title must be present');
  assert.ok(breadcrumbsIndex > titleIndex, 'breadcrumbs must follow the title');
  assert.ok(calendarIndex > breadcrumbsIndex, 'calendar date must follow breadcrumbs');
});
