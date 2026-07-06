import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';
const docsDir = path.resolve(process.cwd(), 'src/content/docs');
const outFile = path.resolve(process.cwd(), 'src/data/timelines.json');
const timelines = {};
const files = (await fg('**/*.{md,mdx}', { cwd: docsDir, absolute: true })).sort();

for (const file of files) {
  const id = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
  const { data } = matter(await fs.readFile(file, 'utf8'));
  if (data.timeline?.id) {
    timelines[data.timeline.id] ??= { id: data.timeline.id, title: data.timeline.id.replace(/-/g, ' '), events: [] };
    timelines[data.timeline.id].events.push({ title: data.title, description: data.description, year: data.timeline.year, date: data.timeline.date, precision: data.timeline.precision, order: data.timeline.order ?? 0, page: `/${id}/` });
  }
}
for (const timeline of Object.values(timelines)) {
  timeline.events.sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || a.order - b.order || a.page.localeCompare(b.page));
}
const sortedTimelines = Object.fromEntries(Object.entries(timelines).sort(([a], [b]) => a.localeCompare(b)));

await fs.ensureDir(path.dirname(outFile));
await fs.writeJson(outFile, sortedTimelines, { spaces: 2 });
console.log(`Generated ${Object.keys(timelines).length} timeline data set(s).`);
