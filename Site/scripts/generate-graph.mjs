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
const idByFile = new Map();
const nodeIds = new Set();

function cleanId(value) {
  return String(value).trim().replace(/^\/+|\/+$/g, '');
}

for (const file of files) {
  const rel = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
  const { data } = matter(await fs.readFile(file, 'utf8'));
  const id = cleanId(data.slug || rel);
  idByFile.set(file, id);
  nodeIds.add(id);
  nodes.push({ id, title: data.title, type: data.type });
  if (data.type !== 'category') titleToId.set(String(data.title).toLowerCase(), id);
}

for (const file of files) {
  const source = idByFile.get(file);
  const { data, content } = matter(await fs.readFile(file, 'utf8'));
  for (const match of content.matchAll(/\]\(\/([^/#)]+(?:\/[^/#)]+)*)\/?\)/g)) {
    const target = cleanId(match[1]);
    if (nodeIds.has(target)) edges.push({ source, target, type: 'link' });
  }
  for (const value of Object.values(data.relationships ?? {})) {
    const list = Array.isArray(value) ? value : [value];
    for (const item of list) {
      const target = titleToId.get(String(item).toLowerCase());
      if (target) edges.push({ source, target, type: 'relationship' });
    }
  }
}

await fs.ensureDir(path.dirname(outFile));
await fs.writeJson(outFile, { nodes, edges }, { spaces: 2 });
console.log(`Generated graph with ${nodes.length} nodes and ${edges.length} edges.`);
