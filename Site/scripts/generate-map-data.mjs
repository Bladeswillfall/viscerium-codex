import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';
const docsDir = path.resolve(process.cwd(), 'src/content/docs');
const outFile = path.resolve(process.cwd(), 'src/data/maps.json');
const maps = {};
for (const file of await fg('**/*.{md,mdx}', { cwd: docsDir, absolute: true })) {
  const id = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
  const { data } = matter(await fs.readFile(file, 'utf8'));
  if (data.type === 'map' && data.mapId) maps[data.mapId] = { id: data.mapId, title: data.title, description: data.description, image: data.image, width: data.width, height: data.height, page: `/${id}/`, markers: [] };
}
for (const file of await fg('**/*.{md,mdx}', { cwd: docsDir, absolute: true })) {
  const id = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
  const { data } = matter(await fs.readFile(file, 'utf8'));
  if (data.map?.id) {
    maps[data.map.id] ??= { id: data.map.id, title: data.map.id, description: '', markers: [] };
    maps[data.map.id].markers.push({ title: data.title, description: data.description, x: data.map.x, y: data.map.y, marker: data.map.marker, layer: data.map.layer, page: `/${id}/` });
  }
}
await fs.ensureDir(path.dirname(outFile));
await fs.writeJson(outFile, maps, { spaces: 2 });
console.log(`Generated ${Object.keys(maps).length} map data set(s).`);
