import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';

const docsDir = path.resolve(process.cwd(), 'src/content/docs');
const outFile = path.resolve(process.cwd(), 'src/data/graph.json');
const files = (await fg('**/*.{md,mdx}', { cwd: docsDir, absolute: true })).sort();
const nodes = [];
const edges = [];
const titleToId = new Map();
for (const file of files) {
  const rel = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
  const { data } = matter(await fs.readFile(file, 'utf8'));
  nodes.push({ id: rel, title: data.title, type: data.type });
  titleToId.set(String(data.title).toLowerCase(), rel);
}
for (const file of files) {
  const rel = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
  const { data, content } = matter(await fs.readFile(file, 'utf8'));
  for (const match of content.matchAll(/\]\(\/([^/#)]+(?:\/[^/#)]+)*)\/?\)/g)) {
    const target = match[1];
    if (nodes.some((node) => node.id === target)) edges.push({ source: rel, target, type: 'link' });
  }
  for (const value of Object.values(data.relationships ?? {})) {
    const list = Array.isArray(value) ? value : [value];
    for (const item of list) {
      const target = titleToId.get(String(item).toLowerCase());
      if (target) edges.push({ source: rel, target, type: 'relationship' });
    }
  }
}
await fs.ensureDir(path.dirname(outFile));
await fs.writeJson(outFile, { nodes, edges }, { spaces: 2 });
console.log(`Generated graph with ${nodes.length} nodes and ${edges.length} edges.`);
