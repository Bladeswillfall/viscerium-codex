import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const siteRoot = process.cwd();
const pagePath = path.join(
  siteRoot,
  'dist',
  'eras',
  'citadel',
  'factions',
  'example-faction',
  'index.html',
);
const fontAwesomeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';

function fail(message) {
  console.error(`Icon output validation failed: ${message}`);
  process.exit(1);
}

let html;
try {
  html = await fs.readFile(pagePath, 'utf8');
} catch (error) {
  fail(`could not read ${path.relative(siteRoot, pagePath)} (${error.message})`);
}

const checks = [
  {
    label: 'Font Awesome stylesheet link',
    pattern: new RegExp(`<link[^>]+href=["']${fontAwesomeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i'),
  },
  {
    label: 'page-title icon wrapper',
    pattern: /<h1[^>]*id=["']_top["'][^>]*>[\s\S]*?codex-title-icon[\s\S]*?fa-solid[\s\S]*?fa-flag[\s\S]*?fa-fw[\s\S]*?<\/h1>/i,
  },
  {
    label: 'article heading icon wrapper',
    pattern: /<h2[^>]*>[\s\S]*?codex-heading-icon[\s\S]*?fa-solid[\s\S]*?fa-id-card[\s\S]*?fa-fw[\s\S]*?Identity[\s\S]*?<\/h2>/i,
  },
];

for (const check of checks) {
  if (!check.pattern.test(html)) fail(`${check.label} is missing from the built Example Faction page`);
}

const fontAwesomeClassAttributes = [...html.matchAll(/class=["']([^"']*\bfa-(?:solid|regular|brands|thin|light|duotone|sharp|sharp-duotone)\b[^"']*)["']/gi)];
for (const match of fontAwesomeClassAttributes) {
  if (!/\bfa-fw\b/i.test(match[1])) {
    fail(`Font Awesome icon is missing fa-fw: ${match[1]}`);
  }
}

if (/\[Icon:/i.test(html)) {
  fail('raw [Icon:...] authoring syntax leaked into the built HTML');
}

console.log(`Validated ${fontAwesomeClassAttributes.length} fixed-width Font Awesome icon(s).`);
