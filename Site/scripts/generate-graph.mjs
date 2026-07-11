import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import { loadGeneratedDocs } from './content-manifest.mjs';
import { isMainModule } from './script-entry.mjs';

const outFile = path.resolve(process.cwd(), 'src/data/graph.json');

function cleanId(value) {
  return String(value).trim().replace(/^\/+|\/+$/g, '');
}

export async function generateGraph({ manifest } = {}) {
  const docs = manifest ?? await loadGeneratedDocs();
  const nodes = [];
  const edges = [];
  const titleToId = new Map();
  const idByFile = new Map();
  const nodeIds = new Set();

  for (const record of docs.records) {
    const rel = record.relativePath.replace(/\.(md|mdx)$/i, '');
    const id = cleanId(record.data.slug || rel);
    idByFile.set(record.file, id);
    nodeIds.add(id);
    nodes.push({ id, title: record.data.title, type: record.data.type });
    if (record.data.type !== 'category') titleToId.set(String(record.data.title).toLowerCase(), id);
  }

  for (const record of docs.records) {
    const source = idByFile.get(record.file);
    for (const match of record.content.matchAll(/\]\(\/([^/#)]+(?:\/[^/#)]+)*)\/?\)/g)) {
      const target = cleanId(match[1]);
      if (nodeIds.has(target)) edges.push({ source, target, type: 'link' });
    }
    for (const value of Object.values(record.data.relationships ?? {})) {
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
  return { nodes, edges };
}

if (isMainModule(import.meta.url)) await generateGraph();
